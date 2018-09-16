const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    serverUrl: app.serverUrl,
    fileServerUrl: app.fileServerUrl + "/File/user/",

    searchUserId:"",
    searchValue:"",

    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (params) {
    var me = this;

    var searchUserId = params.searchUserId;
    if (searchUserId == null || searchUserId == undefined) {
      searchUserId = "";
    }
    var searchValue = params.searchValue;
    var isSaveRecord = params.isSaveRecord;
    if (isSaveRecord == null || isSaveRecord == "" || isSaveRecord == undefined) {
      isSaveRecord = 0;
    }

    me.setData({
      searchValue: searchValue,
      searchUserId: searchUserId
    });

    wx.showLoading({
      title: '请等待...',
    });
    me.getMyVideoList(0,1);
  },

  getMyVideoList: function (isSaveRecord, page) {
    var me = this;
    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var searchValue = me.data.searchValue;
    var searchUserId = me.data.searchUserId;
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showAll/?isSaveRecord=' + isSaveRecord + '&page=' + page + '&pageSize=9',
      method: "POST",
      data: {
        userId: searchUserId,
        videoDesc: searchValue
      },
      success: function (res) {
        wx.hideNavigationBarLoading();
        if (res.data.data.total === 0) {
          wx.hideLoading();
          wx.showToast({
            title: '没有相关信息...',
            icon: "none"
          });
          //延时2秒执行
          setTimeout( function(){
            wx.redirectTo({
              url: '../search/search'
            })
          },2000);
        }
        if (page === 1) {
          me.setData({
            myVideoList: []
          })
        }
        var myVideoList = res.data.data.rows;
        var newVideoList = me.data.myVideoList;
        wx.hideLoading();
        me.setData({
          myVideoPage: page,
          myVideoList: newVideoList.concat(myVideoList),
          myVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.getMyVideoList(0,1);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
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
    this.getMyVideoList(0,page);
  },

  /**
   * 视频详情页
   */
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