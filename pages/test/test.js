var clipImgUtils = require('../../utils/clipImgUtils.js')

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shareImgPath:"测试"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var me = this;
    //开启分享回调
    wx.showShareMenu({
      withShareTicket: true
    })
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
    
  },



  test: function () {
    var me = this;
    
  },

  onShareAppMessage: function (e) {
    var me = this;
    console.info(me.data.shareImgPath);
    
  
    wx.downloadFile({
      url: 'http://localhost:8066/File/user/code/1537457410272024.jpg',
      success: (res) => {
        clipImgUtils.clipImage("CodeImageCanvas", res.tempFilePath, "jpg", 200, 200, (img) => {
          me.setData({
            shareImgPath: img
          })
          console.info("经过了")
        });
      }
    })
    


    console.info("res# " + me.data.shareImgPath);
    return {
      imageUrl: me.data.shareImgPath,
      success: function (res) {
        console.log("分享成功")
    console.info("完了# " + me.data.shareImgPath);
      }
    }
  }




})