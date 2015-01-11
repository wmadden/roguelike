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
    @visibleEntities = []
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

    @_observeDungeonFeaturesVisibilityChange(previouslyVisibleTiles, newlyVisibleTiles)

  updateVisibleEntities: (newlyVisibleEntities) ->
    previouslyVisibleEntities = @visibleEntities

    entitiesEnteringFOV = []
    entitiesLeavingFOV = []
    for entity in _(previouslyVisibleEntities.concat(newlyVisibleEntities)).unique((e) -> e.id)
      wasPreviouslyVisible = !!_(previouslyVisibleEntities).find((e) -> e.id == entity.id)
      isCurrentlyVisible = !!_(newlyVisibleEntities).find((e) -> e.id == entity.id)

      if wasPreviouslyVisible && !isCurrentlyVisible
        entitiesLeavingFOV.push(entity)
        # @_observeEntityLeaveFOV(id: entity.id, entityState: entity)
      else if !wasPreviouslyVisible && isCurrentlyVisible
        entitiesEnteringFOV.push(entity)
        # @_observeEntityEnterFOV(id: entity.id, entityState: entity)

    @_observeEntitiesVisibilityChange({ entitiesEnteringFOV, entitiesLeavingFOV })
    @visibleEntities = newlyVisibleEntities

  clearVisible: ->
    @visible = {}
    @visibleTiles = []

  _observeDungeonFeaturesVisibilityChange: (previouslyVisibleTiles, newlyVisibleTiles) ->
    @eventStream.push({
      type: 'dungeonFeaturesVisibilityChange'
      previouslyVisibleTiles
      newlyVisibleTiles
    })


  _observeEntitiesVisibilityChange: ({ entitiesEnteringFOV, entitiesLeavingFOV }) ->
    @eventStream.push({
      type: 'entitiesVisibilityChanged'
      entitiesEnteringFOV
      entitiesLeavingFOV
    })

  # TODO: rephrase event types in the past tense
  observeEntitySpawn: ({ id, entityState }) ->
    previousState = entityState
    previousState.visibility = UNSEEN
    newState = _(previousState).clone()
    newState.visibility = CURRENTLY_VISIBLE
    @visibleEntities.push(entityState)
    @eventStream.push({
      type: 'entitySpawn'
      entity: {
        id
        previousState
        newState
      }
    })

  observeEntityMove: ({ id, previousState, newState }) ->
    if newState.visibility == CURRENTLY_VISIBLE
      isVisible = _(@visibleEntities).find (e) -> e.id == id
      @visibleEntities.push(newState) unless isVisible
    else
      @visibleEntities = _(@visibleEntities).reject (e) -> e.id == id
    @eventStream.push({
      type: 'entityMove'
      entity: {
        id
        previousState: previousState
        newState: newState
      }
    })
