# You can use either WebGLRenderer or CanvasRenderer
pixi = require("pixi.js")
Game = require('./game').Game

document.addEventListener "DOMContentLoaded", ->
  renderer = new pixi.WebGLRenderer(80 * 16, 40 * 16)
  document.body.appendChild renderer.view
  stage = new pixi.Stage

  game = new Game(
    pixiRenderer: renderer,
    stage: stage
  )

  game.load()

  drawLoop = ->
    game.draw()
    requestAnimationFrame(drawLoop)
  drawLoop()
