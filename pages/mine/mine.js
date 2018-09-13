var videoUtils = require('../../utils/videoUtils.js')

const app = getApp()

Page({
  data: {
    faceUrl: "noneface.png",
    fileServerUrl: app.fileServerUrl + "/File/user/",
    isMe: true,
    isFollow: false,

    videoSelClass: "video-info",
    isSelectedWork: "video-info-selected",
    isSelectedFollow: "",
    isSelectedLike: "",

    myWorkFalg: false,
    myFollowFalg: true,
    myLikesFalg: true,
    
    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    followVideoList: [],
    followVideoPage: 1,
    followVideoTotal: 1,

    likeVideoList: [],
    likeVideoPage: 1,
    likeVideoTotal: 1,
  },

  onLoad: function (params){
    var me = this;
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    var userId = user.id;
    var resultUserId = params.resultUserId;
    if (resultUserId != null && resultUserId != "" && resultUserId != undefined && resultUserId != user.id) {
      userId = resultUserId;
      me.setData({
        isMe: false,
        resultUserId: resultUserId
      })
    }
    me.setData({
      userId: userId
    })
    wx.showLoading({
      title: '请等待...',
    });
    //用户信息
    wx.request({
      url: serverUrl + '/user/query?userId=' + userId + "&fanId=" + user.id,
      method: "POST",
      header: {
        'content-type': 'application/json', // 默认值
        'headerUserId': user.id,
        'headerUserToken': user.userToken
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.status == 200) {
          var userRes = res.data.data;
          var faceUrl = "../resource/images/noneface.png";
          if (userRes.faceImage != null && userRes.faceImage != '' && userRes.faceImage != undefined) {
            faceUrl = userRes.faceImage;
          }


          me.setData({
            faceUserId: userRes.id,
            faceUrl: faceUrl,
            fansCounts: userRes.fansCounts,
            followCounts: userRes.followCounts,
            receiveLikeCounts: userRes.receiveLikeCounts,
            nickname: userRes.nickname,
            isFollow: userRes.follow
          });
        } else if (res.data.status == 500) {
          wx.showToast({
            title: res.data.msg,
            duration: 3000,
            icon: "none",
            success: function () {
              wx.redirectTo({
                url: '../userLogin/login',
              })
            }
          })
        } else if (res.data.status == 502) {
          wx.showToast({
            title: res.data.msg,
            duration: 3000,
            icon: "none",
            success: function () {
              wx.redirectTo({
                url: '../userLogin/login',
              })
            }
          })
        }
      }
    })
    me.getMyVideoList(1);
  },

  //上传头像
  changeFace: function () {
    var me = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        wx.showLoading({
          title: '请等待...',
        });
        var user = app.getGlobalUserInfo();
        var serverUrl = app.serverUrl;
        //调用后端
        wx.uploadFile({
          url: serverUrl + '/user/uploadface',
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            'userId': user.id
          },
          header: {
            'content-type': 'application/json', // 默认值
            'headerUserId': user.id,
            'headerUserToken': user.userToken
          },
          success: function (res) {
            wx.hideLoading();
            var data = JSON.parse(res.data);
            console.info(data);
            if (data.status == 200) {
              wx.showToast({
                title: '上传成功!~~',
                icon: "success"
              });

              var imageUrl = data.data;
              me.setData({
                faceUserId: user.id,
                faceUrl: imageUrl
              });

            } else if (data.status == 500) {
              wx.showToast({
                title: data.msg
              });
            } else if (data.status == 502) {
              wx.showToast({
                title: data.msg,
                duration: 2000,
                icon: "none",
                success: function () {
                  wx.redirectTo({
                    url: '../userLogin/login',
                  })
                }
              });

            }
          }
        })
      }
    })
  },

  uploadVideo: function () {
    videoUtils.uploadVideo();
  },

  followMe: function(e) {
    var me = this;
    var user = app.getGlobalUserInfo();
    var fanId = me.data.resultUserId;
    var followType = e.currentTarget.dataset.followtype;//#########
    var url = "";
    if(followType == "1") {
      url = app.serverUrl + '/user/saveUserFans?userId=' + fanId + "&fanId=" + user.id;
    } else {
      url = app.serverUrl + '/user/cleanUserFans?userId=' + fanId + "&fanId=" + user.id;
    }
    wx.showLoading();
    wx.request({
      url: url,
      method: "POST",
      header: {
        'content-type': 'application/json', // 默认值
        'headerUserId': user.id,
        'headerUserToken': user.userToken
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.status == 200) {
          if (followType == "1") {
            me.setData ({
              isFollow:true,
              fansCounts: ++me.data.fansCounts
            })
          } else {
            me.setData({
              isFollow: false,
              fansCounts: --me.data.fansCounts
            })
          }
        }
      }
    })
  },

  doSelectWork: function () {
    this.setData({
      isSelectedWork: "video-info-selected",
      isSelectedFollow: "",
      isSelectedLike: "",

      myWorkFalg: false,
      myFollowFalg: true,
      myLikesFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1
    })
    this.getMyVideoList(1);
  },

  doSelectFollow: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedFollow: "video-info-selected",
      isSelectedLike: "",

      myWorkFalg: true,
      myFollowFalg: false,
      myLikesFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1
    })
    this.getMyFollowList(1);
  },

  doSelectLike: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedFollow: "",
      isSelectedLike: "video-info-selected",

      myWorkFalg: true,
      myFollowFalg: true,
      myLikesFalg: false,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1
    })
    this.getMyLikesList(1);
  },

  /**
   * 获取我发的视频
   */
  getMyVideoList: function (page) {
    var me = this;
    var userId = me.data.userId;
    var serverUrl = app.serverUrl;
    // 查询视频信息
    wx.showLoading();
    // 调用后端
    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + '&pageSize=9',
      method: "POST",
      data: {
        userId: userId
      },
      success: function (res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        if (res.data.data.total === 0) {
          wx.showToast({
            title: '没有视频,请上传',
            duration: 2000,
            icon: "none"
          })
        }
        if (page === 1) {
          me.setData({
            myVideoList: []
          })
        }
        var myVideoList = res.data.data.rows;
        var newVideoList = me.data.myVideoList;
        me.setData({
          myVideoPage: page,
          myVideoList: newVideoList.concat(myVideoList),
          myVideoTotal: res.data.data.total,
        });
      }
    })
  },

  /**
   * 获取我关注用户发的视频
   */
  getMyFollowList: function (page) {
    var me = this;
    var userId = me.data.userId;
    var serverUrl = app.serverUrl;
    // 查询视频信息
    wx.showLoading();
    // 调用后端
    wx.request({
      url: serverUrl + '/video/showFollow?userId=' + userId + '&page=' + page + '&pageSize=9',
      method: "POST",
      success: function (res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        if (res.data.data.total === 0) {
          wx.showToast({
            title: '没有视频,请上传',
            duration: 2000,
            icon: "none"
          })
        }
        if (page === 1) {
          me.setData({
            followVideoList: []
          })
        }
        var followVideoList = res.data.data.rows;
        var newVideoList = me.data.followVideoList;
        me.setData({
          followVideoPage: page,
          followVideoList: newVideoList.concat(followVideoList),
          followVideoTotal: res.data.data.total
        });
      }
    })
  },

  /**
   * 获取我喜欢的视频
   */
  getMyLikesList: function (page) {
    var me = this;
    var userId = me.data.userId;
    var serverUrl = app.serverUrl;
    // 查询视频信息
    wx.showLoading();
    // 调用后端
    wx.request({
      url: serverUrl + '/video/showLike?userId=' + userId + '&page=' + page + '&pageSize=9',
      method: "POST",
      success: function (res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        if (res.data.data.total === 0) {
          wx.showToast({
            title: '没有视频,请上传',
            duration: 2000,
            icon: "none"
          })
        }
        if (page === 1) {
          me.setData({
            likeVideoList: []
          })
        }
        var likeVideoList = res.data.data.rows;
        var newVideoList = me.data.likeVideoList;
        me.setData({
          likeVideoPage: page,
          likeVideoList: newVideoList.concat(likeVideoList),
          likeVideoTotal: res.data.data.total
        });
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var myWorkFalg = this.data.myWorkFalg;
    var myFollowFalg = this.data.myFollowFalg;
    var myLikesFalg = this.data.myLikesFalg;
    wx.showNavigationBarLoading();
    if (!myWorkFalg) {
      this.getMyVideoList(1);
    } else if (!myFollowFalg) {
      this.getMyFollowList(1);
    } else if (!myLikesFalg) {
      this.getMyLikesList(1);
    }
    
  },

  // 到底部后触发加载
  onReachBottom: function () {
    var myWorkFalg = this.data.myWorkFalg;
    var myFollowFalg = this.data.myFollowFalg;
    var myLikesFalg = this.data.myLikesFalg;

    if (!myWorkFalg) {
      var currentPage = this.data.myVideoPage;
      var totalPage = this.data.myVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyVideoList(page);
    } else if (!myFollowFalg) {
      var currentPage = this.data.followVideoPage;
      var totalPage = this.data.followVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyFollowList(page);
    } else if (!myLikesFalg) {
      var currentPage = this.data.likeVideoPage;
      var totalPage = this.data.likeVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyLikesList(page);
    }
  },

  showVideo: function (e) {

    var myWorkFalg = this.data.myWorkFalg;
    var myFollowFalg = this.data.myFollowFalg;
    var myLikesFalg = this.data.myLikesFalg;

    if (!myWorkFalg) {
      var videoList = this.data.myVideoList;
    } else if (!myFollowFalg) {
      var videoList = this.data.followVideoList;
    } else if (!myLikesFalg) {
      var videoList = this.data.likeVideoList;
    }

    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);

    wx.navigateTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo
    })
  },

  logout: function () {
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;

    wx.showLoading({
      title: '请等待...',
    });
    //调用后端
    wx.request({
      url: serverUrl + '/logout?userId=' + user.id,
      method: "POST",
      success: function (res) {
        wx.hideLoading();
        if (res.data.status == 200) {
          // 登录成功跳转 
          wx.showToast({
            title: '注销成功',
            icon: 'success',
            duration: 2000
          });
          // 注销以后，清空缓存
          wx.removeStorageSync("userInfo")
          // 页面跳转
          wx.redirectTo({
            url: '../userLogin/login',
          })
        }
      }
    })
  }

})
