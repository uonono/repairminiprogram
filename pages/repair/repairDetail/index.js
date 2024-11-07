// pages/repair/index.js
const app = getApp()
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min');
var qqmapsdk;
import Utils from '../../../utils/util'
import {
  getOrderId,
  workerLocation,
  cancelOrder
} from '../../../utils/api/order';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mrid: null, //工单id
    sheetType: 'historyAddress', //弹框类型
    actionTitle: '查询到以下户号',
    address: '',
    authData: {}, //权限信息
    userLocation: {}, //用户位置信息
    markers: [], //地图坐标数组
    map: {
      latitude: 38.03599,
      longitude: 114.46979
    },
    userInfo: {},
    historyLine: [], //历史轨迹数组
    scanValue: "",
    showLocationModel: false, //引导打开定位
    navHeight: 120,
    focusHeight: 0,
    maskShow: false,
    howDoor: false, //是否通过其他动作选择了户号
    howConcel: false, //是否通过提交页面跳转回来
    arrvieIndex: -1, //状态枚举值处理
    domHeight: 0,
    arrvieIcon: -1,
    worderCallout: '正在路上',
    target: {
      latitude: null,
      longitude: null
    },
    mapIcon: [{
        icon: '/images/detail/message.png',
        text: '消息',
        type: 'message'
      },
      {
        icon: '/images/detail/online.png',
        text: '在线客服',
        type: 'online'
      },
      {
        icon: '/images/detail/share.png',
        text: '分享工单',
        type: 'shark'
      },
      {
        icon: '/images/add.png',
        text: '取消工单',
        type: 'cancel'
      }
    ],
    step: [{
        title: '未接单',
        text: '',
      },
      {
        title: '未到达',
        text: '',
      },
      {
        title: '未勘察',
        text: '',
      },
      {
        title: '未处理',
        text: '',
      },
      {
        title: '未评价',
        text: '',
      },
    ],
    activeNames: [],
    dataList: {}, //当前详情数据
    timer: null,
    newTimer: null,
    oldTimer: null,
    hasArrive: false,
    arrTime: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options && options.id) {
      this.getOrderInit(options.id) //初始化数据
      this.getWorder(options.id) //初始化获取维修工位置
      this.setData({
        mrid: options.id,
        timer: setInterval(() => {
          this.getWorder(this.data.mrid)
          console.log('定时器')
        }, 5000),
        timerUser: setInterval(() => {
          this.getOrderInit(this.data.mrid)
        }, 30000)
      })

    }
    this.setData({
      navHeight: app.globalData.navHeight
    })
    qqmapsdk = new QQMapWX({
      //腾讯位置服务：   https://lbs.qq.com/console/mykey.html
      key: 'ORXBZ-N32HX-ROV4B-7NIWS-JYYWE-ESBJA' //这里自己的key秘钥进行填充，该key是腾讯位置服务中申请的
    });

    app.setWatcher(this); // 设置监听器
    //获取用户授权情况
    this.getInit()
  },
  watch: {
    scanValue: function (newValue) {
      console.log(newValue); //仿照vue watch方法实现监听器
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    setTimeout(() => {
      this.watchDom()
    }, 300)

  },
  onShow: function () {
    this.getOrderInit(this.data.mrid)
    //根据标签页面情况弹框
    let _this = this;
    //添加
    //修改
    // this.getOrderInit(this.data.mrid)
    wx.getStorage({
      key: 'addEvaluation',
      success(res) {
        if (res) {
          if (res.data) {
            console.log(res, '这是评论值')
            Utils.showToast('评价成功', 'success')
          } else {
            Utils.showToast('评价失败', 'error')
          }
          wx.removeStorage({
            key: 'addEvaluation'
          })
        }
      },
      fail(res) {}
    });

  },
  onHide: function () {},
  onUnload: function () {
    clearInterval(this.data.timer)
    clearInterval(this.data.timerUser)
    this.setData({
      timer: null,
      timerUser: null
    })
  },
  //分享
  onShareAppMessage: function (options) {
    let data = {
      path: '/pages/repair/repairDetail/index?id=' + this.data.mrid
    }
    return data
  },
  //获取地图实例
  getInit() {
    // this.getHasAuth()
  },
  //初始化获取工单信息
  getOrderInit(id) {
    Utils.showLoading()
    const {
      dataList
    } = this.data
    getOrderId(id).then(res => {
      if (res.isok && res.data) {
        console.log(res, '详细信息')
        if (dataList) {
          if (res.data && res.data.procCode == dataList.procCode) {
            return
          }
        }
        if (res.data.orderTime) {
          let arrverTime = res.data.orderTime
          arrverTime = new Date(arrverTime.replace(new RegExp("-", "gm"), "/"))
          arrverTime.setMinutes(arrverTime.getMinutes() + 45)
          let year = arrverTime.getFullYear();
          let month = arrverTime.getMonth() + 1; //获取当前月份的日期
          let min = arrverTime.getMinutes()
          let sec = arrverTime.getSeconds() > 10 ? arrverTime.getSeconds() : '0' + arrverTime.getSeconds()
          let orderTime = year + '-' + month + '-' + arrverTime.getDate() + ' ' + arrverTime.getHours() + ':' + min + ':' + sec
          this.setData({
            arrTime: orderTime
          })
        }
        this.setData({
          dataList: res.data
        })
        this.getLocalpeople()
        if (res.data.procCode !== undefined && res.data.procCode !== null) {
          this.getTimeStatus(res.data.procCode, res.data)
          this.getStatusIndex(res.data.procCode, res.data.isEvaluate)
          //当工单已处理且未评价时
          let index = parseInt(res.data.procCode)
          if (index >= 6 && res.data.isEvaluate == 0) {
            let {
              mapIcon
            } = this.data
            let service = {
              icon: '/images/detail/rale.png',
              text: '服务评价',
              type: 'evaluation',
              status: res.data.isEvaluate
            }
            mapIcon.splice(0, 1, service)
            this.setData({
              mapIcon: mapIcon
            })
          } else if (index >= 6 && res.data.isEvaluate == 1) {
            let {
              mapIcon
            } = this.data
            let service = {
              icon: '/images/detail/rale.png',
              text: '查看评价',
              type: 'evaluation',
              status: res.data.isEvaluate
            }
            mapIcon.splice(0, 1, service)
            this.setData({
              mapIcon: mapIcon
            })
          }
        }
      }
      Utils.hideLoading()
    }).catch(err => {
      Utils.hideLoading()
      console.log(err)
    })
  },
  //获取维修工经纬度
  getWorder(id) {
    let ids = id ? id : this.data.mrid
    workerLocation(ids).then(res => {
      console.log(res, '维修工位置')
      if (res.isok) {
        let arr = []
        let newTime = null
        //此处获取起始点
        res.data.map((item, index) => {
          item.submit_time.replace(new RegExp("-", "gm"), "/")
          arr.push((new Date(item.submit_time)).getTime())
          //获取最大值
          const max = Math.max(arr)
          if (max == (new Date(item.submit_time)).getTime()) {
            newTime = item
          }
        })
        //获取历史轨迹
        let pointArr = []
        let oldTime = null;
        res.data.map((item, index) => {
          item.submit_time.replace(new RegExp("-", "gm"), "/")
          item.submit_time = (new Date(item.submit_time)).getTime()
          pointArr.push(item)
        })
        pointArr.sort((a, b) => {
          a.submit_time > b.submit_time ? 1 : -1
        })
        pointArr.map((item, index) => {
          //删除最后时间坐标
          delete item.submit_time
        })
        oldTime = [...pointArr].pop()
        console.log(oldTime, 'abc')
        this.changeHistory(pointArr)
        console.log(pointArr, '这是排序好的时间')
        this.getLocalpeople(newTime, oldTime)
        console.log(newTime)
        console.log(arr)
      }
    }).catch(err => {
      console.log(err)
    })
  },
  //处理历史轨迹
  changeHistory(item) {
    const {
      historyLine
    } = this.data
    if (historyLine && historyLine.length > 0) {
      if (historyLine.length == item.length) {
        console.log('历史路径无变化')
        return
      }
    }
    console.log('变化了')
    this.setData({
      historyLine: item
    })
  },
  //根据状态处理枚举值
  getStatusIndex(status, evaluate) {
    let {
      step
    } = this.data
    let index = parseInt(status)
    if (index >= 2) {
      step[0].title = '未接单'
    }
    if (index >= 3) {
      step[0].title = '已接单'
      step[1].title = '到达中'
    }
    if (index >= 4) {
      step[1].title = '已到达'
      step[2].title = '勘查中'
    }
    if (index >= 5) {
      step[2].title = '已勘察'
      step[3].title = '处理中'
    }
    if (index >= 6 && index < 8) {
      step[3].title = '已处理'
    }
    if (index == 8) {
      step[3].title = '已处理'
    }

    this.setData({
      step: step
    })
    switch (status) {
      case "01":
        this.setData({
          arrvieIndex: -1,
          arrvieIcon: -1
        })
        break;
      case "02":
        this.setData({
          arrvieIndex: -1,
          arrvieIcon: -1
        })
        break;
      case "03":
        this.setData({
          arrvieIndex: 0,
          arrvieIcon: 1
        })
        break;
      case "04":
        this.setData({
          arrvieIndex: 1,
          arrvieIcon: 2
        })
        break;
      case "05":
        this.setData({
          arrvieIndex: 2,
          arrvieIcon: 3
        })
        break;
      case "06":
        if (evaluate == 1) {
          step[4].title = '已评价'
          this.setData({
            arrvieIndex: 4,
            arrvieIcon: 5,
            step: step
          })
        } else {
          this.setData({
            arrvieIndex: 2,
            arrvieIcon: 3
          })
        }
        break;
      case "07":
        this.setData({
          arrvieIndex: 2,
          arrvieIcon: 3
        })
        break;
      case "08":
        if (evaluate == 1) {
          step[4].title = '已评价'
          this.setData({
            arrvieIndex: 4,
            arrvieIcon: 5,
            step: step
          })
        } else {
          this.setData({
            arrvieIndex: 2,
            arrvieIcon: 3
          })
        }

        break;
    }
  },
 // 取消工单方法
cancelOrder() {
  wx.showModal({
    title: '提示',
    content: '确定要取消该工单吗？',
    success: (res) => {
      if (res.confirm) {
        // 调用取消工单接口
        cancelOrder(this.data.mrid).then(response => {
          if (response.isok) {
            wx.showToast({
              title: '工单已取消',
              icon: 'success',
              duration: 2000,
            });
            // 可选：取消后返回上一页或刷新数据
            wx.reLaunch({
              url: '/my/pages/repair/index',
            })
          } else {
            wx.showToast({
              title: '取消失败，请重试',
              icon: 'none',
              duration: 2000,
            });
          }
        }).catch(error => {
          wx.showToast({
            title: '网络错误',
            icon: 'none',
            duration: 2000,
          });
          console.error('取消工单失败:', error);
        });
      }
    }
  });
},
  goMessage(e) {
    let type = e.currentTarget.dataset.type
    let item = e.currentTarget.dataset.item
    let url = ''
    console.log(type)
    // if (type == 'message') {
    //   url = '/my/pages/message/index?id=0'
    //   wx.navigateTo({
    //     url: url,
    //   })
    // } else 
    if (type == 'evaluation') {
      let urls = '/pages/repair/repairEvaluation/index?data=' + this.data.dataList.mRID + '&status=' + item.status
      wx.navigateTo({
        url: urls,
      })
    } else if (type == 'shark') {
      // this.subscribeMessage()
    } else if (type == 'cancel') {
      this.cancelOrder()
    } else {
      Utils.showToast('功能未开放', 'error')
    }

  },
  //根据状态值显示下方时间
  getTimeStatus(status, data) {
    let {
      step,
      worderCallout
    } = this.data
    let index = parseInt(status)
    step[2].text = data.surveyTime ? data.surveyTime : ''
    step[3].text = data.dealWithTime ? data.dealWithTime : ''
    step[0].text = data.orderTime ? data.orderTime : ''
    if (index >= 4) {
      step[1].text = data.arriveTime ? data.arriveTime : ''
      this.setData({
        hasArrive: false,
        step: step,
        worderCallout: '已到达'
      })
    } else {
      this.setData({
        hasArrive: true,
        step: step,
        worderCallout: '正在路上'
      })
    }
  },
  //获取目标坐标以及抢修人员坐标 渲染地图
  getLocalpeople(data, oldData) {
    let nowLat = Number(this.data.dataList.latitude)
    let nowLong = Number(this.data.dataList.longitude)
    if (this.data.markers[1] && data) {
      if (data.latitude == this.data.markers[1].latitude && data.longitude == this.data.markers[1].longitude) {
        console.log('坐标无变化')
        return
      } else {
        console.log('坐标有变化')
      }
    }
    let markerArr = [{
      id: 1,
      latitude: nowLat,
      longitude: nowLong,
      iconPath: '/images/position.png',
      width: '56rpx',
      height: '114rpx',
      callout: {
        content: this.data.dataList.cause,
        fontSize: 16,
        anchorY: -10,
        display: 'ALWAYS',
        padding: 10
      }
    }]
    //如果有抢修师傅经纬度
    if (data) {
      if (markerArr[1]) {
        markerArr[1].latitude = data.latitude
        markerArr[1].longitude = data.longitude
        markerArr[1].alpha = 1
      } else {
        markerArr.push({
          id: 2,
          latitude: data.latitude,
          longitude: data.longitude,
          iconPath: '/images/qxry.png',
          width: '88rpx',
          height: '88rpx',
          callout: {
            content: this.data.worderCallout,
            fontSize: 16,
            anchorY: -10,
            display: 'ALWAYS',
            padding: 10
          }
        })
      }

    }
    //用于展示出最大视野范围经纬度，不显示此marker
    if (oldData) {
      if (markerArr[2]) {
        markerArr[2].latitude = oldData.latitude
        markerArr[2].longitude = oldData.longitude
        markerArr[2].alpha = 0
      } else {
        markerArr.push({
          id: 3,
          latitude: oldData.latitude,
          longitude: oldData.longitude,
          alpha: 0
        })
      }
    }
    this.setData({
      markers: markerArr
    })
  },
  //获取当前位置 
  getLocation() {
    let _this = this
    // let { markers} = this.data
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        _this.setData({
          map: {
            latitude: res.latitude,
            longitude: res.longitude
          },
        })
      },
      fail() {
        wx.getSetting({
          success: (res) => {
            if (!res.authSetting['scope.userLocation']) {
              //打开提示框，提示前往设置页面
              wx.showModal({
                title: '温馨提示',
                content: '获取定位失败，请在设置里面打开',
                success(res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success(res) {
                        console.log('判断有无权限', res)
                        if (res.authSetting['scope.userLocation'] === true) {
                          _this.getLocation()
                        }
                      }
                    })
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            }
          }
        })
      }
    })
  },

  //点击确定携带参数跳转页面
  formSubmit(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    wx.navigateTo({
      url: '/pages/repair/repairContent/index'
    })
  },


  closeDoor() {
    this.setData({
      maskShow: false
    })
  },

  onClose() {
    this.setData({
      show: false
    });
  },
  submitFormOrder(e) {
    console.log('提交')
  },
  //监听元素高度动态调整地图中心点
  watchDom() {
    let _this = this;
    let query = wx.createSelectorQuery();
    query.select('.map-content').boundingClientRect(rect => {
      let clientHeight = rect.height;
      let clientWidth = rect.width;
      let ratio = 750 / clientWidth;
      let height = clientHeight * ratio;
      _this.setData({
        domHeight: height
      })
      console.log(height);
    }).exec();
  },
  //展开收起折叠面板
  onCollapse(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
  //拨打电话
  callPhone(e) {
    let phone = e.currentTarget.dataset.phone
    if (!phone || phone == '') {
      Utils.showToast('抢修人员暂无号码', 'none')
      return
    }
    wx.makePhoneCall({
      phoneNumber: phone,
      success(res) {
        console.log(res)
      },
      fail(res) {
        console.log(res)
      }
    })
  },


})