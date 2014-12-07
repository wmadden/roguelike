# You can use either WebGLRenderer or CanvasRenderer
pixi = require("pixi.js")
Game = require('./game').Game

document.addEventListener "DOMContentLoaded", ->
  renderer = new pixi.WebGLRenderer(800, 600)
  document.body.appendChild renderer.view
  stage = new pixi.Stage

  game = new Game(
    renderer: renderer,
    stage: stage
  )

  requestAnimationFrame -> game.animate()
