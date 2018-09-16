//app.js
App({

  //北京

  //serverUrl: "http://192.168.50.158:8081",
  //fileServerUrl: "http://192.168.50.158:8066",

  //廊坊

  //serverUrl: "http://192.168.2.108:8081",
  //fileServerUrl: "http://192.168.2.108:8066",

  //华为云服务器

  serverUrl: "http://114.116.27.14:8080/videos",
  fileServerUrl: "http://114.116.27.14:8066",

  user: null,
  userInfo: null,
  setGlobalUserInfo: function(user){
    wx.setStorageSync("userInfo", user);
  },
  getGlobalUserInfo: function () {
    return wx.getStorageSync("userInfo");
  }
})