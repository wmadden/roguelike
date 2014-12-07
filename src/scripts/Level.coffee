ROT = require('rot-js').ROT

class Level
  WALL: 1
  FLOOR: 0

  constructor: ({ @width, @height }) ->
    @tiles = []
    for i in [0..@width]
      @tiles[i] = new Array(@height)

  generate: ->
    callback = (x, y, wall) =>
      @tiles[x][y] ?= []
      @tiles[x][y] = wall #if wall then WALL else FLOOR
    map = new ROT.Map.Digger(@width, @height)
    map.create(callback)

module.exports.Level = Level
