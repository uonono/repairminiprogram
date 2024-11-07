// component/audio/audio.js
const plugin = requirePlugin("WechatSI")
const recorderManager = plugin.getRecordRecognitionManager()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    maskShow: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    vueTouches: {}, //滑动距离
    isShowMask: false, //录音图标,
    hasStart:false, //是否在录音
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindTouchStart: function (e) {
      console.log('刚点击')
    },
    bindTouchmove(e) {
      console.log('鼠标移动')
    },
    bindTouchEnd: function (e) {
      let _this = this
      if(_this.data.hasStart){
      recorderManager.stop()
      }
      _this.setData({
        isShowMask: false,
        maskShow:false
      })

    },
    bingLongTap: function (e) {
      let _this = this
      recorderManager.onStart = function (res) {
        if (res.msg == 'Ok') {
          _this.setData({
            isShowMask: true,
            hasStart:true
          })
        }
      }
      recorderManager.onStop = function (res) {
        _this.setData({
          maskShow: false,
          hasStart:false
        })
        console.log("result停止", res)
        if (res.result == '') {
          _this.triggerEvent('getVideo')
          return;
        } else {
          _this.triggerEvent('getVideo', res.result)
        }
      }
      // recorderManager.onRecognize = function (res) {
      //   console.log("current result识别中", res)
      // }
      recorderManager.onError = function (res) {
        console.error("error msg", res.msg)
      }
      recorderManager.start({
        duration: 30000,
        lang: "zh_CN"
      })
      console.log("长按");
    },
    //触摸被打断
    touchCancel(e) {
      let _this = this
      recorderManager.stop()
      _this.setData({
        isShowMask: false
      })
    },
    closeMask() {
      this.triggerEvent('closeMask')
    },

  }
})