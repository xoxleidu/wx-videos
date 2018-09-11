var videoUtils = require('../../utils/videoUtils.js')

const app = getApp()

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    myWorkFalg: false,
    //myLikesFalg: true,
    //myFollowFalg: true
  },

  onLoad: function (params){
    var me = this;
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    var userId = user.id;
    var resultUserId = params.resultUserId;
    if (resultUserId != null && resultUserId != "" && resultUserId != undefined) {
      userId = resultUserId;
    }
    wx.showLoading({
      title: '请等待...',
    });
    //用户信息
    wx.request({
      url: serverUrl + '/user/query?userId=' + userId,// + "&fanId=" + user.id,
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
            faceUrl = app.fileServerUrl + "/File/user/" + userRes.id + "/face/" + userRes.faceImage;
          }


          me.setData({
            faceUrl: faceUrl,
            fansCounts: userRes.fansCounts,
            followCounts: userRes.followCounts,
            receiveLikeCounts: userRes.receiveLikeCounts,
            nickname: userRes.nickname,
            //isFollow: userRes.follow
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
                faceUrl: app.fileServerUrl + "/File/user/" + user.id + "/face/" + imageUrl
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
  },

  uploadVideo: function () {
    videoUtils.uploadVideo();
  },

  getMyVideoList: function (page) {
   
    var me = this;
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    var fileServerUrl = app.fileServerUrl + "/File/user/" + user.id + "/videos/";
    
    // 查询视频信息
    wx.showLoading();
    // 调用后端
    wx.request({
      url: serverUrl + '/video/showAll/?page=' + page + '&pageSize=9',
      method: "POST",
      data: {
        userId: user.id
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
        if(page === 1) {
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
          fileServerUrl: fileServerUrl
        });
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function(){
    wx.showNavigationBarLoading();
    this.getMyVideoList(1);
  },

  // 到底部后触发加载
  onReachBottom: function () {
    var myWorkFalg = this.data.myWorkFalg;
    // var myLikesFalg = this.data.myLikesFalg;
    // var myFollowFalg = this.data.myFollowFalg;

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
    } 
    // else if (!myLikesFalg) {
    //   var currentPage = this.data.likeVideoPage;
    //   var totalPage = this.data.myLikesTotal;
    //   // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
    //   if (currentPage === totalPage) {
    //     wx.showToast({
    //       title: '已经没有视频啦...',
    //       icon: "none"
    //     });
    //     return;
    //   }
    //   var page = currentPage + 1;
    //   this.getMyLikesList(page);
    // } else if (!myFollowFalg) {
    //   var currentPage = this.data.followVideoPage;
    //   var totalPage = this.data.followVideoTotal;
    //   // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
    //   if (currentPage === totalPage) {
    //     wx.showToast({
    //       title: '已经没有视频啦...',
    //       icon: "none"
    //     });
    //     return;
    //   }
    //   var page = currentPage + 1;
    //   this.getMyFollowList(page);
    // }
  },

  showVideo:function(e){
    var me = this;
    var arrindex = e.target.dataset.arrindex;
    var videoList = this.data.myVideoList;
    var videoInfo = JSON.stringify(videoList[arrindex]); 
    wx.navigateTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo
    })
  }

})
