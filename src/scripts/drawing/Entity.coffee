pixi = require 'pixi.js'
animation = require('./Animation')

class module.exports.Entity extends pixi.Sprite
  constructor: (options) ->
    { texture } = options
    @set(options)
    super(texture)

  set: ({ @type, @id }) ->

  transition: (duration, properties) ->
    if @transitionAnimation && !@transitionAnimation.isFinished()
      @transitionAnimation.stop()
    @transitionAnimation = new animation.Transition(this, properties, duration)

  bulge: (duration, bulgeAmount) ->
    if @bulgeAnimation && !@bulgeAnimation.isFinished()
      @bulgeAnimation.stop()
    @bulgeAnimation = new animation.Bulge(this, bulgeAmount, duration)

  @create: (textureMap, type) ->
    new Entity({ type, texture: textureMap["#{type}_0"] })
