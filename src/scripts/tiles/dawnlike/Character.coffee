pixi = require 'pixi.js'
Promise = require('es6-promise').Promise

class module.exports.CharacterTextures
  @load: (variant) ->
    loader = new pixi.JsonLoader("images/dawnlike/Characters/textures/#{variant}.json")
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
      # Because of this, if you load two CharacterTextures at the same time, the
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
        json = JSON.parse(loader.ajaxRequest.responseText)
        result = new TextureVariant(variant, json)

      loader.once('loaded', ->
        resolve(result)
      )
      loader.once('error', (args...) -> console.log(args...); reject(args...))
      loader.load()

class TextureVariant
  constructor: (@name, json) ->
    for textureId of json.frames
      textureName = textureId
      this[textureName] = pixi.TextureCache[textureId]
      pixi.Texture.removeTextureFromCache(textureId)
