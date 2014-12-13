pixi = require 'pixi.js'

textureAt = (originX, originY, x, y, w, h, baseTexture) ->
  new pixi.Texture(baseTexture,
    new pixi.Rectangle(originX + x * w, originY + y * h, w, h)
  )

floorMap = (originX, originY, tileWidth, tileHeight, baseTexture) ->
  # Shorthand
  oX = originX
  oY = originY
  tw = tileWidth
  th = tileHeight

  {
    wall: {                                                  # N---
      wall: {                                                # NE--
        wall: {                                              # NES-
          wall: textureAt(oX, oY, 5, 0, tw, th, baseTexture) # NESW
          none: textureAt(oX, oY, 6, 1, tw, th, baseTexture) # NES_
        }
        none: {                                              # NE_-
          wall: textureAt(oX, oY, 3, 0, tw, th, baseTexture) # NE_W
          none: textureAt(oX, oY, 2, 0, tw, th, baseTexture) # NE__
        }
      }
      none: {                                                # N_--
        wall: {                                              # N_S-
          wall: textureAt(oX, oY, 4, 1, tw, th, baseTexture) # N_SW
          none: textureAt(oX, oY, 5, 1, tw, th, baseTexture) # N_S_
        }
        none: {                                              # N__-
          wall: textureAt(oX, oY, 0, 0, tw, th, baseTexture) # N__W
          none: textureAt(oX, oY, 1, 0, tw, th, baseTexture) # N___
        }
      }
    }
    none: {
      wall: {                                                # _E--
        wall: {                                              # _ES-
          wall: textureAt(oX, oY, 3, 2, tw, th, baseTexture) # _ESW
          none: textureAt(oX, oY, 2, 2, tw, th, baseTexture) # _ES_
        }
        none: {                                              # _E_-
          wall: textureAt(oX, oY, 3, 1, tw, th, baseTexture) # _E_W
          none: textureAt(oX, oY, 2, 1, tw, th, baseTexture) # _E__
        }
      }
      none: {                                                # __--
        wall: {                                              # __S-
          wall: textureAt(oX, oY, 0, 2, tw, th, baseTexture) # __SW
          none: textureAt(oX, oY, 1, 2, tw, th, baseTexture) # __S_
        }
        none: {                                              # ___-
          wall: textureAt(oX, oY, 0, 1, tw, th, baseTexture) # ___W
          none: textureAt(oX, oY, 1, 1, tw, th, baseTexture) # ____
        }
      }
    }
  }

floorMapAt = (column, row, tileWidth, tileHeight, baseTexture) ->
  floorMapWidth = 7
  floorMapHeight = 3
  floorMap(
    column * floorMapWidth * tileWidth,
    row * floorMapHeight * tileHeight, tileWidth, tileHeight, baseTexture
  )

floorMapGroupAt = (column, row, tileWidth, tileHeight, baseTexture, names...) ->
  result = {}
  for name, i in names
    result[names[i]] = floorMapAt(column, row + i, tileWidth, tileHeight, baseTexture)
  result

class FloorTextures
  @load: ->
    @baseTexture = pixi.Texture.fromImage("images/dawnlike/Objects/Floor.png")

    tw = tileWidth = 16
    th = tileHeight = 16

    @floorTypes = {
      blackAndWhite: floorMapAt(0,0,tw,th, @baseTexture)
      bricks: floorMapGroupAt(0,1,tw,th, @baseTexture, 'cyan', 'grey', 'darkgrey', 'blue')
      grass:  floorMapGroupAt(1,1,tw,th, @baseTexture, 'cyan', 'grey', 'darkgreen', 'blue')
      rock:   floorMapGroupAt(2,1,tw,th, @baseTexture, 'yellow', 'orange', 'red', 'blue')
      dirt:   floorMapGroupAt(0,5,tw,th, @baseTexture, 'yellow', 'orange', 'red', 'blue')
      planks: floorMapGroupAt(1,5,tw,th, @baseTexture, 'pink', 'orange', 'greygreen', 'brown')
      sunlitDirt: floorMapGroupAt(2,5,tw,th, @baseTexture, 'yellow', 'orange', 'brown', 'blue')
      furrows: floorMapGroupAt(0,9,tw,th, @baseTexture, 'orange', 'brown', 'blue', 'darkblue')
    }

module.exports.FloorTextures = FloorTextures
