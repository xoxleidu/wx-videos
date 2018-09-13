//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,
  },
  onLoad: function (){
    this.getMyVideoList(1);    
  },

  getMyVideoList: function (page) {
    var me = this;
    var serverUrl = app.serverUrl;
    var fileServerUrl = app.fileServerUrl + "/File/user/";
    // 查询视频信息
    wx.showLoading();
    // 调用后端
    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + '&pageSize=21',
      method: "POST",
      data: {},
      success: function (res) {
        console.info(res);
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
          fileServerUrl: fileServerUrl
        });
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
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

  showVideo: function (e) {
    var me = this;
    var arrindex = e.target.dataset.arrindex;
    var videoList = this.data.myVideoList;
    var videoInfo = JSON.stringify(videoList[arrindex]);
    wx.navigateTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo
    })
  }
})
