pixi = require 'pixi.js'
events = require 'events'
_ = require 'underscore'

module.exports.Animation = class Animation extends events.EventEmitter
  constructor: ->
    @_started = false
    @_finished = false

  update: (msElapsed) -> # Implement in subclass

  isStarted: -> @_started
  isFinished: -> @_finished

  stop: ->
    return if @_finished
    @_finished = true
    @emit('finished')

module.exports.AnimationChain = class AnimationChain extends Animation
  constructor: (@animations = []) ->
    @currentAnimationIndex = null
    for animation in @animations
      animation.duration = @duration / @animations.length

  update: (msElapsed) ->
    if not @_started
      @_started = true
      @currentAnimationIndex = 0

    if @animations[@currentAnimationIndex].isFinished()
      allAnimationsAreFinished = @currentAnimationIndex == @animations.length - 1
      if allAnimationsAreFinished
        @stop()
        return

      @currentAnimationIndex += 1
    currentAnimation = @animations[@currentAnimationIndex]
    currentAnimation.update(msElapsed)

module.exports.Transition = class Transition extends Animation
  constructor: (@sprite, @properties, @duration, transitionFunction) ->
    @transitionFunction = transitionFunction if transitionFunction?
    @originalProperties = _(@sprite).pick(_(@properties).keys())

  update: (msElapsed) ->
    return if @isFinished()
    allPropertiesTransitioned = true
    for property, finalValue of @properties
      currentValue = @sprite[property]
      continue if currentValue == finalValue
      originalValue = @originalProperties[property]

      delta = @transitionFunction(originalValue, finalValue, currentValue, @duration, msElapsed)

      distanceToFinalValue = finalValue - currentValue
      if Math.abs(distanceToFinalValue) < Math.abs(delta)
        @sprite[property] = finalValue
      else
        allPropertiesTransitioned = false
        @sprite[property] += delta
    if allPropertiesTransitioned
      @stop()

  @LINEAR: (originalValue, finalValue, currentValue, duration, msElapsed) ->
    totalDelta = finalValue - originalValue
    delta = totalDelta / duration * msElapsed

  transitionFunction: @LINEAR

module.exports.ScaleTransition = class ScaleTransition extends Animation
  constructor: (@sprite, @desiredScale, @duration, transitionFunction) ->
    @transitionFunction = transitionFunction if transitionFunction?
    throw new Error("Scale must be a Point") unless @desiredScale instanceof pixi.Point
    super(@sprite, {}, @duration, transitionFunction)

  update: (msElapsed) ->
    return if @isFinished()

    unless @_started
      @originalScale = @sprite.scale.clone()
      @_started = true

    currentScale = @sprite.scale

    desiredScaleReached = currentScale.x == @desiredScale.x && currentScale.y == @desiredScale.y
    if desiredScaleReached
      @stop()
      return

    deltaX = @transitionFunction(@originalScale.x, @desiredScale.x, @sprite.scale.x, @duration, msElapsed)
    deltaY = @transitionFunction(@originalScale.y, @desiredScale.y, @sprite.scale.y, @duration, msElapsed)

    newX = @sprite.scale.x + deltaX
    newY = @sprite.scale.y + deltaY

    if deltaX > 0 && newX > @desiredScale.x || deltaX < 0 && newX < @desiredScale.x
      newX = @desiredScale.x
    if deltaY > 0 && newY > @desiredScale.y || deltaY < 0 && newY < @desiredScale.y
      newY = @desiredScale.y

    @sprite.scale = new pixi.Point(newX, newY)

  transitionFunction: Transition.LINEAR

module.exports.Bulge = class Bulge extends AnimationChain
  constructor: (@sprite, @bulgeAmount, @duration, transitionFunction) ->
    animations = [
      new ScaleTransition(@sprite, @bulgeAmount, @duration, transitionFunction)
      new ScaleTransition(@sprite, new pixi.Point(1.0, 1.0), @duration, transitionFunction)
    ]
    super(animations)

module.exports.transition = (sprite, properties, duration, transitionFunction = null) ->
  new Transition(sprite, properties, duration, transitionFunction)
