<template>
  <q-page padding>
    <q-table ref="table"
             :data="serverData"
             :columns="columns"
             row-key="id"
             :visible-columns="visibleColumns"
             :separator="separator"
             :pagination.sync="serverPagination"
             :loading="loading"
             color="secondary"
             :rows-per-page-options="[5,10,15,20]"
             @request="request">
      <div slot="top-left"
           slot-scope="props"
           class="row print-hide">
        <!-- <q-btn v-show="resetBtnExist"
               icon="mdi-eraser"
               label="重置当前搜索"
               rounded
               color="dark"
               @click="resetSearchFormAndSearch">
        </q-btn>
        <q-btn icon="mdi-magnify"
               label="搜索"
               rounded
               color="secondary"
               @click="searchFormDialogOpened=true">
        </q-btn> -->
        <q-btn icon="mdi-file-import"
               label="导入款式"
               rounded
               color="primary"
               @click="openBatchDialog(1)">
        </q-btn>
        <q-btn icon="mdi-file-import"
               label="导入编号"
               rounded
               color="primary"
               @click="openBatchDialog(2)">
        </q-btn>
        <q-btn icon="mdi-file-import"
               label="导入物料"
               rounded
               color="primary"
               @click="openBatchDialog(3)">
        </q-btn>
        <q-btn icon="mdi-file-excel"
               label="款式模板"
               rounded
               color="secondary"
               @click="downloadImportModel('styleImportModel')">
        </q-btn>
        <q-btn icon="mdi-file-excel"
               label="编号模板"
               rounded
               color="secondary"
               @click="downloadImportModel('codeImportModel')">
        </q-btn>
        <q-btn icon="mdi-file-excel"
               label="物料模板"
               rounded
               color="secondary"
               @click="downloadImportModel('matImportModel')">
        </q-btn>
      </div>
      <template slot="top-right"
                slot-scope="props"
                class="print-hide">
        <q-table-columns color="secondary"
                         class="q-mr-sm print-hide"
                         label="筛选列"
                         v-model="visibleColumns"
                         :columns="columns" />
        <q-btn flat
               rounded
               class="print-hide"
               :icon="props.inFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
               @click="props.toggleFullscreen">
          <q-tooltip>全屏</q-tooltip>
        </q-btn>
      </template>
      <q-tr slot="header"
            slot-scope="props">
        <q-th v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="text-align:center">
          {{ col.label }}
        </q-th>
      </q-tr>
      <template slot="body"
                slot-scope="props">
        <q-tr :props="props">
          <q-td key="userName"
                :props="props"
                style="text-align:center">{{ props.row.userName}}</q-td>
          <q-td key="batchType"
                :props="props"
                style="text-align:center">{{calType(props.row.batchType)}}</q-td>
          <q-td key="batchNum"
                :props="props"
                style="text-align:center">{{ props.row.batchNum}}</q-td>
          <q-td key="gmtCreate"
                :props="props"
                style="text-align:center">{{ formatDate(props.row.gmtCreate) }}</q-td>
          <q-td key="isSync"
                :props="props"
                style="text-align:center">
            <q-icon :name="props.row.isSync?'mdi-check-circle':'mdi-sync-off'"
                    size="1.5rem"
                    :color="props.row.isSync?'positive':'negative'" />
          </q-td>
          <q-td key="operation"
                :props="props"
                style="text-align:center">
            <!-- <q-btn icon="mdi-settings"
                   rounded
                   color="primary"
                   @click="openBatchModel(props.row.id)">
              <q-tooltip>详情</q-tooltip>
            </q-btn> -->
            <q-btn v-show="!props.row.isSync"
                   icon="mdi-cloud-sync"
                   rounded
                   :loading="syncLoading"
                   color="secondary"
                   @click="syncBatch(props.row.id,props.row.batchType)">
              <q-tooltip>同步</q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
      <div slot="pagination"
           slot-scope="props"
           class="row flex-center q-py-sm print-hide">
        <q-btn round
               dense
               size="sm"
               icon="mdi-undo"
               color="secondary"
               class="q-mr-sm"
               :disable="props.isFirstPage"
               @click="props.prevPage" />
        <div class="q-mr-sm"
             style="font-size: small">
          {{ props.pagination.page }} / {{ props.pagesNumber }}
        </div>
        <q-btn round
               dense
               size="sm"
               icon="mdi-redo"
               color="secondary"
               :disable="props.isLastPage"
               @click="props.nextPage" />
      </div>
    </q-table>
    <!-- upload xls -->
    <q-dialog v-model="batchFileUploadDialog"
              prevent-close>
      <span slot="title">批量导入</span>
      <span slot="message">请按照模板填写相关信息(编号或款号务必为文本格式)</span>
      <div slot="body">
        <q-uploader ref="batchFileUpload"
                    :url="api+batchFileUploadUrl"
                    :additionalFields="[
                      {'name':'batchType','value':this.batchType},
                      {'name':'imsToken','value':this.imsToken}]"
                    clearable
                    extensions=".xls,.xlsx"
                    auto-expand
                    hide-upload-button
                    float-label="上传表格文件"
                    @uploaded="batchFileUploaded"
                    @fail="batchFileUploadedFail"
                    @add="addbatchFile" />
      </div>
      <template slot="buttons"
                slot-scope="props">
        <q-btn color="primary"
               label="上传"
               :loading="importLoading"
               @click="batchFileUpload" />
        <q-btn color="primary"
               label="取消"
               @click="batchFileUploadCancel" />
      </template>
    </q-dialog>
  </q-page>
