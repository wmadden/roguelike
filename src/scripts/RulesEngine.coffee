ROT = require('rot-js').ROT
events = require 'events'

class module.exports.RulesEngine extends events.EventEmitter
  constructor: (@level, @player) ->

  step: ({ actor, direction }) ->
    [destX, destY] = @getDestination(actor, direction)
    if @canOccupy(destX, destY)
      actor.x = destX
      actor.y = destY
      true
    else
      false

  canOccupy: (x, y) ->
    destinationTile = @level.tiles[x][y]
    destinationTile?.type == 'floor' && not @level.entityAt(x, y)? &&
      not (@player.x == x && @player.y == y)

  lightPasses: (x, y) ->
    @level.tiles[x]?[y]?.type == 'floor'

  updateSightmap: (entity) ->
    fov = new ROT.FOV.PreciseShadowcasting((x, y) => @lightPasses(x, y))
    entity.sightMap.clearVisible()
    fov.compute( entity.x, entity.y, entity.sightRadius, (x, y, r, visibility) ->
      entity.sightMap.markAsVisible {x, y}
    )

  attack: ({ actor, direction }) ->
    coords = @getDestination(actor, direction)
    targetEntity = @level.entityAt(coords...)
    @inflictDamage(actor, targetEntity, 1)

  getDestination: (actor, direction) ->
    movementDiff = ROT.DIRS[8][direction]
    [xDiff, yDiff] = movementDiff
    [actor.x + xDiff, actor.y + yDiff]

  inflictDamage: (source, destination, damage) ->
    destination.health -= damage
    if destination.health <= 0
      destination.health = 0
      destination.dead = true
    @emit('entity:damageInflicted', source, destination, damage)
