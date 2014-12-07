pixi = require 'pixi.js'
Level = require('./Level').Level

class Game
  constructor: ({ @stage, @renderer }) ->
    console.log 'Game created!'

    @floorTexture = pixi.Texture.fromImage("images/dawnlike/Objects/Floor.png")
    @floorTileTexture = new pixi.Texture(
      @floorTexture,
      new pixi.Rectangle(16 * 1, 16 * 7, 16, 16)
    )
    @wallTileTexture = new pixi.Texture(
      @floorTexture,
      new pixi.Rectangle(16 * 0, 16 * 7, 16, 16)
    )

    @level = new Level(width: 80, height: 40)
    @level.generate()
    @drawLevel(@level)

  draw: ->
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

module.exports.Game = Game
