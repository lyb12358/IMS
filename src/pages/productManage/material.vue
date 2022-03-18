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
        <q-btn
          v-show="resetBtnExist"
          icon="mdi-eraser"
          label="重置当前搜索"
          rounded
          color="dark"
          @click="resetSearchFormAndSearch"
        ></q-btn>
        <q-btn
          icon="mdi-magnify"
          label="搜索"
          rounded
          color="secondary"
          @click="searchFormDialogOpened=true"
        ></q-btn>
        <q-btn
          v-if="checkAuth(28)"
          icon="mdi-new-box"
          label="新建"
          rounded
          color="primary"
          @click="openMainMatModal('add',0)"
        ></q-btn>
        <!-- <q-btn icon="mdi-file-excel"
               rounded
               class="q-ma-xs"
               color="tertiary"
               @click="notify('warning','施工中~')">
          <q-tooltip>导出</q-tooltip>
        </q-btn>-->
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
        <q-btn
          flat
          rounded
          class="print-hide"
          v-if="props.inFullscreen"
          icon="mdi-printer"
          @click="printSth"
        >
          <q-tooltip>打印</q-tooltip>
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
          <q-td key="matCode" :props="props" style="text-align:center">
            <q-checkbox
              color="secondary"
              v-model="props.expand"
              checked-icon="mdi-minus"
              unchecked-icon="mdi-plus"
              class="q-mr-md"
            />
            {{ props.row.matCode }}
          </q-td>
          <q-td key="thumbnail" :props="props" style="text-align:center">
            <img
              :src="thumbnailCheck(props.row.id,props.row.thumbnail)"
              style="height: 80px; width: 80px;"
            >
          </q-td>
          <q-td
            key="matName"
            :props="props"
            :style="{textAlign:'center',maxWidth:'100px',whiteSpace:'normal'}"
          >
            {{ props.row.matName }}
            <q-btn
              flat
              v-show="checkAuth(31)"
              rounded
              color="info"
              class="print-hide"
              icon="mdi-tooltip-image"
              @click="imageCheck(props.row.id,props.row.image)"
            >
              <q-tooltip>图片预览</q-tooltip>
            </q-btn>
          </q-td>
          <q-td
            key="comId"
            :props="props"
            style="text-align:center"
          >{{ filterCom(props.row.comId,comOptions) }}</q-td>
          <q-td key="matFamily" :props="props" style="text-align:center">{{ props.row.familyName }}</q-td>
          <q-td key="matType" :props="props" style="text-align:center">{{ props.row.typeName }}</q-td>
          <q-td key="bigType" :props="props" style="text-align:center">{{ props.row.bigName }}</q-td>
          <q-td key="middleType" :props="props" style="text-align:center">{{ props.row.middleName }}</q-td>
          <q-td key="smallType" :props="props" style="text-align:center">{{ props.row.smallName }}</q-td>
          <q-td key="matCat" :props="props" style="text-align:center">{{ props.row.catName }}</q-td>
          <q-td key="matSpe" :props="props" style="text-align:center">{{ props.row.speName }}</q-td>
          <q-td
            key="retailPrice"
            :props="props"
            style="text-align:center"
          >{{ props.row.retailPrice}}</q-td>
          <q-td
            key="supplyPrice"
            :props="props"
            style="text-align:center"
          >{{ props.row.supplyPrice }}</q-td>
          <q-td key="costPrice" :props="props" style="text-align:center">{{ props.row.costPrice }}</q-td>
          <q-td key="matAttr" :props="props" style="text-align:center">{{ props.row.attrName}}</q-td>
          <q-td key="matYear" :props="props" style="text-align:center">{{ props.row.yearName}}</q-td>
          <q-td key="matColor" :props="props" style="text-align:center">{{ props.row.colorName}}</q-td>
          <q-td key="matUnit" :props="props" style="text-align:center">{{ props.row.unitName}}</q-td>
          <q-td key="boxWarn" :props="props" style="text-align:center">{{ props.row.boxWarn }}</q-td>
          <q-td key="boxNum" :props="props" style="text-align:center">{{ props.row.boxNum }}</q-td>
          <q-td key="numModel" :props="props" style="text-align:center">{{ props.row.numModel }}</q-td>
          <q-td key="boxVolume" :props="props" style="text-align:center">{{ props.row.boxVolume }}</q-td>
          <q-td key="boxWeight" :props="props" style="text-align:center">{{ props.row.boxWeight }}</q-td>
          <q-td key="isSync" :props="props" style="text-align:center">
            <q-icon
              :name="props.row.isSync?'mdi-check-circle':'mdi-sync-off'"
              size="1.5rem"
              :color="props.row.isSync?'positive':'negative'"
            />
          </q-td>
          <q-td
            key="gmtCreate"
            :props="props"
            style="text-align:center"
          >{{ formatDate(props.row.gmtCreate) }}</q-td>
          <q-td
            key="gmtModified"
            :props="props"
            style="text-align:center"
          >{{ formatDate(props.row.gmtModified) }}</q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <q-btn
              v-if="checkAuth(29)"
              icon="mdi-format-list-numbers"
              rounded
              color="orange"
              @click="openMainMatModal('update',props.row.id)"
            >
              <q-tooltip>修改物料辅料信息</q-tooltip>
            </q-btn>
            <q-btn
              v-if="checkAuth(30)"
              icon="mdi-image-plus"
              rounded
              color="secondary"
              @click="openImageUpload(props.row.id,props.row.matCode,props.row.matName)"
            >
              <q-tooltip>上传图片</q-tooltip>
            </q-btn>
            <a
              v-if="checkAuth(31)"
              :href="api+'/image/mat/'+props.row.id+'/'+props.row.image"
              :download="props.row.matName"
            >
              <q-btn
                icon="mdi-image-area-close"
                v-if="props.row.thumbnail!=null"
                rounded
                color="tertiary"
              >
                <q-tooltip>下载原图</q-tooltip>
              </q-btn>
            </a>
            <!-- <q-btn icon="mdi-clipboard-arrow-down"
                   rounded
                   color="orange"
                   @click="downloadSpec(props.row.id,props.row.matName )">
              <q-tooltip>下载物料说明书</q-tooltip>
            </q-btn>-->
            <q-btn
              v-if="checkAuth(166)"
              icon="mdi-pencil-box"
              rounded
              color="info"
              @click="openMatLogModal(3,props.row.id)"
            >
              <q-tooltip>查看日志</q-tooltip>
            </q-btn>
            <q-btn
              v-if="checkAuth(33)"
              icon="mdi-delete"
              rounded
              color="negative"
              @click="deleteMat(props.row.id)"
            >
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
    <!-- search modal -->
    <q-modal
      v-model="searchFormDialogOpened"
      no-backdrop-dismiss
      no-esc-dismiss
      no-refocus
      :content-css="{maxWidth: '50vw', minHeight: '60vh'}"
    >
      <q-modal-layout footer-class="no-shadow">
        <q-toolbar slot="header" :color="brandColor">
          <q-btn flat round dense v-close-overlay icon="mdi-arrow-left"/>
          <q-toolbar-title>搜索项</q-toolbar-title>
        </q-toolbar>
        <q-toolbar slot="footer" inverted>
          <div class="col-12 row justify-center">
            <div style="margin:0 1rem">
              <q-btn v-show="searchBtnExist" color="primary" label="确定" @click="search"/>
            </div>
            <div style="margin:0 1rem">
              <q-btn color="primary" label="重置" @click="resetSearchForm"/>
            </div>
            <div style="margin:0 1rem">
              <q-btn color="primary" v-close-overlay label="取消"/>
            </div>
          </div>
        </q-toolbar>
        <div class="layout-padding">
          <div class="row gutter-sm" @keyup.enter="search">
            <div class="col-xs-12 col-sm-6"  >
              <q-input v-model.trim="searchForm.matCode" class="no-margin" float-label="编号"/>
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-input v-model.trim="searchForm.matName" class="no-margin" float-label="名称"/>
            </div>
            <!-- <div class="col-xs-12 col-sm-6 ">
              <q-input v-model.trim="searchForm.typeName"
                       class="no-margin"
                       float-label="类别" />
            </div>-->
            <div class="col-xs-12 col-sm-6">
              <q-input v-model.trim="searchForm.bigName" class="no-margin" float-label="大类"/>
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-input v-model.trim="searchForm.middleName" class="no-margin" float-label="中类"/>
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-select
                v-model="searchForm.comId"
                float-label="品牌"
                filter
                radio
                :options="comOptions"
              />
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-datetime
                v-model="searchForm.gmtCreateStart"
                ref="gmtCreateStart"
                float-label="添加时间大于等于"
                clearable
                type="date"
              />
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-datetime
                v-model="searchForm.gmtCreateEnd"
                ref="gmtCreateEnd"
                float-label="添加时间小于等于"
                clearable
                type="date"
              />
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-datetime
                v-model="searchForm.gmtModifiedStart"
                ref="gmtModifiedStart"
                float-label="修改时间大于等于"
                clearable
                type="date"
              />
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-datetime
                v-model="searchForm.gmtModifiedEnd"
                ref="gmtModifiedEnd"
                float-label="修改时间小于等于"
                clearable
                type="date"
              />
            </div>
          </div>
        </div>
      </q-modal-layout>
    </q-modal>
    <!-- 新建物料modal -->
    <q-modal
      v-model="mainMatModalOpened"
      no-esc-dismiss
      no-backdrop-dismiss
      no-refocus
      :content-css="{minWidth: '80vw', minHeight: '80vh'}"
    >
      <q-modal-layout footer-class="no-shadow">
        <q-toolbar slot="header" :color="brandColor">
          <q-btn flat round dense v-close-overlay icon="mdi-arrow-left"/>
          <q-toolbar-title>{{modalActionName}}</q-toolbar-title>
        </q-toolbar>
        <q-toolbar slot="footer" inverted>
          <div class="col-12 row justify-center">
            <div v-if="modalActionName==='修改'" style="margin:0 2rem">
              <q-btn color="primary" :loading="modifyLoading" label="确定" @click="modifyMat"/>
            </div>
            <div v-if="modalActionName==='新增'" style="margin:0 2rem">
              <q-btn color="primary" :loading="newLoading" label="确定" @click="newMat"/>
            </div>
            <div v-if="modalActionName==='新增'" style="margin:0 2rem">
              <q-btn color="primary" label="重置" @click="resetMatModal"/>
            </div>
            <div style="margin:0 2rem">
              <q-btn color="primary" v-close-overlay label="取消"/>
            </div>
          </div>
        </q-toolbar>
        <div class="layout-padding">
          <div class="row gutter-sm">
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-field :error="$v.material.matCode.$error" error-label="物料编号必填，且不超过15位">
                <q-input
                  v-model.trim="material.matCode"
                  :readonly="modalActionName==='修改物料'?true:false"
                  class="no-margin"
                  float-label="物料编号"
                />
              </q-field>
            </div>
            <!-- <div class="col-xs-12  col-sm-6 col-md-3">
              <q-field :error="$v.material.matCode.$error"
                       error-label="编号是必填项，且不超过15位">
                <q-input v-model.trim="material.matCode"
                         class="no-margin"
                         float-label="编号" />
              </q-field>
            </div>-->
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-field :error="$v.material.matName.$error" error-label="名称是必填项，且不超过15位">
                <q-input v-model.trim="material.matName" class="no-margin" float-label="名称"/>
              </q-field>
            </div>
            <!-- <div class="col-xs-12  col-sm-6 col-md-3">
              <q-field :error="$v.productStyle.classLabel.$error"
                       error-label="商品类别必填">
                <q-input v-model="productStyle.classLabel"
                         ref="classInput"
                         readonly
                         @focus="openClassDialog()"
                         class="no-margin"
                         float-label="商品类别" />
              </q-field>
            </div>-->
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-field :error="$v.material.matFamily.$error" error-label="归属是必填项">
                <q-select
                  v-model="material.matFamily"
                  float-label="归属"
                  radio
                  :options="matFamilyOptions"
                />
              </q-field>
            </div>
            <!-- 20210419 -->
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-field :error="$v.material.comId.$error" error-label="品牌是必选">
                <q-select
                  v-model="material.comId"
                  float-label="品牌"
                  filter
                  radio
                  :options="comOptions"
                />
              </q-field>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-field :error="$v.material.matType.$error" error-label="归属是必填项">
                <q-select
                  v-model="material.matType"
                  float-label="类别"
                  radio
                  :options="matTypeOptions"
                />
              </q-field>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-field :error="$v.material.bigType.$error" error-label="大类是必填项">
                <q-select
                  v-model="material.bigType"
                  float-label="大类"
                  filter
                  radio
                  :options="bigTypeOptions"
                />
              </q-field>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <!-- <q-field :error="$v.material.middleType.$error"
              error-label="中类是必填项">-->
              <q-select
                v-model="material.middleType"
                float-label="中类"
                filter
                radio
                :options="middleTypeOptions"
              />
              <!-- </q-field> -->
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <!-- <q-field :error="$v.material.smallType.$error"
              error-label="小类是必填项">-->
              <q-select
                v-model="material.smallType"
                float-label="小类"
                filter
                radio
                :options="smallTypeOptions"
              />
              <!-- </q-field> -->
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-select
                v-model="material.matCat"
                float-label="品类"
                filter
                radio
                :options="matCatOptions"
              />
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-select
                v-model="material.matSpe"
                float-label="规格"
                filter
                radio
                :options="matSpeOptions"
              />
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-select
                v-model="material.matAttr"
                float-label="属性"
                radio
                :options="matAttrOptions"
              />
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-field :error="$v.material.retailPrice.$error" error-label="请填写有效值">
                <q-input v-model="material.retailPrice" class="no-margin" float-label="零售价"/>
              </q-field>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-field :error="$v.material.supplyPrice.$error" error-label="请填写有效值">
                <q-input v-model="material.supplyPrice" class="no-margin" float-label="供应价"/>
              </q-field>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-field :error="$v.material.costPrice.$error" error-label="请填写有效值">
                <q-input v-model="material.costPrice" class="no-margin" float-label="成本价"/>
              </q-field>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-select
                v-model="material.matYear"
                float-label="年份"
                filter
                radio
                :options="matYearOptions"
              />
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-select
                v-model="material.matUnit"
                float-label="单位"
                filter
                radio
                :options="matUnitOptions"
              />
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-select
                v-model="material.matColor"
                float-label="花色"
                filter
                radio
                :options="matColorOptions"
              />
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-field :error="$v.material.numModel.$error" error-label="请填写有效值">
                <q-input v-model="material.numModel" class="no-margin" float-label="件数"/>
              </q-field>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-field :error="$v.material.boxWarn.$error" error-label="请填写有效值">
                <q-input v-model="material.boxWarn" class="no-margin" float-label="散货预警量"/>
              </q-field>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-field :error="$v.material.boxNum.$error" error-label="请填写有效值">
                <q-input v-model="material.boxNum" class="no-margin" float-label="箱数量"/>
              </q-field>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-field :error="$v.material.boxVolume.$error" error-label="请填写有效值">
                <q-input v-model="material.boxVolume" class="no-margin" float-label="箱体积"/>
              </q-field>
            </div>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-field :error="$v.material.boxWeight.$error" error-label="请填写有效值">
                <q-input v-model="material.boxWeight" class="no-margin" float-label="箱重量"/>
              </q-field>
            </div>
          </div>
        </div>
      </q-modal-layout>
    </q-modal>
    <!-- select department -->
    <!-- <q-dialog v-model="departOpened"
              prevent-close
              noRefocus>
      <span slot="title">选择部门</span>
      <div slot="body">
        <q-tree :nodes="departProps"
                ref="departTree"
                color="primary"
                :selected.sync="departSelected"
                node-key="id" />
      </div>
      <template slot="buttons"
                slot-scope="props">
        <q-btn color="primary"
               @click="selectDepart"
               label="确定" />
        <q-btn color="primary"
               @click="departOpened = false"
               label="取消" />
      </template>
    </q-dialog>-->
    <!-- image preview -->
    <q-modal v-model="imagePreviewModalOpened" no-refocus :content-css="{ minHeight: '100vh'}">
      <q-modal-layout footer-class="no-shadow">
        <q-toolbar slot="header" :color="brandColor">
          <q-btn flat round dense v-close-overlay icon="mdi-arrow-left"/>
          <q-toolbar-title>图片预览</q-toolbar-title>
        </q-toolbar>
        <div>
          <img :src="imageAddress" style="height: 1000px; width: 1000px;">
        </div>
      </q-modal-layout>
    </q-modal>
    <!-- upload image -->
    <q-dialog v-model="imageUploadDialog" prevent-close>
      <span slot="title">上传图片</span>
      <span slot="message">点击"+"，选择清晰度较高的图片，将作为主要图片展示</span>
      <div slot="body">
        <q-uploader
          ref="imageUpload"
          :url="api+imageUploadUrl"
          :additionalFields="[
                      {'name':'id','value':this.expandId},
                      {'name':'matCode','value':this.expandStyle},
                      {'name':'matName','value':this.expandName}]"
          clearable
          auto-expand
          hide-upload-button
          float-label="上传图片"
          @uploaded="imageUploaded"
          @fail="imageUploadedFail"
          @add="addImageFile"
        />
      </div>
      <template slot="buttons" slot-scope="props">
        <q-btn color="primary" label="上传" @click="imageUpload"/>
        <q-btn color="primary" label="取消" @click="imageUploadCancel"/>
      </template>
    </q-dialog>
    <!-- matLog -->
    <q-modal
      v-model="matLogModalOpened"
      no-esc-dismiss
      no-backdrop-dismiss
      no-refocus
      :content-css="{minWidth: '50vw', minHeight: '50vh'}"
    >
      <q-modal-layout footer-class="no-shadow">
        <q-toolbar slot="header" :color="brandColor">
          <q-btn flat round dense v-close-overlay icon="mdi-arrow-left"/>
          <q-toolbar-title>物料日志</q-toolbar-title>
        </q-toolbar>
        <q-toolbar slot="footer" inverted>
          <div class="col-12 row justify-center">
            <q-btn color="primary" v-close-overlay label="取消"/>
          </div>
        </q-toolbar>
        <div class="layout-padding" style="max-width: 800px">
          <q-timeline style="padding: 0 24px;">
            <q-timeline-entry
              v-for="log in timelineBeanList"
              :key="log.id"
              :title="log.title"
              :color="log.color"
              :subtitle="log.subtitle"
            >
              <q-collapsible v-if="checkAuth(167)" indent icon="mdi-camera" label="物料快照">
                <div>{{log.detail}}</div>
              </q-collapsible>
            </q-timeline-entry>
          </q-timeline>
        </div>
      </q-modal-layout>
    </q-modal>
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
import { getOrgList } from 'src/api/organization'
import { getMatList, getMatById, addMat, updateMat } from 'src/api/material'
import {
  getProdClassOptions,
  getProdClassOptionsByParent,
  getProdParamOptions,
  getProdParamOptionsByParent,
  getProdCatOptions,
  getProdSpeOptionsByParent,
} from 'src/api/productParam'
import { specDownload } from 'src/api/productPlus'
import { getProdLogList } from 'src/api/log'
import { getBrandOptions } from 'src/api/organization'

