//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    fileServerUrl: app.fileServerUrl + "/File/user/180828HDTTW46DGC/videos/",
    screenWidth: 400,
    screenHeight: 660,
    cover: "cover",
    container_play: "none",
    container_pause: "block"
  },
  onLoad: function (params){
    var me = this;
    me.videoCtx = wx.createVideoContext("myVideo", me);
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    var screenHeight = wx.getSystemInfoSync().screenHeight;
    console.info(screenWidth);
    me.setData({
      screenWidth: screenWidth,
      screenHeight: screenHeight,
    });
    
  },

  onShow: function () {
    var me = this;
    me.videoCtx.play();
    me.setData({
      container_play: "none",
      container_pause: "block"
    })
  },

  onHide: function () {
    var me = this;
    me.videoCtx.pause();
    me.setData({
      container_play: "block",
      container_pause: "none"
    })
  },
})
