_ = require('underscore')
EventStream = require('EventStream').EventStream

module.exports.UNSEEN = UNSEEN = 'unseen'
module.exports.PREVIOUSLY_SEEN = PREVIOUSLY_SEEN = 'previouslySeen'
module.exports.CURRENTLY_VISIBLE = CURRENTLY_VISIBLE = 'currentlyVisible'

class module.exports.SightMap
  constructor: ->
    # Hashes describing which tiles have been seen and are currently visible
    @seen = {}
    @visible = {}
    # Arrays of tile objects that have been seen and are currently visible
    @seenTiles = []
    @visibleTiles = []
    @eventStream = new EventStream()

  haveSeen: ({x, y}) -> @seen[x]?[y]

  isVisible: ({x, y}) -> @visible[x]?[y]

  markAsSeen: (tile) ->
    {x, y} = tile
    @seen[x] ?= {}
    return if @seen[x][y]
    @seen[x][y] = true
    @seenTiles.push tile

  markAsVisible: (tile) ->
    {x, y} = tile
    @visible[x] ?= {}
    return if @visible[x][y]
    @markAsSeen tile
    @visible[x][y] = true
    @visibleTiles.push tile

  updateVisibleTiles: (newlyVisibleTiles) ->
    previouslyVisibleTiles = @visibleTiles

    @clearVisible()
    for tile in newlyVisibleTiles
      @markAsVisible(tile)

    @eventStream.push({
      type: 'dungeonFeaturesVisibilityChange'
      previouslyVisibleTiles
      newlyVisibleTiles
    })

  clearVisible: ->
    @visible = {}
    @visibleTiles = []

  observeEntitySpawn: ({ type, id, entityState }) ->
    entityState.visibility = CURRENTLY_VISIBLE
    @eventStream.push({
      type: 'entitySpawn'
      entity: {
        type,
        id,
        newState: entityState
      }
    })

  observeEntityMove: (entity, origin, destination) ->
    @eventStream.push({
      type: 'entityMove'
      entity, origin, destination
    })
