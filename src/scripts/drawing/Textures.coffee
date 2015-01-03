pixi = require 'pixi.js'

FloorTextures = require('tiles/dawnlike/Floor').FloorTextures
WallTextures = require('tiles/dawnlike/Wall').WallTextures
CharacterTextures = require('tiles/dawnlike/Character').CharacterTextures

class module.exports.Textures
  @loadAll: ->
    # TODO: find a better way of loading these
    groundTexture = pixi.Texture.fromImage("images/dawnlike/Objects/Ground0.png")
    @bloodTexture = new pixi.Texture(
      groundTexture,
      new pixi.Rectangle(16 * 0, 16 * 5, 16, 16)
    )
    humanoidTexture = pixi.Texture.fromImage("images/dawnlike/Characters/Humanoid0.png")
    @playerTexture = new pixi.Texture(
      humanoidTexture,
      new pixi.Rectangle(16 * 0, 16 * 7, 16, 16)
    )

    Promise.all([
      FloorTextures.load(),
      WallTextures.load('brick/light').then( (wallTexture) =>
        @wallTexture = wallTexture
      ),
      CharacterTextures.load('rodent').then( (rodentTextures) =>
        @rodentTextures = rodentTextures
      )
    ]).then =>
      @floorTextureMap = FloorTextures.floorTypes.bricks.grey
