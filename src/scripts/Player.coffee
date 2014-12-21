Entity = require('Entity').Entity

class Player extends Entity
  constructor: (options) ->
    options.health ?= 10
    super(options)

module.exports.Player = Player
