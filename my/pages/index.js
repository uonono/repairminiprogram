// pages/my/index.js
import Toast from '@vant/weapp/toast/toast';
import Utils from '../../utils/util'
import {
  updataUser,
  getUser
} from '../../utils/api/user'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    phone: '',
    avatar: '',
    myList: [{
      src: '/images/home.png',
      text: '我的户号',
      to: '/my/pages/door/index',
      type: 'home'
    }, {
      src: '/images/report.png',
      text: '我的报修',
      to: '/my/pages/repair/index',
      type: 'report'
    }, {
      src: '/images/service.png',
      text: '在线客服',
      to: '/my/pages/door/index',
      type: 'service'
    }, {
      src: '/images/setting.png',
      text: '设置',
      to: '/my/pages/setting/index',
      type: 'setting'
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUser()
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  //初始化获取信息
  getUser() {
    let _this = this;
    getUser().then(res => {
      if (res.isok) {
        _this.setData({
          name: res.data.nickname,
          phone: res.data.phone,
          avatar: res.data.headimgurl
        })
      }
    }).catch(err => {
      console.log(err)
    })
  },
  routeLink(e) {
    let to = e.currentTarget.dataset.link
    Utils.navigateTo(to)
  },
  cellClick(e) {
    let to = e.currentTarget.dataset
    console.log(to)
    if (to.type == 'profile') {
      wx.navigateTo({
        url: '/my/pages/profile/index',
      })
    }
  }
})