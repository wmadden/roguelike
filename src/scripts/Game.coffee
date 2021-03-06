pixi = require 'pixi.js'
ROT = require('rot-js').ROT
Level = require('Level').Level
Player = require('Player').Player
Promise = require('es6-promise').Promise
_ = require('underscore')
KeyboardJS = require('keyboardjs')

Renderer = require('drawing/StreamRenderer').StreamRenderer
RulesEngine = require('RulesEngine').RulesEngine
Entity = require('Entity').Entity
SightMap = require('SightMap').SightMap

class Game
  constructor: ({ @stage, @pixiRenderer }) ->
    @scheduler = new ROT.Scheduler.Simple()
    @engine = new ROT.Engine(@scheduler)

    @level = new Level(width: 80, height: 40)
    @level.generate()

    @rulesEngine = new RulesEngine(@level, @player)
    @player = @rulesEngine.spawnPlayer()

    @generateSomeTestEnemies()

    @renderer = new Renderer({
      @stage, game: this, scale: @scale
    })

  load: ->
    # First time only
    @schedule => @renderer.loadTextures()
    @schedule =>
      @renderer.attachToEventStream(@player.sightMap.eventStream)
      Promise.resolve()

    # Every tick
    @schedule (=> @waitForAllEventsToBeDrawn()), repeat: true
    @schedule =>
      @clearDeadEntities()
    , repeat: true
    @schedule new WaitForPlayerInput(@rulesEngine, @level, @player), repeat: true
    @schedule (=> @waitForAllEventsToBeDrawn()), repeat: true
    @schedule =>
      for entity in _(@level.entities).without(@player)
        continue if entity.dead
        action = entity.nextAction()
        action.actor = entity
        @processAction(action)
    , repeat: true

    @engine.start()

  waitForAllEventsToBeDrawn: ->
    Promise.all([
      new Promise (resolve, reject) =>
        test = =>
          if @player.sightMap.eventStream.eventsRemaining() == 0
            resolve()
          else
            @player.sightMap.eventStream.once('pop', test)
        test()
      new Promise (resolve, reject) =>
        test = =>
          if @renderer.pendingAnimations.length == 0
            resolve()
          else
            @renderer.once('animationsComplete', test)
        test()
    ])

  processAction: (actionDetails) ->
    { action } = actionDetails
    unless _(RulesEngine.PERMITTED_ENTITY_ACTIONS).include(action)
      throw new Error("Action #{action} requested by entity is not permitted")
    @rulesEngine[action](actionDetails)

  schedule: (action, options = {}) ->
    if typeof action is 'function'
      schedulable = new Schedulable(action)
    else
      schedulable = action
    unless schedulable instanceof Schedulable
      throw new Error("Don't know how to schedule #{action}")
    @scheduler.add(schedulable, options.repeat)

  draw: (msElapsed) ->
    @renderer.update(msElapsed)
    if @renderer.needsRedraw
      @pixiRenderer.render @stage
      @renderer.needsRedraw = false

  generateSomeTestEnemies: ->
    for i in [0..10]
      index = Math.floor(Math.random() * (@level.freeTiles.length))
      freeTile = @level.freeTiles[index]
      @level.freeTiles.splice(index, 1)
      @rulesEngine.spawn({
        entity: new Entity({
          type: 'bunny-brown'
          health: 3
          visibleWorld: @visibleWorld()
        })
        x: freeTile[0]
        y: freeTile[1]
      })

  clearDeadEntities: ->
    @level.entities = _(@level.entities).filter (entity) -> !entity.dead

  visibleWorld: (actor) ->
    {
      tileOccupied: (x, y) => @rulesEngine.canOccupy(x, y)
    }

class Schedulable
  constructor: (act = null) ->
    @act = act if act?
  act: -> Promise.resolve()

class WaitForPlayerInput extends Schedulable
  N = 0
  NE = 1
  E = 2
  SE = 3
  S = 4
  SW = 5
  W = 6
  NW = 7

  keymap: {
    h: W
    j: S
    k: N
    l: E
    y: NW
    u: NE
    b: SW
    n: SE
    left: W
    right: E
    up: N
    down: S
  }

  constructor: (@rulesEngine, @level, @player) ->

  act: ->
    new Promise (resolve, reject) =>
      keydownHandler = (event, keys, comboString) =>
        event.preventDefault()
        direction = @keymap[comboString]

        movementDiff = ROT.DIRS[8][direction]
        [xDiff, yDiff] = movementDiff
        [destX, destY] = [@player.x + xDiff, @player.y + yDiff]
        entityOnTile = @level.entityAt(destX, destY)

        if entityOnTile?
          @rulesEngine.attack( actor: @player, direction: direction )
          removeKeyHandlers()
          resolve()
        else if @rulesEngine.step( actor: @player, direction: direction )
          removeKeyHandlers()
          resolve()

      keyBindings =
        for keyCombo, direction of @keymap
          KeyboardJS.on(keyCombo, keydownHandler)
      removeKeyHandlers = ->
        binding.clear() for binding in keyBindings

module.exports.Game = Game
