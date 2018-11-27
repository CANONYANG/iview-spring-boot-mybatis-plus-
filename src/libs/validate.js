export const valideMoblie = (rule, value, callback) => {
    var reg = 11 && /^((13|14|15|17|18)[0-9]{1}\d{8})$/;
    if (value === '') {
        callback(new Error('请输入手机号码'));
    } else if (!reg.test(value)) {
        callback(new Error('手机格式不正确'));
    } else {
        callback();
    }
};

export const valideEmail = (rule, value, callback) => {
    var regEmail = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
    if (value === '') {
        callback(new Error('请输入邮箱'));
    } else if (!regEmail.test(value)) {
        callback(new Error('邮箱格式不正确'));
    } else {
        callback();
    }
};