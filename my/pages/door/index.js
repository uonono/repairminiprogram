// pages/my/door/index.js
import {
  updataDoorUser,
  deleteDoorUser,
  getDoor,
} from '../../../utils/api/user.js'
import Utils from '../../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],
    maskTag: false,
    activeItem: {} //当前工单
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getDoorList();
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
    //根据标签页面情况弹框
    let _this = this;
    this.getDoorList();
    //添加
    //修改
    wx.getStorage({
      key: 'editDoor',
      success(res) {
        if (res) {
          console.log(res, '修改信息')
          if (res.data) {
            Utils.showToast('修改成功', 'success')
          } else {
            Utils.showToast('修改失败', 'error')
          }
          wx.removeStorage({
            key: 'editDoor'
          })
        }
      },
      fail(res) {}
    });
    wx.getStorage({
      key: 'addDoor',
      success(res) {
        if (res) {
          if (res.data) {
            Utils.showToast('添加成功', 'success')
          } else {
            Utils.showToast('添加失败', 'error')
          }
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  //初始化获取户号列表
  getDoorList() {
    getDoor().then(res => {
      Utils.showLoading()
      if (res) {
        this.setData({
          dataList: res.data
        })
      } else {
        this.showToast('获取户号失败', 'error')
      }
      Utils.hideLoading()
    }).catch(err => {
      this.showToast('网络异常', 'error')
      console.log(err)
      Utils.hideLoading()
    })
  },
  //非初始化获取户号列表
  getDoorListAll() {
    getDoor().then(res => {
      if (res) {
        this.setData({
          dataList: res.data
        })
      }
    }).catch(err => {
      console.log(err)
    })
  },
  showToast(title, type) {
    wx.showToast({
      title: title,
      icon: type,
      duration: 1000,
      mask: true
    })
  },
  //删除户号
  deleteDoor(e) {
    let id = e.currentTarget.dataset.id
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确定删除当前户号吗',
      success: function (res) {
        if (res.confirm) {
          deleteDoorUser(id).then(res => {
            if (res.isok) {
              Utils.showToast(res.msg, 'success')
              _this.getDoorListAll()
            } else {
              Utils.showToast('删除失败', 'error')
              _this.getDoorListAll()
            }
          }).catch(err => {
            Utils.showToast('删除失败', 'error')
            _this.getDoorListAll()
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }

      }
    })
    _this.getDoorList();
  },
  updataDoor(e) {
    let type = e.currentTarget.dataset.type
    let id = e.currentTarget.dataset.id
    let url = '/my/pages/door/doorForm/index?type=' + type + '&id=' + id
    wx.navigateTo({
      url: url,
    })
  },
  //获取标签返回值
  tagClick(e) {
    let detail = e.detail
    let activeItem = this.data.activeItem;
    let data = {
      id: activeItem.id,
      address: activeItem.address,
      account: activeItem.account,
      tagId: detail.id || '',
      areaName: activeItem.areaName,
      latitude: activeItem.latitude,
      longitude: activeItem.longitude,
    }
    let _this = this
    _this.setData({
      maskTag: false
    })
    updataDoorUser(data).then(res => {
      if (res.isok) {
        Utils.showToast('添加标签成功', 'success')
        this.getDoorListAll()
      } else {
        Utils.showToast('添加标签失败', 'error')
        this.getDoorListAll()
      }
    }).catch(err => {
      Utils.showToast('添加标签失败', 'error')
      this.getDoorListAll()
    })
  },
  //如果户号无标签添加标签
  createTag(e) {
    let item = e.currentTarget.dataset.item
    this.setData({
      maskTag: true,
      activeItem: item
    })
  }
})