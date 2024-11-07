// pages/repair/repairContact/index.js
import Toast from '/@vant/weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    repiarPhone: '',
    region: ['广东省', '广州市', '海珠区'],
    customItem: '全部',
    repiarName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  getConcat() {
    let _this = this
    if (this.versionCompare('2.16.0')) {
      wx.chooseContact({
        success(res) {
          _this.setData({
            repiarPhone: res.phoneNumber,
            repiarName: res.displayName
          })
        },
        fail(res) {
          Toast.fail('当前手机型号暂不支持获取通讯录，请手动输入')
        }
      })
    } else {
      Toast.fail('微信版本过低,请升级最新版本')
    }
  },
  onChange(e) {
    let index = e.currentTarget.dataset.index
    if (index == '0') {
      this.setData({
        repiarPhone: e.detail.value
      })
    } else {
      this.setData({
        repiarName: e.detail.value
      })
    }

  },
  callPhone() {
    wx.makePhoneCall({
      phoneNumber: '15530422660',
      success(res) {
        console.log('拨打成功', res)
      },
      fail(res) {
        console.log('拨打失败', res)
      }
    })
  },
  sharkContent() {

  },
  handleContact(e) {
    console.log(e)
  },
  //点击携带参数返回上一页
  cancelForm(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    let data = {
      repiarPhone: e.detail.value.phone,
      repiarName: e.detail.value.name
    }
    wx.setStorage({
      key: 'concat',
      data: data,
      success() {
        wx.navigateBack({
          delta: 1
        })
      },
      fail(res) {
        console.log(res)
      }
    })
  },
  versionCompare(v) {
    const version = wx.getSystemInfoSync().SDKVersion
    if (this.compareVersion(version, v) >= 0) {
      return true
    } else {
      return false
    }
  },
  compareVersion(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    const len = Math.max(v1.length, v2.length)
    while (v1.length < len) {
      v1.push('0')
    }
    while (v2.length < len) {
      v2.push('0')
    }

    for (var i = 0; i < len; i++) {
      const num1 = parseInt(v1[i])
      const num2 = parseInt(v2[i])

      if (num1 > num2) {
        return 1
      } else if (num1 < num2) {
        return -1
      }
    }
    return 0
  },
})