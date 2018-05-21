// pages/show/show.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    img: "../../images/1.jpg",
    sum: 4,
    cur: 0,
    imgs: ["../../images/1.jpg", "../../images/2.jpg", "../../images/3.jpg", "../../images/4.jpg"],

    img_w: 0,
    img_h: 0
  },

  fn_saveToAlbum(){
    var _this = this;

    _this.canvasToTempFile("tmp");

    wx.saveImageToPhotosAlbum({
      filePath: _this.data.imgs[_this.data.cur],
      success(res){
        console.log(res);
        wx.showToast({
          title: "图片已保存在",
          icon: "none",
          duration: 1500
        });
      },
      fail(){
        wx.showToast({
          title: "图片保存失败",
          icon: "none"
        })
      },
      complete(msg){
        console.log(msg)
      }
    })

    /*wx.downloadFile({
      url: _this.data.imgs[_this.data.cur],
      success(res){
        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success(res){
            wx.showToast({
              title: "图片已保存在"+res.savedFilePath,
              icon: "none",
              duration: 1500
            });
          },
          fail(){
            wx.showToast({
              title: "图片保存失败",
              icon: "none"
            })
          }
        })
      }
    })*/
  },
  fn_change(){
    var _this = this;

    var cur = ++_this.data.cur;

    _this.setData({
      cur: cur >= _this.data.imgs.length ? 0 : cur
    });
  },
  get_imgBouningClientRect(img){
    if(!img) return;

    var _this = this;

    wx.getImageInfo({
      src: img,
      success(res){
        _this.setData({
          img_w: res.width,
          img_h: res.height
        });
      }
    })
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
          _this.saveImageToPhotosAlbum(res.tempFilePath);
        },
        fail(res) {
          console.log(res);
        }
      })
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var _this = this;

    _this.setData({
      img: options.file
    });

    /*_this.setData({
      img: options.file,
      t_x: options.t_x,
      t_y: options.t_y,
      angle: options.angle,
      scale: options.scale
    });*/
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