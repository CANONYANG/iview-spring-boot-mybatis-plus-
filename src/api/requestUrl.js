/**
 * 请求地址统一处理／组装
 * @param {*} actionName action方法名称
 */
export default function (actionName) {
    // 非生产环境 && 开启代理, 接口前缀统一使用[/api/]前缀做代理拦截!
    // return ('http://58.87.125.242/api') + actionName;
    // return ('http://c.tokenup100.com/api') + actionName;
    return ('/api') + actionName;
}
