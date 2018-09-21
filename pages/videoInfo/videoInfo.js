//index.js
var videoUtils = require('../../utils/videoUtils.js')
var clipImgUtils = require('../../utils/clipImgUtils.js')
//获取应用实例
const app = getApp()
Page({
  data: {
    faceUrl: "../resource/images/arrow.jpg",
    fileServerUrl: app.fileServerUrl + "/File/user/",
    videoId: "",
    src: "",
    cover: "cover",
    videoInfo: {},
    container_play: "none",
    container_pause: "block",
    faceUrl: "",
    publisher: {},

    userLikeVideo: false,
    actionSheetHidden: false,
    actionComments: false,
    placeholder: "说点什么...",

    actionCodeImage: false,

    commentsList: [],
  },
  onLoad: function (params){

    //开启分享回调
    wx.showShareMenu({
      withShareTicket: true
    })

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

    me.getCommentsList();
  },

  onShow: function () {
    var me = this;
    me.videoCtx.play();
    me.setData({
      container_play: "none",
      container_pause: "block",
      actionSheetHidden: false,
      actionComments: false,
    })
  },

  onHide: function () {
    var me = this;
    me.videoCtx.pause();
    me.setData({
      container_play: "block",
      container_pause: "none",
      actionSheetHidden: false,
      actionComments: false,
    })
  },

  showSearch:function(){
    var me = this;
    wx.navigateTo({
      url: '../search/search'
    })
  },

  showIndex: function (e) {
    wx.navigateTo({
      url: '../index/index'
    })
  },

  showMine:function(e) {
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
  },

  //隐藏按钮监听
  listenerActionSheet: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },

  //分享事件触发
  onShareAppMessage: function (e) {
    var me = this;
    // var videoInfo = me.data.videoInfo;
    var codeImagePath = e.target.dataset.codeimagenamemini;
    var fileServerUrl = app.fileServerUrl;
    // var user = app.getGlobalUserInfo();
    if (codeImagePath != null && codeImagePath != "" && codeImagePath != undefined) {
      var imageUrl = fileServerUrl + "/File/user/code/" + codeImagePath;
    }
    return {
      //title: videoInfo.videoDesc,
      //path: '/page/videoInfo/videoInfo?videoInfo=' + videoInfo,
      imageUrl: imageUrl,
      success: function (res) {
        console.log("分享成功" + res.shareTickets[0])
        me.setData({
          actionSheetHidden: false,
          actionCodeImage: false,
        })
        // console.log
        wx.getShareInfo({
          shareTicket: res.shareTickets[0],
          success: function (res) { console.log("回调成功" + JSON.stringify(res)) },
          fail: function (res) { console.log("回调失败" + res) },
          complete: function (res) { console.log("回调完成" + res) }
        })
      },
      fail: function (res) {
        // 分享失败
        console.log("分享失败" + res)
        me.setData({
          actionSheetHidden: false,
          actionCodeImage: false,
        })
      }
      
    }
  },

  downLoadVideoAcode: function () {
    var me = this;
    var appId = app.appId;
    var appSecret = app.appSecret;
    var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appId + "&secret=" + appSecret;
    //根据appId和appSecret请求微信后台生成accessToken
    wx.request({
      url: url,
      method: "GET",
      success: function(res) {
        var serverUrl = app.serverUrl;
        var accessToken = res.data.access_token;
        var user = app.getGlobalUserInfo();
        //scene:最大32个可见字符，只支持数字，大小写英文以及部分特殊字符：!#$&'()*+,/:;=?@-._~，
        var scene = "?code=1?userId=" + user.id;
        var path = "pages/videoInfo/videoInfo";
        var width = 300;
        
        var url = serverUrl
          + "/video/getCodeImgPath?accessToken=" + accessToken
          + "&scene=" + scene
          + "&path=" + path
          + "&width=" + width;

        wx.request({
          // 根据微信后台生成的accessToken 生成二维码保存到服务器，返回图片名
          url: url,
          method: "POST",
          success: function(res) {
            console.info(res);
            me.setData({
              actionCodeImage: true,
              actionSheetHidden: false,
              codeImageName: res.data.data
            })
            url = serverUrl
              + "/video/getCodeImgPath?accessToken=" + accessToken
              + "&scene=" + scene
              + "&path=" + path
              + "&width=180";
            wx.request({
              // 根据微信后台生成的accessToken 生成二维码保存到服务器，返回图片名
              url: url,
              method: "POST",
              success: function (res) {
                me.setData({
                  codeImageNameMini: res.data.data
                })
              }
            })

          }
        })
      }
    })
  },

  downLoadImage: function (e) {
    var me = this;
    var codeImagePath = e.currentTarget.dataset.codeimagepath;
    wx.showLoading({
      title: '下载中...',
    })
    wx.downloadFile({
      url: codeImagePath,
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (res) {
            
            wx.showToast({
              title: '保存成功...',
            })
          },
          complete:function(res) {
            me.setData({
              actionCodeImage: false
            })
            wx.hideLoading();
          }
        })
      }
    })
  },

  downLoadVideo: function () {
    var me = this;
    var videoInfo = me.data.videoInfo;
    var fileServerUrl = me.data.fileServerUrl;
    wx.showLoading({
      title: '下载中...',
    })
    wx.downloadFile({
      url: fileServerUrl + videoInfo.userId + "/videos/" + videoInfo.videoPath,
      success: function (res) {
        wx.saveVideoToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (res) {
            wx.showToast({
              title: '保存成功...',
            })
          },
          complete:function(res) {
            me.setData({
              actionSheetHidden: false,
            })
            wx.hideLoading();
          }
        })
      },
      complete: function (res) {
        me.setData({
          actionSheetHidden: false,
        })
        wx.hideLoading();
      }
    })
  },

  //评论触发
  leaveComment: function () {
    this.setData({
      commentFocus: true,
      actionComments: true
    });
  },

  replyFocus: function(e) {
    var fatherCommentId = e.currentTarget.dataset.fathercommentid;
    var toUserId = e.currentTarget.dataset.touserid;
    var toNickname = e.currentTarget.dataset.tonickname;

    this.setData({
      placeholder: "回复  " + toNickname,
      replyFatherCommentId: fatherCommentId,
      replyToUserId: toUserId,
      commentFocus: true
    })
  },

  saveComment: function(e) {
    var me = this;
    var content = e.detail.value;
    // 获取评论回复的fatherCommentId和toUserId
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
    var toUserId = e.currentTarget.dataset.replytouserid;

    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    var videoInfo = me.data.videoInfo;
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;
    if (user == null || user == "" || user == undefined) {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl
      })
    } else {
      if (videoInfo.id == null || videoInfo.id == "" || videoInfo.id == undefined){
        wx.showToast({
          title: '您想评论谁啊',
        })
        return;
      }
      wx.showLoading({
        title: '请稍后...',
      })
      if(fatherCommentId == null || 
        fatherCommentId == "" || 
        fatherCommentId == undefined || 
        toUserId == null || 
        toUserId == "" || 
        toUserId == undefined) {
          fatherCommentId = "";
          toUserId = "";
        }
      //debugger;
      wx.request({
        url: serverUrl + '/video/saveComment?fatherCommentId=' + fatherCommentId + "&toUserId=" + toUserId,
        method: "POST",
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        data: {
          fromUserId: user.id,
          videoId: videoInfo.id,
          comment: content
        },
        success: function(res) {
          wx.hideLoading();
          me.setData({
            contentValue: "",
            commentsList: [],
            placeholder: "还想说点什么...",
            replyFatherCommentId: "",
            replyToUserId: ""
          });
          me.getCommentsList();
        }
      })
    }
  },

  getCommentsList: function () {
    var me = this;
    var videoId = me.data.videoInfo.id;
    wx.request({
      url: app.serverUrl + '/video/getVideoComments?videoId=' + videoId,
      method: "POST",
      success: function (res) {
        console.log(res.data);

        var commentsList = res.data.data.rows;
        var newCommentsList = me.data.commentsList;

        me.setData({
          commentsList: newCommentsList.concat(commentsList),
        });
      }
    })
  },


  // onReachBottom: function () {
  //   var me = this;
  //   var currentPage = me.data.commentsPage;
  //   var totalPage = me.data.commentsTotalPage;
  //   if (currentPage === totalPage) {
  //     return;
  //   }
  //   var page = currentPage + 1;
  //   me.getCommentsList(page);
  // },

  



})
