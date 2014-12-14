pixi = require 'pixi.js'
Promise = require('es6-promise').Promise

class WallTextures
  @load: (variant) ->
    loader = new pixi.SpriteSheetLoader("images/dawnlike/Objects/textures/wall/#{variant}.json")
    new Promise (resolve, reject) ->
      loader.once('loaded', -> resolve(loader))
      loader.once('error', (args...) -> console.log(args...); reject(args...))
      loader.load()
    .then ->
      new WallTextureVariant(variant)

class WallTextureVariant
  constructor: (@name) ->
    textureNames = [ 'NESW', 'NESW', 'NE_W', 'N_SW', 'N__W', '_ESW', '_E_W',
      '____', 'NES_', 'NE__', 'N_S_', 'N___', '_ES_', '__SW' ]
    for textureName in textureNames
      this[textureName] = pixi.TextureCache["#{textureName}.png"]
    @___W = @_E_W
    @_E__ = @_E_W
    @__S_ = @N_S_

module.exports.WallTextures = WallTextures
