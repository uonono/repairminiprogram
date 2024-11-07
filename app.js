// app.js
import {
  loginUser,
  getUser,
  updataUser,
  refreshToken
} from './utils/api/user'
import Utils from './utils/util'
App({
  onLaunch() {
    // wx.getStorage({
    //   key: 'refreshToken',
    //   success(res) {
    //     console.log(res, '正在重新获取tokne')
    // 
    //   },
    //   fail(res) {
    //     console.log('未获取到')
    //   }
    // })
    let _this = this
    wx.getStorage({
      key: 'token',
      success(res) {
        _this.globalData.hasUserInfo = true
      },
      fail(res) {
        _this.globalData.hasUserInfo = false
        _this.getLogin()
      }
    })
    this.navbar()
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    //授权获取用户信息
    // this.getUserProfile()
  },
  // 登录
  getLogin() {
    let _this = this
    wx.login({
      success(res) {
        let data = {
          authCode: res.code
        }
        loginUser(data).then(res => {
          // if (res.data.refreshToken) {
          //   console.log(res.data.refreshToken)
          //   wx.setStorage({
          //     data: res.data.refreshToken,
          //     key: 'refreshToken',
          //     success(res) {
          //       console.log(res, '第一次登录存储')
          //     },
          //     fail(res) {
          //       console.log('存储失败', res)
          //     }
          //   })
          //   refreshToken(res.data.refreshToken).then(res => {
          //     console.log(res, '这是新数据')
          //     if (res.isok) {
          //       // wx.setStorage({
          //       //   key: 'token',
          //       //   data: res.data.accessToken,
          //       //   success(res) {
          //       //     const pages = getCurrentPages()
          //       //     const perpage = pages[pages.length - 1]
          //       //     perpage.onShow()
          //       //   }
          //       // })
          //       wx.setStorage({
          //         key: 'refreshToken',
          //         data: res.refreshToken
          //       })
          //     }
          //   })
          // }
          if (res.isok && res.data.accessToken) {
            //存储token
            wx.setStorage({
              key: 'token',
              data: res.data.accessToken,
              success(res) {
                getUser().then(res => {
                  //如果头像与名称为空则判断为新用户
                  if (!res.isok) {
                    wx.showModal({
                      title: '提示',
                      showCancel: false,
                      content: '请先登录后操作',
                      success: function (res) {
                        //获取用户信息权限
                        wx.getUserProfile({
                          desc: '获取你的信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                          success: (res) => {
                            let data = {
                              headimgurl: res.userInfo.avatarUrl,
                              nickname: res.userInfo.nickName
                            }
                         
                            //修改个人信息，默认将微信信息填入
                            updataUser(data).then(res => {
                              if (res.isok) {
                                _this.globalData.hasUserInfo = true
                                wx.showToast({
                                  title: '登录成功',
                                  icon: 'succes',
                                  duration: 2000,
                                  mask: true
                                })
                                const pages = getCurrentPages()
                                const perpage = pages[pages.length - 1]
                                perpage.onLoad()
                              }
                            })
                          },
                          fail(res) {
                            _this.globalData.hasUserInfo = false
                          }
                        })
                      }
                    })
                  } else {
                    //存储用户数据
                    wx.setStorage({
                      data: res.data,
                      key: 'userList',
                    })
                    const pages = getCurrentPages()
                    const perpage = pages[pages.length - 1]
                    perpage.onLoad()
                    console.log(perpage,'当前页面')
                    _this.globalData.hasUserInfo = true
                  }
                })
              },
              fail(res) {
                console.log(res, '存储token失败')
              }
            })
            _this.globalData.hasUserInfo = true
          }
        }).catch(err => {
          console.log(err)
        })
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
      fail(res) {
        console.log(res, '获取code失败')
      }
    })

  },
  //判断sessionkey是否过期 过期需要重新获取授权登录
  getSessionKey() {
    wx.checkSession({
      success() {
        //session_key 未过期，并且在本生命周期一直有效
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        wx.login() //重新登录
      }
    })
  },
  //获取用户信息授权
  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res,'获取用户授权')
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  //自定义导航条
  navbar() {
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    wx.getSystemInfo({
      success: res => {
        let statusBarHeight = res.statusBarHeight,
          navTop = menuButtonObject.top, //胶囊按钮与顶部的距离
          navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight) * 2; //导航高度
        this.globalData.navHeight = navHeight;
        this.globalData.navTop = navTop;
        this.globalData.windowHeight = res.windowHeight;
      },
      fail(err) {
        console.log(err);
      }
    })
  },
  /**
   * 设置监听器
   */
  setWatcher(page) {
    let data = page.data;
    let watch = page.watch;
    Object.keys(watch).forEach(v => {
      let key = v.split('.'); // 将watch中的属性以'.'切分成数组
      let nowData = data; // 将data赋值给nowData
      for (let i = 0; i < key.length - 1; i++) { // 遍历key数组的元素，除了最后一个！
        nowData = nowData[key[i]]; // 将nowData指向它的key属性对象
      }
      let lastKey = key[key.length - 1];
      // 假设key==='my.name',此时nowData===data['my']===data.my,lastKey==='name'
      let watchFun = watch[v].handler || watch[v]; // 兼容带handler和不带handler的两种写法
      let deep = watch[v].deep; // 若未设置deep,则为undefine
      this.observe(nowData, lastKey, watchFun, deep, page); // 监听nowData对象的lastKey
    })
  },
  /**
   * 监听属性 并执行监听函数
   */
  observe(obj, key, watchFun, deep, page) {
    var val = obj[key];
    // 判断deep是true 且 val不能为空 且 typeof val==='object'（数组内数值变化也需要深度监听）
    if (deep && val != null && typeof val === 'object') {
      Object.keys(val).forEach(childKey => { // 遍历val对象下的每一个key
        this.observe(val, childKey, watchFun, deep, page); // 递归调用监听函数
      })
    }
    var that = this;
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      set: function (value) {
        // 用page对象调用,改变函数内this指向,以便this.data访问data内的属性值
        watchFun.call(page, value, val); // value是新值，val是旧值
        val = value;
        if (deep) { // 若是深度监听,重新监听该对象，以便监听其属性。
          that.observe(obj, key, watchFun, deep, page);
        }
      },
      get: function () {
        return val;
      }
    })
  },
  globalData: {
    hasUserInfo: null,
    navHeight: null,
    navTop: null,
    windowHeight: null
  }
})