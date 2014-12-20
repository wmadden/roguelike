class module.exports.SightMap
  constructor: ({ @width, @height }) ->
    @seen = {}
    @seenTiles = []
    @visible = {}
    @visibleTiles = []

  haveSeen: ({x, y}) -> @seen[x]?[y]

  isVisible: ({x, y}) -> @visible[x]?[y]

  markAsSeen: ({x, y}) ->
    @seen[x] ?= {}
    return if @seen[x][y]
    @seen[x][y] = true
    @seenTiles.push {x, y}

  markAsVisible: ({x, y}) ->
    @visible[x] ?= {}
    return if @visible[x][y]
    @markAsSeen {x, y}
    @visible[x][y] = true
    @visibleTiles.push {x, y}

  clearVisible: ->
    @visible = {}
    @visibleTiles = []
