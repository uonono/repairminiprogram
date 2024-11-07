import {
  request
} from '../request'

//  登录接口
export function loginUser(data) {
  return request({
    url: '/bx/authLogin',
    method: 'post',
    data
  }, false)
}
//刷新token接口
export function refreshToken(token) {
  return request({
    url: '/bx/wxUser/refreshAccessToken?refreshToken=' + token,
    method: 'post'
  }, false)
}
// 用户信息获取接口
export function getUser() {
  return request({
    url: '/bx/wxUser/currentUser',
    method: 'get'
  })
}
//户号列表查询
export function getDoor() {
  return request({
    url: '/bx/wxUserAccount/list',
    method: 'get'
  })
}
//户号列表详情
export function getDoorDeatil(id) {
  return request({
    url:  `/bx/wxUserAccount/get/${id}`,
    method: 'get'
  })
}
// 用户信息修改
export function updataUser(data) {
  return request({
    url: '/bx/wxUser/updateWxUser',
    method: 'post',
    data
  }) 
}

//用户户号新增
export function addDoorUser(data) {
  return request({
    url: '/bx/wxUserAccount/create',
    method: 'post',
    data
  })
}

//用户户号编辑
export function updataDoorUser(data) {
  return request({
    url: '/bx/wxUserAccount/update',
    method: 'post',
    data
  })
}

//用户户号删除
export function deleteDoorUser(id) {
  return request({
    url: `/bx/wxUserAccount/delete/${id}`,
    method: 'post'
  })
}
//用户标签新增
export function addTagUser(data) {
  return request({
    url: '/bx/wxUser/tag/create',
    method: 'post',
    data
  })
}
//用户标签编辑
export function updateTagUser(data) {
  return request({
    url: '/bx/wxUser/tag/update',
    method: 'post',
    data
  })
}
//用户标签删除 
export function deleteTagUser(id) {
  return request({
    url: `/bx/wxUser/tag/remove/${id}`,
    method: 'post'
  })
}

//用户标签列表
export function TagUserList(query) {
  return request({
    url: `/bx/wxUser/tag/list`,
    method: 'post',
    query
  })
}