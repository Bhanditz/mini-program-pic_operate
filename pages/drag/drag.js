// pages/drag/drag.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgwidth: 0,
    imgheight: 0,
    animationData: {},
    movex: 0,
    movey: 0,
    x: 0,
    y: 0,  
  },

  imageLoad: function (e) {
    var _this = this;
    //1.框的宽高  
    var cnt_offetw = _this.data.screenWidth - 38,
      cnt_offeth = (_this.data.screenHeight - 38) * 0.7;
    //2.获取图片真实宽度  
    var $width = e.detail.width,    //获取图片真实宽度    
      $height = e.detail.height,
      ratio = $width / $height;   //图片的真实宽高比例  
    //3.进行判断:当图片小于框时候，图片大小等于框大小，当大于框的时候，则成比例呈现  
    var viewWidth = _this.data.screenWidth;           //设置图片固定宽度值，    
    var viewHeight = parseInt(viewWidth / ratio);    //计算的高度值  
    if (viewHeight < cnt_offeth) {
      viewHeight = cnt_offeth;
    }
    _this.setData({
      imgwidth: viewWidth,
      imgheight: viewHeight,
      cnt_boxw: cnt_offetw,
      cnt_boxh: cnt_offeth,
    })
  },  
  startEvent: function (e) {
    //1.获取鼠标点击下去的  
    this.setData({
      startx: e.touches[0].pageX,
      starty: e.touches[0].pageY
    })
  },  
  moveEvent: function (e) {
    var _this = this;
    //2.鼠标移动的位置  
    var pageX = e.touches[0].pageX;
    var pageY = e.touches[0].pageY;
    var x, y;
    //3.记住初始化图片x,y  
    var endx = _this.data.x, endy = _this.data.y;
    //4.判断  
    var w_x = _this.data.imgwidth - _this.data.cnt_boxw;//x拖拽值：图片宽-框的宽  
    var h_y = parseInt(_this.data.imgheight - _this.data.cnt_boxh);//y拖拽值：图片高-框高  
    var DistanceX = pageX - _this.data.startx;//x:当鼠标点击到移动的点之间的距离  
    var DistanceY = pageY - _this.data.starty;//y:当鼠标点击到移动的点之间的距离  
    if (DistanceX > 0) {
      //往右移动 如果当前的值大于等于0时则不移动，否则当前值加上鼠标拖拽的距离  
      if (endx >= 0) {
        x = 0;
      } else {
        x = endx + DistanceX;
      }
    } else {
      //往左移动:x拖拽值大于等于当前的值，说明已经到边上了，就等于拖拽值，否则当前的值加上鼠标拖拽的距离  
      if (w_x >= endx) {
        x = -w_x;
      } else {
        x = endx + DistanceX;
      }
    }
    if (DistanceY > 0) {
      //往下移动:如果当前的值大于等于0时则不移动，否则当前值加上鼠标拖拽的距离  
      if (endy >= 0) {
        y = 0;
      } else {
        y = endy + DistanceY;
      }
    } else {
      //往上移动:y拖拽值大于等于当前的值，说明已经到边上了，就等于拖拽值，否则当前的值加上鼠标拖拽的距离  
      if (-endy == h_y || -endy > h_y) {
        y = -h_y;
        console.log("da0")
      } else {
        y = endy + DistanceY;
        console.log("da 1")
      }
    }
    setTimeout(function () {
      _this.animation.translate(x, y).step();
      _this.setData({
        animationData: this.animation.export()
      })
    }.bind(this), 0)

    _this.setData({
      x: x,
      y: y,
    })
    endx = x; endy = y;//记住这次的图片移动的范围  
    _this.data.startx = pageX; _this.data.starty = pageY;// 每移动一次把上一次的点作为原点  
  },
  endEvent: function () {
    clearTimeout(function () {
      this.animation.translate(this.data.x, this.data.y).step();
      this.setData({
        animationData: this.animation.export()
      })
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数  
    var _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          screenHeight: res.windowHeight,
          screenWidth: res.windowWidth,
        });
      }
    });  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 页面渲染完成  
    //实例化一个动画  
    this.animation = wx.createAnimation({
      duration: 60,
      timingFunction: 'linear',//均匀  
      transformOrigin: "left top 0px",
    }) 
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
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