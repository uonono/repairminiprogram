import {
  request
} from '../request'
//户号列表查询
export function getDoor() {
  return request({
    url: '/bx/wxUserAccount/list',
    method: 'get'
  })
}
//历史报修地址列表
export function gethistoryAddress() {
  return request({
    url: '/bx/order/addressHistory/list',
    method: 'get',
  })
}
//工单保存接口
export function orderSave(data) {
  return request({
    url: '/bx/faultOrder/save',
    method: 'post',
    data
  })
}
//查询已报修工单列表
export function getOrder(data) {
  return request({
    url: '/bx/faultOrder/list',
    method: 'post',
    data
  })
}
// 取消工单接口
export function cancelOrder(id) {
  return request({
    url: `/bx/faultOrder/cancel/${id}`,
    method: 'post'
  })
}
//工单详情查询接口
export function getOrderId(id) {
  return request({
    url: `/bx/faultOrder/get/${id}`,
    method: 'get'
  })
}
//保存评价接口
export function getOrderEvaluation(data) {
  return request({
    url: '/bx/order/evaluate/create',
    method: 'post',
    data
  })
}
//抢修人地图轨迹接口
export function workerLocation(id) {
  return request({
    url: `/bx/faultOrder/worker/location/${id}`,
    method: 'get'
  })
}
//评价查询接口
export function getOrderEvaluationDetail(id) {
  return request({
    url: `/bx/order/evaluate/get/item/${id}`,
    method: 'get'
  })
}