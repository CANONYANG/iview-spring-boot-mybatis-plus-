<style lang="less">
    @import './login.less';

</style>

<template>

    <div class="login fade" id="login" @keydown.enter="handleSubmit" ref="login" v-bind:class="[{imgUrl1:bg1},{imgUrl2:bg2},{imgUrl3:bg3},{imgUrl4:bg4}]">
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
                },
                bg1:false,
                bg2:false,
                bg3:false,
                bg4:false,
                i:0
            };
        },

        mounted: function () {
            this.bg1 = true;
        },

        methods: {

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

<style>

</style>
