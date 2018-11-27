import request from '../request';
import requestUrl from '../requestUrl';
import requestParam from '../requestParam';

// // 获取验证码
// export function captcha (uuid) {
//   return requestUrl(`/captcha.jpg?uuid=${uuid}`);
// }

// 登录
export function login(params) {
    return request({
        url: requestUrl('/sys/user/login'),
        method: 'post',
        data: requestParam(params,'post',true,'json')
    });
}

// 退出
export function logout() {
    return request({
        url: requestUrl('/sys/user/logout'),
        method: 'post',
        data: requestParam()
    });
}

// 解锁
export function unlock(params) {
    return request({
        url: requestUrl('/sys/user/unlock'),
        method: 'post',
        data: requestParam(params,'post',true,'json')
    });
}
