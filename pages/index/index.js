//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    vid: 0,
    pagey: '',
    vsrc: [],
    cover: "cover",
  },
  onLoad: function (){
    var me = this;
    me.videoContext = wx.createVideoContext("myVideo", me);
    //var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    var page = 1;
    // 查询视频信息
    wx.showLoading();
    // 调用后端
    wx.request({
      url: serverUrl + '/video/showAll/?page=' + page,
      method: "POST",
      data: {},
      success: function (res) {
        wx.hideLoading();
        console.info(res);

        var vsrc = res.data.data.rows;
        
        var fileServerUrl = app.fileServerUrl + "/File/user/";
        me.setData({
          vsrc: vsrc,
          fileServerUrl: fileServerUrl
        });



      }
    })
    
  },

  touchstart: function (res) {
    this.setData({
      pagey: res.changedTouches[0].pageY
    })
  },
  touchend: function (res) {
    if (res.changedTouches[0].pageY - this.data.pagey > 50) {

      var isZero = this.data.vid == 0
      var id = this.data.vid == 0 ? 0 : this.data.vid - 1
      if (isZero) {
        wx.showToast({
          title: '已是第一个！',
        })
      }
      else {
        this.setData({
          vid: id
        })
        var that = this
        setTimeout(function () { that.bindPlay() }, 500)
      }
    }
    else if (this.data.pagey - res.changedTouches[0].pageY > 50) {
      var islast = this.data.vid == this.data.vsrc.length - 1
      var lid = this.data.vid == this.data.vsrc.length - 1 ? this.data.vsrc.length - 1 : this.data.vid + 1
      if (islast) {
        wx.showToast({
          title: '已是最后一个！',
        })
      }
      else {
        this.setData({
          vid: lid
        })
      }
      var that = this
      setTimeout(function () { that.bindPlay() }, 500)
    }
  },



  

  onShow: function () {
    var me = this;
    // me.videoCtx.play();
    // me.setData({
    //   container_play: "none",
    //   container_pause: "block"
    // })
  },

  onHide: function () {
    var me = this;
    // me.videoCtx.pause();
    // me.setData({
    //   container_play: "block",
    //   container_pause: "none"
    // })
  },
})
