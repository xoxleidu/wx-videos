//index.js
var videoUtils = require('../../utils/videoUtils.js')
//获取应用实例
const app = getApp()
Page({
  data: {
    faceUrl: "../resource/images/arrow.jpg",
    videoId: "",
    src: "",
    cover: "cover",
    videoInfo: {},
    container_play: "none",
    container_pause: "block",
    faceUrl: "",
    publisher: {},

    userLikeVideo: false
  },
  onLoad: function (params){
    console.info(params);
    var me = this;
    me.videoCtx = wx.createVideoContext("myVideo", me);
    // 获取上一个页面传入的参数
    var videoInfo = JSON.parse(params.videoInfo);
    var fileServerUrl = app.fileServerUrl + "/File/user/" + videoInfo.userId + "/videos/";
    
    var height = videoInfo.videoHeight;
    var width = videoInfo.videoWidth;
    var cover = "cover";
    if (width >= height) {
      cover = "";
    }

    me.setData({
      videoId: videoInfo.id,
      src: fileServerUrl + videoInfo.videoPath,
      cover: cover,
      videoInfo: videoInfo
    });

    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    var userId = "";
    if (user != null && user != "" && user != undefined) {
      userId = user.id;
    }
    var url = "/user/queryIsLike?userId=" + userId + "&videoId=" + videoInfo.id + "&videoCreateId=" + videoInfo.userId;
    wx.showLoading({
      title: '獲取視頻用戶信息',
    })
    wx.request({
      url: serverUrl + url,
      method: "POST",
      success: function (res) {
        wx.hideLoading();
        var publisher = res.data.data.usersVOResult;
        var faceUrlImg = publisher.faceImage;
        var faceUrl = "../resource/images/arrow.jpg";
        if (faceUrlImg != null && faceUrlImg != "" && faceUrlImg != undefined){
          faceUrl = app.fileServerUrl + "/File/user/" + videoInfo.userId + "/face/" + publisher.faceImage;
        }
        me.setData({
          faceUrl: faceUrl,
          publisher: publisher,
          userLikeVideo: res.data.data.userIsLikeVideo
        })
      }
    })
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
    var user = app.getGlobalUserInfo();
    if (user == null || user == "" || user == undefined) {
      wx.navigateTo({
        url: '../userLogin/login'
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine'
      })
    }
  },

  showPublisher: function(){
    var me = this;
    var user = app.getGlobalUserInfo();
    var videoInfo = me.data.videoInfo;
    var realUrl = '../mine/mine@resultUserId#' + videoInfo.userId;
    if (user == null || user == "" || user == undefined) {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?resultUserId=' + videoInfo.userId
      })
    }
  },

  upload:function() {
    var me = this;
    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoInfo/videoInfo@videoInfo#' + videoInfo;
    if (user == null || user == "" || user == undefined) {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl
      })
    } else {
      videoUtils.uploadVideo();
    }
  },

  likeVideoOrNot: function() {
    var me = this;
    var user = app.getGlobalUserInfo();
    var videoInfo = me.data.videoInfo;
    var realUrl = '../videoInfo/videoInfo@videoInfo#' + videoInfo;
    if (user == null || user == "" || user == undefined) {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl
      })
    } else {
      var serverUrl = app.serverUrl;
      var userLikeVideo = me.data.userLikeVideo;
      var url = "/video/likeVideo?userId=" + user.id + "&videoId=" + videoInfo.id + "&videoCreateId=" + videoInfo.userId;
      if (userLikeVideo){
        url = "/video/unLikeVideo?userId=" + user.id + "&videoId=" + videoInfo.id + "&videoCreateId=" + videoInfo.userId;
      }
      wx.showLoading({
        title: '...',
      })
      wx.request({
        url: serverUrl + url,
        method: "POST",
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        success: function (res) {
          wx.hideLoading();
          me.setData({
            userLikeVideo: !userLikeVideo
          })
        }
      })
    }
  }



})
