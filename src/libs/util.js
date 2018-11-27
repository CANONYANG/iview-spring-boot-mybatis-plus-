import axios from 'axios';
import env from '../../build/env';
import {responseMsg} from '@/libs/message';

/**
 * 是否有权限
 * @param {*} key
 */
export function isAuth(key) {
    // return (localStorage.permissions ? JSON.parse(localStorage.permissions) : []).indexOf(key) !== -1;
    return true;
}
/**
 * 根据状态码获取信息
 * @param code
 * @returns {string}
 */
export function getMsg(code) {
    let msg = '未知的状态码';
    let len = responseMsg.length;
    for (let i = 0; i < len; i++) {
        if (responseMsg[i].code === code) {
            msg = responseMsg[i].msg;
            break;
        }
    }
    return msg;
}


let util = {};
util.title = function (title) {
    title = title || '后台管理平台';
    window.document.title = title;
};

const ajaxUrl = env === 'development'
    ? 'http://127.0.0.1:8083'
    : env === 'production'
        ? 'https://www.url.com'
        : 'https://debug.url.com';

util.ajax = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000
});

util.inOf = function (arr, targetArr) {
    let res = true;
    arr.forEach(item => {
        if (targetArr.indexOf(item) < 0) {
            res = false;
        }
    });
    return res;
};

util.oneOf = function (ele, targetArr) {
    if (targetArr.indexOf(ele) >= 0) {
        return true;
    } else {
        return false;
    }
};

util.showThisRoute = function (itAccess, currentAccess) {
    if (typeof itAccess === 'object' && Array.isArray(itAccess)) {
        return util.oneOf(currentAccess, itAccess);
    } else {
        return itAccess === currentAccess;
    }
};

util.getRouterObjByName = function (routers, name) {
    if (!name || !routers || !routers.length) {
        return null;
    }
    // debugger;
    let routerObj = null;
    for (let item of routers) {
        if (item.name === name) {
            return item;
        }
        routerObj = util.getRouterObjByName(item.children, name);
        if (routerObj) {
            return routerObj;
        }
    }
    return null;
};

util.handleTitle = function (vm, item) {
    if (typeof item.title === 'object') {
        return vm.$t(item.title.i18n);
    } else {
        return item.title;
    }
};

util.setCurrentPath = function (vm, name) {
    let title = '';
    let isOtherRouter = false;
    (localStorage.routers ? JSON.parse(localStorage.routers) : []).forEach(item => {
        if (item.children.length < 1) {
            if (item.name === name) {
                title = util.handleTitle(vm, item);
                if (item.name === 'otherRouter') {
                    isOtherRouter = true;
                }
            }
        } else {
            item.children.forEach(child => {
                if (child.name === name) {
                    title = util.handleTitle(vm, child);
                    if (item.name === 'otherRouter') {
                        isOtherRouter = true;
                    }
                }
            });
        }
    });
    let currentPathArr = [];
    if (name === 'home_index') {
        currentPathArr = [
            {
                title: util.handleTitle(vm, util.getRouterObjByName((localStorage.routers ? JSON.parse(localStorage.routers) : []), 'home_index')),
                path: '',
                name: 'home_index'
            }
        ];
    } else if ((name.indexOf('_index') >= 0 || isOtherRouter) && name !== 'home_index') {
        util.getRouterObjByName((localStorage.routers ? JSON.parse(localStorage.routers) : []), name);
        currentPathArr = [
            {
                title: util.handleTitle(vm, util.getRouterObjByName((localStorage.routers ? JSON.parse(localStorage.routers) : []), name)),
                path: '/home',
                name: 'home_index'
            },
            {
                title: title,
                path: '',
                name: name
            }
        ];
    } else {
        let currentPathObj = (localStorage.routers ? JSON.parse(localStorage.routers) : []).filter(item => {
            if (item.children.length < 1) {
                return item.name === name;
            } else {
                let i = 0;
                let childArr = item.children;
                let len = childArr.length;
                while (i < len) {
                    if (childArr[i].name === name) {
                        return true;
                    }
                    i++;
                }
                return false;
            }
        })[0];
        if (currentPathObj.children.length <= 1 && currentPathObj.name === 'home') {
            currentPathArr = [
                {
                    title: '首页',
                    path: '',
                    name: 'home_index'
                }
            ];
        } else if (currentPathObj.children.length <= 1 && currentPathObj.name !== 'home') {
            currentPathArr = [
                {
                    title: '首页',
                    path: '/home',
                    name: 'home_index'
                },
                {
                    title: currentPathObj.title,
                    path: '',
                    name: name
                }
            ];
        } else {
            let childObj = currentPathObj.children.filter((child) => {
                return child.name === name;
            })[0];
            currentPathArr = [
                {
                    title: '首页',
                    path: '/home',
                    name: 'home_index'
                },
                {
                    title: currentPathObj.title,
                    path: '',
                    name: currentPathObj.name
                },
                {
                    title: childObj.title,
                    path: currentPathObj.path + '/' + childObj.path,
                    name: name
                }
            ];
        }
    }
    vm.$store.commit('setCurrentPath', currentPathArr);

    return currentPathArr;
};

