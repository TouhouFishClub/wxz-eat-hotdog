/* 扩展数组对象 */
Array.prototype.remove = function(obj){
  for(let i = 0; i < this.length; i++){
    if(this[i] === obj){
      this.splice(i, 1)
      return
    }
  }
}

/* wxz */
class Wxz {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.down = 30
  }
  get xPos() {
    return this.x
  }
  get yPos() {
    return this.y
  }
  get count() {
    return this.down
  }
  dropUp() {
    this.y = this.y - 0.2
    this.down = this.down - 1
  }
  dropDown(speed) {
    this.y = this.y += speed
  }

}

/* hotdog */
class HotDog {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
  get xPos() {
    return this.x
  }
  get yPos() {
    return this.y
  }
  dropUp(speed) {
    this.y = this.y -= speed
  }
}

/* Game Core */
class Game {
  constructor(ctx){
    this.ctx = ctx
  }
  init() {
    this.wxzs = []
    this.wxzEats = []
    this.hotdogs = []
    this.FPS = 60
    this.frame = 0
    this.hotdogControl = 0
    this.MAX_HEIGHT = document.documentElement.clientHeight
    this.MAX_WIDTH = document.documentElement.clientWidth
    this.Level = 2
    this.cross = 0
    this.onTouch = false
    this.tapLeft = 0
    this.tapTop = 0

    let wxzImg = new Image()
    wxzImg.src = './source/wxz.png'
    this.wxzImg = wxzImg

    let wxzEatImg = new Image()
    wxzEatImg.src = './source/wxz-eating.png'
    this.wxzEatImg = wxzEatImg

    let hotDogImg = new Image()
    hotDogImg.src = './source/hotdog.png'
    this.hotDogImg = hotDogImg

    document.addEventListener('mousedown', e => {
      e.preventDefault()
      this.hotdogControl = 0
      this.onTouch = true
      this.tapLeft = e.clientX
      this.tapTop = e.clientY
    })
    document.addEventListener('touchstart', e => {
      e.preventDefault()
      this.hotdogControl = 0
      this.onTouch = true
      this.tapLeft = e.touches[0].clientX
      this.tapTop = e.touches[0].clientY
    }, { passive: false })
    document.addEventListener('mouseup', e => {
      e.preventDefault()
      this.onTouch = false
    })
    document.addEventListener('touchend', e => {
      e.preventDefault()
      this.onTouch = false
    }, { passive: false })
    document.addEventListener('mousemove', e => {
      e.preventDefault()
      // console.log(e.clientX)
      this.tapLeft = e.clientX
      this.tapTop = e.clientY
    })
    document.addEventListener('touchmove', e => {
      e.preventDefault()
      // console.log(e.touches[0].clientX)
      this.tapLeft = e.touches[0].clientX
      this.tapTop = e.touches[0].clientY
    }, { passive: false })

    setInterval(() => {
      this.manage()
    }, 1000 / this.FPS)
  }
  manage() {
    /* 每100帧生成一个校长 */
    if(this.frame % 5 === 0) {
     this.wxzs.push(new Wxz(Math.random() * (this.MAX_WIDTH - 64), 0))
    }

    /* 每5帧生成一个热狗 */
    if(this.hotdogControl % 2 === 0 && this.tapLeft && this.onTouch) {
      this.hotdogs.push(new HotDog(this.tapLeft, this.tapTop - 60))
    }

    /* 校长下落 */
    this.wxzs.forEach(wxz => {
      wxz.dropDown(this.Level)
      if(wxz.yPos > this.MAX_HEIGHT) {
        this.wxzs.remove(wxz)
        this.cross = this.cross + 1
      }
      /* 碰撞检测 */
      for(let i = 0; i < this.hotdogs.length; i ++) {
        if(wxz.xPos > this.hotdogs[i].xPos + 27 || wxz.xPos + 64 < this.hotdogs[i].xPos) {
          continue
        } else {
          if(wxz.yPos > this.hotdogs[i].yPos + 47 || wxz.yPos + 48 < this.hotdogs[i].yPos) {
            continue
          } else {
            this.hotdogs.remove(this.hotdogs[i])
            this.wxzEats.push(wxz)
            this.wxzs.remove(wxz)
            break
          }
        }
      }
    })

    /* 校长吃包 */
    this.wxzEats.forEach(wxz => {
      wxz.dropUp()
      if(wxz.count < 0) {
        this.wxzEats.remove(wxz)
      }
    })

    /* 面包上升 */
    this.hotdogs.forEach(hotdog => {
      hotdog.dropUp(10)
      if(hotdog.yPos < 0) {
        this.hotdogs.remove(hotdog)
      }
    })

    this.reRender()
    this.frame = this.frame + 1
    this.hotdogControl = this.hotdogControl + 1
  }
  reRender() {
    this.ctx.clearRect(0, 0, this.MAX_WIDTH, this.MAX_HEIGHT)
    this.wxzs.forEach(wxz => {
      this.ctx.drawImage(this.wxzImg, wxz.xPos, wxz.yPos, 64, 78)
    })
    this.wxzEats.forEach(wxz => {
      this.ctx.save()
      this.ctx.globalAlpha = wxz.count / 30
      this.ctx.drawImage(this.wxzEatImg, wxz.xPos, wxz.yPos, 64, 78)
      this.ctx.restore()
    })
    this.hotdogs.forEach(hotdog => {
      this.ctx.drawImage(this.hotDogImg, hotdog.xPos, hotdog.yPos, 27, 47)
    })
  }
}

const canvas = document.querySelector('#canvas'),
  ctx = canvas.getContext('2d')
canvas.width = document.documentElement.clientWidth
canvas.height = document.documentElement.clientHeight

new Game(ctx).init()