export default {
  data() {
    return {
      api: process.env.API,
      resetBtnExist: false,
      searchBtnExist: false,
      searchFormDialogOpened: false,
      searchForm: {
        page: 0,
        row: 0,
        matCode: '',
        matName: '',
        typeName: '',
        bigName: '',
        middleName: '',
        gmtCreateStart: null,
        gmtCreateEnd: null,
        gmtModifiedStart: null,
        gmtModifiedEnd: null,
        comId: null,
      },
      loading: false,
      modifyLoading: false,
      newLoading: false,
      visibleColumns: [
        'matCode',
        'thumbnail',
        'matName',
        'matFamily',
        'matType',
        'bigType',
        'middleType',
        'smallType',
        'boxNum',
        'boxVolume',
        'isSync',
      ],
      separator: 'horizontal',
      serverPagination: {
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 5, // specifying this determines pagination is server-side
      },
      serverData: [],
      columns: [
        { name: 'matCode', label: '编号', field: 'matCode' },
        { name: 'thumbnail', label: '简图', field: 'thumbnail' },
        { name: 'matName', label: '名称', field: 'matName' },
        { name: 'comId', label: '品牌', field: 'comId' },
        { name: 'matFamily', label: '归属', field: 'matFamily' },
        { name: 'matType', label: '类别', field: 'matType' },
        { name: 'bigType', label: '大类', field: 'bigType' },
        { name: 'middleType', label: '中类', field: 'middleType' },
        { name: 'smallType', label: '小类', field: 'smallType' },
        { name: 'matCat', label: '品类', field: 'matCat' },
        { name: 'matSpe', label: '规格', field: 'matSpe' },
        { name: 'retailPrice', label: '零售价', field: 'retailPrice' },
        { name: 'supplyPrice', label: '供应价', field: 'supplyPrice' },
        { name: 'costPrice', label: '成本价', field: 'costPrice' },
        { name: 'matAttr', label: '属性', field: 'matAttr' },
        { name: 'matYear', label: '年份', field: 'matYear' },
        { name: 'matColor', label: '花色', field: 'matColor' },
        { name: 'matUnit', label: '单位', field: 'matUnit' },
        { name: 'numModel', label: '件数', field: 'numModel' },
        { name: 'boxWarn', label: '散货预警量', field: 'boxWarn' },
        { name: 'boxNum', label: '箱数量', field: 'boxNum' },
        { name: 'boxVolume', label: '箱体积', field: 'boxVolume' },
        { name: 'boxWeight', label: '箱重量', field: 'boxWeight' },
        { name: 'isSync', label: '是否同步', field: 'isSync' },
        { name: 'gmtCreate', label: '创建时间', field: 'gmtCreate' },
        { name: 'gmtModified', label: '修改时间', field: 'gmtModified' },
      ],
      //modal
      mainMatModalOpened: false,
      modalActionName: '',
      //modal content
      material: {
        id: 0,
        matCode: '',
        matName: '',
        matFamily: '',
        matType: '',
        bigType: '',
        middleType: '',
        smallType: '',
        matAttr: '',
        matCat: '',
        matSpe: '',
        retailPrice: 0,
        supplyPrice: 0,
        costPrice: 0,
        matYear: '',
        matUnit: '',
        matColor: '',
        numModel: '',
        boxWarn: '',
        boxNum: '',
        boxVolume: '',
        boxWeight: '',
        isDel: false,
        isSync: false,
        comId: null,
      },
      classList: [],
      matFamilyOptions: [],
      matTypeOptions: [],
      paramList: [],
      catList: [],
      matCatOptions: [],
      matSpeOptions: [],
      bigTypeOptions: [],
      middleTypeOptions: [],
      smallTypeOptions: [],
      matCatOptions: [],
      matSpeOptions: [],
      matAttrOptions: [],
      matYearOptions: [],
      matColorOptions: [],
      matUnitOptions: [],
      //image preview
      imageAddress: '',
      imagePreviewModalOpened: false,
      //upload image
      expandId: 0,
      expandStyle: '',
      expandName: '',
      imageUploadDialog: false,
      imageUploadUrl: '/imageUpload/mat',
      //matLog
      matLogModalOpened: false,
      timelineBeanList: [],
      //20210419
      comOptions: [],
    }
  },
  validations: {
    material: {
      matCode: { required, maxLength: maxLength(15) },
      matName: { required, maxLength: maxLength(20) },
      matFamily: { required },
      matType: { required },
      bigType: { required },
      comId: { required },
      // middleType: { required },
      // smallType: { required },
      boxWarn: { integer },
      boxNum: { integer },
      boxVolume: { decimal },
      boxWeight: { decimal },
      numModel: { integer },
      retailPrice: {
        decimal,
        minValue: minValue(0),
        maxValue: maxValue(999999),
      },
      supplyPrice: {
        decimal,
        minValue: minValue(0),
        maxValue: maxValue(999999),
      },
      costPrice: {
        decimal,
        minValue: minValue(0),
        maxValue: maxValue(999999),
      },
    },
  },
  computed: {
    permissions() {
      return this.$store.getters['user/permissions']
    },
    maintainProductPermission() {
      return this.$store.getters['user/maintainProductPermission']
    },
    brandColor() {
      return this.$store.getters['user/brandColor']
    },
  },
  watch: {
    //control v-show of reset btn
    searchForm: {
      deep: true,
      handler: function(newVal, oldVal) {
        if (
          (newVal.matCode != '') |
          (newVal.matName != '') |
          (newVal.typeName != '') |
          (newVal.attrName != '') |
          (newVal.bigName != '') |
          (newVal.middleName != '') |
          (newVal.comId != null) |
          (newVal.gmtCreateStart != null) |
          (newVal.gmtCreateEnd != null) |
          (newVal.gmtModifiedStart != null) |
          (newVal.gmtModifiedEnd != null)
        ) {
          this.searchBtnExist = true
        } else {
          this.searchBtnExist = false
        }
      },
    },
    //reset the matClass when it changes
    'material.matFamily': function(newVal, oldVal) {
      if (this.mainMatModalOpened && newVal != '') {
        this.bigTypeOptions = []
        this.middleTypeOptions = []
        this.smallTypeOptions = []
        this.matCatOptions = []
        this.matSpeOptions = []
        this.material.matType = ''
        this.material.bigType = ''
        this.material.middleType = ''
        this.material.smallType = ''
        this.material.matCat = ''
        this.material.matSpe = ''
        this.matTypeOptions = this.classList.filter(
          (item) => item.parentId == newVal
        )
      }
    },
    'material.matType': function(newVal, oldVal) {
      if (this.mainMatModalOpened && newVal != '') {
        this.middleTypeOptions = []
        this.smallTypeOptions = []
        this.matCatOptions = []
        this.matSpeOptions = []
        this.material.bigType = ''
        this.material.middleType = ''
        this.material.smallType = ''
        this.material.matCat = ''
        this.material.matSpe = ''
        this.bigTypeOptions = this.classList.filter(
          (item) => item.parentId == newVal
        )
      }
    },
    'material.bigType': function(newVal, oldVal) {
      if (this.mainMatModalOpened && newVal != '') {
        this.smallTypeOptions = []
        this.material.middleType = ''
        this.material.smallType = ''
        this.material.matCat = ''
        this.material.matSpe = ''
        getProdSpeOptionsByParent(newVal).then((response) => {
          let data = response.data.data
          this.matSpeOptions = data
        })
        this.middleTypeOptions = this.classList.filter(
          (item) => item.parentId == newVal
        )
        this.matCatOptions = this.catList.filter(
          (item) => item.classId == newVal
        )
      }
    },
    'material.middleType': function(newVal, oldVal) {
      if (this.mainMatModalOpened && newVal != '') {
        this.material.smallType = ''
        this.smallTypeOptions = this.classList.filter(
          (item) => item.parentId == newVal
        )
      }
    },
  },
  methods: {
    checkAuth(auth) {
      if (this.permissions.indexOf(1) > -1) {
        return true
      }
      if (this.permissions.indexOf(auth) > -1) {
        return true
      } else {
        return false
      }
    },
    formatDate(timeStamp) {
      return date.formatDate(timeStamp, 'YYYY-MM-DD HH:mm:ss')
    },
    resetSearchForm() {
      Object.assign(this.searchForm, this.$options.data.call(this).searchForm)
    },
    resetSearchFormAndSearch() {
      this.resetSearchForm()
      this.$nextTick(() => {
        this.search()
        this.resetBtnExist = false
      })
    },
    search() {
      this.searchFormDialogOpened = false
      this.serverPagination.page = 1
      this.request({
        pagination: this.serverPagination,
      })
      this.resetBtnExist = true
    },
    printSth() {
      window.print()
    },
    notify(type, message) {
      this.$q.notify({
        message: message,
        type: type,
      })
    },
    //modal input depart permission check
    // checkDepartPermission() {
    //   if (this.myPermissions.indexOf('superAdmin') > -1) {
    //     this.departOpened = true
    //   }
    // },
    //main modal function
    openMainMatModal(action, id) {
      this.$v.material.$reset()
      if (action === 'add') {
        this.modalActionName = '新增'
        Object.assign(this.material, this.$options.data.call(this).material)
        this.$nextTick(() => {
          this.mainMatModalOpened = true
        })
      } else if (action === 'update') {
        // if (
        //   departId != this.myDepart &&
        //   this.myPermissions.indexOf('superAdmin') < 0
        // ) {
        //   this.notify('warning', '无权维护非本部门商品')
        //   return
        // }
        this.modalActionName = '修改'
        getMatById(id).then((response) => {
          let material = response.data.data
          //check matType permission
          let mt = material.matType
          mt += ''
          if (
            this.permissions.indexOf(1) < 0 &&
            this.maintainProductPermission.indexOf(mt) < 0
          ) {
            this.notify('warning', '无权维护该类别物料及辅料')
            return
          }
          Object.assign(this.material, material)
          let bigType = material.bigType
          getProdSpeOptionsByParent(bigType).then((response) => {
            let data = response.data.data
            this.matSpeOptions = data
          })
          // filter util need string parameter
          let matFamily = material.matFamily
          let matType = material.matType
          let middleType = material.middleType
          this.matTypeOptions = this.classList.filter(
            (item) => item.parentId == matFamily
          )
          this.bigTypeOptions = this.classList.filter(
            (item) => item.parentId == matType
          )
          this.middleTypeOptions = this.classList.filter(
            (item) => item.parentId == bigType
          )
          this.smallTypeOptions = this.classList.filter(
            (item) => item.parentId == middleType
          )
          this.matCatOptions = this.catList.filter(
            (item) => item.classId == bigType
          )
          this.$nextTick(() => {
            this.mainMatModalOpened = true
          })
        })
      }
    },
    //add product
    // selectDepart() {
    //   if (this.departSelected == '') {
    //     this.notify('warning', '请选择一个部门')
    //     return
    //   }
    //   if (
    //     this.$refs.departTree.getNodeByKey(this.departSelected).isParent == 1
    //   ) {
    //     this.notify('warning', '商品绑定到部门，而非公司')
    //     this.departSelected = ''
    //     return
    //   }
    //   this.productStyle.departId = this.$refs.departTree.getNodeByKey(
    //     this.departSelected
    //   ).id
    //   this.productStyle.departLabel = this.$refs.departTree.getNodeByKey(
    //     this.departSelected
    //   ).label
    //   this.departOpened = false
    // },
    // selectClass() {
    //   if (this.classSelected == '') {
    //     this.notify('warning', '请选择一个类别')
    //     return
    //   }
    //   if (this.$refs.classTree.getNodeByKey(this.classSelected).isParent == 1) {
    //     this.notify('warning', '只能选择子类')
    //     this.classSelected = ''
    //     return
    //   }
    //   this.productStyle.prodClass = this.$refs.classTree.getNodeByKey(
    //     this.classSelected
    //   ).id
    //   this.productStyle.classLabel = this.$refs.classTree.getNodeByKey(
    //     this.classSelected
    //   ).label
    //   this.classOpened = false
    // },

    //upload image
    openImageUpload(id, matCode, matName) {
      this.expandId = id
      this.expandStyle = matCode
      this.expandName = matName
      this.imageUploadDialog = true
    },
    addImageFile(files) {
      if (files[0].size > 5 * 1024 * 1024) {
        this.$refs.imageUpload.reset()
        this.notify('warning', '图片不能大于5MB')
      }
    },
    imageUpload() {
      this.$refs.imageUpload.upload()
    },
    imageUploadCancel() {
      this.$refs.imageUpload.reset()
      this.imageUploadDialog = false
    },
    // when image has just bean uploaded
    imageUploaded(file, xhr) {
      let response = JSON.parse(xhr.response)
      if (response.code == 20000) {
        this.notify('positive', response.msg)
        this.$refs.imageUpload.reset()
        this.imageUploadDialog = false
        this.request({
          pagination: this.serverPagination,
        })
      } else {
        this.notify('negative', response.msg)
        this.$refs.imageUpload.reset()
      }
    },
    // when it has encountered error while uploading
    imageUploadedFail(file, xhr) {
      let response = JSON.parse(xhr.response)
      this.notify('negative', response.data.msg)
    },
    //check thumbnail
    thumbnailCheck(id, thumbnail) {
      if (!(thumbnail === null)) {
        return this.api + '/image/mat/' + id + '/' + thumbnail
      } else {
        return 'statics/noImage.jpg'
      }
    },
    //image preview
    imageCheck(id, image) {
      if (!(image === null) && !(image === '')) {
        this.imageAddress = this.api + '/image/mat/' + id + '/' + image
      } else {
        this.imageAddress = 'statics/noImage.jpg'
      }
      this.imagePreviewModalOpened = true
    },
    newMat() {
      //check matType permission
      let mt = this.material.matType
      mt += ''
      if (
        this.permissions.indexOf(1) < 0 &&
        this.maintainProductPermission.indexOf(mt) < 0
      ) {
        this.notify('warning', '无权维护该类别物料及辅料')
        return
      }
      this.$v.material.$touch()
      if (this.$v.material.$invalid) {
        return
      }
      this.$v.material.$reset()
      this.newLoading = true
      this.material.status = 1
      this.material.isDel = 0
      this.material.isSync = 1
      this.material.gmtCreate = Date.now()
      addMat(this.material)
        .then((response) => {
          let data = response.data
          this.mainMatModalOpened = false
          this.newLoading = false
          Object.assign(this.material, this.$options.data.call(this).material)
          this.notify('positive', data.msg)
          this.request({
            pagination: this.serverPagination,
          })
        })
        .catch((error) => {
          this.newLoading = false
        })
    },
    modifyMat() {
      this.$v.material.$touch()
      if (this.$v.material.$invalid) {
        return
      }
      this.$v.material.$reset()
      this.modifyLoading = true
      //this.material.isSync = 1
      this.material.status = 1
      this.material.gmtCreate = ''
      this.material.gmtModified = ''
      updateMat(this.material)
        .then((response) => {
          let data = response.data
          this.mainMatModalOpened = false
          this.modifyLoading = false
          Object.assign(this.material, this.$options.data.call(this).material)
          this.notify('positive', data.msg)
          this.request({
            pagination: this.serverPagination,
          })
        })
        .catch((error) => {
          this.modifyLoading = false
        })
    },
    resetMatModal() {
      Object.assign(this.material, this.$options.data.call(this).material)
      this.$nextTick(() => {
        this.$v.material.$reset()
      })
    },
    //download specification
    downloadSpec(id, name) {
      specDownload(id).then((response) => {
        this.fileDownload(response.data, name + '物料说明书.pdf')
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
    // matLog
    openMatLogModal(type, id) {
      getProdLogList(type, id)
        .then((response) => {
          let data = response.data.data
          this.timelineBeanList = data
          this.matLogModalOpened = true
        })
        .catch((error) => {})
    },
    // delete mat
    deleteMat() {
      this.notify('warning', '删除了哦')
    },
    //filter com
    filterCom(value, list) {
      for (let com of list) {
        if (com.value == value) {
          return com.label
        }
      }
    },
    //dataTable request
    request({ pagination }) {
      this.loading = true
      this.searchForm.page = pagination.page
      this.searchForm.row = pagination.rowsPerPage
      getMatList(this.searchForm)
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
    // once mounted, we need to trigger the initial server data fetch
    this.request({
      pagination: this.serverPagination,
    })
    //once mounted, fetch some product parameters
    getProdClassOptions().then((response) => {
      let data = response.data.data
      this.classList = data
      let list = data.filter((item) => item.parentId == 0)
      // abandon prod
      for (let i = 0; i < list.length; i++) {
        let id = list[i].value
        if (id == 267 || id == 697 || id == 765) {
          this.matFamilyOptions.push(list[i])
        }
      }
    })
    getProdParamOptions().then((response) => {
      let data = response.data.data
      this.paramList = data
      this.matAttrOptions = data.filter((item) => item.parentId == 606)
      this.matYearOptions = data.filter((item) => item.parentId == 464)
      this.matUnitOptions = data.filter((item) => item.parentId == 458)
      this.matColorOptions = data.filter((item) => item.parentId == 466)
    })
    //fetch all the categories
    getProdCatOptions().then((response) => {
      let data = response.data.data
      this.catList = data
    })
    //20210419品牌
    getBrandOptions().then((response) => {
      let data = response.data.data
      this.comOptions = data
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
