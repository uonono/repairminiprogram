// pages/area/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    areaList: [],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getArea()
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
  cellClick(e) {
    let type = e.currentTarget.dataset.type
    let data = e.currentTarget.dataset.title
    switch (type) {
      case 'list':
        wx.setStorage({
          key: 'area',
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
        break;
    }
  },
  getArea() {
    let areaData = [];
    let areaIndex = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "W", "X", "Y", "Z"];
    let area = ['河北省', '北京市']
    areaIndex.map(item => {
      areaData.push({
        initial: item
      })
    })
    areaData.map(item => {
      item.children = []
      if (item.initial == 'H') {
        item.children.push(area[0])
      } else if (item.initial == 'B') {
        item.children.push(area[1])
      }
    })
    console.log(areaData)
    this.setData({
      areaList: areaData
    })
  }
})