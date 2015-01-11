pixi = require 'pixi.js'
animation = require('./Animation')

class module.exports.Entity extends pixi.Sprite
  constructor: (options) ->
    { texture } = options
    @set(options)
    super(texture)

  set: ({ @type, @id }) ->

  transition: (duration, properties) ->
    if @transitionAnimation && !@transitionAnimation.isComplete()
      @transitionAnimation.stop()
    @transitionAnimation = animation.transition(this, properties, duration)

  @create: (textureMap, type) ->
    new Entity({ type, texture: textureMap["#{type}_0"] })
