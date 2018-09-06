//index.js
var videoUtils = require('../../utils/videoUtils.js')
//获取应用实例
const app = getApp()
Page({
  data: {
    screenWidth: 400,
    screenHeight: 660,
    videoId: "",
    src: "",
    cover: "cover",
    container_play: "none",
    container_pause: "block"
  },
  onLoad: function (params){
    var me = this;
    me.videoCtx = wx.createVideoContext("myVideo", me);
    // 获取上一个页面传入的参数
    var videoInfo = JSON.parse(params.videoInfo);
    var fileServerUrl = app.fileServerUrl + "/File/user/" + videoInfo.userId + "/videos/";
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    var screenHeight = wx.getSystemInfoSync().screenHeight;
    console.info(screenWidth);
    me.setData({
      screenWidth: screenWidth,
      screenHeight: screenHeight,
      videoId: videoInfo.id,
      src: fileServerUrl + videoInfo.videoPath
    });
    //console.info(fileServerUrl + videoInfo.videoPath);
    
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

  showSearch:function(){
    var me = this;
    wx.navigateTo({
      url: '../search/search'
    })
  },

  showMine:function(e) {
    var me = this;
    wx.redirectTo({
      url: '../mine/mine'
    })
  },

  upload:function() {
    videoUtils.uploadVideo();
  }


})
