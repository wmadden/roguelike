pixi = require 'pixi.js'
Promise = require('es6-promise').Promise

class WallTextures
  @load: (variant) ->
    loader = new pixi.JsonLoader("images/dawnlike/Objects/textures/wall/#{variant}.json")
    result = null
    new Promise (resolve, reject) ->
      # Loading the spritesheet happens in two steps. First, the JSON
      # description is loaded from the given URL, then the spritesheet image is
      # loaded.
      #
      # After the JSON is loaded, the pixi.TileCache is populated with the
      # textures the JSON describes and the base image is requested. When the
      # base image request succeeds, the loader reports success.
      #
      # Because of this, if you load two WallTextures at the same time, the
      # later one will clobber the textures in the TextureCache from the first
      # one if the JSON for the second load returns before the image from the
      # first one.
      #
      # To get around this, we introduce our own "onJSONLoaded" event handler
      # into the SpriteSheetLoader instance - a class A hack - which is called
      # when the JSON loads, before the image request is made.
      originalLoaderJSONHandler = loader.onJSONLoaded
      loader.onJSONLoaded = ->
        originalLoaderJSONHandler.apply(loader)
        result = new WallTextureVariant(variant)

      loader.once('loaded', ->
        resolve(result)
      )
      loader.once('error', (args...) -> console.log(args...); reject(args...))
      loader.load()

class WallTextureVariant
  constructor: (@name) ->
    textureNames = [ 'NESW', 'NE_W', 'N_SW', 'N__W', '_ESW', '_E_W',
      '____', 'NES_', 'NE__', 'N_S_', 'N___', '_ES_', '__SW' ]
    for textureName in textureNames
      textureId = "#{textureName}.png"
      this[textureName] = pixi.TextureCache[textureId]
      pixi.Texture.removeTextureFromCache(textureId)
      # delete pixi.TextureCache[textureId]
    @___W = @_E_W
    @_E__ = @_E_W
    @__S_ = @N_S_

module.exports.WallTextures = WallTextures
