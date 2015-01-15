ROT = require('rot-js').ROT
_ = require('underscore')

class module.exports.Entity
  constructor: ({ @type, @x, @y, @health, @visibleWorld }) ->

  sightRadius: 10

  nextAction: ->
    availableDirections = _(ROT.DIRS[8]).reduce (memo, movementDiff, i) =>
      [xDiff, yDiff] = movementDiff
      [destX, destY] = [@x + xDiff, @y + yDiff]
      if @visibleWorld.tileOccupied(destX, destY)
        memo.push(i)
      memo
    , []
    if availableDirections.length == 0
      throw new Error("Can't do anything")
    index = Math.floor(Math.random() * availableDirections.length)
    direction = availableDirections[index]
    action: 'step', direction: direction

  state: ->
    _(this).pick('x', 'y', 'type', 'id', 'dead')
