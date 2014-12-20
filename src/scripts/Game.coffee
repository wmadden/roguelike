pixi = require 'pixi.js'
ROT = require('rot-js').ROT
Level = require('./Level').Level
Player = require('./Player').Player
Promise = require('es6-promise').Promise
FloorTextures = require('./tiles/dawnlike/Floor').FloorTextures
WallTextures = require('./tiles/dawnlike/Wall').WallTextures
SightMap = require('./SightMap').SightMap

PREVIOUSLY_SEEN = 'previouslySeen'
CURRENTLY_VISIBLE = 'currentlyVisible'

class Game
  scale: new pixi.Point(1,1)

  constructor: ({ @stage, @renderer }) ->
    @scheduler = new ROT.Scheduler.Simple()
    @engine = new ROT.Engine(@scheduler)

    @level = new Level(width: 80, height: 40)
    @level.generate()

    @thingsHaveChanged = true
    @rulesEngine = new RulesEngine(@level, =>
      @thingsHaveChanged = true
      @updateLayers()
    )

    freeTile = @level.freeTiles[0]
    @player = new Player(x: freeTile[0], y: freeTile[1])
    @player.sightMap = new SightMap(width: @level.width, height: @level.height)

    @layers = {
      level: new pixi.DisplayObjectContainer()
      entities: new pixi.DisplayObjectContainer()
    }
    @rootDisplayObjectContainer = new pixi.DisplayObjectContainer()
    @rootDisplayObjectContainer.addChild(@layers.level)
    @rootDisplayObjectContainer.addChild(@layers.entities)
    @rootDisplayObjectContainer.scale = @scale
    @stage.addChild(@rootDisplayObjectContainer)

  load: ->
    @loadTextures().then =>
      @scheduler.add(
        new Schedulable( =>
          @rulesEngine.updateSightmap(@player)
          Promise.resolve()
        )
        , true
      )
      @scheduler.add(
        new WaitForPlayerInput(@rulesEngine, @player)
        , true
      )

      @engine.start()
      @drawLevel(@level)
      @drawCreatures()
    .catch (error) ->
      console.error(error)

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

  updateLayers: ->
    @clearLayers()
    @drawCreatures()
    @drawLevel()

  clearLayers: ->
    for name, layer of @layers
      layer.removeChildren()

  draw: ->
    return unless @thingsHaveChanged
    @renderer.render @stage
    @thingsHaveChanged = false
    return

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

class RulesEngine
  constructor: (@level, @thingsChangedCallback) ->
  step: ({ actor, direction }) ->
    movementDiff = ROT.DIRS[8][direction]
    [xDiff, yDiff] = movementDiff
    [destX, destY] = [actor.x + xDiff, actor.y + yDiff]
    destinationTile = @level.tiles[destX][destY]
    if destinationTile?.type == 'floor'
      actor.x = destX
      actor.y = destY
      @thingsChangedCallback()
      true
    else
      false
  lightPasses: (x, y) ->
    @level.tiles[x]?[y]?.type == 'floor'
  updateSightmap: (entity) ->
    fov = new ROT.FOV.PreciseShadowcasting((x, y) => @lightPasses(x, y))
    entity.sightMap.clearVisible()
    fov.compute( entity.x, entity.y, entity.sightRadius, (x, y, r, visibility) ->
      entity.sightMap.markAsVisible {x, y}
    )

class Schedulable
  constructor: (act = null) ->
    @act = act if act?
  act: -> Promise.resolve()

class WaitForPlayerInput extends Schedulable
  KEYMAP: {
    # Direction keys -> direction constants
    38: 0
    33: 1
    39: 2
    34: 3
    40: 4
    35: 5
    37: 6
    36: 7
  }

  constructor: (@rulesEngine, @player) ->

  act: ->
    new Promise (resolve, reject) =>
      keydownHandler = (event) =>
        code = event.keyCode
        return unless code of @KEYMAP
        event.preventDefault()

        direction = @KEYMAP[code]
        if @rulesEngine.step( actor: @player, direction: direction )
          window.removeEventListener('keydown', keydownHandler)
          resolve()

      window.addEventListener('keydown', keydownHandler)

module.exports.Game = Game
