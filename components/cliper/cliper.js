// components/cliper/cliper.js
const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    img: {
      type: String,
      value: "",
      observer(newVal, oldVal){
        let _this = this;

        let ctx = wx.createCanvasContext(_this.data.canvasId);

        if(newVal != oldVal){
          wx.getImageInfo({
            src: newVal,
            success: function (img) {
              var baseScale = _this.data.c_w / img.width;
              var dx = _this.data.imgLeft,
                  dy = _this.data.imgTop,
                  dWidth = _this.data.c_w,
                  dHeight = img.height * baseScale;

              _this.setData({
                ctx: ctx,
                imgWidth: img.width,
                imgHeight: img.height,
                baseWidth: dWidth,
                baseHeight: dHeight,
                scaleWidth: dWidth,
                scaleHeight: dHeight,
                baseScale: baseScale,
                t_c_w: _this.data.c_w / baseScale,
                t_c_h: _this.data.c_h / baseScale
              });

              //_this.drawImage(_this.data.ctx, newVal, dx, dy, dWidth, dHeight);

            }
          })
        }
      }
    },
    c_w: {
      type: Number,
      value: 500
    },
    c_h: {
      type: Number,
      value: 500
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    canvasId: new Date().getTime(),
    targetCanvasId: new Date().getTime() + 1,

    animation: "",
    animationData: {},

    pixelRatio: app.globalData.device.pixelRatio,

    ctx: "",
    t_c_w: 0,
    t_c_h: 0,
    imgLeft: 0,/*touchmove事件触发时的偏移量*/
    imgTop: 0,
    rectX: 0,/*touchstart事件触发前的偏移量*/
    rectY: 0,
    baseScale: 1,/*原始图片与操作canvas的比*/
    imgWidth: 0,/*图片原始宽高*/
    imgHeight: 0,
    baseWidth: 0,/*图片按照canvas的比例缩放后的宽高*/
    baseHeight: 0,
    scaleWidth: 0,
    scaleHeight: 0,

    touchX: 0,
    touchY: 0,
    toucheEventLen: 0,/*用于记录上一次的事件是单指还是双指，防止在双指操作后一直手指松开后触发单指移动事件*/
    oldDistance: 0,/*两指之间的距离*/
    oldScale: 1,
    defaultAngle: 0,/*两指之间与x轴之间形成的角度*/
    oldAngle: 0,
    newDistance: 0,
    newScale: 1,
    newAngle: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    save(){

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

      this.data.touchX = e.touches[0].clientX;
      this.data.touchY = e.touches[0].clientY;

    },
    __oneTouchMove(e) {
      var _this = this;
      var xMove, yMove;

      if (this.data.toucheEventLen != 1) return;

      xMove = e.touches[0].clientX - this.data.touchX;
      yMove = e.touches[0].clientY - this.data.touchY;

      var imgLeft = Math.round(_this.data.rectX + xMove);
      var imgTop = Math.round(_this.data.rectY + yMove);

      _this.setData({
        imgLeft: imgLeft,
        imgTop: imgTop
      });

      //_this.updateCanvas();
      _this.updateImage();
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
      var _this = this;
      let oldScale = _this.data.oldScale;
      let oldDistance = _this.data.oldDistance;
      let scale = _this.data.scale;

      var newScale = _this.getNewScale(oldScale, oldDistance, touch0, touch1);
      newScale <= 1 && (newScale = 1);
      newScale >= scale && (newScale = scale);

      //两指之间的角度
      _this.getNewRotate(touch0, touch1);


      _this.setData({
        newScale: newScale,
        scaleWidth: _this.data.baseWidth * newScale,
        scaleHeight: _this.data.baseHeight * newScale
      });

      //_this.updateCanvas();
      _this.updateImage();
    },
    __xTouchEnd() {
      var _this = this;

      _this.setData({
        oldScale: _this.data.newScale,
        oldAngle: _this.data.newAngle,
        rectX: _this.data.imgLeft,
        rectY: _this.data.imgTop,
        lastEvent: false
      })
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

    updateImage(){
      var _this = this;

      _this.animation.translate(_this.data.imgLeft, _this.data.imgTop)
          .scale(_this.data.newScale, _this.data.newScale)
          .rotate(_this.data.newAngle)
          .step();

      _this.setData({
        animationData: _this.animation.export()
      });

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
     * 将图片绘制到canvas
     * */
    drawImage(ctx, src, dx, dy, dWidth, dHeight) {
      var _this = this;

      ctx.save();

      /*ctx.translate(_this.data.c_w/2+dx, _this.data.c_h/2+dy);
      ctx.rotate(_this.data.newAngle * Math.PI / 180);
      ctx.drawImage(src, -dWidth / 2, -dHeight / 2, dWidth, dHeight);*/
      ctx.drawImage(src, 0, 0, dWidth, dHeight);

      ctx.restore();

      ctx.draw();
    }
  },

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  created(){
    console.log("created!");
  },
  attached(){
    console.log("attached!");
  },
  ready(){
    let _this = this;
    let animation;

    animation = wx.createAnimation({
      duration: 0,
      timingFunction: 'linear'
    });
    _this.animation = animation;

    animation.scale(1,1).translate(0,0).rotate(0).step();

    _this.setData({
      animationData: animation.export()
    });
    console.log("ready!");
  },
  moved(){},
  detached(){},
});