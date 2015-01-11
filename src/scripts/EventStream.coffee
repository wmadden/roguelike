events = require 'events'
Promise = require('es6-promise').Promise

# EventStream is a Stream-like object that allows listeners to consume events
# and can be piped into other streams.
class module.exports.EventStream extends events.EventEmitter
  constructor: ->
    @_eventQueue = []

  eventsRemaining: -> @_eventQueue.length

  push: (event) ->
    @_eventQueue.push(event)
    @emit('push', event)

  pop: ->
    event = @_eventQueue.shift()
    @emit('pop', event)
    event

  # Returns a Promise that resolves with the next event emitted by the stream.
  next: ->
    new Promise (resolve, reject) =>
      if @eventsRemaining() > 0
        resolve(@pop())
      else
        @once('push', =>
          resolve(@pop())
        )

  remainingEvents: -> @_eventQueue.length
