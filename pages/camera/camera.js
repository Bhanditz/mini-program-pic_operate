// pages/camera/camera.js
var Config = require("../../config/config");
let _ = require("../../utils/underscore");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    img: "",
    loading: false
  },

  /**
   * methods*/
  fn_chooseImg(){
    var _this = this;

    if(_this.data.loading) return;

    wx.chooseImage({
      count: 1,
      success(res){
        console.log(res);
        _this.setData({
          img: res.tempFilePaths[0],
          loading: true
        });

        _this.fn_uploadfile({
          filePath: res.tempFilePaths[0],
          success: function (res){

          },
          fail: function (res){
            console.log(res)
          }
        });
      }
    })
  },
  fn_uploadfile(opt){
    let _this = this;

    if(!opt.filePath) {
      opt.fail && opt.fail.call && opt.fail(new Error("filepath can not be null"))
      && opt.complete && opt.complete.call && opt.complete(new Error("filepath can not be null"));
      return;
    }

    let default_opt = {
      url: Config.api.uploadFile,
      filePath: "",
      name: new Date().getTime()+"",
      formData: {}
    }

    wx.uploadFile(_.extend(default_opt, opt, true))
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
    this.onLoad()
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