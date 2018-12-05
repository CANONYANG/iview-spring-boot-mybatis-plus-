<style lang="less">
    @import './login.less';

</style>

<template>

    <div class="login" id="login" @keydown.enter="handleSubmit" ref="login">
        <div class="login-con">
            <Card :bordered="false">
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    后台管理平台
                </p>
                <div class="form-con">
                    <Form ref="loginForm" :model="form" :rules="rules">
                        <FormItem prop="userName">
                            <Input v-model="form.userName" placeholder="请输入用户名">
                            <span slot="prepend">
                                    <Icon :size="16" type="person"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="password">
                            <Input type="password" v-model="form.password" placeholder="请输入密码">
                            <span slot="prepend">
                                    <Icon :size="14" type="locked"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem>
                            <Button @click="handleSubmit" type="primary" long>登录</Button>
                        </FormItem>
                    </Form>
                    <p class="login-tip"></p>

                </div>
            </Card>
        </div>
    </div>

</template>

<script>
    import API from '@/api';
    import '../libs/jquery-2.1.0'
    import '../libs/supersized.3.2.7.min'

    export default {
        data() {

            return {
                form: {
                    userName: '',
                    password: ''
                },
                rules: {
                    userName: [
                        {required: true, message: '账号不能为空', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '密码不能为空', trigger: 'blur'}
                    ]
                }
            };
        },

        mounted: function () {
            this.init();
        },

        methods: {

            init(){
                $.supersized({

                    // Functionality
                    slide_interval     : 4000,    // Length between transitions
                    transition         : 1,    // 0-None, 1-Fade, 2-Slide Top, 3-Slide Right, 4-Slide Bottom, 5-Slide Left, 6-Carousel Right, 7-Carousel Left
                    transition_speed   : 1000,    // Speed of transition
                    performance        : 1,    // 0-Normal, 1-Hybrid speed/quality, 2-Optimizes image quality, 3-Optimizes transition speed // (Only works for Firefox/IE, not Webkit)

                    // Size & Position
                    min_width          : 0,    // Min width allowed (in pixels)
                    min_height         : 0,    // Min height allowed (in pixels)
                    vertical_center    : 1,    // Vertically center background
                    horizontal_center  : 1,    // Horizontally center background
                    fit_always         : 0,    // Image will never exceed browser width or height (Ignores min. dimensions)
                    fit_portrait       : 1,    // Portrait images will not exceed browser height
                    fit_landscape      : 0,    // Landscape images will not exceed browser width

                    // Components
                    slide_links        : 'blank',    // Individual links for each slide (Options: false, 'num', 'name', 'blank')
                    slides             : [    // Slideshow Images
                        {image : 'src/images/1.jpg'},
                        {image : 'src/images/2.jpg'},
                        {image : 'src/images/3.jpg'},
                        {image : 'src/images/4.jpg'}
                    ]

                });
            },
            handleSubmit() {
                this.$refs.loginForm.validate((valid) => {
                    if (valid) {
                        var params = {
                            'username': this.form.userName,
                            'password': this.form.password
                        }
                        API.common.login(params).then(({data}) => {
                            if (data.errCode === 0) {
                                data.expire = 5000; //假设
                                this.$cookie.set('token', data.data.token, {expires: `${data.expire || 0}s`});
                                this.$cookie.set('username', data.data.username, {expires: `${data.expire || 0}s`});
                                this.$store.commit('setAvator', 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3448484253,3685836170&fm=27&gp=0.jpg');
                                // 显示打开的页面的列表
                                this.$store.commit('setOpenedList');
                                this.$store.commit('initCachepage');
                                // 权限菜单过滤相关
                                this.$store.commit('updateMenulist', data.expire);
                                var timer = setInterval(() =>{
                                    if(typeof localStorage.permissions !== 'undefined'){
                                        clearInterval(timer);
                                        this.$router.push({
                                            name: 'home_index'
                                        });
                                    }
                                }, 200);
                            } else {
                                this.$Message.error(data.errMsg);
                            }
                        }).catch((data) => {
                            this.$Message.error('连接失败，请检查网络！');
                        });
                    }
                });
            }
        }
    };
</script>
