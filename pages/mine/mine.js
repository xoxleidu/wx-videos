const app = getApp()

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
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
  }

})
