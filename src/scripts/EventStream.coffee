events = require 'events'
Promise = require('es6-promise').Promise

# EventStream is a Stream-like object that allows listeners to consume events
# and can be piped into other streams.
class module.exports.EventStream extends events.EventEmitter
  constructor: ->
    @_events = []

  push: (event) ->
    @_events.push(event)
    @emit('data', event)

  pop: -> @_events.shift()

  # Returns a Promise that resolves with the next event emitted by the stream.
  next: ->
    new Promise (resolve, reject) =>
      if @_events.length > 0
        resolve(@pop())
      else if @_ended
        reject()
      else
        @once('data', =>
          @removeListener('end', reject)
          resolve(@pop())
        )
        @once('end', reject)

  remainingEvents: -> @_events.length

  end: ->
    @_ended = true
    @emit('end')