</template>

<script>
import { filter } from 'quasar'
import { date } from 'quasar'
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
import {
  getBatchLogList,
  addMatBatchDataSync,
  addProdBatchDataSync,
} from 'src/api/batch'
import { importModelDownload } from 'src/api/productPlus'
export default {
  data() {
    return {
      api: process.env.API,
      searchForm: {
        page: 0,
        row: 0,
      },
      loading: false,
      visibleColumns: [
        'userName',
        'batchType',
        'batchNum',
        'gmtCreate',
        'isSync',
        'operation',
      ],
      separator: 'horizontal',
      serverPagination: {
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 10, // specifying this determines pagination is server-side
      },
      serverData: [],
      columns: [
        { name: 'userName', label: '用户', field: 'userName' },
        { name: 'batchType', label: '类型', field: 'batchType' },
        { name: 'batchNum', label: '数量', field: 'batchNum' },
        { name: 'gmtCreate', label: '导入时间', field: 'gmtCreate' },
        { name: 'isSync', label: '是否同步', field: 'isSync' },
        { name: 'operation', label: '操作', field: 'operation' },
      ],
      syncLoading: false,
      //batch dialog
      batchFileUploadDialog: false,
      batchFileUploadUrl: '',
      batchType: '',
      importLoading: false,
      //main modal
    }
  },
  computed: {
    brandColor() {
      return this.$store.getters['user/brandColor']
    },
    imsToken() {
      return this.$store.getters['user/token']
    },
  },
  methods: {
    notify(type, message) {
      this.$q.notify({
        message: message,
        type: type,
      })
    },
    calType(type) {
      if (type == 1) {
        return '款式'
      } else if (type == 2) {
        return '编号'
      } else if (type == 3) {
        return '物料/辅料'
      } else {
        return '未知'
      }
    },
    formatDate(timeStamp) {
      return date.formatDate(timeStamp, 'YYYY-MM-DD HH:mm:ss')
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
    //
    openBatchDialog(type) {
      if (type == 1) {
        this.batchType = 1
        this.batchFileUploadUrl = '/prodStyle/batch'
        this.batchFileUploadDialog = true
      }
      if (type == 2) {
        this.batchType = 2
        this.batchFileUploadUrl = '/prodCode/batch'
        this.batchFileUploadDialog = true
      }
      if (type == 3) {
        this.batchType = 3
        this.batchFileUploadUrl = '/mat/batch'
        this.batchFileUploadDialog = true
      }
    },
    addbatchFile(files) {
      if (files[0].size > 5 * 1024 * 1024) {
        this.$refs.batchFileUpload.reset()
        this.notify('warning', '图片不能大于5MB')
      }
    },
    batchFileUpload() {
      this.importLoading = true
      this.$refs.batchFileUpload.upload()
    },
    batchFileUploadCancel() {
      this.$refs.batchFileUpload.reset()
      this.batchFileUploadDialog = false
    },
    batchFileUploaded(file, xhr) {
      let response = JSON.parse(xhr.response)
      if (response.code == 20000) {
        this.notify('positive', response.msg)
        this.$refs.batchFileUpload.reset()
        this.batchFileUploadDialog = false
        this.request({
          pagination: this.serverPagination,
        })
        this.importLoading = false
      } else {
        this.notify('negative', response.msg)
        this.$refs.batchFileUpload.reset()
        this.importLoading = false
      }
    },
    // when it has encountered error while uploading
    batchFileUploadedFail(file, xhr) {
      let response = JSON.parse(xhr.response)
      this.notify('negative', response.data.msg)
      this.importLoading = false
    },
    //download importModel
    downloadImportModel(name) {
      importModelDownload(name).then((response) => {
        if (name == 'styleImportModel') {
          this.fileDownload(response.data, '商品款式导入模板.xls')
        }
        if (name == 'codeImportModel') {
          this.fileDownload(response.data, '商品编号导入模板.xls')
        }
        if (name == 'matImportModel') {
          this.fileDownload(response.data, '物料辅料导入模板.xls')
        }
      })
    },
    // public method to download file
    fileDownload(data, name) {
      if (!data) {
        return
      }
      let url = window.URL.createObjectURL(new Blob([data]))
      let link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.setAttribute('download', name)
      document.body.appendChild(link)
      link.click()
      // release url object
      URL.revokeObjectURL(link.href)
      document.body.removeChild(link)
    },
    syncBatch(id, type) {
      this.syncLoading = true
      if (type == 3) {
        addMatBatchDataSync(id)
          .then((response) => {
            this.syncLoading = false
            this.request({
              pagination: this.serverPagination,
            })
          })
          .catch((error) => {
            this.syncLoading = false
          })
      } else if (type == 2) {
        addProdBatchDataSync(id)
          .then((response) => {
            this.syncLoading = false
            this.request({
              pagination: this.serverPagination,
            })
          })
          .catch((error) => {
            this.syncLoading = false
          })
      }
    },
    //dataTable request
    request({ pagination }) {
      this.loading = true
      this.searchForm.page = pagination.page
      this.searchForm.row = pagination.rowsPerPage
      getBatchLogList(this.searchForm)
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
  font-size 13px
.q-table tbody td
  font-size 15px
@media (min-width: 1200px)
  .layout-padding
    padding 1.5rem 1.5rem
</style>
