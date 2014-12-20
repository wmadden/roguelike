events = require 'events'
pixi = require 'pixi.js'
FloorTextures = require('tiles/dawnlike/Floor').FloorTextures
WallTextures = require('tiles/dawnlike/Wall').WallTextures
animation = require('./Animation')
Array2D = require('util/Array2D')
_ = require('underscore')

PREVIOUSLY_SEEN = 'previouslySeen'
CURRENTLY_VISIBLE = 'currentlyVisible'

ANIMATION_DURATION = 50

class module.exports.Renderer extends events.EventEmitter
  scale: new pixi.Point(1,1)
  constructor: ({ @stage, @level, @player, scale })->
    @pendingAnimations = []
    @scale = scale if scale?
    @layers = {
      level: new pixi.DisplayObjectContainer()
      entities: new pixi.DisplayObjectContainer()
    }

    @rootDisplayObjectContainer = new pixi.DisplayObjectContainer()
    @rootDisplayObjectContainer.addChild(@layers.level)
    @rootDisplayObjectContainer.addChild(@layers.entities)
    @rootDisplayObjectContainer.scale = @scale

    @stage.addChild(@rootDisplayObjectContainer)

    @transitionLevel(@level)

  loadTextures: ->
    new Promise (resolve, reject) =>
      FloorTextures.load()

      WallTextures.load('brick/light').then( (wallTexture) =>
        @wallTexture = wallTexture
        resolve()
      , reject)

      @floorTextureMap = FloorTextures.floorTypes.bricks.grey
      humanoidTexture = pixi.Texture.fromImage("images/dawnlike/Characters/Humanoid0.png")
      @playerTexture = new pixi.Texture(
        humanoidTexture,
        new pixi.Rectangle(16 * 0, 16 * 7, 16, 16)
      )

  transitionLevel: (newLevel) ->
    @level = newLevel
    # TODO: transition between levels
    @tiles = Array2D.create(@level.width, @level.height)

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
    tile = @level.tiles[x][y]
    sprite = new pixi.Sprite(
      @floorTextureMap[ tile.north ][ tile.east ][ tile.south ][ tile.west ]
    )

    sprite.x = x * 16
    sprite.y = y * 16
    sprite

  wallSprite: (x, y) ->
    tile = @level.tiles[x][y]
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
      switch @level.tiles[x][y]?.type
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
    for {x, y} in @player.sightMap.visibleTiles
      @drawTile(x, y, CURRENTLY_VISIBLE)
    for {x, y} in @player.sightMap.seenTiles
      @drawTile(x, y, PREVIOUSLY_SEEN) unless @player.sightMap.isVisible({x, y})

  drawCreatures: ->
    unless @player.sprite?
      @player.sprite = new pixi.Sprite(@playerTexture)
      @player.sprite.x = 16 * @player.x
      @player.sprite.y = 16 * @player.y
    else
      @queueAnimation animation.transition(@player.sprite,
        x: 16 * @player.x
        y: 16 * @player.y
      , ANIMATION_DURATION)

    @layers.entities.addChild(@player.sprite)
