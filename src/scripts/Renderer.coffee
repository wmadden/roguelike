pixi = require 'pixi.js'
FloorTextures = require('./tiles/dawnlike/Floor').FloorTextures
WallTextures = require('./tiles/dawnlike/Wall').WallTextures

PREVIOUSLY_SEEN = 'previouslySeen'
CURRENTLY_VISIBLE = 'currentlyVisible'

class module.exports.Renderer #extends events.EventEmitter
  scale: new pixi.Point(1,1)
  constructor: ({ @stage, @level, @player, scale })->
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

  clearLayers: ->
    for name, layer of @layers
      layer.removeChildren()

  update: ->
    @clearLayers()
    @drawCreatures()
    @drawLevel()

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
    switch @level.tiles[x][y]?.type
      when 'floor'
        tile = @floorSprite(x, y)
      when 'wall'
        wallSprite = @wallSprite(x, y)
        tile = wallSprite if wallSprite?
    return unless tile # TODO: Do we really need this check?
    if visibility == PREVIOUSLY_SEEN
      tile.alpha = 0.5
    else
      tile.alpha = 1.0
    @layers.level.addChild tile

  drawLevel: (level) ->
    for {x, y} in @player.sightMap.visibleTiles
      @drawTile(x, y, CURRENTLY_VISIBLE)
    for {x, y} in @player.sightMap.seenTiles
      @drawTile(x, y, PREVIOUSLY_SEEN) unless @player.sightMap.isVisible({x, y})

  drawCreatures: ->
    @player.sprite = new pixi.Sprite(@playerTexture)
    @player.sprite.x = 16 * @player.x
    @player.sprite.y = 16 * @player.y
    @layers.entities.addChild(@player.sprite)
