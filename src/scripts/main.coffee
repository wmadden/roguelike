# You can use either WebGLRenderer or CanvasRenderer
pixi = require("pixi")
document.addEventListener "DOMContentLoaded", ->

  animate = ->
    bunny.rotation += 0.01
    renderer.render stage
    requestAnimationFrame animate
    return
  renderer = new pixi.WebGLRenderer(800, 600)
  document.body.appendChild renderer.view
  stage = new pixi.Stage
  bunnyTexture = pixi.Texture.fromImage("images/bunny.png")
  bunny = new pixi.Sprite(bunnyTexture)
  bunny.position.x = 400
  bunny.position.y = 300
  bunny.scale.x = 2
  bunny.scale.y = 2
  stage.addChild bunny
  requestAnimationFrame animate
