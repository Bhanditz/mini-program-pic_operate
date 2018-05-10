// pages/drawCanvas/drawCanvas.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    img: "",
    tempImg: "",
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    animationData: {},

    pixelRatio: app.globalData.device.pixelRatio,

    canvasId: "preview",
    targetCanvasId: "target",
    drawTarget: false,
    c_w: 300,
    c_h: 300,
    t_c_w: 0,
    t_c_h: 0,
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
    }, {
      x: 0,
      y: 0
    }],
    toucheEventLen: 0,
    oldDistance: 0,
    oldScale: 1,
    defaultAngle: 0,/*两指之间与x轴之间形成的角度*/
    oldAngle: 0,
    newDistance: 0,
    newScale: 1,
    newAngle: 0
  },

  chooseImage: function () {
    var self = this;

    wx.chooseImage({
      count: 1, // 默认9
      sourceType: ['album', 'camera'],
      success: function (res) {
        
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
              baseScale: baseScale,
              t_c_w: self.data.c_w / baseScale,
              t_c_h: self.data.c_h / baseScale
            });

            self.drawImage(self.data.ctx, res.tempFilePaths[0], dx, dy, dWidth, dHeight);

          }
        })
      },
    })
  },
  clipImg(){
    var _this = this;
    wx.navigateTo({
      url: "/pages/show/show?file=" + _this.data.img + "&scale=" + _this.data.newScale + "&t_x=" + _this.data.imgLeft + "&t_y=" + _this.data.imgTop + "&angle=" + _this.data.newAngle,
      success(){
        _this.setData({
          img: ""
        })
      }
    });
  },

  //事件处理函数
  saveToAlbum(){
    var _this = this;

    //_this.drawTargetCanvas();
    _this.canvasToTempFile(_this.data.targetCanvasId);
  },
  canvasToTempFile(canvasId){
    var _this = this;

    if(_this.data.drawTarget){
      draw();
    }
    else {
      _this.drawTargetCanvas(draw);
    }

    function draw(){
      wx.canvasToTempFilePath({
        width: _this.data.imgWidth,
        height: _this.data.imgHeight,
        canvasId: canvasId,
        fileType: "jpg",
        success(res) {
          console.log(res.tempFilePath);
          _this.saveImageToPhotosAlbum(res.tempFilePath);
        },
        fail(res) {
          console.log(res);
        }
      })
    }

  },
  saveImageToPhotosAlbum(tmpPath){
    wx.saveImageToPhotosAlbum({
      filePath: tmpPath,
      success(res){
        wx.showToast({
          title: "图片保存成功",
          icon: "success"
        })
      }
    })
  },

  // 触摸事件
  touchStart (e) {

    if (e.touches.length == 1) {
      this.setData({
        toucheEventLen: 1,
        drawTarget: false
      });
      this.__oneTouchStart(e);
    }
    else {
      this.setData({
        toucheEventLen: 2
      });

      this.__twoTouchStart(e.touches[0], e.touches[1]);
    }

  },
  touchMove (e) {

    if (e.touches.length == 1) {
      this.__oneTouchMove(e);
    }
    else {
      this.__twoTouchMove(e.touches[0], e.touches[1]);
    }
  },
  touchEnd (e) {

    this.__xTouchEnd(e);
    //this.drawTargetCanvas();
  },

  // 手势事件
  __oneTouchStart(e) {

    this.data.touches[0].x = e.touches[0].clientX;
    this.data.touches[0].y = e.touches[0].clientY;

  },
  __oneTouchMove(e) {
    var self = this;
    var xMove, yMove;

    if (this.data.toucheEventLen != 1) return;

    xMove = e.touches[0].clientX - this.data.touches[0].x;
    yMove = e.touches[0].clientY - this.data.touches[0].y;

    var imgLeft = Math.round(self.data.rectX + xMove);
    var imgTop = Math.round(self.data.rectY + yMove);

    self.setData({
      imgLeft: imgLeft,
      imgTop: imgTop
    });

    // self.updateImgPosition();

    self.updateCanvas();
  },
  __twoTouchStart(touch0, touch1) {
    var _this = this;
    var xMove, yMove, oldDistance, angle;

    // 计算两指距离
    xMove = Math.round(touch1.clientX - touch0.clientX);
    yMove = Math.round(touch1.clientY - touch0.clientY);
    oldDistance = Math.round(Math.sqrt(xMove * xMove + yMove * yMove));

    angle = _this.getAngle(touch1.clientX, touch1.clientY, touch0.clientX, touch0.clientY);

    this.setData({
      oldDistance: oldDistance,
      defaultAngle: angle,
      lastEvent: "twoTouch"
    });

  },
  __twoTouchMove(touch0, touch1) {
    var self = this;
    let oldScale = self.data.oldScale;
    let oldDistance = self.data.oldDistance;
    let scale = self.data.scale;

    var newScale = self.getNewScale(oldScale, oldDistance, touch0, touch1);
    newScale <= 1 && (newScale = 1);
    newScale >= scale && (newScale = scale);

    //两指之间的角度
    self.getNewRotate(touch0, touch1);


    self.setData({
      newScale: newScale,
      scaleWidth: self.data.baseWidth * newScale,
      scaleHeight: self.data.baseHeight * newScale
    });

    self.updateCanvas();
  },
  __xTouchEnd(e) {
    var self = this;

    self.setData({
      oldScale: self.data.newScale,
      oldAngle: self.data.newAngle,
      rectX: self.data.imgLeft,
      rectY: self.data.imgTop,
      lastEvent: false
    })
  },

  // common function
  /**
   * 将图片绘制到canvas
   * */
  drawImage(ctx, src, dx, dy, dWidth, dHeight) {
    var self = this;

    ctx.save();
    //ctx.setTransform(1, 0, 0, 1, self.data.c_w/2+dx, self.data.c_h/2+dy);
    ctx.translate(self.data.c_w/2+dx, self.data.c_h/2+dy);
    ctx.rotate(self.data.newAngle * Math.PI / 180);
    ctx.drawImage(src, -dWidth / 2, -dHeight / 2, dWidth, dHeight);
    ctx.restore();
    ctx.draw();
  },
  drawTargetCanvas(done) {
    var _this = this;
    const context = wx.createCanvasContext(_this.data.targetCanvasId);

    var imgWidth = _this.data.t_c_w,
        imgHeight = _this.data.t_c_h,
        target_width = _this.data.imgWidth * _this.data.oldScale,
        target_height = _this.data.imgHeight * _this.data.oldScale,
        dx = _this.data.baseScale * _this.data.imgLeft,
        dy = _this.data.baseScale * _this.data.imgTop;

    /*context.setTransform(1, 0, 0, 1,
      imgWidth / 2 + dx, 
      imgHeight / 2 + dy);*/
    context.translate(imgWidth/2+dx,imgHeight/2+dy);
    context.rotate(_this.data.newAngle * Math.PI / 180);

    context.drawImage(_this.data.img, -target_width / 2, -target_height / 2, target_width, target_height);
    context.draw();

    _this.setData({
      drawTarget: true
    });

    done && done.call && done();
    //_this.canvasToTempFile(_this.data.targetCanvasId);
  },
  /**
   * 当拖动、缩放、旋转图片的时候重新绘制canvas
   * */
  updateCanvas() {
    var self = this;
    if (self.data.ctx) {
      self.drawImage(self.data.ctx, self.data.img, 
        self.data.imgLeft, self.data.imgTop, 
        self.data.scaleWidth, 
        self.data.scaleHeight);
    }
  },
  /**
   * 获取缩放值
   * */
  getNewScale(oldScale, oldDistance, touch0, touch1) {
    var xMove, yMove, newDistance;

    // 计算二指最新距离
    xMove = Math.round(touch1.clientX - touch0.clientX);
    yMove = Math.round(touch1.clientY - touch0.clientY);
    newDistance = Math.round(Math.sqrt(xMove * xMove + yMove * yMove));

    return oldScale + 0.005 * (newDistance - oldDistance)
  },
  /**
   * 获取旋转值
   * */
  getNewRotate(touch0, touch1){
    var _this = this;

    var newAngle = _this.getAngle(touch1.clientX, touch1.clientY, touch0.clientX, touch0.clientY) - _this.data.defaultAngle + _this.data.oldAngle;
    newAngle = newAngle > 360 ? newAngle-360 : newAngle;

    _this.setData({
      newAngle: newAngle
    });
  },
  getAngle(px, py, mx, my){

    var angle = 0;

    if(mx == px && my > py){ /*-y轴*/
      angle = 90;
    }
    else if(mx == px && my < py){/*y轴*/
      angle = 270;
    }
    else if(mx < px && my == py){/*-x轴*/
      angle = 180;
    }
    else if(mx > px && my == py){/*x轴*/
      angle = 0;
    }
    else {
      if(mx > px && my < py){/*第一象限*/
        angle = 360 - 180*Math.atan(Math.abs(my-py)/Math.abs(mx-px))/Math.PI
      }
      if(mx > px && my > py){/*第二象限*/
        angle = 180*Math.atan(Math.abs(my-py)/Math.abs(mx-px))/Math.PI
      }
      if(mx < px && my > py){/*第三象限*/
        angle = 180 - 180*Math.atan(Math.abs(my-py)/Math.abs(mx-px))/Math.PI
      }
      if(mx < px && my < py){/*第四象限*/
        angle = 180 + 180*Math.atan(Math.abs(my-py)/Math.abs(mx-px))/Math.PI
      }
    }


    return angle;

  },





  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const self = this;

    const context = wx.createCanvasContext(self.data.canvasId);
    /**
     * 页面回退刷新页面数据
     * */
    this.setData({
      ctx: context,
      img: "",
      tempImg: "",
      motto: 'Hello World',
      userInfo: {},
      hasUserInfo: false,
      canIUse: wx.canIUse('button.open-type.getUserInfo'),
      animationData: {},

      pixelRatio: app.globalData.device.pixelRatio,

      canvasId: "preview",
      targetCanvasId: "target",
      drawTarget: false,
      c_w: 300,
      c_h: 300,
      t_c_w: 0,
      t_c_h: 0,
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

      scale: 2.5,
      touches: [{
        x: 0,
        y: 0
      }, {
        x: 0,
        y: 0
      }],
      toucheEventLen: 0,
      oldDistance: 0,
      oldScale: 1,
      defaultAngle: 0,/*两指之间与x轴之间形成的角度*/
      oldAngle: 0,
      newDistance: 0,
      newScale: 1,
      newAngle: 0
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})