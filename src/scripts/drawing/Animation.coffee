events = require 'events'
_ = require 'underscore'

module.exports.Animation = class Animation extends events.EventEmitter
  act: ->
    new Promise (resolve, reject) ->
      resolve() if isComplete()
      # reject() if cancelled()
      @once('complete', resolve)

  update: (msElapsed) ->

  isComplete: -> @_complete

  markCompleted: ->
    return if @_complete
    @_complete = true
    @emit('complete')

  stop: ->
    @markCompleted()

module.exports.Transition = class Transition extends Animation
  constructor: (@sprite, @properties, @duration, transitionFunction) ->
    @transitionFunction = transitionFunction if transitionFunction?
    @originalProperties = _(@sprite).pick(_(@properties).keys())

  update: (msElapsed) ->
    return if @isComplete()
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
      @markCompleted()

  @LINEAR: (originalValue, finalValue, currentValue, duration, msElapsed) ->
    totalDelta = finalValue - originalValue
    delta = totalDelta / duration * msElapsed

  transitionFunction: @LINEAR


module.exports.transition = (sprite, properties, duration, transitionFunction = null) ->
  new Transition(sprite, properties, duration, transitionFunction)
