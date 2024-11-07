// pages/my/door/doorForm/index.js
import Utils from '../../../../utils/util'
var QQMapWX = require('../../../../utils/qqmap-wx-jssdk.min');
var qqmapsdk;
import {
  addDoorUser,
  addTagUser,
  updateTagUser,
  deleteTagUser,
  getDoorDeatil,
  updataDoorUser
} from '../../../../utils/api/user'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navTitle: '添加户号',
    formButton: '立即提交',
    areaTitle: '请选择地区',
    actionTitle: '查询到以下户号',
    maskShow: false,
    PowerDoor: [{
        id: 0,
        address: '1006577809 | *1室',
        detail: '广州市海珠区*****1单元'
      },
      {
        id: 1,
        address: '1006544808 | *2室',
        detail: '广州市天河区*****2单元'
      }
    ],
    maskTag: false,
    tagList: {
      tagName: '请选择标签'
    },
    payValue: '',
    id: 0,
    type: 'add',
    addressValue: '', //详情地址
    addressContent: '', //区域字段
    address: '', //展示地区名称
    location: {
      lat: "",
      lng: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options) {
      let type = options.type;
      let id = options.id;
      console.log(type)
      console.log(options)
      if (type == 'edit') {
        if (id) {
          this.getDeatil(id)
        }
        this.setData({
          navTitle: '修改户号',
          id: id,
          type: type
        })
      }
    }
    qqmapsdk = new QQMapWX({
      //腾讯位置服务：   https://lbs.qq.com/console/mykey.html
      key: 'ORXBZ-N32HX-ROV4B-7NIWS-JYYWE-ESBJA' //这里自己的key秘钥进行填充，该key是腾讯位置服务中申请的
    });
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
    let _this = this
    wx.getStorage({
      key: 'area',
      success(res) {
        if (res) {
          _this.setData({
            areaTitle: res.data
          })
          wx.removeStorage({
            key: 'area'
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
  //获取详情信息
  getDeatil(id) {
    Utils.showLoading()
    getDoorDeatil(id).then(res => {
      this.setData({
        addressValue: res.data.detailAddress,
        address: res.data.address,
        payValue: res.data.account,
        tagList: {
          tagName: res.data.tagId == '' ? '请选择标签' : res.data.tagName,
          id: res.data.tagId == '' ? '' : res.data.tagId
        },
        location: {
          lat: Number(res.data.latitude),
          lng: Number(res.data.longitude)
        }
      })
      console.log(this.data.location, 'aaaa', res)
      Utils.hideLoading()
    }).catch(err => {
      Utils.hideLoading()
      console.log(err)
    })
  },
  //新增
  cancelForm() {
    console.log(this.data.type, this.data)
    let data = {
      address: this.data.address,
      detailAddress: this.data.addressValue,
      account: this.data.payValue,
      tagId: this.data.tagList.id || '',
      latitude: this.data.location.lat,
      longitude: this.data.location.lng
    }
    if (!data.address || data.address == '') {
      wx.showToast({
        title: '请选择地址',
        icon: 'error',
        duration: 1000,
        mask: true
      })
      return
    }
    if (!this.data.addressValue || this.data.addressValue == '') {
      wx.showToast({
        title: '请填写详细地址',
        icon: 'error',
        duration: 1000,
        mask: true
      })
      return
    }
    if (!data.account || data.account == '') {
      wx.showToast({
        title: '请填写户号',
        icon: 'error',
        duration: 1000,
        mask: true
      })
      return
    }
    let _this = this
    if (_this.data.type == 'edit') {
      //修改
      data = {
        id: _this.data.id,
        address: this.data.address,
        detailAddress: this.data.addressValue,
        account: this.data.payValue,
        tagId: this.data.tagList.id || '',
        latitude: this.data.location.lat,
        longitude: this.data.location.lng
      }
      console.log(data, '修改信息')
      updataDoorUser(data).then(res => {
        if (res.isok) {
          Utils.setStorage('editDoor', true)
        } else {
          Utils.setStorage('editDoor', false)
        }
      }).catch(err => {
        Utils.setStorage('editDoor', false)
      })
    } else {
      //添加
      addDoorUser(data).then(res => {
        if (res.isok) {
          Utils.setStorage('addDoor', true)
        } else {
          Utils.setStorage('addDoor', false)
        }
      }).catch(err => {
        Utils.setStorage('addDoor', false)
      })
    }
  },
  //扫码
  onScanCode() {
    let _this = this
    wx.scanCode({
      success(res) {
        _this.setData({
          payValue: res.result
        })
      }
    })

  },
  getChooise() {
    let _this = this
    wx.chooseLocation({
      success(res) {
        console.log(res)
        _this.setData({
          address: res.address + res.name,
          location: {
            lat: res.latitude,
            lng: res.longitude
          }
        })
      },
      fail(res) {

      }
    })
  },
  cellClick(e) {
    let type = e.currentTarget.dataset.type
    switch (type) {
      case 'area':
        wx.navigateTo({
          url: '/pages/area/index',
        })
        this.setData({
          maskTag: false
        })
        break;
      case 'door':
        this.setData({
          maskShow: true,
          maskTag: false
        })
        break;
      case 'tag':
        this.setData({
          maskTag: true
        })
        break;
    }
  },
  closeDoor() {
    this.setData({
      maskShow: false
    })
  },
  changeDoor(e) {
    let data = e.currentTarget.dataset.list
    this.setData({
      maskShow: false
    })
  },

  //获取标签返回值
  tagClick(e) {
    let detail = e.detail
    if (detail && detail.id) {
      this.setData({
        tagList: e.detail,
        maskTag: false
      })
    }
  },
  //动态获取input
  changeInput(e) {
    let index = e.currentTarget.dataset.index
    switch (index) {
      case "0":
        this.setData({
          addressValue: e.detail.value
        })
        break;
      case "1":
        this.setData({
          payValue: e.detail.value
        })
        break;
    }

  }
})