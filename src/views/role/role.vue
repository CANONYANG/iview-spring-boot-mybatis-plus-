<template>
    <div>
        <Row style="margin-bottom: 10px;">
            <div style="float: left" v-if="isAuth('sys:role:save')">
                <span @click="showRoleEditModal()" style="margin: 0 10px;"><Button type="primary"
                                                                                   icon="plus">新增角色</Button></span>
            </div>
            <div style="float: left" v-if="isAuth('sys:role:save')">
                <span @click="showMenuList()" style="margin: 0 10px;"><Button type="primary"
                                                                              icon="ios-list-outline">菜单列表</Button></span>
            </div>
            <div style="float: left" v-if="isAuth('sys:role:save')">
                <span @click="showMenuEditModal()" style="margin: 0 10px;"><Button type="primary"
                                                                                   icon="plus">添加菜单</Button></span>
            </div>
            <div style="float: right">
                <Input v-model="keywords" placeholder="请输入角色名称" style="width: 200px"/>
                <span @click="init" style="margin: 0 10px;"><Button type="primary" icon="search">搜索</Button></span>
                <span @click="batchDel" v-if="isAuth('sys:role:delete')" style="margin: 0"><Button type="error"
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
        <Modal v-model="editRoleModal" :closable='true' :mask-closable=false :width="800"
               @on-visible-change="resetData">
            <h3 slot="header" style="color:#2D8CF0">{{!editRoleForm.pkId?'添加角色':'修改角色'}}</h3>
            <Form ref="editRoleForm" :model="editRoleForm" :label-width="100" label-position="right"
                  :rules="RoleValidate" @submit.native.prevent="saveEditRole">
                <FormItem label="角色名称" prop="roleName">
                    <Input v-model="editRoleForm.roleName" placeholder="请输入角色名称"></Input>
                </FormItem>
                <FormItem label="角色描述" prop="remark">
                    <Input v-model="editRoleForm.remark" placeholder="请输入角色描述"></Input>
                </FormItem>
                <FormItem label="权限列表" prop="menuList">
                    <Tree :data='menuList' show-checkbox @on-check-change="treeCheckChange"></Tree>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="cancelEditRole">取消</Button>
                <Button type="primary" :loading="saveLoading" @click="saveEditRole">保存</Button>
            </div>
        </Modal>
        <Modal v-model="menuListModal" :closable='true' :mask-closable=false :width="800">
            <h3 slot="header" style="color:#2D8CF0">菜单列表</h3>
            <Row>
                <Table border ref="menu_selection" :columns="menu_columns" :data="menu_tableData" :highlight-row="true"
                       :current="menu_pageIndex" @on-selection-change="menu_selectionChange" :loading="loading"></Table>
            </Row>
            <Row style="margin-top: 10px;float: right;">
                <Page :total="menu_totalCount" :page-sise="menu_pageSize" loading show-sizer @on-change="menu_pageChange"
                      @on-page-size-change="menu_sizeChange"></Page>
            </Row>
            <div slot="footer">
                <!--<Button type="text" @click="cancelEditRole">取消</Button>-->
            </div>
        </Modal>
        <Modal v-model="editMenuModal" :closable='true' :mask-closable=false :width="800"
               @on-visible-change="resetData">
            <h3 slot="header" style="color:#2D8CF0">{{!editMenuForm.pkId?'添加菜单':'修改菜单'}}</h3>
            <Form ref="editMenuForm" :model="editMenuForm" :label-width="100" label-position="right"
                  :rules="MenuValidate" @submit.native.prevent="saveEditRole">
                <FormItem label="菜单类型：" prop="parentId">
                    <RadioGroup v-model="editMenuForm.parentId" @on-change="changeParent">
                        <Radio :label="0">一级菜单</Radio>
                        <Radio :label="1">次级菜单</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="一级菜单：" v-if="isParentId === 1">
                    <Select style="width:200px" v-model="editMenuForm.menuId">
                        <Option v-for="list in firstMenuList" :value="list.pkId" :key="list.pkId">{{ list.title }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="菜单名" prop="name">
                    <Input v-model="editMenuForm.name" placeholder="请输入菜单名"></Input>
                </FormItem>
                <FormItem label="菜单标题" prop="title">
                    <Input v-model="editMenuForm.title" placeholder="请输入菜单标题"></Input>
                </FormItem>
                <FormItem label="菜单排序" prop="orderNum" v-if="isParentId === 0">
                    <Input v-model="editMenuForm.orderNum" placeholder="请输入菜单排序号"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="cancelEditMenu">取消</Button>
                <Button type="primary" :loading="saveLoading" @click="saveEditMenu">保存</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import API from '@/api';
    import {treeDataTranslate, unique, getMsg} from '@/libs/util';


    export default {
        name: 'role_name',
        data() {
            return {
                loading: false,
                keywords: '',
                totalCount: 0,
                menu_totalCount:0,
                pageSize: 10,
                menu_pageSize: 10,
                pageIndex: 1,
                menu_pageIndex: 1,
                selection: [], //多选选中的值
                menu_selection: [], //多选选中的值
                editRoleModal: false, // 新增模态框
                saveLoading: false,
                menuList: [],
                menuIdList: [],
                firstMenuList: [],
                treeValue: [], // 当前选中的树
                menuListModal:false,
                editMenuModal:false,
                isParentId:0,
                firstMenu:'',
                editRoleForm: {
                    'pkId': 0,
                    'roleName': '',
                    'remark': ''
                },editMenuForm: {
                    'pkId': 0,
                    'name': '',
                    'title': '',
                    'parentId':0,
                    'menuId':0,
                    'orderNum': 0
                },
                RoleValidate: {
                    roleName: [
                        {required: true, message: '请输入角色名称', trigger: 'blur'}
                    ],
                    remark: [
                        {required: true, message: '请输入角色描述', trigger: 'blur'}
                    ],
                },
                MenuValidate: {
                    name: [
                        {required: true, message: '请输入菜单名称', trigger: 'blur'}
                    ],
                    title: [
                        {required: true, message: '请输入菜单标题', trigger: 'blur'}
                    ]
                },
                columns: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: '角色名称',
                        key: 'roleName',
                        align: 'center'
                    },
                    {
                        title: '角色描述',
                        key: 'remark',
                        align: 'center'
                    },
                    {
                        title: '创建时间',
                        key: 'date',
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
                                        this.showRoleEditModal(params);
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
                            if (this.isAuth('sys:role:delete') && this.isAuth('sys:role:update')) {
                                return h('div', [
                                    editBtn, deleteBtn
                                ]);
                            } else if (this.isAuth('sys:role:update')) {
                                return h('div', [
                                    editBtn
                                ]);
                            } else if (this.isAuth('sys:role:delete')) {
                                return h('div', [
                                    deleteBtn
                                ]);
                            } else {
                                return h('div', {}, '您暂无相关权限');
                            }
                        }
                    }
                ], menu_columns: [
                    {
                        title: '菜单名称',
                        key: 'title',
                        align: 'center'
                    },
                    {
                        title: '菜单类型',
                        key: 'parentId',
                        render: (h, params) => {
                            const row = params.row;
                            const text = row.parentId === 0 ? '一级菜单' : '次级菜单';
                            return h('div', {}, text);
                        },
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
                                        this.showMenuEditModal(params);
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
                                        this.deleteMenu(params);
                                    }
                                }
                            }, '删除');
                            if (this.isAuth('sys:role:delete') && this.isAuth('sys:role:update')) {
                                return h('div', [
                                    editBtn, deleteBtn
                                ]);
                            } else if (this.isAuth('sys:role:update')) {
                                return h('div', [
                                    editBtn
                                ]);
                            } else if (this.isAuth('sys:role:delete')) {
                                return h('div', [
                                    deleteBtn
                                ]);
                            } else {
                                return h('div', {}, '您暂无相关权限');
                            }
                        }
                    }
                ],
                tableData: [],
                menu_tableData: [],
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
                API.role.list(params).then(({data}) => {
                    this.loading = false;
                    if (data && data.errCode === 0) {
                        this.tableData = data.data.data;
                        this.totalCount = data.data.totalElements;
                    } else {
                        this.$Message.error(data.errMsg);
                    }
                }).catch(() => {
                    this.loading = false;
                    this.$Message.error('连接失败，请检查网络！');
                });
            },
            resetData(val) { //表单数据重置
                if (!val) {
                    this.editRoleForm = {
                        'pkId': 0,
                        'roleName': '',
                        'remark': ''
                    };
                    this.menuIdList = [];
                    this.treeValue = [];
                    this.saveLoading = false;
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
            menu_pageChange(val) { //页数改变监听
                this.menu_pageIndex = val;
                this.init();
            },
            menu_sizeChange(size) { //每页个数改变监听
                this.menu_pageSize = size;
                this.init();
            },
            menu_selectionChange(data) { //表格选中数据监听
                // 记录选中的数据
                this.menu_selection = data;
            },
            showRoleEditModal(params) {//显示模态框

                let menuList = [];
                API.menu.list().then(({data}) => {
                    menuList = data.data.data;
                }).then(() => {
                    if (typeof params != 'undefined') { //如果是修改状态，则填充必要数据
                        this.editRoleForm = params.row;
                        API.role.info(this.editRoleForm.pkId).then(({data}) => {
                            if (data && data.errCode === 0) {
                                this.menuIdList = data.data.menuIdList;
                                this.treeValue = this.menuIdList;
                                this.menuList = treeDataTranslate(menuList, this.menuIdList, 'pkId');
                            }
                        }).then(() => {
                            // 弹出编辑框
                            this.editRoleModal = true;
                        });
                    } else {
                        this.menuList = treeDataTranslate(menuList, [], 'pkId');
                        // 弹出编辑框
                        this.editRoleModal = true;
                    }
                }).catch((e) => {
                    // console.log(e);
                });
            },
            cancelEditRole() {
                this.editRoleModal = false;
            },
            treeCheckChange(val) {
                this.treeValue = val;
            },
            saveEditRole() {
                this.$refs.editRoleForm.validate((valid) => {
                    if (valid) {
                        this.menuIdList = [];
                        this.treeValue.forEach((item) => {
                            this.menuIdList.push(typeof item.pkId === 'number' ? item.pkId : item);
                        })
                        let tempList = unique(this.menuIdList);
                        this.menuIdList = tempList.length === 0 ? tempList : this.treeValue.map((item) => {
                            return typeof item.pkId === 'number' ? item.pkId : item;
                        });
                        // 添加角色
                        let params = {
                            'pkId': this.editRoleForm.pkId || undefined,
                            'roleName': this.editRoleForm.roleName,
                            'remark': this.editRoleForm.remark,
                            'menuIdList': this.menuIdList
                        };
                        this.saveLoading = true;
                        let msg = typeof params.pkId === 'undefined' ? '添加成功' : '修改成功';
                        let tick = !this.editRoleForm.pkId ? API.role.add(params) : API.role.update(params);
                        tick.then(({data}) => {
                            if (data && data.errCode === 0) {
                                this.saveLoading = false;
                                this.$Message.success({
                                    content: msg, onClose: () => {
                                        this.init();
                                        this.editRoleModal = false;
                                        this.saveLoading = false;
                                    }
                                });
                            } else {
                                this.saveLoading = false;
                                this.$Message.error(getMsg(data.errCode));
                            }
                        }).catch(() => {
                            this.saveLoading = false;
                            this.$Message.error('连接失败，请检查网络！');
                        });
                    }
                });
            },
            batchDel() { // 批量删除
                let pkIds = [];
                // 批量删除
                this.selection.forEach((item) => {
                    pkIds.push(item.pkId);
                });
                if (pkIds.length === 0) {
                    this.$Message.error('请至少选中一行数据！');
                } else {
                    this.$Modal.confirm({
                        title: '提示',
                        content: '<p>确定要删除么</p>',
                        onOk: () => {
                            API.role.del(pkIds).then(({data}) => {
                                if (data && data.errCode === 0) {
                                    this.$Message.success({
                                        content: getMsg(data.errCode), onClose: () => {
                                            this.selection = []; // 勾选数据初始化
                                            this.init();
                                        }
                                    });
                                } else {
                                    this.$Message.error(getMsg(data.errCode));
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
                let pkIds = [params.row.pkId];
                this.$Modal.confirm({
                    title: '提示',
                    content: '<p>确定要删除么</p>',
                    onOk: () => {
                        API.role.del(pkIds).then(({data}) => {
                            if (data && data.errCode === 0) {
                                this.$Message.success({
                                    content: getMsg(data.errCode), onClose: () => {
                                        this.init();
                                    }
                                });
                            } else {
                                this.$Message.error(getMsg(data.errCode));
                            }
                        }).catch(() => {
                            this.$Message.error('连接失败，请检查网络！');
                        });
                    },
                    onCancel: () => {

                    }
                });
            },
            changeParent(val){
                this.isParentId = val;
                this.editMenuForm = {
                    'pkId': this.editMenuForm.pkId,
                    'name': '',
                    'title': '',
                    'parentId':val,
                    'menuId':0,
                    'orderNum': 0
                }
            },
            //查看菜单列表
            showMenuList(){
                this.menuListModal = true;
                this.loading = true;
                API.menu.list().then(({data}) => {
                    this.loading = false;
                    if (data && data.errCode === 0) {
                        this.menu_tableData = data.data.data;
                        this.menu_totalCount = data.data.totalElements;
                    } else {
                        this.$Message.error(getMsg(data.errCode));
                    }
                }).catch(() => {
                    this.loading = false;
                    this.$Message.error('连接失败，请检查网络！');
                });
            },
            //添加菜单
            showMenuEditModal(params){
                this.editMenuModal = true;
                if(typeof params != 'undefined'){
                    this.editMenuForm = params.row;
                }
                API.menu.getFirstMenu().then(({data}) => {
                    this.loading = false;
                    if (data && data.errCode === 0) {
                        this.firstMenuList = data.data;
                    } else {
                        this.$Message.error(getMsg(data.errCode));
                    }
                }).catch(() => {
                    this.$Message.error('连接失败，请检查网络！');
                });
            },
            cancelEditMenu(){
                this.editMenuModal = false;
            },
            saveEditMenu(){
                this.$refs.editMenuForm.validate((valid) => {
                    if (typeof this.editMenuForm.pkId == 'undefined'
                    ) {
                        valid = false; //校验不通过
                        this.$Message.error('请将信息填写完整');
                    }
                    if (valid) {
                        if(this.editMenuForm.parentId === 1){
                            this.editMenuForm.parentId = this.editMenuForm.menuId;
                        }
                        let params = {
                            'pkId': this.editMenuForm.pkId || undefined,
                            'parentId': this.editMenuForm.parentId,
                            'name': this.editMenuForm.name,
                            'title': this.editMenuForm.title,
                            'orderNum': this.editMenuForm.orderNum,
                        };
                        this.saveLoading = true;
                        let msg = typeof params.pkId === 'undefined' ? '添加成功' : '修改成功';
                        let tick = !this.editMenuForm.pkId ? API.menu.add(params) : API.menu.update(params);
                        tick.then(({data}) => {
                            if (data && data.errCode === 0) {
                                this.saveLoading = false;
                                this.$Message.success({
                                    content: msg, onClose: () => {
                                        this.init();
                                        this.editMenuForm.pkId = '';
                                        this.editMenuForm.name = '';
                                        this.editMenuForm.title = '';
                                        this.editMenuForm.orderNum = 0;
                                        this.editMenuModal = false;
                                        this.saveLoading = false;
                                        this.showMenuList();
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
            deleteMenu(params) { // 删除菜单
                let pkIds = [params.row.pkId];
                this.$Modal.confirm({
                    title: '提示',
                    content: '<p>确定要删除么</p>',
                    onOk: () => {
                        API.menu.del(pkIds).then(({data}) => {
                            if (data && data.errCode === 0) {
                                this.$Message.success(data.errMsg);
                                this.showMenuList();
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
            },
        },
        mounted() {
            this.init(); //初始化
        }
    };
</script>
