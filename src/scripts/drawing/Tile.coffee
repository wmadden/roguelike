pixi = require 'pixi.js'
animation = require('./Animation')

class module.exports.Tile extends pixi.DisplayObjectContainer
  constructor: (options) ->
    @set(options)

    delete options.floor
    delete options.wall
    delete options.decals

    super(options)

    @rebuild()

  set: ({ @floor, @wall, @decals }) ->

  rebuild: ->
    @addChild @_floor(@floor) if @floor
    @addChild @_wall(@wall) if @wall
    if @decals
      for decal in @decals
        @addChild @_decal(@decals.textureMap, decal)

  transition: (duration, properties) ->
    if @transitionAnimation && !@transitionAnimation.isComplete()
      @transitionAnimation.stop()
    @transitionAnimation = animation.transition(this, properties, duration)

  _floor: ({ textureMap, north, east, south, west }) ->
    new pixi.Sprite(
      textureMap[ north ][ east ][ south ][ west ]
    )

  _wall: ({ textureMap, north, east, south, west }) ->
    textureName = "#{if north == 'wall' then 'N' else '_'}#{if east is "wall" then "E" else "_"}#{if south is "wall" then "S" else "_"}#{if west is "wall" then "W" else "_"}"
    new pixi.Sprite(
      textureMap[textureName]
    )

  _decal: ({ textureMap, type }) ->
    new pixi.Sprite(textureMap[type])
