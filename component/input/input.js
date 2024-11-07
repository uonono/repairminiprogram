// component/inputKey/inputKey.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    inputName: {
      type: String,
      value: 'name'
    },
    inputValue: {
      type: String,
      value: ''
    },
    inputPlaceholder:{
      type:String,
      value:''
    },
    type:{
      type:String,
      value:'input'
    },
    inputType:{
      type:String,
      value:'text'
    },
    positioning:{
      type:Boolean,
      value:false
    },
    disable:{
      type:Boolean,
      value:false
    },
    maxLength:{
      type:String,
      value:'100'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    inputHeight: 0,
    fixedInput:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindinput(e) {
      this.setData({
        inputValue: e.detail.value
      })
      this.triggerEvent('inputs', e.detail)
    },
    focus(e) {
      let inputHeight = e.detail.height
      console.log(e)
      this.setData({
        inputHeight: inputHeight, //获取输入键盘高度
        fixedInput:true
      })
    },
    blur(e) {
      this.setData({
        fixedInput:false,
        inputHeight: 0,
      })
      this.triggerEvent('onblur');
    }
  },
  catchKey(){
    wx.hideKeyboard()
  }
})