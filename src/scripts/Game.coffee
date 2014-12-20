pixi = require 'pixi.js'
ROT = require('rot-js').ROT
Level = require('Level').Level
Player = require('Player').Player
Promise = require('es6-promise').Promise

Renderer = require('drawing/Renderer').Renderer
SightMap = require('SightMap').SightMap

class Game
  constructor: ({ @stage, @pixiRenderer }) ->
    @scheduler = new ROT.Scheduler.Simple()
    @engine = new ROT.Engine(@scheduler)

    @level = new Level(width: 80, height: 40)
    @level.generate()

    @rulesEngine = new RulesEngine(@level)

    freeTile = @level.freeTiles[0]
    @player = new Player(x: freeTile[0], y: freeTile[1])
    @player.sightMap = new SightMap(width: @level.width, height: @level.height)

    @renderer = new Renderer({ @stage, @level, @player })

  load: ->
    # First time only
    @schedule => @renderer.loadTextures()
    @schedule => @needsRedraw = true

    # Every time
    @schedule =>
      @rulesEngine.updateSightmap(@player)
    , repeat: true
    @schedule new WaitForPlayerInput(@rulesEngine, @player), repeat: true
    @schedule =>
      @needsRedraw = true
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

  draw: ->
    return unless @needsRedraw
    @renderer.update()
    @pixiRenderer.render @stage
    @needsRedraw = false
    return

class RulesEngine
  constructor: (@level) ->
  step: ({ actor, direction }) ->
    movementDiff = ROT.DIRS[8][direction]
    [xDiff, yDiff] = movementDiff
    [destX, destY] = [actor.x + xDiff, actor.y + yDiff]
    destinationTile = @level.tiles[destX][destY]
    if destinationTile?.type == 'floor'
      actor.x = destX
      actor.y = destY
      true
    else
      false
  lightPasses: (x, y) ->
    @level.tiles[x]?[y]?.type == 'floor'
  updateSightmap: (entity) ->
    fov = new ROT.FOV.PreciseShadowcasting((x, y) => @lightPasses(x, y))
    entity.sightMap.clearVisible()
    fov.compute( entity.x, entity.y, entity.sightRadius, (x, y, r, visibility) ->
      entity.sightMap.markAsVisible {x, y}
    )

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

  constructor: (@rulesEngine, @player) ->

  act: ->
    new Promise (resolve, reject) =>
      keydownHandler = (event) =>
        code = event.keyCode
        return unless code of @KEYMAP
        event.preventDefault()

        direction = @KEYMAP[code]
        if @rulesEngine.step( actor: @player, direction: direction )
          window.removeEventListener('keydown', keydownHandler)
          resolve()

      window.addEventListener('keydown', keydownHandler)

module.exports.Game = Game
