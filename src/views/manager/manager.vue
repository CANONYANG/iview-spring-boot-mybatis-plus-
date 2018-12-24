<template>
    <div>
        <Row style="margin-bottom: 10px;">
            <div style="float: left" v-if="isAuth('sys:manager:save')">
                <span @click="showManagerEditModal()" style="margin: 0 10px;"><Button type="primary"
                                                                                      icon="plus">新增管理员</Button></span>
            </div>
            <div style="float: right">
                <Input v-model="keywords" placeholder="请输入管理员手机号" style="width: 200px"/>
                <span @click="init" style="margin: 0 10px;"><Button type="primary" icon="search">搜索</Button></span>
                <span @click="batchDel" v-if="isAuth('sys:manager:delete')" style="margin: 0"><Button type="error"
                                                                                                      icon="trash-a">批量删除</Button></span>
                <span @click="init"><Icon type="refresh" style="font-size: 20px;position: relative;top: 4px;margin-left: 5px;"></Icon></span>
            </div>
        </Row>
        <Row>
            <Table border ref="selection" :columns="columns" :data="tableData" :highlight-row="true"
                   :current="pageIndex" @on-selection-change="selectionChange" :loading="loading"></Table>
        </Row>
        <Row style="margin-top: 10px;float: right;">
            <Page :total="totalCount" show-total :page-sise="pageSize" loading show-sizer @on-change="pageChange"
                  @on-page-size-change="sizeChange"></Page>
        </Row>
        <Modal v-model="editManagerModal" :closable='true' :mask-closable=false :width="500"
               @on-visible-change="resetData">
            <h3 slot="header" style="color:#2D8CF0">{{!editManagerForm.pkId?'添加管理员':'修改管理员'}}</h3>
            <Form ref="editManagerForm" :model="editManagerForm" :label-width="100" label-position="right"
                  :rules="managerValidate" @submit.native.prevent="saveEditManager">
                <FormItem v-if="!editManagerForm.pkId" label="账号" prop="username">
                    <Input v-model="editManagerForm.username" placeholder="请输入管理员账号"></Input>
                </FormItem>
                <FormItem label="密码" prop="password">
                    <Input v-model="editManagerForm.password" type="password" placeholder="请输入管理员密码"></Input>
                </FormItem>
                <FormItem label="确认密码" prop="rePassword">
                    <Input v-model="editManagerForm.rePassword" type="password" placeholder="请确认管理员密码"></Input>
                </FormItem>
                <!--<FormItem label="邮箱" prop="email">-->
                <!--<Input v-model="editManagerForm.email" placeholder="请输入管理员邮箱"></Input>-->
                <!--</FormItem>-->
                <FormItem label="手机号" prop="mobile">
                    <Input v-model="editManagerForm.mobile" placeholder="请输入管理员手机号"></Input>
                </FormItem>
                <FormItem label="状态" prop="status">
                    <RadioGroup v-model="editManagerForm.status">
                        <Radio :label="0">启用</Radio>
                        <Radio :label="1">禁用</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="角色" prop="roleIdList">
                    <!--<CheckboxGroup v-model="editManagerForm.roleIdList">-->
                    <!--<Checkbox v-for="(role,index) in roleList" :label="role.pkId" :key="index">-->
                    <!--{{role.roleName}}-->
                    <!--</Checkbox>-->
                    <!--</CheckboxGroup>-->
                    <RadioGroup v-model="editManagerForm.roleId" prop="role.pkId">
                        <Radio v-for="role in roleList" :label="role.pkId" :key="role.pkId">{{role.roleName}}</Radio>
                    </RadioGroup>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="cancelEditManager">取消</Button>
                <Button type="primary" :loading="saveLoading" @click="saveEditManager">保存</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import API from '@/api';
    import * as validateUtil from '@/libs/validate';
    import {getMsg} from '@/libs/util';

    export default {
        name: 'manager_model',
        data() {
            return {
                loading: false,
                keywords: '',
                totalCount: 0,
                pageSize: 10,
                pageIndex: 1,
                selection: [], //多选选中的值
                editManagerModal: false, // 新增模态框
                saveLoading: false,
                roleList: [],
                editManagerForm: {
                    'pkId': 0,
                    'username': '',
                    'password': '',
                    'rePassword': '',
                    // 'email': '',
                    'mobile': '',
                    'status': 0,
                    'roleId': 0
                },
                managerValidate: {
                    username: [
                        {required: true, message: '请输入账号', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ],
                    rePassword: [
                        {required: true, message: '请再次输入密码', trigger: 'blur'}
                    ],
                    // email: [
                    //     {required: true, message: '请输入邮箱', trigger: 'blur'},
                    //     {validator: validateUtil.valideEmail, trigger: 'blur'}
                    // ],
                    mobile: [
                        {required: true, message: '请输入手机号', trigger: 'blur'},
                        {validator: validateUtil.valideMoblie, trigger: 'blur'}
                    ]
                },
                columns: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: '用户名',
                        key: 'username',
                        align: 'center'
                    },
                    {
                        title: '手机号',
                        key: 'mobile',
                        align: 'center'
                    },
                    {
                        title: '状态',
                        key: 'status',
                        render: (h, params) => {
                            const row = params.row;
                            const color = row.status ===0 ? 'green' : 'red';
                            const text = row.status === 0 ? '启用' : '禁用';
                            return h('Tag', {
                                props: {
                                    type: 'dot',
                                    color: color
                                }
                            }, text);
                        },
                        align: 'center'
                    },
                    {
                        title: '创建时间',
                        key: 'createTime',
                        align: 'center'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        align: 'center',
                        render: (h, params) => {
                            let editBtn = h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small'
                                },
                                style: {
                                    marginRight: '5px'
                                },
                                on: {
                                    click: () => {
                                        this.showManagerEditModal(params);
                                    }
                                }
                            }, '修改');
                            let deleteBtn = h('Button', {
                                props: {
                                    type: 'error',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        this.delete(params);
                                    }
                                }
                            }, '删除');
                            if (this.isAuth('sys:manager:delete') && this.isAuth('sys:manager:update')) {
                                return h('div', [
                                    editBtn, deleteBtn
                                ]);
                            } else if (this.isAuth('sys:manager:update')) {
                                return h('div', [
                                    editBtn
                                ]);
                            } else if (this.isAuth('sys:manager:delete')) {
                                return h('div', [
                                    deleteBtn
                                ]);
                            } else {
                                return h('div', {}, '您暂无相关权限');
                            }
                        }
                    }
                ],
                tableData: []
            };
        },
        methods: {
            init() {// 数据初始化、搜索
                this.loading = true;
                let params = {
                    'pageNum': this.pageIndex,
                    'pageSize': this.pageSize,
                    'keywords': this.keywords,
                };
                API.manager.list(params).then(({data}) => {
                    this.loading = false;
                    if (data && data.errCode === 0) {
                        this.tableData = data.data.data;
                        this.totalCount = data.data.totalElements;
                    } else {
                        this.$Message.error(data.errMsg);
                    }
                }).catch((e) => {
                    this.loading = false;
                    this.$Message.error('连接失败，请检查网络！');
                });
                // 如果没有，则查找角色列表
                if (this.roleList.length === 0) {
                    let roleParams = {
                        'pageNum': 0,
                        'pageSize': 99
                    };
                    API.role.list(roleParams).then(({data}) => {
                        if (data && data.errCode === 0) {
                            this.roleList = data.data.data;
                        } else {
                            this.$Message.error(data.errMsg);
                        }
                    }).catch((e) => {
                        this.$Message.error('连接失败，请检查网络！');
                    });
                }
            },
            resetData(val) { //表单数据重置
                if (!val) {
                    this.editManagerForm = {
                        'pkId': 0,
                        'username': '',
                        'password': '',
                        'rePassword': '',
                        // 'email': '',
                        'mobile': '',
                        'status': 0,
                        'roleId': 0
                    };
                }
            },
            pageChange(val) { //页数改变监听
                this.pageIndex = val;
                this.init();
            },
            sizeChange(size) { //每页个数改变监听
                this.pageSize = size;
                this.init();
            },
            selectionChange(data) { //表格选中数据监听
                // 记录选中的数据
                this.selection = data;
            },
            showManagerEditModal(params) {//显示模态框
                // 弹出编辑框
                this.editManagerModal = true;

                let roleParams = {
                    'pageNum': 0,
                    'pageSize': 99
                };
                API.role.list(roleParams).then(({data}) => {
                    if (data && data.errCode === 0) {
                        this.roleList = data.data.data;
                    } else {
                        this.$Message.error(getMsg(data.errCode));
                    }
                }).catch((e) => {
                    this.$Message.error('连接失败，请检查网络！');
                });
                if (typeof params != 'undefined') { //如果是修改状态，则填充必要数据
                    this.editManagerForm = params.row;
                    this.editManagerForm.roleId = params.row.roleIds;
                    this.editManagerForm.password = '';
                    this.editManagerForm.rePassword = '';
                    this.managerValidate.password = [];
                    this.managerValidate.rePassword = [];
                } else {
                    this.managerValidate.password = [
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ];
                    this.managerValidate.rePassword = [
                        {required: true, message: '请再次输入密码', trigger: 'blur'}];
                }

            },
            cancelEditManager() {
                this.editManagerModal = false;
            },
            saveEditManager() {
                this.$refs.editManagerForm.validate((valid) => {
                    if ((typeof this.editManagerForm.pkId == 'undefined' ||
                        this.editManagerForm.password !== '' || this.editManagerForm.rePassword !== '')
                        && this.editManagerForm.password !== this.editManagerForm.rePassword) {
                        valid = false; //校验不通过
                        this.$Message.error('两次密码不一致！');
                    }
                    if (valid) {
                        // 添加管理员
                        let params = {
                            'pkId': this.editManagerForm.pkId || undefined,
                            'username': this.editManagerForm.username,
                            'password': this.editManagerForm.password,
                            // 'email': this.editManagerForm.email,
                            'mobile': this.editManagerForm.mobile,
                            'status': this.editManagerForm.status,
                            'roleId': this.editManagerForm.roleId
                        };
                        this.saveLoading = true;
                        let tick = !this.editManagerForm.pkId ? API.manager.add(params) : API.manager.update(params);
                        let msg = !this.editManagerForm.pkId ? '添加成功' : '修改成功';
                        tick.then(({data}) => {
                            if (data && data.errCode === 0) {
                                this.saveLoading = false;
                                this.$Message.success({
                                    content: msg , onClose: () => {
                                        this.editManagerModal = false;
                                        this.init();
                                    }
                                });
                            } else {
                                this.saveLoading = false;
                                this.$Message.error(data.errMsg);
                            }
                        }).catch(() => {
                            this.saveLoading = false;
                            this.$Message.error('连接失败，请检查网络！');
                        });
                    }
                });
            },
            batchDel() { // 批量删除
                let userIds = [];
                // 批量删除
                this.selection.forEach((item) => {
                    userIds.push(item.pkId);
                });
                if (userIds.length === 0) {
                    this.$Message.error('请至少选中一行数据！');
                } else {
                    this.$Modal.confirm({
                        title: '提示',
                        content: '<p>确定要删除么</p>',
                        onOk: () => {
                            API.manager.del(userIds).then(({data}) => {
                                if (data && data.errCode === 0) {
                                    this.$Message.success({
                                        content: getMsg(data.errCode), onClose: () => {
                                            this.selection = [];// 勾选数据初始化
                                            this.init();
                                        }
                                    });

                                } else {
                                    this.$Message.error(data.errMsg);
                                }
                            }).catch(() => {
                                this.$Message.error('连接失败，请检查网络！');
                            });
                        },
                        onCancel: () => {

                        }
                    });
                }
            },
            delete(params) { // 删除
                let userIds = [params.row.pkId];
                this.$Modal.confirm({
                    title: '提示',
                    content: '<p>确定要删除么</p>',
                    onOk: () => {
                        API.manager.del(userIds).then(({data}) => {
                            if (data && data.errCode === 0) {
                                this.$Message.success({
                                    content: getMsg(data.errCode), onClose: () => {
                                        this.init();
                                    }
                                });
                            } else {
                                this.$Message.error(data.errMsg);
                            }
                        }).catch(() => {
                            this.$Message.error('连接失败，请检查网络！');
                        });
                    },
                    onCancel: () => {

                    }
                });
            }
        },
        mounted() {
            this.init(); //初始化
        }
    };
</script>
