events = require 'events'
pixi = require 'pixi.js'
FloorTextures = require('tiles/dawnlike/Floor').FloorTextures
WallTextures = require('tiles/dawnlike/Wall').WallTextures
CharacterTextures = require('tiles/dawnlike/Character').CharacterTextures
animation = require('./Animation')
Array2D = require('util/Array2D')
_ = require('underscore')

PREVIOUSLY_SEEN = 'previouslySeen'
CURRENTLY_VISIBLE = 'currentlyVisible'

ANIMATION_DURATION = 100

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
    Promise.all([
      FloorTextures.load(),
      WallTextures.load('brick/light').then( (wallTexture) =>
        @wallTexture = wallTexture
      ),
      CharacterTextures.load('rodent').then( (rodentTextures) =>
        @rodentTextures = rodentTextures
      )
    ]).then =>
      @floorTextureMap = FloorTextures.floorTypes.bricks.grey
      groundTexture = pixi.Texture.fromImage("images/dawnlike/Objects/Ground0.png")
      @bloodTexture = new pixi.Texture(
        groundTexture,
        new pixi.Rectangle(16 * 1, 16 * 5, 16, 16)
      )
      humanoidTexture = pixi.Texture.fromImage("images/dawnlike/Characters/Humanoid0.png")
      @game.playerTexture = new pixi.Texture(
        humanoidTexture,
        new pixi.Rectangle(16 * 0, 16 * 7, 16, 16)
      )

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

  floorSprite: (x, y) ->
    tile = @game.level.tiles[x][y]
    sprite = new pixi.Sprite(
      @floorTextureMap[ tile.north ][ tile.east ][ tile.south ][ tile.west ]
    )

    sprite.x = x * 16
    sprite.y = y * 16
    sprite

  wallSprite: (x, y) ->
    tile = @game.level.tiles[x][y]
    textureName = "#{if tile.north == 'wall' then 'N' else '_'}#{if tile.east is "wall" then "E" else "_"}#{if tile.south is "wall" then "S" else "_"}#{if tile.west is "wall" then "W" else "_"}"
    sprite = new pixi.Sprite(
      @wallTexture[textureName]
    )

    sprite.x = x * 16
    sprite.y = y * 16
    sprite

  drawTile: (x, y, visibility) ->
    tile = @tiles[x][y]

    if not tile?
      switch @game.level.tiles[x][y]?.type
        when 'floor'
          tile = @floorSprite(x, y)
        when 'wall'
          wallSprite = @wallSprite(x, y)
          tile = wallSprite if wallSprite?
      tile.alpha = 0
      @layers.level.addChild tile
      @tiles[x][y] = tile

    if visibility == PREVIOUSLY_SEEN
      @queueAnimation animation.transition(tile, {
        alpha: 0.5
      }, ANIMATION_DURATION)
    else
      @queueAnimation animation.transition(tile, {
        alpha: 1.0
      }, ANIMATION_DURATION)

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

  on_damageInflicted: (source, destination) ->
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

