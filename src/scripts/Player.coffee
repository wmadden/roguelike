class Player
  constructor: ({ @x, @y })->

  move: ({ x, y }) ->
    @x += x
    @y += y

module.exports.Player = Player
