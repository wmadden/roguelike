pixi = require 'pixi.js'
ROT = require('rot-js').ROT
Level = require('./Level').Level
Player = require('./Player').Player
Promise = require('es6-promise').Promise

class Game
  constructor: ({ @stage, @renderer }) ->
    @scheduler = new ROT.Scheduler.Simple()
    @engine = new ROT.Engine(@scheduler)

    @level = new Level(width: 80, height: 40)
    @level.generate()

    @rulesEngine = new RulesEngine(@level)

    freeTile = @level.freeTiles[0]
    @player = new Player(x: freeTile[0], y: freeTile[1])
    console.log 'player x:', @player.x, 'player y:', @player.y

    @loadTextures()
    @drawLevel(@level)

    @scheduler.add new WaitForPlayerInput(@rulesEngine, @player), true
    @engine.start()

  loadTextures: ->
    @floorTexture = pixi.Texture.fromImage("images/dawnlike/Objects/Floor.png")
    @floorTileTexture = new pixi.Texture(
      @floorTexture,
      new pixi.Rectangle(16 * 1, 16 * 7, 16, 16)
    )
    @wallTileTexture = new pixi.Texture(
      @floorTexture,
      new pixi.Rectangle(16 * 0, 16 * 7, 16, 16)
    )
    humanoidTexture = pixi.Texture.fromImage("images/dawnlike/Characters/Humanoid0.png")
    @playerTexture = new pixi.Texture(
      humanoidTexture,
      new pixi.Rectangle(16 * 0, 16 * 7, 16, 16)
    )

  draw: ->
    @player.sprite.x = 16 * @player.x
    @player.sprite.y = 16 * @player.y
    @renderer.render @stage
    requestAnimationFrame => @draw()
    return

  floorSprite: (x, y) ->
    sprite = new pixi.Sprite(@floorTileTexture)
    sprite.x = x * 16
    sprite.y = y * 16
    sprite

  wallSprite: (x, y) ->
    sprite = new pixi.Sprite(@wallTileTexture)
    sprite.x = x * 16
    sprite.y = y * 16
    sprite

  drawLevel: (level) ->
    for x in [0..@level.width]
      for y in [0..@level.height]
        switch @level.tiles[x][y]
          when 0
            @stage.addChild @floorSprite(x, y)
          when 1
            #@stage.addChild @wallSprite(x, y)
            continue

    @player.sprite = new pixi.Sprite(@playerTexture)
    @stage.addChild(@player.sprite)

class RulesEngine
  constructor: (@level) ->
  step: ({ actor, direction }) ->
    movementDiff = ROT.DIRS[8][direction]
    [xDiff, yDiff] = movementDiff
    destination = [actor.x + xDiff, actor.y + yDiff]
    destinationTile = @level.tiles[destination[0]][destination[1]]
    if destinationTile == 0
      actor.x = destination[0]
      actor.y = destination[1]
      true
    else
      false

class Schedulable
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

        direction = @KEYMAP[code]
        if @rulesEngine.step( actor: @player, direction: direction )
          window.removeEventListener('keydown', keydownHandler)
          resolve()

      window.addEventListener('keydown', keydownHandler)

module.exports.Game = Game
