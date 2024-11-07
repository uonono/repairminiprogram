// component/tag/tag.js
import {
  TagUserList,
  addTagUser,
  deleteTagUser,
  updateTagUser
} from '../../utils/api/user'
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    maskTag: {
      type: Boolean,
      value: false
    }
  },
  lifetimes: {
    attached: function () {
      this.getInit()
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    tagValue: "",
    showIndex: {

    },
    tagItem: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //获取列表
    getInit() {
      TagUserList().then(res => {
        console.log(res)
        if (res.isok) {
          this.setData({
            showIndex: res.data[0],
            tagItem: res.data
          })
        }
      }).catch(err => {
        console.log(err)
      })
    },
    closeTag() {
      this.setData({
        maskTag: false
      })
    },
    clickTag(e) {
      let item = e.currentTarget.dataset.item
      this.setData({
        showIndex: item
      })
    },
    inputChange(e) {
      this.setData({
        tagValue: e.detail.value
      })
    },
    //点击确认
    confirm() {
      this.triggerEvent('tagData', this.data.showIndex)
    },
    //添加
    addTag() {
      let value = this.data.tagValue;
      if (value == '') {
        wx.showToast({
          title: '标签名不能为空',
          icon: 'error',
          duration: 2000,
          mask: true
        })
        return
      }
      let data = {
        tagName: value
      }
      addTagUser(data).then(res => {
        if (res.isok) {
          wx.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 2000,
            mask: true
          })
          this.setData({
            tagValue: ''
          })
          this.getInit()
        } else {
          wx.showToast({
            title: '添加失败',
            icon: 'error',
            duration: 2000,
            mask: true
          })
        }
      }).catch(err => {
        wx.showToast({
          title: '添加失败',
          icon: 'error',
          duration: 2000,
          mask: true
        })
        console.log(err)
      })

    },
    //删除
    deteleTag(e) {
      let id = e.currentTarget.dataset.id;
      console.log(id)
      deleteTagUser(id).then(res => {
        console.log(res)
        if (res.isok) {
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000,
            mask: true
          })
          this.getInit()
        }
      }).catch(err => {
        wx.showToast({
          title: '删除失败',
          icon: 'error',
          duration: 2000,
          mask: true
        })
        console.log(err)
      })
    }
  }
})