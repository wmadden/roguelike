ROT = require('rot-js').ROT
_ = require('underscore')

class module.exports.Entity
  constructor: ({ @type, @x, @y, @health, @rulesEngine }) ->

  sightRadius: 10

  act: ->
    availableDirections = _(ROT.DIRS[8]).reduce (memo, movementDiff, i) =>
      [xDiff, yDiff] = movementDiff
      [destX, destY] = [@x + xDiff, @y + yDiff]
      if @rulesEngine.canOccupy(destX, destY)
        memo.push(i)
      memo
    , []
    index = Math.floor(Math.random() * availableDirections.length)
    direction = availableDirections[index]
    @rulesEngine.step actor: this, direction: direction
