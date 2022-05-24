<template>
  <q-page padding>
    <q-table
      ref="table"
      :data="serverData"
      :columns="columns"
      row-key="id"
      :visible-columns="visibleColumns"
      :separator="separator"
      :pagination.sync="serverPagination"
      :loading="loading"
      color="secondary"
      :rows-per-page-options="[5,10,15,20]"
      @request="request"
    >
      <div slot="top-left" slot-scope="props" class="row print-hide">
        <q-input
          class="q-mt-ml q-mr-sm"
          @keyup.enter="search"
          v-model="searchForm.account"
          float-label="账号"
        />
        <q-input
          class="q-mt-ml q-mr-sm"
          @keyup.enter="search"
          v-model="searchForm.name"
          float-label="姓名"
        />
        <q-btn icon="mdi-eraser" rounded class="q-ma-xs" color="dark" @click="resetSearchForm()">
          <q-tooltip>重置</q-tooltip>
        </q-btn>
        <q-btn icon="mdi-magnify" rounded class="q-ma-xs" color="secondary" @click="search">
          <q-tooltip>搜索</q-tooltip>
        </q-btn>
        <q-btn
          icon="mdi-new-box"
          rounded
          class="q-ma-xs"
          color="primary"
          @click="openMainUserModal('add',0)"
        >
          <q-tooltip>新建</q-tooltip>
        </q-btn>
      </div>
      <template slot="top-right" slot-scope="props" class="print-hide">
        <q-table-columns
          color="secondary"
          class="q-mr-sm print-hide"
          label="筛选列"
          v-model="visibleColumns"
          :columns="columns"
        />
        <!-- <q-select color="secondary"
                  class="print-hide"
                  v-model="separator"
                  :options="[
          { label: '水平框线', value: 'horizontal' },
          { label: '竖直框线', value: 'vertical' },
          { label: '网格框线', value: 'cell' },
          { label: '无框线', value: 'none' }
        ]"
        hide-underline />-->
        <q-btn
          flat
          rounded
          class="print-hide"
          :icon="props.inFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
          @click="props.toggleFullscreen"
        >
          <q-tooltip>全屏</q-tooltip>
        </q-btn>
      </template>
      <q-tr slot="header" slot-scope="props">
        <q-th
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
          style="text-align:center"
        >{{ col.label }}</q-th>
      </q-tr>
      <template slot="body" slot-scope="props">
        <q-tr :props="props">
          <q-td key="account" :props="props" style="text-align:center">{{ props.row.account}}</q-td>
          <q-td key="name" :props="props" style="text-align:center">{{ props.row.name}}</q-td>
          <q-td
            key="roleName"
            :props="props"
            :style="{textAlign:'center',maxWidth:'200px',whiteSpace:'normal'}"
          >{{ props.row.roleName}}</q-td>
          <q-td key="status" :props="props" style="text-align:center">
            <q-icon
              :name="props.row.status==1?'mdi-check-circle':'mdi-close-circle'"
              size="1.5rem"
              :color="props.row.status==1?'positive':'negative'"
            />
          </q-td>
          <q-td key="operation" :props="props" style="text-align:center">
            <q-btn icon="mdi-settings" rounded color="primary" @click="openRoleModel(props.row.id)">
              <q-tooltip>角色管理</q-tooltip>
            </q-btn>
            <q-btn
              icon="mdi-eraser-variant"
              rounded
              color="dark"
              @click="resetPassword(props.row.id,props.row.name)"
            >
              <q-tooltip>重置密码</q-tooltip>
            </q-btn>
            <q-btn icon="mdi-delete" rounded color="negative" @click="deleteUser(props.row.name,props.row.id,props.row.account)">
              <q-tooltip>删除</q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
      <div slot="pagination" slot-scope="props" class="row flex-center q-py-sm print-hide">
        <q-btn
          round
          dense
          size="sm"
          icon="mdi-undo"
          color="secondary"
          class="q-mr-sm"
          :disable="props.isFirstPage"
          @click="props.prevPage"
        />
        <div
          class="q-mr-sm"
          style="font-size: small"
        >{{ props.pagination.page }} / {{ props.pagesNumber }}</div>
        <q-btn
          round
          dense
          size="sm"
          icon="mdi-redo"
          color="secondary"
          :disable="props.isLastPage"
          @click="props.nextPage"
        />
      </div>
    </q-table>
    <q-modal
      v-model="mainUserModalOpened"
      no-backdrop-dismiss
      no-esc-dismiss
      :content-css="{minWidth: '20vw', minHeight: '20vh'}"
    >
      <q-modal-layout footer-class="no-shadow">
        <q-toolbar slot="header">
          <q-btn flat round dense v-close-overlay icon="mdi-arrow-left"/>
          <q-toolbar-title>{{modalActionName}}</q-toolbar-title>
        </q-toolbar>
        <div class="layout-padding">
          <div class="row gutter-sm">
            <div class="col-xs-12 col-sm-6">
              <q-field :error="$v.user.name.$error" error-label="名字必填">
              <q-input v-model.trim="user.name" class="no-margin" float-label="名称"/>
              </q-field>
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-field :error="$v.user.account.$error" error-label="账号必填">
              <q-input v-model.trim="user.account" class="no-margin" float-label="账号"/>
              </q-field>
            </div>
          </div>
        </div>
        <q-toolbar slot="footer" inverted>
          <div class="col-12 row justify-center">
            <div v-if="modalActionName==='修改用户'" style="margin:0 2rem">
              <q-btn color="primary" :loading="modifyUserLoading" label="确定" @click="modifyUser"/>
            </div>
            <div v-if="modalActionName==='新增用户'" style="margin:0 2rem">
              <q-btn color="primary" :loading="newUserLoading" label="确定" @click="newUser"/>
            </div>
            <div v-if="modalActionName==='新增用户'" style="margin:0 2rem">
              <q-btn color="primary" label="重置" @click="resetUserModal"/>
            </div>
            <div style="margin:0 2rem">
              <q-btn color="primary" v-close-overlay label="取消"/>
            </div>
          </div>
        </q-toolbar>
        <div class="layout-padding">
          <div class="row gutter-sm"></div>
        </div>
      </q-modal-layout>
    </q-modal>
    <!-- role manage -->
    <q-modal
      v-model="mainUserRoleModalOpened"
      no-backdrop-dismiss
      no-esc-dismiss
      :content-css="{maxWidth: '50vw', minHeight: '50vh'}"
    >
      <q-modal-layout footer-class="no-shadow">
        <q-toolbar slot="header" :color="brandColor">
          <q-btn flat round dense v-close-overlay icon="mdi-arrow-left"/>
          <q-toolbar-title>用户拥有的角色</q-toolbar-title>
        </q-toolbar>
        <q-toolbar slot="footer" inverted>
          <div class="col-12 row justify-center">
            <div style="margin:0 2rem">
              <q-btn
                color="primary"
                :loading="modifyUserRoleLoading"
                label="确定"
                @click="modifyUseRole"
              />
            </div>
            <div style="margin:0 2rem">
              <q-btn color="primary" v-close-overlay label="取消"/>
            </div>
          </div>
        </q-toolbar>
        <div class="layout-padding">
          <q-option-group
            inline
            color="secondary"
            type="checkbox"
            v-model="roleList"
            :options="roleOptions"
          />
        </div>
      </q-modal-layout>
    </q-modal>
  </q-page>
