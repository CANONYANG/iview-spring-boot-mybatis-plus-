import Vue from 'vue';
import iView from 'iview';
import {router} from './router/index';
import store from './store';
import App from './app.vue';
import VueCookie from 'vue-cookie';
import { isAuth } from '@/libs/util';
import '@/locale';
import 'iview/dist/styles/iview.css';
import VueI18n from 'vue-i18n';
import echarts from 'echarts'
Vue.use(VueI18n);
Vue.use(iView);
Vue.use(VueCookie);
Vue.prototype.isAuth = isAuth;
Vue.prototype.$echarts = echarts;
new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => h(App),
    data: {
        currentPageName: ''
    },
    mounted () {
        this.currentPageName = this.$route.name;
    },
    created () {
        let tagsList = [{
            title: '首页',
            path: '',
            name: 'home_index'
        }];
        this.$store.commit('setTagsList', tagsList);
    }
});
