// component/map.js
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min');
var qqmapsdk;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //地图中心点
    mapConfig: {
      type: Object,
      value: {}
    },
    //平移
    translate: {
      type: Object,
      value: {}
    },
    //地图点
    markers: {
      type: Array,
      value: []
    },
    //地图id
    mapId: {
      type: String,
      value: 'map'
    },
    showLocation: {
      type: Boolean,
      value: false
    },
    domHeight: {
      type: Number,
      value: 0
    },
    maxHeight: {
      type: Number,
      value: 100
    },
    polyline: {
      type: Array,
      value: []
    },
    hasCenter: {
      type: Boolean,
      value: false
    },
    scale: {
      type: Number,
      value: 15
    },
    historyLine: {
      type: Array,
      value: []
    }

  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  // 监听坐标点数组
  observers: {
    'markers'(val) {
      this.initMap()
      this.setPolyline()
    },
    'historyLine'(val) {
      this.setPolyline()
    },
    'domHeight'(val) {
      this.setCenter()
    },
    'translate'(val) {
      this.translateMarkers()
    },
  },
  lifetimes: {
    attached: function () {
      qqmapsdk = new QQMapWX({
        //腾讯位置服务：   https://lbs.qq.com/console/mykey.html
        key: 'ORXBZ-N32HX-ROV4B-7NIWS-JYYWE-ESBJA' //这里自己的key秘钥进行填充，该key是腾讯位置服务中申请的
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getMapCtx() {
      if (this.mapCtx) {
        return this.mapCtx
      }
      // 创建 map 上下文 MapContext 对象
      this.mapCtx = wx.createMapContext('map', this)
      return this.mapCtx
    },
    bindClick() {
      this.setData({
        hasCenter: true
      })
    },
    //点击标记点触发
    onBindmarkertap(e) {
      this.zoomTap()
      this.triggerEvent('myevent', e)
    },
    bindTouchEnd() {
      //  this.setCenter()
      let _this = this
      if (_this.data.hasCenter) {
        this.getMapCtx().getCenterLocation({
          success(res) {
            let tranalateArr = {
              latitude: res.latitude,
              longitude: res.longitude
            }
            _this.setData({
              translate: tranalateArr
            })
            _this.triggerEvent('getCenter', tranalateArr)
          }
        })
      }


    },
    // 初始化地图
    initMap() {
      const {
        tapMarker
      } = this.data
      this.zoomTap()
      // this.resetMarkers(tapMarker, true)
    },
    //动态调整中心点
    setCenter() {
      if (this.data.domHeight > 400) {
        this.getMapCtx().setCenterOffset({
          offset: [0.5, 0.25],
          success(res) {},
          fail(res) {
            console.log(res)
          },
        })
      }
    },
    //获取坐标点的路径绘制路线
    setPolyline(type) {
      let _this = this
      const {
        markers,
        historyLine
      } = _this.data
      if (markers.length > 2) {
        let arr = []
        markers.map((item, index) => {
          //获取两个marker坐标进行路线规划
          arr.push({
            latitude: item.latitude,
            longitude: item.longitude
          })
          // 直接根据数组绘制直线
          if (historyLine && historyLine.length > 0) {
            let polyLineArr = []
            console.log(historyLine, '1231564')
            for (let i = 0; i < historyLine.length - 1; i++) {
              let line = {
                points: [historyLine[i], historyLine[i + 1]],
                color: "#518FF8",
                width: 4,
                dottedLine: false
              }
              polyLineArr.push(
                line
              )
            }
            _this.setData({
              polyline: polyLineArr
            })
          }
          // 绘制维修工起点到终点路线
          // qqmapsdk.direction({
          //   mode: type ? type : 'driving',
          //   from: arr[2],
          //   to: arr[1],
          //   success(res) {
          //     let pl = []
          //     if (res.result.routes) {
          //       let polyline = res.result.routes[0].polyline
          //       for (let i = 2; i < polyline.length; i++) {
          //         polyline[i] = polyline[i - 2] + polyline[i] / 1000000
          //       }
          //       for (let i = 0; i < polyline.length; i += 2) {
          //         pl.push({
          //           latitude: polyline[i],
          //           longitude: polyline[i + 1]
          //         })
          //       }
          //       _this.setData({
          //         polyline: [{
          //           points: pl,
          //           color: "#518FF8",
          //           width: 4,
          //           dottedLine: false,
          //             level:'aboveroads'    
          //         }]
          //       })
          //     }
          //   },
          //   fail(res) {}
          // })

          // qqmapsdk.direction({
          //   mode: type ? type : 'driving',
          //   from: arr[0],
          //   to: arr[1],
          //   success(res) {
          //     let pl = []
          //     if (res.result.routes) {
          //       let polyline = res.result.routes[0].polyline
          //       for (let i = 2; i < polyline.length; i++) {
          //         polyline[i] = polyline[i - 2] + polyline[i] / 1000000
          //       }
          //       for (let i = 0; i < polyline.length; i += 2) {
          //         pl.push({
          //           latitude: polyline[i],
          //           longitude: polyline[i + 1]
          //         })
          //       }
          //       if (historyLine && historyLine.length > 0) {
          //         _this.setData({
          //           polyline: [{
          //             points: pl,
          //             color: "#518FF8",
          //             width: 4,
          //             dottedLine: false
          //           }, {
          //             points: historyLine,
          //             color: "#228B22",
          //             width: 4,
          //             dottedLine: false
          //           }]
          //         })
          //       } else {
          //         _this.setData({
          //           polyline: [{
          //             points: pl,
          //             color: "#518FF8",
          //             width: 4,
          //             dottedLine: false
          //           }]
          //         })
          //       }

          //     }
          //   },
          //   fail(res) {}
          // })
          // console.log(arr)

        })
      }
    },

    //平移marker
    translateMarkers() {
      let _this = this
      const {
        markers
      } = _this.data
      if (markers && markers.length > 0) {
        this.getMapCtx().translateMarker({
          markerId: markers[0].id,
          destination: _this.data.translate,
          duration: 100,
          success(res) {
            console.log(res)
          },
          fail(res) {
            console.log(res)
          }
        })
      }
    },
    // 处理父组件传进来的数据
    resetMarkers(tapMarker, initFlag = false) {
      const {
        markers
      } = this.data
      const newList = markers.map((item) => {
        let obj = {
          ...item,
          width: 28, // 标注图标宽度
          height: 28, // 标注图标高度
          // 显示的图标，项目目录下的图片路径，支持网络路径、本地路径、代码包路径
          // 在这里先设置一个气泡背景色和字体色，可以避免点击坐标点显示气泡弹窗时的闪现变色
          callout: {
            color: '#fff', // 气泡文本的颜色
            bgColor: '#ff7732' // 气泡背景色
          }
        }
        // 坐标点上方的气泡窗口，点击哪个坐标点就让哪个标记点显示气泡弹窗
        // 同时隐藏其他坐标点的气泡弹窗
        if (!!tapMarker && tapMarker.id === item.id) {
          obj.zIndex = 9, // 显示层级，解决点击的坐标点被其他坐标点压住的问题
            obj.callout = {
              content: item.title, // 气泡文本
              color: '#fff', // 气泡文本的颜色
              fontSize: 12, // 气泡文本字体大小
              borderRadius: 5, // 气泡边框圆角
              bgColor: '#ff7732', // 气泡背景色
              padding: 8, // 气泡文本边缘留白
              textAlign: 'left', // 气泡文本对齐方式，有效值: left, right, center
              display: "ALWAYS", // 'BYCLICK':点击显示; 'ALWAYS':常显
              anchorX: 0, // 横向偏移量，向右为正数
              anchorY: 2 // 纵向偏移量，向下为正数
            }
        }
        return obj
      })
      // 第一次初始化地图时执行以下代码，点击坐标点时不执行此代码
      if (initFlag) {
        // 如果初始化地图时有数据传入，则展示所有经纬度坐标点，否则将地图中心移置当前定位坐标点
        if (newList.length > 0) {
          const box = this.getBox(newList)
          // includePoints() 缩放视野展示所有经纬度
          this.getMapCtx().includePoints({
            // 坐标点形成的矩形边缘到地图边缘的距离，单位像素。
            // 格式为[上,右,下,左]，安卓上只能识别数组第一项，上下左右的padding一致。
            // 开发者工具暂不支持padding参数
            // 防止坐标点溢出
            padding: [40, 40, 40, 40],
            // 要显示在可视区域内的坐标点列表，必填须
            points: [{
                latitude: box.top,
                longitude: box.left
              },
              {
                latitude: box.bottom,
                longitude: box.right
              }
            ],
            success: function (res) {
              // console.log(res)
            }
          })
        } else {
          // moveToLocation() 将地图中心移置当前定位坐标点
          this.getMapCtx().moveToLocation(this.data.mapConfig.longitude)
        }
      }
      this.setData({
        markers: newList,
        tapMarker: tapMarker
      })
    },
    // 获取所有坐标点的最大经纬度范围
    getBox(markers) {
      let left = null
      let right = null
      let top = null
      let bottom = null
      markers.forEach((item) => {
        if (!item.longitude || !item.latitude) {
          return
        }
        if (!left) {
          left = item.longitude
        }
        if (!right) {
          right = item.longitude
        }
        if (!top) {
          top = item.latitude
        }
        if (!bottom) {
          bottom = item.latitude
        }
        left = Math.min(left, item.longitude)
        right = Math.max(right, item.longitude)
        top = Math.max(top, item.latitude)
        bottom = Math.min(bottom, item.latitude)
      })
      return {
        left,
        right,
        top,
        bottom
      }
    },
    // 点击定位到初始中心坐标位置 显示所有marker
    zoomTap(e) {
      const {
        markers
      } = this.data
      if (markers.length > 0) {
        const box = this.getBox(markers)
        // includePoints() 缩放视野展示所有经纬度
        this.getMapCtx().includePoints({
          // 坐标点形成的矩形边缘到地图边缘的距离，单位像素。
          // 格式为[上,右,下,左]，安卓上只能识别数组第一项，上下左右的padding一致。
          // 开发者工具暂不支持padding参数
          // 防止坐标点溢出
          padding: [40, 40, 40, 40],
          // 要显示在可视区域内的坐标点列表，必填须
          points: [{
              latitude: box.top,
              longitude: box.left
            },
            {
              latitude: box.bottom,
              longitude: box.right
            }
          ],
          success: function (res) {},
          fail(res) {
            console.log('调用失败', res)
          }
        })
      } else {
        // moveToLocation() 将地图中心移置当前定位点
        if (this.data.mapConfig.longitude) {
          // setTimeout(() => {
          //   this.getMapCtx().moveToLocation(this.data.mapConfig.longitude)
          // },5000)
        }
      }
    },
    // 点击坐标点时触发，e.detail = {markerId}
    markerTap(e) {
      const that = this
      const {
        tapMarker,
        markers
      } = this.data
      const markerId = e.detail.markerId
      const marker = markers.find((item) => item.id === markerId)
      if (!marker) {
        return
      }
      // 首次点击显示气泡弹窗，二次点击触发自定义点击事件
      if (tapMarker && tapMarker.id === marker.id) {
        this.triggerEvent('markerTap', tapMarker)
        return
      }
      // getRegion() 获取当前地图的视野范围
      this.getMapCtx().getRegion({
        success: function (res) {
          that.resetMarkers(marker) // 调用地图初始化方法，点击坐标点时显示气泡弹窗
        }
      })
    }
  }
})