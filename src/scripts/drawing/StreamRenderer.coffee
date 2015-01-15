events = require 'events'
pixi = require 'pixi.js'
animation = require('./Animation')
Array2D = require('util/Array2D')
Textures = require('./Textures').Textures
_ = require('underscore')
Tile = require('./Tile').Tile
sightMap = require('SightMap')
Entity = require('./Entity').Entity

UNSEEN = sightMap.UNSEEN
PREVIOUSLY_SEEN = sightMap.PREVIOUSLY_SEEN
CURRENTLY_VISIBLE = sightMap.CURRENTLY_VISIBLE

VISIBILITY_ALPHAS = {}
VISIBILITY_ALPHAS[UNSEEN] = 0.0
VISIBILITY_ALPHAS[PREVIOUSLY_SEEN] = 0.5
VISIBILITY_ALPHAS[CURRENTLY_VISIBLE] = 1.0

ANIMATION_DURATION = 50

class module.exports.StreamRenderer extends events.EventEmitter
  scale: new pixi.Point(1,1)
  constructor: ({ @stage, @game, scale }) ->
    @needsRedraw = false
    @pendingAnimations = []
    @scale = scale if scale?
    @layers = {
      level: new pixi.DisplayObjectContainer()
      decals: new pixi.DisplayObjectContainer()
      entities: new pixi.DisplayObjectContainer()
      effects: new pixi.DisplayObjectContainer()
    }

    @rootDisplayObjectContainer = new pixi.DisplayObjectContainer()
    @rootDisplayObjectContainer.addChild(@layers.level)
    @rootDisplayObjectContainer.addChild(@layers.entities)
    @rootDisplayObjectContainer.addChild(@layers.effects)
    @rootDisplayObjectContainer.scale = @scale

    @tiles = Array2D.create(@game.level.width, @game.level.height)
    @entities = {}

    @stage.addChild(@rootDisplayObjectContainer)

  loadTextures: ->
    Textures.loadAll().then =>
      @bloodTexture = Textures.bloodTexture
      @wallTexture = Textures.wallTexture
      @rodentTextures = Textures.rodentTextures
      @floorTextureMap = Textures.floorTextureMap
      @playerTexture = Textures.playerTexture
      @texturesLoaded = true

  update: (msElapsed) ->
    return unless @texturesLoaded
    if @pendingAnimations.length > 0
      @needsRedraw = true
      @updateAnimations(msElapsed)

  updateAnimations: (msElapsed) ->
    @pendingAnimations = _(@pendingAnimations).filter (animation) ->
      animation.update(msElapsed)
      not animation.isFinished()

    if @pendingAnimations.length == 0
      @emit('animationsComplete')

  queueAnimation: (animation) ->
    @pendingAnimations.push animation

  attachToEventStream: (eventStream) ->
    eventStream.next().then (event) =>
      @processEvent(event).then =>
        @attachToEventStream(eventStream)

  processEvent: (event) ->
    console.log "Render event '#{event.type}'", event
    processEventsSequentially = true
    if processEventsSequentially
      Promise.resolve(this["process_#{event.type}"]?(event))
    else
      this["process_#{event.type}"]?(event)
      Promise.resolve()

  process_entitySpawn: (event) ->
    { id, newState } = event.entity
    @updateEntity(event.entity)

  process_entityMove: (event) ->
    { id, previousState, newState } = event.entity
    @updateEntity(event.entity)

  process_damageInflicted: (event) ->
    { destination: { id, previousState, newState } } = event
    entity = @entities[id]
    @queueAnimation entity.bulge( ANIMATION_DURATION, new pixi.Point(1.25, 1.25) )

    if not event.destination.newState.dead
      @updateEntity(event.destination)
    else
      # TODO: don't manipulate the event state to do this, use an explicit method
      event.destination.newState.visibility = UNSEEN
      @updateEntity(event.destination)

  process_entitiesVisibilityChanged: (event) ->
    { entitiesEnteringFOV, entitiesLeavingFOV } = event
    for entityState in entitiesEnteringFOV
      previousState = entityState
      previousState.visibility = UNSEEN
      newState = _(previousState).clone()
      newState.visibility = CURRENTLY_VISIBLE
      @updateEntity({ id: entityState.id, previousState, newState })
    for entityState in entitiesLeavingFOV
      previousState = entityState
      previousState.visibility = CURRENTLY_VISIBLE
      newState = _(previousState).clone()
      newState.visibility = UNSEEN
      @updateEntity({ id: entityState.id, previousState, newState })

  updateEntity: ({ id, previousState, newState }) ->
    entity = @entities[id]
    if not entity
      entity = @createEntity(previousState.type)
      this.entities[id] = entity
      @layers.entities.addChild entity

    if previousState.type != newState.type
      throw new Error("Can't yet render entity transformation")

    entity.x = previousState.x * 16 + 8
    entity.y = previousState.y * 16 + 8
    entity.alpha = @visibilityAlpha(previousState.visibility)

    new Promise ( resolve, reject ) =>
      animation = entity.transition( ANIMATION_DURATION, {
        x: newState.x * 16 + 8
        y: newState.y * 16 + 8
        alpha: @visibilityAlpha(newState.visibility)
      })
      @queueAnimation animation
      animation.on('finished', resolve)

  createEntity: (type) ->
    switch type
      when 'player'
        entity = new Entity(type: 'player', texture: @playerTexture)
      when 'bunny-brown'
        entity = Entity.create(@rodentTextures, type)
    entity.pivot = new pixi.Point(8,8)
    return entity

  process_dungeonFeaturesVisibilityChange: (event) ->
    { previouslyVisibleTiles, newlyVisibleTiles } = event
    updates = []
    for tile in previouslyVisibleTiles
      { x, y } = tile
      updates.push @updateTile( x, y, @game.level.tiles[x][y], PREVIOUSLY_SEEN)
    for tile in newlyVisibleTiles
      { x, y } = tile
      updates.push @updateTile( x, y, @game.level.tiles[x][y], CURRENTLY_VISIBLE)
    Promise.all( updates )

  createTile: (x, y) ->
    gameTile = @game.level.tiles[x][y]
    if gameTile.type == 'floor'
      tileDescriptor = {
        floor: _(gameTile).extend(textureMap: @floorTextureMap)
      }
    else
      tileDescriptor = {
        wall: _(gameTile).extend(textureMap: @wallTexture)
      }
    _(new Tile(tileDescriptor)).tap (tile) ->
      tile.x = x * 16
      tile.y = y * 16

  updateTile: (x, y, gameTile, visibility) ->
    tile = @tiles[x][y]

    if not tile?
      tile = @createTile(x, y)
      tile.alpha = 0
      @layers.level.addChild tile
      @tiles[x][y] = tile

    new Promise ( resolve, reject ) =>
      animation = tile.transition(ANIMATION_DURATION, {
        alpha: @visibilityAlpha(visibility)
      })
      @queueAnimation animation
      animation.on('finished', resolve)

  visibilityAlpha: (visibility) -> VISIBILITY_ALPHAS[visibility]
