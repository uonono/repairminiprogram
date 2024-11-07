import {
  loginUser,
  getUser,
  updataUser,
} from './api/user'
const app = getApp()
const dealResult = (res, resolve, reject) => {
  console.log('接口response：', res, res.statusCode);
  if (res.statusCode >= 200 && res.statusCode < 500) {
    //未认证和400（jwt过期都要）
    if (res.statusCode == 401 || res.data.code == 400) {
      wx.removeStorage({
        key: 'token',
        success(res) {
          getLogin()
        }
      })
      reject(res.data);
    } else {
      resolve(res.data);
    }
  } else {
    // wx.showToast({
    //   title: '服务器异常,请稍后重试',
    //   icon: 'none',
    //   duration: 1000
    // })
    reject(res.data);
  }
}
const request = (options, token = true, type) => {
  let headers = {
    'content-type': 'application/json'
  }
  return new Promise((resolve, reject) => {
    // 通用接口拦截
    if (token) {
      wx.getStorage({
        key: 'token',
        success(res) {
          headers = {
            'content-type': 'application/json',
            'Authorization': 'bearer ' + res.data
          }
          reuqestBody(options, type, headers, resolve, reject)
        },
        fail(res) {
          // reuqestBody(options, type, headers, resolve, reject)
          console.log(res)
        }
      });
    } else {
      reuqestBody(options, type, headers, resolve, reject)
    }

  })
}
const reuqestBody = (options, type, headers, resolve, reject) => {
  let HTTPS_HOST = 'https://127.0.0.1:5000'
  let params = options.data || {};
  if (typeof type == 'undefined') {
    wx.request({
      header: headers,
      ...options,
      data: params,
      url: HTTPS_HOST + options.url,
      success(res) {
        dealResult(res, resolve, reject);
      },
      fail(err) {
        // wx.hideLoading()
        // 错误处理
        wx.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none',
          duration: 1000
        })
        // wx.showModal({
        //   title: '提示',
        //   showCancel: false,
        //   content: '网络异常，请稍后重试',
        //   success: function () {

        //   }
        // })
        // reject(err);
      }
    });
  } else if (typeof type != 'undefined' && type == 'downloadFile') {
    // 下载预览
    wx.downloadFile({
      ...options,
      url: HTTPS_HOST + options.url,
      header: {
        'appSign': 'wxapp'
      },
      success(res) {
        const filePath = res.tempFilePath;
        wx.openDocument({
          filePath: filePath,
          fileType: 'pdf',
          success: function (res) {
            console.log('打开文档成功');
            dealResult(res, resolve, reject);
          },
          fail(err) {
            console.log('打开文档失败:', err)
          }
        })
      },
      fail(err) {
        reject(err);
      }

    })
  } else if (typeof type != 'undefined' && type == 'uploadFile') {
    wx.uploadFile({
      ...options,
      url: HTTPS_HOST + options.url,
      header: {
        'appSign': 'wxapp'
      },
      success(res) {
        const data = res.data;
        dealResult(res, resolve, reject);
      },
      fail(err) {
        console.log('err:', err)
        reject(err);
      },
      complete(err) {
        console.log('comp:', err)
        reject(err);
      }
    })
  }
}
//重新执行登录请求，用来防止401
const getLogin = () => {
  let _this = this
  wx.login({
    success(res) {
      let data = {
        authCode: res.code
      }
      loginUser(data).then(res => {
        if (res.isok && res.data.accessToken) {
          //存储token
          wx.setStorage({
            key: 'token',
            data: res.data.accessToken,
            success(res) {
              getUser().then(res => {
                //如果头像与名称为空则判断为新用户
                if (!res.isok && res.data.headimgurl == '' && res.data.nickname == '') {
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
                        fail(res) {}
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
                }
              })
            },
            fail(res) {
              console.log(res, '存储token失败')
            }
          })
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

}
module.exports = {
  request
}