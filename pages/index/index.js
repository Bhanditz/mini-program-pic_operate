//index.js
//获取应用实例
const app = getApp()
const TOUCH_STATE = ['touchstarted', 'touchmoved', 'touchended'];

Page({
  data: {
    img: "",
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    animationData: {},

    pixelRatio: 1,

    c_w: 300,
    c_h: 300,
    imgLeft: 0,
    imgTop: 0,
    rectX: 0,
    rectY: 0,
    imgWidth: 0,
    imgHeight: 0,
    baseScale: 1,
    baseWidth: 0,
    baseHeight: 0,
    scaleWidth: 0,
    scaleHeight: 0,
    ctx: '',

    scale: 2.5,
    touches: [{
      x: 0,
      y: 0
    },{
      x: 0,
      y: 0
    }],
    oldDistance: 0,
    oldScale: 1,
    newDistance: 0,
    newScale: 1
  },
  //事件处理函数
  chooseImage: function () {
    var self = this;

    wx.chooseImage({
      count: 1, // 默认9
      sourceType: ['album', 'camera'],
      success: function(res) {
        // self.wecropper.pushOrign(res.tempFilePaths[0]);
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: function (img) {
            // var old_scale = self.data.c_w / self.data.pixelRatio / img.width;
            var baseScale = self.data.c_w / img.width;
            var dx = self.data.imgLeft,
              dy = self.data.imgTop,
              // dWidth = self.data.c_w / self.data.pixelRatio,
              dWidth = self.data.c_w,
              dHeight = img.height * baseScale;
            
            self.setData({
              imgWidth: img.width,
              imgHeight: img.height,
              img: res.tempFilePaths[0],
              baseWidth: dWidth,
              baseHeight: dHeight,
              scaleWidth: dWidth,
              scaleHeight: dHeight,
              baseScale: baseScale
            });
            
          }
        })
      },
    })
  },
  touchStart: function (e){
    
    this.setTouchState(this, true, null, null);

    if (e.touches.length == 1) {
      this.__oneTouchStart(e);
    }
    else{
      this.__twoTouchStart(e.touches[0], e.touches[1]);
    }

  },
  touchMove: function (e){

    this.setTouchState(this, null, true);

    if (e.touches.length == 1) {
      this.__oneTouchMove(e);
    }
    else {
      this.__twoTouchMove(e.touches[0], e.touches[1]);
    }
  },
  touchEnd: function (e){
    
    this.setTouchState(this, false, false, true);

    this.__xTouchEnd(e);
  },

  // common function
  updateImgPosition(){
    this.animation.translate(this.data.imgLeft, this.data.imgTop)
        .scale(this.data.newScale, this.data.newScale)
        .step();

    this.setData({
      animationData: this.animation.export()
    });

  },
  getNewScale(oldScale, oldDistance, touch0, touch1){
    var xMove, yMove, newDistance;

    // 计算二指最新距离
    xMove = Math.round(touch1.clientX - touch0.clientX);
    yMove = Math.round(touch1.clientY - touch0.clientY);
    newDistance = Math.round(Math.sqrt(xMove * xMove + yMove * yMove));

    return oldScale + 0.005 * (newDistance - oldDistance)
  },
  setTouchState(instance) {
    var arg = [], len = arguments.length - 1;
    while (len-- > 0) arg[len] = arguments[len + 1];

    TOUCH_STATE.forEach(function (key, i) {
      if (arg[i] !== undefined) {
        instance[key] = arg[i];
      }
    });
  },
  
  // 手势事件
  __oneTouchStart(e){

    this.data.touches[0].x = e.touches[0].clientX;
    this.data.touches[0].y = e.touches[0].clientY;

  },
  __oneTouchMove(e){
    var self = this;
    var xMove, yMove;

    xMove = e.touches[0].clientX - this.data.touches[0].x;
    yMove = e.touches[0].clientY - this.data.touches[0].y;

    var imgLeft = Math.round(self.data.rectX + xMove);
    var imgTop = Math.round(self.data.rectY + yMove);

    self.setData({
      imgLeft: imgLeft,
      imgTop: imgTop
    });

     self.updateImgPosition();

  },
  __twoTouchStart(touch0, touch1){
    var xMove, yMove, oldDistance;

    // self.data.touches[1].x = Math.round(self.data.touches[0].x + self.data.scaleWidth / 2);
    // self.data.touches[1].y = Math.round(self.data.touches[0].y + self.data.scaleHeight / 2);

    // 计算两指距离
    xMove = Math.round(touch1.clientX - touch0.clientX);
    yMove = Math.round(touch1.clientY - touch0.clientY);
    oldDistance = Math.round(Math.sqrt(xMove * xMove + yMove * yMove));

    this.setData({
      oldDistance: oldDistance
    })

  },
  __twoTouchMove(touch0, touch1){
    var self = this;
    var oldScale = self.data.oldScale;
    var oldDistance = self.data.oldDistance;
    var scale = self.data.scale;
    // var imgLeft, imgTop;

    var newScale = self.getNewScale(oldScale, oldDistance, touch0, touch1);
    newScale <= 1 && (newScale = 1);
    newScale >= scale && (newScale = scale);

    // imgLeft = self.data.imgLeft + self.data.baseWidth*(newScale - 1) / 2;
    // imgTop = self.data.imgTop + self.data.baseHeight*(newScale - 1) /2;

    self.setData({
      newScale: newScale,
      // scaleWidth: self.data.baseWidth * newScale,
      // scaleHeight: self.data.baseHeight * newScale,
      // imgLeft: imgLeft,
      // imgTop: imgTop
    });

    self.updateImgPosition();
  },
  __xTouchEnd(e){
    var self = this;

    self.setData({
      oldScale: self.data.newScale,
      rectX: self.data.imgLeft,
      rectY: self.data.imgTop
    })
  },

  // 生命周期函数
  onShow(){
  },
  onLoad(option) {
    const _this = this;
    let animation;

    const context = wx.createCanvasContext('preview');
    this.setData({
      ctx: context
    });
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          pixelRatio: res.pixelRatio
        })
      },
    });

    animation = wx.createAnimation({
      duration: 0,
      timingFunction: 'linear'
    });
    _this.animation = animation;

    animation.scale(1,1).translate(0,0).rotate(0).step();

    _this.setData({
      animationData: animation.export()
    })

  }
})
