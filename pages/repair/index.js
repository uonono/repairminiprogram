// pages/repair/index.js
const app = getApp()
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min');
var qqmapsdk;
import {
  loginUser,
  getUser,
  updataUser
} from '../../utils/api/user'
import {
  getDoor,
  gethistoryAddress,
  orderSave,
  getOrder
} from '../../utils/api/order.js';
import Utils from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scale: 15, //缩放等级
    hasDoors: false, //是否有选择户号
    hasCenter: false,
    activeIndexDoor: false, //当前选中的户号
    hasDisable: false,
    hasPhone: false, //是否绑定手机
    hasInfo: false, //是否登录
    sheetType: 'historyAddress', //弹框类型
    actionTitle: '查询到以下户号',
    scanValue: '',
    address: '', //展示地址字段
    addressContent: '', //地址字段
    detailAddress: '', //详情地址字段
    authData: {}, //权限信息
    userLocation: {}, //用户位置信息
    historyAddress: [], //历史报修地址
    PowerDoor: [],
    markers: [], //地图坐标数组
    map: {
      latitude: 38.03599,
      longitude: 114.46979
    },
    navbarTitle: 'home',
    userInfo: {},
    showLocationModel: false, //引导打开定位
    navHeight: 120,
    focusHeight: 0,
    maskShow: false,
    howDoor: false, //是否通过其他动作选择了户号
    howConcel: false, //是否通过提交页面跳转回来
    submitData: [{
      title: '户号',
      text: '6789900022'
    }, {
      title: '故障地址',
      text: '广州市海珠区厚德路94号2单元202室'
    }, {
      title: '上门时间',
      text: '2021-04-14  20:20'
    }, {
      title: '联系人员',
      text: '李先生'
    }, {
      title: '联系电话',
      text: '13250548007'
    }, {
      dataList: []
    }],
    domHeight: 0,
    translateArr: {},
    showLocation: false,
    PowerData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options && options.data) {
      this.getSubitForm(options.data)
      this.setData({
        howConcel: true,
        hasCenter: false,
        navbarTitle: 'back'
      })
    } else {
      this.getOrderList()
      this.getHasAuth();
      this.getInit()
      this.setData({
        howConcel: false,
        hasCenter: true,
        navbarTitle: 'home'
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
    this.getUserPhone();

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
    //根据标签页面情况弹框
    let _this = this;
    //添加
    wx.getStorage({
      key: 'addDoor',
      success(res) {
        if (res) {
          if (res.data) {
            Utils.showToast('添加成功', 'success')
          } else {
            Utils.showToast('添加失败', 'error')
          }
          _this.getDoorList()
          wx.removeStorage({
            key: 'addDoor'
          })
        }
      },
      fail(res) {
        wx.removeStorage({
          key: 'addDoor'
        })
      }
    });

  },
  //初始化数据
  getInit() {
    this.getDoorList()
    this.getHistoryAddress()
  },
  //获取已报修工单列表
  getOrderList() {
    let page = {
      pageIndex: 1,
    }
    getOrder(page).then(res => {
      if (res.isok) {
        console.log(res, 'res')
        let arr = []
        res.data.map((item, index) => {
          if (item.procCode !== '08') {
            arr.push(item)
          }
        })
        this.setData({
          dataList: arr
        })
      } else {
        console.log('网络异常')
      }
    }).catch(err => {
      console.log('网络异常', err)
      console.log(err)
    })
  },
  //户号查询
  getDoorList() {
    getDoor().then(res => {
      if (res) {
        this.setData({
          PowerDoor: res
        })
      };
    }).catch(err => {
      console.log(err)
    })
  },
  //历史地址
  getHistoryAddress() {
    gethistoryAddress().then(res => {
      if (res) {
        this.setData({
          historyAddress: res.data
        })
      }
    }).catch(err => {
      console.log(err, '历史数据')
    })
  },
  //初始化使用
  getLocation() {
    console.log('有无触发')
    let _this = this
    wx.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      success(res) {
        _this.getLocal(res.latitude, res.longitude, false, false)
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
  //非初始化使用
  getLocationSecond() {
    let _this = this
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        _this.getLocal(res.latitude, res.longitude)
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
  getChooise() {
    //选择地图后回调
    let _this = this
    if (!this.data.hasDoors) {
      wx.chooseLocation({
        success(res) {
          _this.setData({
            detailAddress: '', //详情字段
            addressContent: res.address, //地区字段
            address: res.name ? res.name : '' //只展示地区名称
          })
          _this.getLocal(res.latitude, res.longitude, true)
        },
        fail(res) {

        }
      })
    }
  },
  //点击查看跳转工单列表，如果当一个直接跳转详情
  viewClick(e) {
    let item = e.currentTarget.dataset.item
    let url = 'pages/repair/index'
    console.log(item)
    if (item.length == 1) {
      url = '/pages/repair/repairDetail/index?id=' + item[0].id
    } else {
      url = '/my/pages/repair/index'
    }
    wx.reLaunch({
      url: url,
    })
  },
  //移动地图后获取对应地址
  getCenter(res) {
    console.log(res)
    let that = this
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: res.detail.latitude,
        longitude: res.detail.longitude
      },
      success: function (res) {
        that.setData({ //把地理位置省市赋值给声明在data中的变量
          address: res.result.address,
          addressContent: ''
        })
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        // console.log(res);
      }
    });
  },
  //获取用户授权
  //判断是否有位置授权
  getHasAuth() {
    this.getLocation()
    let _this = this
    wx.getSetting({
      success(res) {
        _this.setData({
          authData: res.authSetting
        })
        console.log(res)
        //初始化请求定位

      }
    })
  },
  //点击确定携带参数跳转页面
  formSubmit(e) {
    //校验
    let scanValue = this.data.scanValue;
    let address = this.data.address;
    let detailAddress = this.data.detailAddress
    let addressContent = this.data.addressContent
    let data = {
      addressAreaName: addressContent + address,
      account: scanValue,
      address: addressContent + address + detailAddress,
      latitude: this.data.userLocation.latitude,
      longitude: this.data.userLocation.longitude
    }
    if (!this.data.hasDoors) {
      if (!address || address == '') {
        Utils.showToast('请选择地址', 'error')
        return
      }
      if (!detailAddress || detailAddress == '') {
        Utils.showToast('请填写详细地址', 'error')
        return
      }
      if (!app.globalData.hasUserInfo) {
        Utils.showToast('请先登录', 'error')
        return
      }
    } else {
      data = this.data.PowerData
    }
    let dataUrl = JSON.stringify(data)
    console.log(dataUrl)
    wx.navigateTo({
      url: '/pages/repair/repairContent/index?data=' + dataUrl
    })
  },
  //扫码
  onScanCode() {
    let _this = this
    if (!this.data.hasDoors) {
      wx.scanCode({
        success(res) {
          console.log(res)
          _this.setData({
            scanValue: res.result
          })
        }
      })
    }
  },
  //此处为点击更多以及添加按钮
  getPicker(e) {
    let type = e.currentTarget.dataset.type
    let title = '查询到以下户号'
    let source = e.currentTarget.dataset.source
    if (type == 'historyAddress') {
      title = '查询到以下历史保修地址'
    } else if (type == 'PowerDoor') {
      title = '查询到以下户号'
      //根据点击扫码返回、更多、自动查询等不同对应返回数据
      if (source == 'more') {
        //点击更多
      } else if (source == 'automatic') {
        //点击自动查询户号
      } else if (source == 'add') {
        Utils.navigateTo('/my/pages/door/doorForm/index?type=' + 'add')
      }
    }
    console.log(type)
    this.setData({
      sheetType: type,
      actionTitle: title
    })
    if (source !== 'add') {
      this.setData({
        maskShow: true
      })
    }
  },
  //关闭模态窗
  closeDoor() {
    this.setData({
      maskShow: false
    })
  },
  //腾讯位置获取地址 此处处理地图定位，marker
  getLocal: function (latitude, longitude, set = false, showMarker = true, contentValue) { //把经纬度转换成地理位置
    let that = this;
    console.log(latitude, longitude, '触发')
    if (showMarker) {
      that.setData({
        markers: [{
          id: 1,
          latitude: latitude,
          longitude: longitude,
          iconPath: '/images/position.png',
          width: '56rpx',
          height: '114rpx',
          callout: {}
        }],
      })
      that.setData({
        showLocation: false
      })
    } else {
      that.setData({
        showLocation: true
      })
    }
    that.setData({
      map: {
        latitude: latitude,
        longitude: longitude
      },
      translateArr: {
        latitude: latitude,
        longitude: longitude
      },
      userLocation: {
        latitude: latitude,
        longitude: longitude
      },

    })
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      get_poi: 1,
      success: function (res) {
        console.log(res)
        const city = res.result.address_component.city
        const cityArr = ['广州市', '北京市', '石家庄市', '石家庄']
        console.log(cityArr.indexOf(city), 'ads')
        let {
          markers
        } = that.data
        if (cityArr.indexOf(city) !== -1) {
          if (markers && markers.length > 0) {
            if (contentValue && contentValue !== '') {
              markers[0].callout = {
                content: contentValue,
                fontSize: 16,
                anchorY: -10,
                display: 'ALWAYS',
                padding: 10
              }
            } else {
              markers[0].callout = {}

            }
            that.setData({
              markers: markers
            })
          }
          that.setData({
            hasDisable: false
          })
        } else {
          markers[0].callout = {
            content: '当前区域还未开通报修功能，请使用95598电话报修或者安装网上国网App报修',
            fontSize: 16,
            anchorY: -10,
            display: 'ALWAYS',
            padding: 10
          }
          console.log(markers)
          that.setData({
            markers: markers,
            hasDisable: true
          })
        }
        console.log(set, res.result.address)
        if (!set) {
          that.setData({ //把地理位置省市赋值给声明在data中的变量
            address: res.result.address
          })
        }

      },
      fail: function (res) {
        console.log(res, '无结果返回');
      },
      complete: function (res) {
        // console.log(res);
      }
    });
  },
  onClose() {
    this.setData({
      show: false
    });
  },
  //第三级页面赋值
  getSubitForm(data) {
    let datas = JSON.parse(data);
    let submitForm = [{
      title: '户号',
      text: datas.account
    }, {
      title: '故障地址',
      text: datas.address
    }, {
      title: '预约时间',
      text: datas.orderTime
    }, {
      title: '联系人员',
      text: datas.contactName
    }, {
      title: '联系电话',
      text: datas.contactPhone
    }]
    this.setData({
      submitData: submitForm,
      submitList: datas
    })
    this.getLocalpeople(datas.latitude, datas.longitude, datas.content)
  },
  submitFormOrder(data) {
    //这里最终提交
    this.saveData()
    // this.subscribeMessage()
  },
  // 跳下一页
  goToNextPage() {
    // 跳转到指定页面，例如跳转到详情页
    wx.navigateTo({
      url: '/pages/repair/repairDetail/index',  // 替换为目标页面的路径
    });
  },
  //提交工单
  saveData() {
    console.log('回调执行')
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1;
    let nowHours = parseInt(date.getHours()) > 10 ? date.getHours() : date.getHours();
    let nowMinutes = parseInt(date.getMinutes()) > 10 ? date.getMinutes() : '0' + date.getMinutes();
    let returnDate = year + '-' + month + '-' + date.getDate() + ' ' + nowHours + ':' + nowMinutes
    let datas = this.data.submitList
    if (datas && datas.orderTime && datas.orderTime === '立即上门') {
      datas.orderTime = returnDate;
    }
  
    console.log(datas, 'datas')
    orderSave(datas).then(res => {
      console.log('saveOrder.result-->', res)
      if (res.isok) {
        let url = '/pages/repair/repairDetail/index?id=' + res.data.id
        wx.reLaunch({
          url: url,
        })
      } else {
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '提交工单失败,当前访问网络超时(500)',
          success: function (res) {}
        })
      }
    }).catch(err => {
      console.log(err)
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '提交工单失败,当前访问网络超时(504)',
        success: function (res) {}
      })
    })
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
  //双向绑定
  bindComponentInput(e) {
    let name = e.currentTarget.dataset.name
    switch (name) {
      case 'scanValue':
        this.setData({
          scanValue: e.detail.value
        })
        break;
      case 'address':
        this.setData({
          address: e.detail.value
        })
        break;
      case 'detailAddress':
        this.setData({
          detailAddress: e.detail.value
        })
        break;
    }

  },
  //点击历史报修以及用户电号或者弹窗里面的选中 获取数据跳转
  clickRouterTo(e) {
    this.setData({
      maskShow: false
    })
    let item = e.currentTarget.dataset.item
    let type = e.currentTarget.dataset.type
    let index = e.currentTarget.dataset.index
    console.log(item)
    let data = {
      addressAreaName: item.areaName,
      address: item.areaName + (item.address || item.addressContent),
      longitude: item.longitude,
      latitude: item.latitude,
      account: item.account ? item.account : ''
    }
    let datas = JSON.stringify(data)

    if (type == 'PowerDoor' && index == '1') {
      console.log('这里选择户号')
      if (this.data.activeIndexDoor == item.id) {
        this.setData({
          hasDoors: false,
          activeIndexDoor: '',
          PowerData: {},
          address: '',
          detailAddress: '',
          scanValue: ''
        })
      } else {
        this.setData({
          activeIndexDoor: item.id,
          hasDoors: true,
          PowerData: data,
          address: item.areaName,
          detailAddress: item.address,
          scanValue: item.account
        })
      }

    } else {
      wx.navigateTo({
        url: '/pages/repair/repairContent/index?data=' + datas
      })
    }


  },
  //当用户选择信息后，根据选择的地址定位地图
  getLocalpeople(lat, long, val) {
    this.getLocal(lat, long, true, true, val)
  },
  //获取手机号并写入后台
  getPhoneNumber(e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
  },
  //初始化获取用户手机号，判断是否有值，如果有则默认判断有绑定
  getUserPhone() {
    getUser().then(res => {
      if (res.isok) {
        if (res.data.phone !== '') {
          this.setData({
            hasPhone: true
          })
        }
      }
    })
  },
  subscribeMessage(callback) {
    //需要订阅的消息模板，在微信公众平台手动配置获取模板ID
    let message = ['-AaseY77ufnU5bMnTZPCiE6PMy55TjL8NiRupjIbABM', 'MrLFCQrVwm8nmJmJ0uNYR9a-bh3lyF0DsDTrYH6-7P4','oP64DCIBZliqqlciwPjF7ejcHQIRaSPY8KxWMPqjKsY']
    // -AaseY77ufnU5bMnTZPCiE6PMy55TjL8NiRupjIbABM
    //如果总是拒绝（subscriptionsSetting，2.10.1库才支持）
    if (this.versionCompare('2.10.1')) {
      wx.getSetting({
        withSubscriptions: true, //是否同时获取用户订阅消息的订阅状态，默认不获取
        success: (res) => {
          console.log(res)
          if (res.subscriptionsSetting && res.subscriptionsSetting.itemSettings) {
            //打开设置去设置
            let item = res.subscriptionsSetting.itemSettings
            let arr = []
            for (let i in item) {
              arr.push(item[i])
            }
            if (arr.indexOf('accept') == -1) {
              //当都拒绝
              this.openConfirm('检测到您没打开推送权限，是否去设置打开？')
            } else {
              callback()
            }
          } else {
            wx.requestSubscribeMessage({
              tmplIds: message,
              success: (res) => {
                callback()
              },
              fail: (res) => {
                console.info(res)
              },
            })
          }
        }
      })
    } else if (this.versionCompare('2.4.4')) {
      wx.requestSubscribeMessage({
        tmplIds: [message],
        success: (res) => {
          if (res[message] == 'accept') {
            //用户允许
          }
        },
        fail: (res) => {
          console.info(res)
        },
      })
    }
  },
  //打开设置
  openConfirm(message) {
    wx.showModal({
      content: message,
      confirmText: "确认",
      cancelText: "取消",
      success: (res) => {
        //点击“确认”时打开设置页面
        if (res.confirm) {
          wx.openSetting({
            success: (res) => {
              console.log(res.authSetting)
            },
            fail: (error) => {
              console.log(error)
            }
          })
        } else {
          console.log('用户点击取消')
        }
      }
    });
  },
  //基础库版本比较
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
  //失焦后重新获取地图定位
  onPosition(e) {
    // let content = this.data.address + this.data.detailAddress
    // let _this = this
    // if (content !== '') {
    //   qqmapsdk.geocoder({
    //     address: content,
    //     success(res) {
    //       let lat = res.result.location.lat
    //       let lng = res.result.location.lng
    //       _this.getLocal(lat, lng, true)
    //     }
    //   })
    // }
  }
})