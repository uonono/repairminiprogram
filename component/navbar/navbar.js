// components/navbar/index.js
const App = getApp();

Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    pageName: String,
    bgColor: {
      type: String,
      value: ''
    },
    showNav: {
      type: Boolean,
      value: true
    },
    showHome: {
      type: Boolean,
      value: true
    },
    navbarColor: {
      type: String,
      value: 'navbar-color'
    },
    leftIcon: {
      type: String,
      value: 'home'
    },
    path: {
      type: String,
      value: '/pages/repair/index'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    navHeight: 120,
    navTop: 48,
    userInfo: {},
    hasUserInfo: false
  },
  lifetimes: {
    attached: function () {
      console.log(App.globalData)
      if (App.globalData.hasUserInfo) {
        this.setData({
          hasUserInfo: true
        })
      }
      this.setData({
        navHeight: App.globalData.navHeight,
        navTop: App.globalData.navTop
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getLogin() {
      wx.getUserProfile({
        desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res)
          wx.login({
            success: res => {
              wx.reLaunch({
                url: '/pages/repair/index',
              })
              console.log(res)
              // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
          })
        }
      })

    },
    //获取用户信息授权
    getUserProfile() {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗

    },
    //回主页
    navBack: function (e) {
      let type = e.currentTarget.dataset.type;
      let path = e.currentTarget.dataset.path;
      switch (type) {
        case 'back':
          wx.navigateBack({
            delta: 1
          })
          break;
        case 'home':
          wx.navigateTo({
            url: '/pages/repair/index'
          })
          break;
        case 'fixedPath':
          wx.redirectTo({
            url: path
          })
          break;
        case 'my':
          wx.navigateTo({
            url: '/my/pages/index'
          })
          break;
      }

    },
  }
})