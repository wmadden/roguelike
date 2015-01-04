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
      not animation.isComplete()

    if @pendingAnimations.length == 0
      @emit('animationsComplete')

  queueAnimation: (animation) ->
    @pendingAnimations.push animation

  attachToEventStream: (eventStream) ->
    eventStream.next().then (event) =>
      @processEvent(event).then =>
        @attachToEventStream(eventStream)

  processEvent: (event) ->
    console.log "Render event '#{event.type}'"
    Promise.resolve(this["process_#{event.type}"]?(event))

  process_entitySpawn: (event) ->
    { id, newState } = event.entity
    previousState = _(newState).chain().clone().extend({
      visibility: UNSEEN
    }).value()
    @updateEntity({ id, previousState, newState })

  process_entityMove: (event) ->
    { id, previousState, newState } = event.entity
    previousState = _(newState).chain().clone().extend({
      visibility: UNSEEN
    }).value()
    @updateEntity(event.entity)

  updateEntity: ({ id, previousState, newState }) ->
    entity = @entities[id]
    if not entity
      entity = @createEntity(previousState.type)
      this.entities[id] = entity
      @layers.entities.addChild entity

    if previousState.type != newState.type
      throw new Error("Can't yet render entity transformation")

    entity.x = previousState.x * 16
    entity.y = previousState.y * 16
    entity.alpha = @visibilityAlpha(previousState.visibility)

    new Promise ( resolve, reject ) =>
      animation = entity.transition( ANIMATION_DURATION, {
        x: newState.x * 16
        y: newState.y * 16
        alpha: @visibilityAlpha(newState.visibility)
      })
      @queueAnimation animation
      animation.on('complete', resolve)

  createEntity: (type) ->
    switch type
      when 'player'
        new Entity(type: 'player', texture: @playerTexture)
      when 'bunny-brown'
        Entity.create(@rodentTextures, type)

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
      animation.on('complete', resolve)

  visibilityAlpha: (visibility) -> VISIBILITY_ALPHAS[visibility]
