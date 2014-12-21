pixi = require 'pixi.js'
ROT = require('rot-js').ROT
Level = require('Level').Level
Player = require('Player').Player
Promise = require('es6-promise').Promise
_ = require('underscore')

Renderer = require('drawing/Renderer').Renderer
RulesEngine = require('RulesEngine').RulesEngine
Entity = require('Entity').Entity
SightMap = require('SightMap').SightMap

class Game
  constructor: ({ @stage, @pixiRenderer }) ->
    @scheduler = new ROT.Scheduler.Simple()
    @engine = new ROT.Engine(@scheduler)

    @level = new Level(width: 80, height: 40)
    @level.generate()

    freeTile = @level.freeTiles.pop()
    @player = new Player(x: freeTile[0], y: freeTile[1])
    @player.sightMap = new SightMap(width: @level.width, height: @level.height)

    @rulesEngine = new RulesEngine(@level, @player)

    @generateSomeTestEnemies()

    @renderer = new Renderer({ @stage, game: this, scale: @scale })

  load: ->
    # First time only
    @schedule => @renderer.loadTextures()

    # Every tick
    @schedule =>
      @rulesEngine.updateSightmap(@player)
    , repeat: true
    @schedule =>
      @renderer.update()
      @needsRedraw = true
    , repeat: true
    @schedule =>
      return if @renderer.pendingAnimations.length == 0
      new Promise (resolve, reject) =>
        @renderer.once('animationsComplete', resolve)
    , repeat: true
    @schedule =>
      @clearDeadEntities()
    , repeat: true
    @schedule new WaitForPlayerInput(@rulesEngine, @level, @player), repeat: true
    @schedule =>
      for entity in @level.entities
        entity.act() unless entity.dead
    , repeat: true

    @engine.start()

  schedule: (action, options = {}) ->
    if typeof action is 'function'
      schedulable = new Schedulable(action)
    else
      schedulable = action
    unless schedulable instanceof Schedulable
      throw new Error("Don't know how to schedule #{action}")
    @scheduler.add(schedulable, options.repeat)

  draw: (msElapsed) ->
    if @renderer.pendingAnimations.length > 0
      @renderer.updateAnimations(msElapsed)
      @pixiRenderer.render @stage
    else if @needsRedraw
      @pixiRenderer.render @stage
      @needsRedraw = false

  generateSomeTestEnemies: ->
    for i in [0..10]
      index = Math.floor(Math.random() * (@level.freeTiles.length))
      freeTile = @level.freeTiles[index]
      @level.freeTiles.splice(index, 1)
      @level.entities.push(new Entity({
        type: 'bunny-brown'
        x: freeTile[0]
        y: freeTile[1]
        rulesEngine: @rulesEngine
      }))

  clearDeadEntities: ->
    @level.entities = _(@level.entities).filter (entity) -> !entity.dead

class Schedulable
  constructor: (act = null) ->
    @act = act if act?
  act: -> Promise.resolve()

class WaitForPlayerInput extends Schedulable
  KEYMAP: {
    # Direction keys -> direction constants
    38: 0
    33: 1
    39: 2
    34: 3
    40: 4
    35: 5
    37: 6
    36: 7
  }

  constructor: (@rulesEngine, @level, @player) ->

  act: ->
    new Promise (resolve, reject) =>
      keydownHandler = (event) =>
        code = event.keyCode
        return unless code of @KEYMAP
        event.preventDefault()

        direction = @KEYMAP[code]

        movementDiff = ROT.DIRS[8][direction]
        [xDiff, yDiff] = movementDiff
        [destX, destY] = [@player.x + xDiff, @player.y + yDiff]
        entityOnTile = @level.entityAt(destX, destY)

        if entityOnTile?
          @rulesEngine.attack( actor: @player, direction: direction )
          window.removeEventListener('keydown', keydownHandler)
          resolve()
        else if @rulesEngine.step( actor: @player, direction: direction )
          window.removeEventListener('keydown', keydownHandler)
          resolve()

      window.addEventListener('keydown', keydownHandler)

module.exports.Game = Game
