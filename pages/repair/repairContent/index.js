// pages/repair/repairContent/index.js
const getTime = require('../../../utils/util')
import Toast from '/@vant/weapp/toast/toast';
import Utils from '../../../utils/util'
import {
  getUser,
} from '../../../utils/api/user'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    optionData: [],
    userList: {}, //个人信息
    columns: [],
    repairPicker: ['我家停电了', '我家和邻居家停电', '整栋楼停电', '整个小区（村）停电', '其它紧急情况', '内部故障'],
    repairPickerValue: '我家停电了',
    maskPickerShow: false,
    otherName: '', //代他人报修名称
    otherPhone: '', //代他人报修电话
    repairDesc: '',
    maskShow: false,
    maskTimeShow: false,
    chooseImgArr: [],
    fileList: [],
    currentDate: [], //当前选中
    pickerDom: null, //picker组件实例
    showCurrentDate: '立即上门',
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      } else if (type === 'month') {
        return `${value}月`;
      }
      return value;
    },
    mainActiveIndex: 0,
    activeId: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options && options.data) {
      this.getInit(options.data)
    }
    //获取个人信息
    this.getUserData()
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
    this.getUserData()
    let _this = this
    wx.getStorage({
      key: 'concat',
      success(res) {
        if (res) {
          _this.setData({
            otherName: `${res.data.repiarName}`,
            otherPhone: `${res.data.repiarPhone}`
          })
          wx.removeStorage({
            key: 'concat'
          })
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  //处理路劲参数
  getInit(data) {
    let datas = JSON.parse(data)
    console.log(datas)
    this.setData({
      optionData: datas
    })
  },
  onChangeSwitch({
    detail
  }) {
    // 需要手动对 checked 状态进行更新
    console.log(detail, userList)
    const {
      userList
    } = this.data
    if (detail) {
      this.setData({
        checked: detail,
        otherName: '',
        otherPhone: ''
      });
    } else {
      this.setData({
        checked: detail,
        otherName: userList.nickname ? userList.nickname : '',
        otherPhone: userList.phone ? userList.phone : ''
      });
    }
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

  },
  //判断是否有录音权限
  getHasAuth() {
    let _this = this

  },
  //选择器触发
  bindPickerChange(e) {
    console.log(e)
    this.setData({
      index: e.detail.value
    })
  },
  closeMask() {
    this.setData({
      maskShow: false
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
  /**
   * 图片  视频 选择框
   */
  //选择图片
  chooseMedia() {
    let _this = this
    let tempFilePaths = [];
    wx.chooseMedia({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res)
        // tempFilePath可以作为img标签的src属性显示图片
        tempFilePaths = res.tempFiles
        let nowPhoto = _this.data.chooseImgArr
        if (tempFilePaths.length > 0) {
          tempFilePaths.map((item) => {
            if (item.fileType == 'image') {
              console.log(item)
              nowPhoto.push(item.tempFilePath)
            } else if (item.fileType == 'video') {
              console.log(item.thumbTempFilePath)
              nowPhoto.push(item.thumbTempFilePath)
            }
          })
        }
        if (nowPhoto.length > 8) {
          let data = nowPhoto.slice(0, 9)
          _this.setData({
            chooseImgArr: data
          })
        } else {
          _this.setData({
            chooseImgArr: nowPhoto
          })
        }
      }
    })

  },
  afterRead(event) {
    const {
      file
    } = event.detail;
    console.log(event)
    const {
      fileList = []
    } = this.data;

    fileList.push(
      ...file
    );
    this.setData({
      fileList
    });
    console.log(fileList)
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    wx.uploadFile({
      url: 'https://example.weixin.qq.com/upload', // 仅为示例，非真实的接口地址
      filePath: file.url,
      name: 'file',
      formData: {
        user: 'test'
      },
      success(res) {
        // 上传完成需要更新 fileList
        const {
          fileList = []
        } = this.data;
        fileList.push({
          ...file,
          url: res.data
        });
        this.setData({
          fileList
        });
      },
    });
  },
  //删除图片
  deleteImg(e) {
    let fistOldimg = this.data.fileList
    fistOldimg.splice(e.detail.index, 1)
    this.setData({
      fileList: fistOldimg
    })
  },
  //时间选择
  onInput(event) {
    this.setData({
      currentDate: event.detail,
    });
  },
  //显示预约时间
  getTimeShow() {

    this.setData({
      maskTimeShow: true,
    })
  },
  maskTimeHide() {
    this.setData({
      maskTimeShow: false
    })
  },
  //双向绑定按钮
  inputChange(e) {
    let value = e.detail.value
    this.setData({
      repairDesc: value
    })
  },
  //取消按钮
  confirmTime(event) {
    // let time = getTime.formatDuringTime(event.detail)
    this.setData({
      // currentDate: event.detail,
      // showCurrentDate: time,
      maskTimeShow: false
    });
  },
  //点击确认跳转
  cancelForm(e) {
    //需要附带参数
    if (this.data.repairPickerValue == '' && this.data.repairDesc == '') {
      Toast.fail('故障描述不能为空')
      // Utils.showToast('故障描述不能为空', 'none')
      return
    }
    if (this.data.showCurrentDate == '') {
      Toast.fail('请选择预约时间')
      // Utils.showToast('请选择预约时间', 'error')
      return
    }
    //联系人处理
    if (this.data.otherName == '') {
      Toast.fail('联系人姓名不能为空')
      // Utils.showToast('联系人姓名不能为空', 'none')
      return
    }
    if (this.data.otherPhone == '') {
      Toast.fail('联系人电话不能为空')
      // Utils.showToast('联系人电话不能为空', 'none')
      return
    }
    // if (this.data.checked) {

    // } else {
    //   if (this.data.userList.phone == '') {
    //     wx.showModal({
    //       title: '提示',
    //       showCancel: false,
    //       content: '请先完善个人资料的手机号',
    //       success: function () {
    //         Utils.navigateTo('/my/pages/profile/index')
    //       }
    //     })
    //     return
    //   }
    // }

    let data = {
      addressAreaName: this.data.optionData.addressAreaName, //区域地质
      address: this.data.optionData.address, //报修地址,
      account: this.data.optionData.account, //户号
      contactName: this.data.otherName, //联系人姓名
      contactPhone: this.data.otherPhone, // 联系人电话
      content: this.data.repairPickerValue + this.data.repairDesc, //故障描述
      orderTime: this.data.showCurrentDate, //预约时间
      longitude: this.data.optionData.longitude, //工单经度
      latitude: this.data.optionData.latitude, //工单纬度 
      // fileList: this.data.fileList,
    }
    //将对象转为string
    console.log(data)
    let queryBean = JSON.stringify(data)
    wx.navigateTo({
      url: '/pages/repair/index?data=' + queryBean,
    })
  },
  //带订阅的提交方式
  cancelSubscribeMessage() {
    if (this.data.repairPickerValue == '' && this.data.repairDesc == '') {
      Toast.fail('故障描述不能为空')
      return
    }
    if (this.data.showCurrentDate == '') {
      Toast.fail('请选择预约时间')
      return
    }
    //联系人处理
    if (this.data.otherName == '') {
      Toast.fail('联系人姓名不能为空')
      return
    }
    if (this.data.otherPhone == '') {
      Toast.fail('联系人电话不能为空')
      return
    }
    this.subscribeMessage(this.cancelForm)
  },
  //待他人报修
  otherRepiar() {
    wx.navigateTo({
      url: '/pages/repair/repairContact/index',
    })
  },
  //初始化获取当前用户信息
  getUserData() {
    getUser().then(res => {
      if (res.isok) {
        //存储当前个人信息方便后面使用
        this.setData({
          userList: res.data,
          otherName: res.data.nickname ? res.data.nickname : '',
          otherPhone: res.data.phone ? res.data.phone : ''
        })
      }
    })
  },
  cellClick(e) {
    let index = parseInt(e.currentTarget.dataset.pickerindex)
    let nowDate = new Date()
    switch (index) {
      case 0:
        this.setData({
          maskPickerShow: true
        })
        break;
      case 1:
        let textItem = [{
            text: '立即上门',
            context: '立即上门'
          },
          {
            text: `${this.getDatastr(0)} 今天`,
            context: `${this.getDatastr(0,true)}`,
          },
          {
            text: `${this.getDatastr(1)} 明天`,
            context: `${this.getDatastr(1,true)}`,
          },
          {
            text: `${this.getDatastr(2)} 后天`,
            context: `${this.getDatastr(2,true)}`,
          },
        ]
        let firstItem = []
        let nowIndex = this.data.currentDate;
        textItem.map((item, index) => {
          firstItem.push({
            text: item.text,
            context: item.context,
            id: index
          })
        })
        let timeItem = [{
            values: firstItem,
            className: 'column1',
          },
          {
            values: ['-'],
            className: 'column2',
            defaultIndex: 2,
          },
          {
            values: ['-'],
            className: 'column3',
            defaultIndex: 3,
          },
        ] //时间选项
        //根据nowIndex判断已选中内容
        console.log(nowIndex)
        if (nowIndex && nowIndex.length > 0) {
          if (nowIndex[0].value[0].id == 0) {
            timeItem[1].values = ['-']
            timeItem[2].values = ['-']
          } else if (nowIndex[0].value[0].id == 1) {
            timeItem[1].values = this.getPickerHours(true)
            timeItem[2].values = this.getPickerMin(true)
          } else {
            timeItem[1].values = this.getPickerHours()
            timeItem[2].values = this.getPickerMin()
          }

          this.setData({
            maskTimeShow: true,
            columns: timeItem
          })
        } else {
          this.setData({
            maskTimeShow: true,
            columns: timeItem
          })
        }
        break;
      case 2:
        wx.navigateTo({
          url: '/pages/repair/repairContact/index',
        })
        break;
    }

  },
  //故障描述选择
  onPickerChange(e) {
    this.setData({
      repairPickerValue: e.detail.value,
      maskPickerShow: false
    })
  },
  //关闭故障描述
  onPickerClose() {
    this.setData({
      maskPickerShow: false
    })
  },
  //picker选择时间
  onChange(event) {
    const {
      picker,
      value,
      index
    } = event.detail;
    if (value[0].id == 0) {
      picker.setColumnValues(1, ['-']);
      picker.setColumnValues(2, ['-']);
    } else if (value[0].id == 1) {
      picker.setColumnValues(1, this.getPickerHours(true));
      picker.setColumnValues(2, this.getPickerMin(true));
    } else {
      picker.setColumnValues(1, this.getPickerHours());
      picker.setColumnValues(2, this.getPickerMin());
    }
    this.setData({
      currentDate: [{
        value: event.detail.value
      }]
    })
  },
  //
  onConfirm(e) {
    let value = e.detail.value
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1;
    let nowHours = parseInt(date.getHours()) > 10 ? date.getHours() : date.getHours();
    let nowMinutes = parseInt(date.getMinutes()) > 10 ? date.getMinutes() : '0' + date.getMinutes();
    if (value[0].id !== 0) {
      this.setData({
        showCurrentDate: year + '-' + value[0].context + ' ' + value[1] + ':' + value[2],
        maskTimeShow: false,
        currentDate: [e.detail]
      })
    } else {
      let returnDate = '立即上门'
      this.setData({
        showCurrentDate: returnDate,
        maskTimeShow: false,
        currentDate: [e.detail]
      })
    }
  },
  timeSlot(step, now) { //  step = 间隔的分钟
    let date = new Date()
    date.setHours(0) // 时分秒设置从零点开始
    date.setSeconds(0)
    date.setUTCMinutes(0)
    let nowData = new Date()
    let nowHours = nowData.getHours();
    let nowMinutes = nowData.getMinutes();
    let arr = [],
      timeArr = [];
    let slotNum = 24 * 60 / step // 算出多少个间隔
    for (let f = 0; f < slotNum; f++) { //  stepM * f = 24H*60M
      // arr.push(new Date(Number(date.getTime()) + Number(step*60*1000*f)))   //  标准时间数组
      let time = new Date(Number(date.getTime()) + Number(step * 60 * 1000 * f)) // 获取：零点的时间 + 每次递增的时间
      let hour = '',
        sec = '';
      time.getHours() < 10 ? hour = '0' + time.getHours() : hour = time.getHours() // 获取小时
      time.getMinutes() < 10 ? sec = '0' + time.getMinutes() : sec = time.getMinutes() // 获取分钟
      if (now) {
        if (hour == nowHours) {
          if (sec > nowMinutes) {
            timeArr.push({
              id: f + 1,
              hours: hour,
              min: sec
            })
          }
        } else if (hour !== nowHours) {
          if (hour > nowHours) {
            timeArr.push({
              id: f + 1,
              hours: hour,
              min: sec
            })
          }
        }
      } else {
        timeArr.push({
          id: f + 1,
          hours: hour,
          min: sec
        })
      }


    }
    return timeArr
  },
  getData(time) {
    let date = new Date()
    let howData = date.getDay()
    if (time) {
      if ((howData + time) == 7) {
        howData = 0
      } else if ((howData + time) > 7) {
        howData = 0 + time - 1
      } else {
        howData = howData + time
      }
    }
    switch (howData) {
      case 0:
        return '周日';
      case 1:
        return '周一';
      case 2:
        return '周二';
      case 3:
        return '周三';
      case 4:
        return '周四';
      case 5:
        return '周五';
      case 6:
        return '周六';
      default:
        return '周一'

    }


  },
  //获取当前picker时间框内数据
  getPickerHours(now) {
    let nowDate = new Date()
    let nowHours = nowDate.getHours();
    let arr = []
    for (let i = 0; i < 24; i++) {
      if (now) {
        if (i > nowHours)
          arr.push(
            (i < 10 ? '0' + i : i).toString(),
          )
      } else {
        arr.push(
          (i < 10 ? '0' + i : i).toString(),
        )
      }
    }
    return arr
  },
  getPickerMin(now) {
    let nowDate = new Date()
    let nowMinutes = nowDate.getMinutes()
    let arr = []
    for (let i = 0; i < 60; i++) {
      if (now) {
        if (i > nowMinutes)
          arr.push(
            (i < 10 ? '0' + i : i).toString(),
          )
      } else {
        arr.push(
          (i < 10 ? '0' + i : i).toString(),
        )
      }
    }
    return arr
  },
  //点击左侧标签函数
  onClickNav({
    detail = {}
  }) {
    this.setData({
      mainActiveIndex: detail.index || 0,
    });
  },
  onClickItem({
    detail = {}
  }) {
    const activeId = this.data.activeId === detail.id ? null : detail.id;
    let nowDate = new Date()
    let nowHours = nowDate.getHours();
    let nowMinutes = nowDate.getMinutes()
    //根据mainActiveIndex判断是哪一天 0今日 1明日 2后天
    let times = this.getDatastr(this.data.mainActiveIndex) + ' ' + detail.text
    if (this.data.mainActiveIndex == 0 && detail.id == 0) {
      times = this.getDatastr(this.data.mainActiveIndex) + ' ' + `${nowHours}:${nowMinutes}`
    }
    this.setData({
      activeId,
      showCurrentDate: times,
      maskTimeShow: false
    });
  },
  //获取今日，明日，后天日期
  getDatastr(addDate, context = false) {
    let nowDate = new Date()
    nowDate.setDate(nowDate.getDate() + addDate)
    let year = nowDate.getFullYear();
    let month = nowDate.getMonth() + 1; //获取当前月份的日期
    let returnDate = month + '月' + nowDate.getDate() + '日'
    if (context) {
      returnDate = month + '-' + nowDate.getDate()
    }
    return returnDate
  },
  subscribeMessage(callback) {
    //需要订阅的消息模板，在微信公众平台手动配置获取模板ID
    let message = ['GTq-trBwelcPLxJeB-nWf4mZVML5uXz4mS0U25W3uIA']
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
                console.log(res, '123')
                //允许不允许都跳转
                // if (res[message] == 'accept') {
                //   //用户允许
                // }
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
  getConcat() {
    let _this = this
    if (this.versionCompare('2.16.0')) {
      wx.chooseContact({
        success(res) {
          _this.setData({
            otherPhone: res.phoneNumber,
            otherName: res.displayName
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
  onChangeConcat(e) {
    let index = e.currentTarget.dataset.index
    if (index == '0') {
      this.setData({
        otherPhone: e.detail.value
      })
    } else {
      this.setData({
        otherName: e.detail.value
      })
    }
  },
})