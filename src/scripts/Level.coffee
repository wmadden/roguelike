Array2D = require('./util/Array2D')
ROT = require('rot-js').ROT
_ = require('underscore')

WALL = 1
FLOOR = 0

class Level
  constructor: ({ @width, @height }) ->
    @freeTiles = []
    @tiles = Array2D.create(@width, @height)
    @entities = []

  generate: ->
    tiles = Array2D.create(@width, @height)
    callback = (x, y, wall) =>
      tiles[x][y] ?= []
      tiles[x][y] = wall #if wall then WALL else FLOOR
      @freeTiles.push([x,y]) unless wall == 1
    @map = new ROT.Map.Digger(@width, @height)
    @map.create(callback)
    @processGeneratedMap(@map, tiles)

  processGeneratedMap: (map, rawTiles) ->
    for x in [0..@width]
      for y in [0..@height]
        @tiles[x][y] = @createTile(rawTiles, x, y)

  createTile: (rawTiles, x, y) ->
    if rawTiles[x][y] == 1 # Wall
      @createWallTile(rawTiles, x, y)
    else
      @createFloorTile(rawTiles, x, y)

  createFloorTile: (rawTiles, x, y) ->
    tile = new Tile('floor')
    tile.north = if @hasNorthWall(rawTiles,x,y) then 'wall' else 'none'
    tile.east = if @hasEastWall(rawTiles,x,y) then 'wall' else 'none'
    tile.south = if @hasSouthWall(rawTiles,x,y) then 'wall' else 'none'
    tile.west = if @hasWestWall(rawTiles,x,y) then 'wall' else 'none'
    tile

  createWallTile: (rawTiles, x, y) ->
    if @adjacentFloorTile(rawTiles, x, y)
      tile = new Tile('wall')
      tile.north = if @wallContinuesNorth(rawTiles,x,y) then 'wall' else 'none'
      tile.east = if @wallContinuesEast(rawTiles,x,y) then 'wall' else 'none'
      tile.south = if @wallContinuesSouth(rawTiles,x,y) then 'wall' else 'none'
      tile.west = if @wallContinuesWest(rawTiles,x,y) then 'wall' else 'none'
      tile

  adjacentFloorTile: (rawTiles, x, y) ->
    @adjacentTiles(rawTiles, x, y).indexOf(FLOOR) != -1

  adjacentTiles: (rawTiles, x, y) ->
    result = []
    result.push(rawTiles[x][y-1]) if y > 0
    result.push(rawTiles[x+1][y-1]) if y > 0 && x < @width
    result.push(rawTiles[x+1][y]) if x < @width
    result.push(rawTiles[x+1][y+1]) if x < @width && y < @height
    result.push(rawTiles[x][y+1]) if y < @height
    result.push(rawTiles[x-1][y+1]) if x > 0 && y < @height
    result.push(rawTiles[x-1][y]) if x > 0
    result.push(rawTiles[x-1][y-1]) if x > 0 && y > 0
    result

  hasNorthWall: (tiles, x, y) ->
    return true if y == 0
    tiles[x][y-1] == 1

  hasSouthWall: (tiles, x, y) ->
    return true if y == @height
    tiles[x][y+1] == 1

  hasWestWall: (tiles, x, y) ->
    return true if x == 0
    tiles[x-1][y] == 1

  hasEastWall: (tiles, x, y) ->
    return true if x == @width
    tiles[x+1][y] == 1

  wallContinuesNorth: (tiles, x, y) ->
    return false if y == 0
    tiles[x][y-1] == 1 && @adjacentFloorTile(tiles, x, y-1)

  wallContinuesSouth: (tiles, x, y) ->
    return false if y == @height
    tiles[x][y+1] == 1 && @adjacentFloorTile(tiles, x, y+1)

  wallContinuesWest: (tiles, x, y) ->
    return false if x == 0
    tiles[x-1][y] == 1 && @adjacentFloorTile(tiles, x-1, y)

  wallContinuesEast: (tiles, x, y) ->
    return false if x == @width
    tiles[x+1][y] == 1 && @adjacentFloorTile(tiles, x+1, y)

  entityAt: (x, y) ->
    _(@entities).find (entity) -> entity.x == x && entity.y == y


class Tile
  constructor: (@type) ->

module.exports.Level = Level
