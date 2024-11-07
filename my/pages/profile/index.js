// pages/my/profile/index.js
import Toast from '@vant/weapp/toast/toast';
import Utils from '../../../utils/util'
import {
  updataUser,
  getUser
} from '../../../utils/api/user'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    phone: '',
    avatar: ''
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
  //初始化获取信息
  getUser() {
    Utils.showLoading()
    let _this = this;
    getUser().then(res => {
      if (res.isok) {
        _this.setData({
          name: res.data.nickname,
          phone: res.data.phone,
          avatar: res.data.headimgurl
        })
      }
      Utils.hideLoading()
    }).catch(err => {
      Utils.hideLoading()
      console.log(err)
    })
  },
  //修改信息
  cancelForm() {
 
    let data = {
      headimgurl: this.data.avatar,
      nickname: this.data.name,
      phone: this.data.phone
    }
    if (!(/^1[34578]\d{9}$/.test(data.phone))) {
      Utils.showToast('手机格式有误','error')
      return
    }
    updataUser(data).then(res => {
      if (res.isok) {
        Toast.success('保存成功');
      } else {
        Toast.error('保存失败');
      }
    }).catch(err => {
      console.log(err)
    })
  },
  cellClick(e) {
    let index = e.currentTarget.dataset.pickerindex
    console.log(index)
    switch (index) {
      case "0":
        this.chooseImages()
        break
    }

  },
  chooseImages() {
    console.log('a')
    let _this = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res)
        _this.setData({
          avatar: res.tempFilePaths[0]
        })
        //上传操作
        wx.uploadFile({
          url: 'https://example.weixin.qq.com/upload',
          filePath: res.tempFilePaths[0],
          name: 'file',
          formData: {
            user: 'test'
          },
          success(res) {
            _this.setData({
              avatar: res.tempFilePaths[0]
            })
          },
          fail(res) {
            Toast.fail('上传头像失败');
          }
        });
      }
    })
  },
  ChangeInput(e) {
    console.log(e)
    let type = e.currentTarget.dataset.type;
    if (type == 'name') {
      this.setData({
        name: e.detail
      })
    } else if (type == 'phone') {
      this.setData({
        phone: e.detail
      })
    }
  }
})