</template>

<script>
import {
  getUserList,
  updatePassword,
  addUser,
  updateUser,
  getRoleOptions,
  getUserRole,
  updateUserRole,
} from 'src/api/userManage'
import {
  minLength,
  maxLength,
  minValue,
  maxValue,
  numeric,
  integer,
  decimal,
  required,
} from 'vuelidate/lib/validators'
export default {
  data() {
    return {
      api: process.env.API,
      searchForm: {
        page: 0,
        row: 0,
        account: '',
        name: '',
      },
      loading: false,
      newUserLoading: false,
      modifyUserLoading: false,
      modifyUserRoleLoading: false,
      visibleColumns: ['account', 'name', 'roleName', 'status', 'operation'],
      separator: 'horizontal',
      serverPagination: {
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 10, // specifying this determines pagination is server-side
      },
      serverData: [],
      columns: [
        { name: 'account', label: '账号', field: 'account' },
        { name: 'name', label: '名称', field: 'name' },
        { name: 'roleName', label: '角色', field: 'roleName' },
        {
          name: 'status',
          label: '状态',
          field: 'status',
        },
        { name: 'operation', label: '操作', field: 'operation' },
      ],
      //main modal
      mainUserModalOpened: false,
      modalActionName: '',
      user: { name: '', account: '', id: '' },
      //role manage
      mainUserRoleModalOpened: false,
      userIdChosen: '',
      roleOptions: [],
      roleList: [],
    }
  },
  validations: {
    user: {
      name: { required, maxLength: maxLength(20) },
      account: { required, maxLength: maxLength(20) },
    },
  },
  computed: {
    brandColor() {
      return this.$store.getters['user/brandColor']
    },
  },
  methods: {
    notify(type, message) {
      this.$q.notify({
        message: message,
        type: type,
      })
    },
    roleManage(id) {
      this.notify('warning', 'Ok,Ok~')
    },
    deleteUser(name, id, account) {
      this.$q
        .dialog({
          title: '删除用户',
          message: '你确定要删除' + name + '这个用户吗？',
          ok: '确定',
          cancel: '取消',
        })
        .then(() => {
          this.user.name = name
          this.user.account = account
          this.user.id = id
          this.user.status = 1
          this.user.password = 111111
          this.user.isDel = 1
          updateUser(this.user).then((response) => {
            let data = response.data
            this.notify('positive', data.msg)
            this.request({
              pagination: this.serverPagination,
            })
          })
        })
    },
    resetSearchForm() {
      Object.assign(this.searchForm, this.$options.data.call(this).searchForm)
      this.$nextTick(() => {
        this.serverPagination.page = 1
        this.request({
          pagination: this.serverPagination,
        })
      })
    },
    search() {
      this.serverPagination.page = 1
      this.request({
        pagination: this.serverPagination,
      })
    },
    //main modal
    openMainUserModal(action, id) {
      if (action === 'add') {
        this.modalActionName = '新增用户'
        Object.assign(this.user, this.$options.data.call(this).user)
        this.$v.user.$reset()
        this.mainUserModalOpened = true
      }
    },
    newUser() {
      this.$v.user.$touch()
      if (this.$v.user.$invalid) {
        return
      }
      this.$v.user.$reset()
      this.newUserLoading = true
      addUser(this.user)
        .then((response) => {
          let data = response.data
          this.mainUserModalOpened = false
          this.newUserLoading = false
          Object.assign(this.user, this.$options.data.call(this).user)
          this.notify('positive', data.msg)
          this.request({
            pagination: this.serverPagination,
          })
        })
        .catch((error) => {
          this.newUserLoading = false
        })
    },
    modifyUser() {},
    resetUserModal() {
      Object.assign(this.user, this.$options.data.call(this).user)
    },
    //user operation
    resetPassword(id, name) {
      this.$q
        .dialog({
          title: '重置密码',
          message: '你确定要重置' + name + '的密码吗？',
          ok: '确定',
          cancel: '取消',
        })
        .then(() => {
          let date = new Date()
          let newPw = 'by' + date.getFullYear()
          updatePassword(id, newPw).then((response) => {
            let data = response.data
            this.notify('positive', data.msg)
          })
        })
    },
    //role manage
    openRoleModel(id) {
      this.userIdChosen = id
      getRoleOptions()
        .then((response) => {
          let data = response.data.data
          this.roleOptions = data
        })
        .catch((error) => {})
      getUserRole(id)
        .then((response) => {
          let data = response.data.data
          this.roleList = data
        })
        .catch((error) => {})
      this.$nextTick(() => {
        this.mainUserRoleModalOpened = true
      })
    },
    modifyUseRole() {
      this.modifyUserRoleLoading = true
      updateUserRole(this.userIdChosen, this.roleList)
        .then((response) => {
          let data = response.data
          this.notify('positive', data.msg)
          this.mainUserRoleModalOpened = false
          this.modifyUserRoleLoading = false
          this.request({
            pagination: this.serverPagination,
          })
        })
        .catch((error) => {
          this.modifyUserRoleLoading = false
        })
    },
    //dataTable request
    request({ pagination }) {
      this.loading = true
      this.searchForm.page = pagination.page
      this.searchForm.row = pagination.rowsPerPage
      getUserList(this.searchForm)
        .then((response) => {
          let data = response.data.data
          this.serverPagination = pagination
          this.serverPagination.rowsNumber = data.total
          this.serverData = data.rows
          this.loading = false
        })
        .catch((error) => {
          this.loading = false
        })
    },
  },
  mounted() {
    this.request({
      pagination: this.serverPagination,
    })
  },
}
</script>

<style lang="stylus" scoped>
.q-table th
  font-size: 13px
.q-table tbody td
  font-size: 15px
@media (min-width: 1200px)
  .layout-padding
    padding: 1.5rem 1.5rem
</style>
