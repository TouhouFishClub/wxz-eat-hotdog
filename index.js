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
  constructor(canvas, scoreContainer, hpNum, hpContainer){
    this.canvas = canvas
    this.scoreContainer = scoreContainer
    this.hpNum = hpNum
    this.hpContainer = hpContainer
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
    this.Level = 1
    this.cross = 0
    this.onTouch = false
    this.tapLeft = 0
    this.tapTop = 0
    this.score = 0
    this.hp = 100
    this.interval = 0
    this.ctx = this.canvas.getContext('2d')

    this.scoreContainer.innerHTML = this.score

    let wxzImg = new Image()
    wxzImg.src = './source/wxz.png'
    this.wxzImg = wxzImg

    let wxzEatImg = new Image()
    wxzEatImg.src = './source/wxz-eating.png'
    this.wxzEatImg = wxzEatImg

    let hotDogImg = new Image()
    hotDogImg.src = './source/hotdog.png'
    this.hotDogImg = hotDogImg

    canvas.addEventListener('mousedown', e => {
      e.preventDefault()
      this.hotdogControl = 0
      this.onTouch = true
      this.tapLeft = e.clientX
      this.tapTop = e.clientY
    })
    canvas.addEventListener('touchstart', e => {
      e.preventDefault()
      this.hotdogControl = 0
      this.onTouch = true
      this.tapLeft = e.touches[0].clientX
      this.tapTop = e.touches[0].clientY
    }, { passive: false })
    canvas.addEventListener('mouseup', e => {
      e.preventDefault()
      this.onTouch = false
    })
    canvas.addEventListener('touchend', e => {
      e.preventDefault()
      this.onTouch = false
    }, { passive: false })
    canvas.addEventListener('mousemove', e => {
      e.preventDefault()
      // console.log(e.clientX)
      this.tapLeft = e.clientX
      this.tapTop = e.clientY
    })
    canvas.addEventListener('touchmove', e => {
      e.preventDefault()
      // console.log(e.touches[0].clientX)
      this.tapLeft = e.touches[0].clientX
      this.tapTop = e.touches[0].clientY
    }, { passive: false })

    this.interval = setInterval(() => {
      this.manage()
    }, 1000 / this.FPS)
  }
  manage() {
    this.Level = Math.ceil(this.score / 100) || 1

    /* 每50帧生成一个校长 */
    if(this.frame % Math.ceil(50 / this.Level) === 0) {
     this.wxzs.push(new Wxz(Math.random() * (this.MAX_WIDTH - 64), 0))
    }

    /* 每5帧生成一个热狗 */
    if(this.hotdogControl % Math.ceil(20 / this.Level) === 0 && this.tapLeft && this.onTouch) {
      this.hotdogs.push(new HotDog(this.tapLeft, this.tapTop - 30))
    }

    /* 校长下落 */
    this.wxzs.forEach(wxz => {
      wxz.dropDown(this.Level * 2)
      if(wxz.yPos > this.MAX_HEIGHT) {
        this.wxzs.remove(wxz)
        this.cross = this.cross + 1
        if(this.hp - 20 > 0) {
          this.hp = this.hp - 20
        } else {
          this.hp = 0
        }
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
            this.score = this.score + 10
            this.scoreContainer.innerHTML = this.score
            if(this.hp < 100) {
              this.hp = this.hp + 1
            }
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
    if(this.hp == 0){
      document.querySelector('#panel').style.display = 'block'
      clearInterval(this.interval)
    }
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
    this.hpNum.innerHTML = this.hp
    this.hpContainer.style.width = `${this.hp}%`
  }
}

const canvas = document.querySelector('#canvas')
canvas.width = document.documentElement.clientWidth
canvas.height = document.documentElement.clientHeight

let score = document.querySelector('#scoreNum')
let hpnum = document.querySelector('#hpNum')
let hpbar = document.querySelector('#hpbar')

const game = new Game(canvas, score, hpnum, hpbar)
const btn = document.querySelector('#start')
const desc = document.querySelector('#desc')
btn.addEventListener('click', function(){
  console.log('===')
  desc.innerHTML = 'GAME OVER'
  btn.innerHTML = '重新开始'
  document.querySelector('#panel').style.display = 'none'
  game.init()
})