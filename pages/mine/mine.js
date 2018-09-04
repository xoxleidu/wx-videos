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
    //console.info(app.fileServerUrl + "/File/user/" + app.userInfo.id + "/videos/");
    
    wx.showLoading({
      title: '请等待...',
    });
    me.getMyVideoList(1);
  },

  logout: function () {
    var user = app.userInfo;
    //var user = app.getGlobalUserInfo();

    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待...',
    });
    //调用后端
    wx.request({
      url: serverUrl + '/logout?userId=' + user.id,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.status == 200) {
          // 登录成功跳转 
          wx.showToast({
            title: '注销成功',
            icon: 'success',
            duration: 2000
          });
          app.userInfo = null;
          // 注销以后，清空缓存
          //wx.removeStorageSync("userInfo")
          // 页面跳转
          wx.redirectTo({
            url: '../userLogin/login',
          })
        } 
      }
    })
  },

  uploadVideo: function () {
      var me = this
      wx.chooseVideo({
        sourceType: ['album'],
        maxDuration: 60,
        success: function (res) {
          var duration = res.duration;
          var tmpHeight = res.height;
          var tmpWidth = res.width;
          var tmpVideoUrl = res.tempFilePath;
          var tmpCoverUrl = res.thumbTempFilePath;
          if (duration > 61) {
            wx.showToast({
              title: '视频长度不能超过10秒...',
              icon: "none",
              duration: 2500
            })
          } else if (duration < 1) {
            wx.showToast({
              title: '视频长度太短，请上传超过1秒的视频...',
              icon: "none",
              duration: 2500
            })
          } else {
            // 打开选择bgm的页面
            wx.navigateTo({
              url: '../chooseBgm/chooseBgm?duration=' + duration
                + "&tmpHeight=" + tmpHeight
                + "&tmpWidth=" + tmpWidth
                + "&tmpVideoUrl=" + tmpVideoUrl
                + "&tmpCoverUrl=" + tmpCoverUrl
              ,
            })
          }
        }
      })
  },

  getMyVideoList: function (page) {
    var me = this;
    var fileServerUrl = app.fileServerUrl + "/File/user/" + app.userInfo.id + "/videos/";
    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showAll/?page=' + page + '&pageSize=4',
      method: "POST",
      data: {
        //userId: me.data.userId
        userId: app.userInfo.id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res);
        var myVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = me.data.myVideoList;
        console.info(page);
        console.info(res.data.data.total);
        
        me.setData({
          myVideoPage: page,
          //myVideoList: newVideoList.concat(myVideoList),
          myVideoList: myVideoList,
          myVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl,
          fileServerUrl: fileServerUrl
        });
      }
    })
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
  }

})
