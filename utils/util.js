const app = getApp()
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}
//将秒数转化为时间
const formatDuringTime = during => {
  let date = new Date(during);
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  let d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  let h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  let minute = date.getMinutes();
  let second = date.getSeconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  return y + '-' + m + '-' + d + ' ' + ' ' + h + ':' + minute + ':' + second;
}
//存储方法封装
const setStorage = (key, data, callback) => {
  wx.setStorage({
    key: key,
    data: data,
    success() {
      console.log(callback,"这个callback是什么？？")
      if (callback) {
        callback()
      } else {
        wx.navigateBack({
          delta: 1
        })
      }
    },
    fail(res) {
      console.log(res)
    }
  })
}
const showToast = (title, type) => {
  wx.showToast({
    title: title,
    icon: type,
    duration: 1000,
    mask: true
  })
}
//保留当前页面跳转
const navigateTo = (url) => {
  wx.navigateTo({
    url: url
  })
}
const showLoading = (title,time) =>{
  wx.showLoading({
    title: '加载中',
    duration:time ? time : 0
  })
}
const hideLoading = () => {
  wx.hideLoading({
    success: (res) => {},
  })
}
//截取字符串最后几位
const getSubstring = (string) => {
  if (string.length > 4) {
    return (string.trim()).substring(string.length - 4, string.length)
  } else {
    return string
  }
}

module.exports = {
  showLoading,
  hideLoading,
  setStorage,
  showToast,
  formatTime,
  formatDuringTime,
  navigateTo,
  getSubstring
}