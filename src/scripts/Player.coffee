class Player
  constructor: ({ @x, @y })->

  move: ({ x, y }) ->
    @x += x
    @y += y

  sightRadius: 10

module.exports.Player = Player
