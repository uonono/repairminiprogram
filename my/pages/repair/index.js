// pages/my/repair/index.js
import {
  getOrder
} from '../../../utils/api/order';
import Utils from '../../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderList()
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

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //获取已报修工单列表
  getOrderList() {
    Utils.showLoading()
    let page = {
      pageIndex: 1,
    }
    getOrder(page).then(res => {
      if (res.isok) {
        this.setData({
          dataList: res.data
        })
      }else{
        Utils.showToast('获取工单失败','error')
      }
      Utils.hideLoading();
    }).catch(err => {
      Utils.showToast('网络异常','error')
      Utils.hideLoading();
      console.log(err)
    })
  },
  goDetail(e) {
    let id = e.currentTarget.dataset.id
    let url = '/pages/repair/repairDetail/index?id=' + id
    wx.navigateTo({
      url: url,
    })
  },

})