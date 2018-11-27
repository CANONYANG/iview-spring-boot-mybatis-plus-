import request from '../request';
import requestUrl from '../requestUrl';
import requestParam from '../requestParam';
import isInteger from 'lodash/isInteger';

// 获取管理员列表
export function list(params) {
    return request({
        url: requestUrl('/sys/user/list'),
        method: 'get',
        params: requestParam(params, 'get')
    });
}

// 获取管理员信息
export function info(id) {
    return request({
        url: requestUrl('/sys/user/info' + (isInteger(id) ? `/${id}` : '')),
        method: 'get',
        params: requestParam({}, 'get')
    });
}

// 修改密码
export function updatePassword(params) {
    return request({
        url: requestUrl('/sys/user/updatePassword'),
        method: 'post',
        data: requestParam(params)
    });
}

// 添加管理员
export function add(params) {
    return request({
        url: requestUrl('/sys/user/save'),
        method: 'post',
        data: requestParam(params)
    });
}

// 修改管理员
export function update(params) {
    return request({
        url: requestUrl('/sys/user/update'),
        method: 'post',
        data: requestParam(params)
    });
}

// 删除管理员
export function del(params) {
    return request({
        url: requestUrl('/sys/user/delete'),
        method: 'post',
        data: requestParam(params, 'post', false)
    });
}
