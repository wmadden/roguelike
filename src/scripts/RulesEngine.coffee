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
    entity.id = entityIdCounter
    @level.entities.push(entity)
    entityIdCounter += 1
    entity.sightMap.observeEntitySpawn({
      type: entity.type
      id: entity.id
      entityState: entity.state()
    })

  spawnPlayer: ->
    freeTile = @level.freeTiles.pop()
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
    nowVisible = []

    fov.compute( entity.x, entity.y, entity.sightRadius, (x, y, r, visibility) ->
      nowVisible.push {x, y}
    )

    entity.sightMap.updateVisibleTiles(nowVisible)

  attack: ({ actor, direction }) ->
    coords = @getDestination(actor, direction)
    targetEntity = @level.entityAt(coords...)
    @inflictDamage(actor, targetEntity, 1)

  getDestination: (actor, direction) ->
    movementDiff = ROT.DIRS[8][direction]
    [xDiff, yDiff] = movementDiff
    [actor.x + xDiff, actor.y + yDiff]

  move: (entity, destination) ->
    previousState = entity.state()
    previousState.visibility = sightMap.CURRENTLY_VISIBLE

    [destX, destY] = destination
    entity.x = destX
    entity.y = destY

    newState = entity.state()
    newState.visibility = sightMap.CURRENTLY_VISIBLE

    entity.sightMap?.observeEntityMove({
      entity: {
        id: entity.id
        previousState
        newState
      }
    })
    # TODO: notify any other entities observing this entity's movement

  inflictDamage: (source, destination, damage) ->
    destination.health -= damage
    if destination.health <= 0
      destination.health = 0
      destination.dead = true
