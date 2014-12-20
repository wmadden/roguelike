module.exports.create = (width, height) ->
  tiles = []
  for i in [0..width]
    tiles[i] = new Array(height)
  tiles