util.openNewPage = function (vm, name, argu, query) {
    let pageOpenedList = vm.$store.state.app.pageOpenedList;
    let openedPageLen = pageOpenedList.length;
    let i = 0;
    let tagHasOpened = false;
    while (i < openedPageLen) {
        if (name === pageOpenedList[i].name) { // 页面已经打开
            vm.$store.commit('pageOpenedList', {
                index: i,
                argu: argu,
                query: query
            });
            tagHasOpened = true;
            break;
        }
        i++;
    }
    if (!tagHasOpened) {
        let tag = (localStorage.tagsList ? JSON.parse(localStorage.tagsList) : []).filter((item) => {
            return name === item.name;
        });
        tag = tag[0];
        if (tag) {
            // tag = tag.children ? tag.children[0] : tag;
            if (argu) {
                tag.argu = argu;
            }
            if (query) {
                tag.query = query;
            }
            vm.$store.commit('increateTag', tag);
        }
    }
    vm.$store.commit('setCurrentPageName', name);
};

util.toDefaultPage = function (routers, name, route, next) {
    let len = routers.length;
    let i = 0;
    let notHandle = true;
    while (i < len) {
        if (routers[i].name === name && routers[i].children && routers[i].redirect === undefined) {
            route.replace({
                name: routers[i].children[0].name
            });
            notHandle = false;
            next();
            break;
        }
        i++;
    }
    if (notHandle) {
        next();
    }
};

util.fullscreenEvent = function (vm) {
    vm.$store.commit('initCachepage');
    // 权限菜单过滤相关
    vm.$store.commit('updateMenulist');
};

/**
 * 权限数据转换
 * @param {*} data
 * @param {*} id
 * @param {*} pid
 */
export function treeDataTranslate(data, menuIdList, id = 'id', pid = 'parentId') {
    let res = [];
    let temp = {};
    let parentIds = [];
    for (let i = 0; i < data.length; i++) {
        parentIds.push(data[i].parentId);
    }
    for (let i = 0; i < data.length; i++) {
        if (parentIds.indexOf(data[i].pkId) === -1) {
            for (let j = 0; j < menuIdList.length; j++) {
                if (data[i].pkId === menuIdList[j]) {
                    data[i].checked = true;
                    break;
                }
            }
        }
        data[i].children = [];
        data[i].parentName = null;
        temp[data[i][id]] = data[i];
    }
    for (let k = 0; k < data.length; k++) {
        if (temp[data[k][pid]] && data[k][id] !== data[k][pid]) {
            if (!temp[data[k][pid]]['children']) {
                temp[data[k][pid]]['children'] = [];
            }
            if (!temp[data[k][pid]]['_level']) {
                temp[data[k][pid]]['_level'] = 1;
                temp[data[k][pid]]['expand'] = true;
            }
            data[k]['_level'] = temp[data[k][pid]]._level + 1;
            temp[data[k][pid]]['children'].push(data[k]);
        } else {
            res.push(data[k]);
        }
    }
    return res;
}

export function unique(array) {
    let n = {}, r = [], len = array.length, val, type;
    for (let i = 0; i < len; i++) {
        val = array[i];
        type = typeof val;
        if (!n[val]) {
            n[val] = [type];
            r.push(val);
        } else if (n[val].indexOf(type) < 0) {
            n[val].push(type);
            r.push(val);
        }
    }
    for (let i = 0; i < r.length; i++) {
        if (typeof r[i] === 'undefined') {
            r.splice(i, 1);
            break;
        }
    }
    return r;
}
export default util;
