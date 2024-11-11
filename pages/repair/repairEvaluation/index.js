// pages/repair/repairEvaluation/index.js
import {
  getOrderId,
  getOrderEvaluation,
  getOrderEvaluationDetail
} from '../../../utils/api/order';
import Utils from '../../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    value: 5,
    valueTime: 5,
    repairDesc: '',
    evalyationData: [{
        title: '抢修人员',
        value: ''
      }, {
        title: '故障描述',
        value: ''
      },
      {
        title: '处理时间',
        value: ''
      }
    ],
    dataList: [],
    type: 0,
    maskShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options,12313132132131)
    if (options && options.data) {
      console.log(options, 'aaa')
      this.getInit(options.data)
      if (options.status > 6) {
        this.getOrderDetail(options.data)
      }
      this.setData({
        type: options.status > 6  ? options.status : 0
      })
    }
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
  //初始化获取数据
  getInit(data) {
    let {
      evalyationData
    } = this.data
    getOrderId(data).then(res => {
      if (res.data) {
        let workName = res.data.workerName && res.data.workerName !== '' ? res.data.workerName.slice(0, 1) + '师傅' : '';
          evalyationData[0].value = workName
        evalyationData[1].value = res.data.cause
        evalyationData[2].value = res.data.dealWithTime ? res.data.dealWithTime : ''
        this.setData({
          evalyationData: evalyationData
        })
      }
      console.log(res)
    }).catch(err => {
      console.log(err)
    })
    this.setData({
      id: data
    })
  },
  //查询评价详情
  getOrderDetail(id) {
    getOrderEvaluationDetail(id).then(res => {
      if (res.isok) {
        this.setData({
          value: res.data.attitudeScore ? res.data.attitudeScore : '',
          valueTime: res.data.timelyScore ? res.data.timelyScore : '',
          repairDesc: res.data.content
        })
      }
    }).catch(err => {
      console.log(err)
    })
  },
  //双向绑定按钮
  inputChange(e) {
    let value = e.detail.value
    this.setData({
      repairDesc: value
    })
  },
  onChange(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index
    if (index == "0") {
      this.setData({
        value: e.detail
      })
    } else if (index == "1") {
      this.setData({
        valueTime: e.detail
      })
    }
  },
  //提交表单
  cancelForm() {
    const {
      id,
      value,
      valueTime,
      repairDesc
    } = this.data
    let data = {
      orderId: id,
      attitudeScore: value,
      timelyScore: valueTime,
      content: repairDesc
    }
    getOrderEvaluation(data).then(res => {
      if (res.isok) {
        Utils.setStorage('addEvaluation', true)
      } else {
        Utils.setStorage('addEvaluation', false)
      }
    }).catch(err => {
      Utils.setStorage('addEvaluation', false)
    })
  },
  onAutio() {
    let _this = this
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.record'] === true) {
          _this.setData({
            maskShow: true
          })
        } else if (res.authSetting['scope.record'] === false) {
          wx.showModal({
            title: '温馨提示',
            content: '获取录音权限失败，请在设置里面打开',
            success(res) {
              if (res.confirm) {
                wx.openSetting({
                  success(res) {
                    if (res.authSetting['scope.record'] === true) {
                      _this.setData({
                        maskShow: true
                      })
                    }
                  }
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        } else {
          wx.authorize({
            scope: 'scope.record',
            success() {}
          })
        }
        console.log(res)
        //初始化请求定位
      }
    })
  },
  closeMask() {
    this.setData({
      maskShow: false
    })
  },
  //录音文字返回
  getVideo(res) {
    if (!res.detail || res.detail == '') {
      Toast.fail('你的声音太小了,请长按重试')
    } else {
      this.setData({
        repairDesc: this.data.repairDesc + res.detail
      })
    }

  }
})