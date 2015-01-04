SightMap = require('SightMap').SightMap
Entity = require('Entity').Entity

class Player extends Entity
  constructor: (options) ->
    options.health ?= 10
    super(options)
    @type = 'player'
    @sightMap = new SightMap()

  nextAction: -> throw new Error("Don't call me baby")

module.exports.Player = Player
