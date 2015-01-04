events = require 'events'
pixi = require 'pixi.js'
animation = require('./Animation')
Array2D = require('util/Array2D')
Textures = require('./Textures').Textures
_ = require('underscore')
Tile = require('./Tile').Tile

PREVIOUSLY_SEEN = 'previouslySeen'
CURRENTLY_VISIBLE = 'currentlyVisible'

ANIMATION_DURATION = 50

class module.exports.Renderer extends events.EventEmitter
  scale: new pixi.Point(1,1)
  constructor: ({ @stage, @game, scale })->
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
    @rootDisplayObjectContainer.addChild(@layers.decals)
    @rootDisplayObjectContainer.addChild(@layers.entities)
    @rootDisplayObjectContainer.addChild(@layers.effects)
    @rootDisplayObjectContainer.scale = @scale

    @stage.addChild(@rootDisplayObjectContainer)

    @transitionLevel(@game.level)

  loadTextures: ->
    Textures.loadAll().then =>
      @bloodTexture = Textures.bloodTexture
      @wallTexture = Textures.wallTexture
      @rodentTextures = Textures.rodentTextures
      @floorTextureMap = Textures.floorTextureMap
      @game.playerTexture = Textures.playerTexture

  transitionLevel: (newLevel) ->
    # TODO: transition between levels
    @tiles = Array2D.create(@game.level.width, @game.level.height)

  clearLayers: ->
    for name, layer of @layers
      layer.removeChildren()

  update: ->
    # @clearLayers()
    @drawCreatures()
    @drawLevel()

  updateAnimations: (msElapsed) ->
    @pendingAnimations = _(@pendingAnimations).filter (animation) ->
      animation.update(msElapsed)
      not animation.isComplete()

    if @pendingAnimations.length == 0
      @emit('animationsComplete')

  queueAnimation: (animation) ->
    @pendingAnimations.push animation

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

  drawTile: (x, y, visibility) ->
    tile = @tiles[x][y]

    if not tile?
      tile = @createTile(x, y)
      tile.alpha = 0
      @layers.level.addChild tile
      @tiles[x][y] = tile

    if visibility == PREVIOUSLY_SEEN
      @queueAnimation tile.transition(ANIMATION_DURATION, {
        alpha: 0.5
      })
    else
      @queueAnimation tile.transition(ANIMATION_DURATION, {
        alpha: 1.0
      })

  drawLevel: (level) ->
    for {x, y} in @game.player.sightMap.visibleTiles
      @drawTile(x, y, CURRENTLY_VISIBLE)
    for {x, y} in @game.player.sightMap.seenTiles
      @drawTile(x, y, PREVIOUSLY_SEEN) unless @game.player.sightMap.isVisible({x, y})

  getCreatureSprite: (type) ->
    new pixi.Sprite(@rodentTextures["#{type}_0"])

  drawCreatures: ->
    unless @game.player.sprite?
      @game.player.sprite = new pixi.Sprite(@game.playerTexture)
      @game.player.sprite.x = 16 * @game.player.x
      @game.player.sprite.y = 16 * @game.player.y

    # Draw the player
    @queueAnimation animation.transition(@game.player.sprite,
      x: 16 * @game.player.x
      y: 16 * @game.player.y
    , ANIMATION_DURATION)
    @layers.entities.addChild(@game.player.sprite)

    for entity in @game.level.entities
      unless entity.sprite
        entity.sprite = @getCreatureSprite(entity.type)
        entity.sprite.x = 16 * entity.x
        entity.sprite.y = 16 * entity.y
        entity.sprite.alpha = 0

      if entity.dead
        # Death animation
        @queueAnimation animation.transition(entity.sprite,
          x: 16 * entity.x
          y: 16 * entity.y
          alpha: 0
        , ANIMATION_DURATION)
      else
        if @game.player.sightMap.isVisible(x: entity.x, y: entity.y)
          alpha = 1
        else
          alpha = 0

        @queueAnimation animation.transition(entity.sprite,
          x: 16 * entity.x
          y: 16 * entity.y
          alpha: alpha
        , ANIMATION_DURATION)

      @layers.entities.addChild(entity.sprite)

  on_entity_damageInflicted: (source, destination) ->
    blood = new pixi.Sprite(@bloodTexture)
    @layers.effects.addChild(blood)
    directionOfMovement = [destination.x - source.x, destination.y - source.y]
    blood.x = destination.x * 16 + (directionOfMovement[0] * 8)
    blood.y = destination.y * 16 + (directionOfMovement[1] * 8)
    blood.alpha = 1
    bloodAnimation = animation.transition(blood,
      x: (destination.x + directionOfMovement[0]) * 16
      y: (destination.y + directionOfMovement[1]) * 16
    , ANIMATION_DURATION)
    bloodAnimation.on('complete', =>
      @layers.effects.removeChild(blood)
      @layers.decals.addChild(blood)
    )
    @queueAnimation bloodAnimation
