_ = require('underscore')
events = require 'events'
ROT = require('rot-js').ROT

Player = require('Player').Player
sightMap = require('SightMap')

entityIdCounter = 0

class module.exports.RulesEngine extends events.EventEmitter
  @PERMITTED_ENTITY_ACTIONS: ['step', 'attack']

  constructor: (@level) ->

  step: ({ actor, direction }) ->
    [destX, destY] = @getDestination(actor, direction)
    if @canOccupy(destX, destY)
      @move(actor, [destX, destY])
      true
    else
      false

  spawn: ({ entity, x, y }) ->
    entity.x = x
    entity.y = y
    entity.id = (entityIdCounter++)

    @updateSightmap(entity) if entity.sightMap?
    @level.entities.push(entity)

    for observer in @whoCanSeeEntity(entity)
      observer.sightMap?.observeEntitySpawn({
        type: entity.type
        id: entity.id
        entityState: entity.state()
      })

  spawnPlayer: ->
    freeTile = @level.freeTiles.shift()
    @player = new Player({})
    @spawn(entity: @player, x: freeTile[0], y: freeTile[1])
    @player

  canOccupy: (x, y) ->
    destinationTile = @level.tiles[x][y]
    destinationTile?.type == 'floor' && not @level.entityAt(x, y)? &&
      not (@player.x == x && @player.y == y)

  lightPasses: (x, y) ->
    @level.tiles[x]?[y]?.type == 'floor'

  updateSightmap: (entity) ->
    fov = new ROT.FOV.PreciseShadowcasting((x, y) => @lightPasses(x, y))
    nowVisibleTiles = []
    nowVisibleEntities = []

    fov.compute( entity.x, entity.y, entity.sightRadius, (x, y, r, visibility) =>
      nowVisibleTiles.push {x, y}
      # TODO: calculating entity visibility should probably not be here
      entityOnTile = @level.entityAt(x, y)
      nowVisibleEntities.push(entityOnTile.state()) if entityOnTile
    )

    entity.sightMap.updateVisibleTiles(nowVisibleTiles)
    entity.sightMap.updateVisibleEntities(nowVisibleEntities)

  attack: ({ actor, direction }) ->
    coords = @getDestination(actor, direction)
    targetEntity = @level.entityAt(coords...)
    @inflictDamage(actor, targetEntity, 1)

  getDestination: (actor, direction) ->
    movementDiff = ROT.DIRS[8][direction]
    [xDiff, yDiff] = movementDiff
    [actor.x + xDiff, actor.y + yDiff]

  move: (movingEntity, destination) ->
    previousState = movingEntity.state()
    previousState.visibility = sightMap.CURRENTLY_VISIBLE

    # People who can see the target before it moves
    entitiesObservingTargetAtOrigin = @whoCanSeeEntity(movingEntity)

    [destX, destY] = destination
    movingEntity.x = destX
    movingEntity.y = destY
    @updateSightmap(movingEntity) if movingEntity.sightMap?

    newState = movingEntity.state()
    newState.visibility = sightMap.CURRENTLY_VISIBLE

    entitiesObservingTargetAtDestination = @whoCanSeeEntity(movingEntity)

    for entity in @level.entities
      # TODO: decide if the entity was visible or not inside the SightMap
      previouslyVisible = _(entitiesObservingTargetAtOrigin).contains(entity)
      currentlyVisible = _(entitiesObservingTargetAtDestination).contains(entity)

      if previouslyVisible || currentlyVisible
        previousState.visibility = if previouslyVisible then sightMap.CURRENTLY_VISIBLE else sightMap.UNSEEN
        newState.visibility = if currentlyVisible then sightMap.CURRENTLY_VISIBLE else sightMap.UNSEEN
        entity.sightMap?.observeEntityMove({
          id: movingEntity.id
          previousState
          newState
        })

  inflictDamage: (source, destination, damage) ->
    destination.health -= damage
    if destination.health <= 0
      destination.health = 0
      destination.dead = true

  whoCanSeeEntity: (entity) ->
    # TODO: can they see this entity? Invisible, sneaking, etc.
    @whoCanSeeTile({ x: entity.x, y: entity.y })

  whoCanSeeTile: (tile) ->
    _(@level.entities).filter (entity) -> entity.sightMap?.isVisible(tile)
