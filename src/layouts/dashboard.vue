<template>
  <q-layout view="lHh Lpr lFr">
    <q-layout-header>
      <q-toolbar :color="brandColor">
        <q-btn flat dense round @click="leftDrawerOpen = !leftDrawerOpen">
          <q-icon name="mdi-menu"/>
          <q-tooltip>显示/隐藏菜单栏</q-tooltip>
        </q-btn>

        <q-toolbar-title style="font-weight:bold">
          {{$route.meta.title}}
          <div slot="subtitle">IT Center</div>
        </q-toolbar-title>
        <q-btn-dropdown flat label="主题" icon="mdi-palette">
          <q-list link class="no-padding">
            <q-item
              v-close-overlay
              class="bg-light-blue-6"
              @click.native="brandFlag='light-blue-6'"
            >
              <q-item-main>
                <q-item-tile label>静谧幽兰</q-item-tile>
              </q-item-main>
            </q-item>
            <q-item v-close-overlay class="bg-amber-6" @click.native="brandFlag='amber-6'">
              <q-item-main>
                <q-item-tile label>凡尔赛</q-item-tile>
              </q-item-main>
            </q-item>
            <q-item v-close-overlay class="bg-pink-4" @click.native="brandFlag='pink-4'">
              <q-item-main>
                <q-item-tile label>霞缛云嫣</q-item-tile>
              </q-item-main>
            </q-item>
            <q-item
              v-close-overlay
              class="bg-deep-purple-4"
              @click.native="brandFlag='deep-purple-4'"
            >
              <q-item-main>
                <q-item-tile label>奢语夜魅</q-item-tile>
              </q-item-main>
            </q-item>
            <q-item
              v-close-overlay
              class="bg-light-green-6"
              @click.native="brandFlag='light-green-6'"
            >
              <q-item-main>
                <q-item-tile label>潮流素客</q-item-tile>
              </q-item-main>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn flat label="退出" @click="logout()" icon="mdi-logout"></q-btn>
      </q-toolbar>
    </q-layout-header>

    <!-- <q-layout-footer>
      <q-toolbar color="primary">
      </q-toolbar>
    </q-layout-footer>-->
    <q-layout-drawer
      v-model="leftDrawerOpen"
      :content-style="backImage"
      :content-class="['text-white']"
      :breakpoint="1200"
    >
      <q-scroll-area :style="backColor">
        <q-list no-border link inset-delimiter style="padding:0">
          <q-card class="no-shadow">
            <div class="row flex-center" style="height: 100px">
              <!-- <img src="~assets/logo.png"
              style="height: 75px; width 75px;">-->
              <div class="text-italic" style="font-weight:800;font-size:3em;">CMS</div>
              <div class="caption q-ml-lg text-white">v1.2.0</div>
            </div>
            <q-item-separator/>
            <q-item>
              <q-item-side :avatar="avatarLcation"/>
              <q-item-main>
                <q-item-tile label>{{userName}}</q-item-tile>
                <!-- <q-item-tile sublabel>{{comName}} {{departName}}</q-item-tile> -->
              </q-item-main>
              <!-- <q-item-main>
              <q-item-tile label>角色：管理员</q-item-tile>
              </q-item-main>-->
              <q-btn flat icon="mdi-settings" @click="openPasswordDialog()">
                <q-tooltip>修改密码</q-tooltip>
              </q-btn>
            </q-item>
          </q-card>
          <q-item @click.native="$router.push('/')">
            <q-item-side icon="mdi-home" color="white"/>
            <q-item-main label="主页"/>
          </q-item>
          <q-collapsible v-if="checkAuth(3)|checkAuth(4)">
            <template slot="header">
              <q-item-side icon="mdi-account-multiple" color="white"/>
              <q-item-main label="用户管理"/>
            </template>
            <q-item link v-if="checkAuth(3)" @click.native="$router.push('user')" class="q-ml-xl">
              <q-item-main label="用户"/>
            </q-item>
            <q-item link v-if="checkAuth(4)" @click.native="$router.push('role')" class="q-ml-xl">
              <q-item-main label="角色"/>
            </q-item>
          </q-collapsible>
          <q-collapsible v-if="checkAuth(5)">
            <template slot="header">
              <q-item-side icon="mdi-domain" color="white"/>
              <q-item-main label="组织管理"/>
            </template>
            <q-item
              link
              v-if="checkAuth(5)"
              @click.native="$router.push('comManage')"
              class="q-ml-xl"
            >
              <q-item-main label="公司/部门管理"/>
            </q-item>
          </q-collapsible>
          <q-collapsible v-if="checkAuth(6)|checkAuth(7)|checkAuth(8)|checkAuth(9)">
            <template slot="header">
              <q-item-side icon="mdi-layers" color="white"/>
              <q-item-main label="商品管理"/>
            </template>
            <q-item
              link
              v-if="checkAuth(6)"
              @click.native="$router.push('productCode')"
              class="q-ml-xl"
            >
              <q-item-main label="商品编号管理"/>
            </q-item>
            <q-item
              link
              v-if="checkAuth(7)"
              @click.native="$router.push('productStyle')"
              class="q-ml-xl"
            >
              <q-item-main label="商品款式管理"/>
            </q-item>
            <q-item
              link
              v-if="checkAuth(8)"
              @click.native="$router.push('material')"
              class="q-ml-xl"
            >
              <q-item-main label="物料辅料管理"/>
            </q-item>
            <q-item
              link
              v-if="checkAuth(9)"
              @click.native="$router.push('productCat')"
              class="q-ml-xl"
            >
              <q-item-main label="类别管理"/>
            </q-item>
            <q-item
              link
              v-if="$q.platform.is.cordova"
              @click.native="$router.push('productCard')"
              class="q-ml-xl"
            >
              <q-item-main label="商品卡片"/>
            </q-item>
            <q-item
              link
              v-if="checkAuth(169)"
              @click.native="$router.push('batch')"
              class="q-ml-xl"
            >
              <q-item-main label="批量操作"/>
            </q-item>
          </q-collapsible>
          <q-item v-if="checkAuth(10)" @click.native="$router.push('changeLog')">
            <q-item-side icon="mdi-book-open" color="white"/>
            <q-item-main label="更新日志"/>
          </q-item>
          <q-item-separator/>
          <q-list-header class="text-white">外部链接</q-list-header>
          <q-item @click.native="openURL('https://lyb12358.github.io/IMS/')">
            <q-item-side icon="mdi-library-books" color="white"/>
            <q-item-main label="说明书"/>
          </q-item>
          <q-item @click.native="openURL('http://hao.china-beyond.com/')">
            <q-item-side icon="mdi-compass" color="white"/>
            <q-item-main label="导航"/>
          </q-item>
          <q-item @click.native="openURL('http://beyond-oa.com/')">
            <q-item-side icon="mdi-briefcase" color="white"/>
            <q-item-main label="OA"/>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-layout-drawer>

    <q-page-container>
      <transition
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
        mode="out-in"
        :duration="300"
        @leave="resetScroll"
      >
        <router-view/>
      </transition>
    </q-page-container>
    <!-- modify password dialog -->
    <q-dialog v-model="passwordDialogOpened" no-refocus prevent-close>
      <span slot="title">修改密码</span>
      <div slot="body">
        <q-field
          icon="mdi-textbox-password"
          class="q-mt-lg"
          label="密码"
          :label-width="4"
          :error="$v.user.firstPassword.$error"
          error-label="密码6位至20位，至少有一位数字和字母"
        >
          <q-input v-model.trim="user.firstPassword" type="password"/>
        </q-field>
        <q-field
          icon="mdi-textbox-password"
          class="q-mt-lg"
          label="再次输入"
          :label-width="4"
          :error="$v.user.secondPassword.$error"
          error-label="要与第一栏相同"
        >
          <q-input v-model.trim="user.secondPassword" type="password"/>
        </q-field>
      </div>
      <template slot="buttons" slot-scope="props">
        <q-btn color="primary" @click="modifyPassword(userId,user.firstPassword)" label="确定"/>
        <q-btn color="primary" v-close-overlay label="取消"/>
      </template>
    </q-dialog>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'
import {
  minLength,
  required,
  sameAs,
  maxLength,
} from 'vuelidate/lib/validators'
import { updatePassword } from 'src/api/userManage'
export default {
  name: 'dashboard',
  data() {
    return {
      brandFlag: 'light-green-6',
      leftDrawerOpen: true,
      passwordDialogOpened: false,
      user: {
        firstPassword: '',
        secondPassword: '',
      },
    }
  },
  validations: {
    user: {
      firstPassword: {
        required,
        minLength: minLength(6),
        maxLength: maxLength(20),
        valid: function(value) {
          const containsUppercase = /[A-Z]/.test(value)
          const containsLowercase = /[a-z]/.test(value)
          const containsNumber = /[0-9]/.test(value)
          const containsSpecial = /[#?!@$%^&*-]/.test(value)
          return (containsUppercase || containsLowercase) && containsNumber
        },
      },
      secondPassword: {
        required,
        minLength: minLength(6),
        sameAsPassword: sameAs('firstPassword'),
      },
    },
  },
  computed: {
    permissions() {
      return this.$store.getters['user/permissions']
    },
    userName() {
      return this.$store.getters['user/userInfo'].name
    },
    userId() {
      return this.$store.getters['user/userInfo'].id
    },
    brandColor() {
      return this.$store.getters['user/brandColor']
    },
    backImage() {
      if (this.brandFlag == 'light-blue-6') {
        return { background: 'url(statics/10422.jpg) no-repeat' }
      } else if (this.brandFlag == 'amber-6') {
        return { background: 'url(statics/10092.jpg) no-repeat' }
      } else if (this.brandFlag == 'pink-4') {
        return { background: 'url(statics/10112.jpg) no-repeat' }
      } else if (this.brandFlag == 'deep-purple-4') {
        return { background: 'url(statics/10322.jpg) no-repeat' }
      } else if (this.brandFlag == 'light-green-6') {
        return { background: 'url(statics/12832.jpg) no-repeat' }
      }
    },
    backColor() {
      if (this.brandFlag == 'light-blue-6') {
        return 'width: 100%; height: 100%;background-color:rgba(41,182,246,0.6);'
      } else if (this.brandFlag == 'amber-6') {
        return 'width: 100%; height: 100%;background-color:rgba(255,213,79,0.6);'
      } else if (this.brandFlag == 'pink-4') {
        return 'width: 100%; height: 100%;background-color:rgba(240,98,146,0.6);'
      } else if (this.brandFlag == 'deep-purple-4') {
        return 'width: 100%; height: 100%;background-color:rgba(149,117,205,0.7);'
      } else if (this.brandFlag == 'light-green-6') {
        return 'width: 100%; height: 100%;background-color:rgba(139,195,74,0.6);'
      }
    },
    // departName() {
    //   return this.$store.getters['user/userInfo'].departName
    // },
    // comName() {
    //   return this.$store.getters['user/userInfo'].comName
    // },
    avatarLcation() {
      if (this.permissions.indexOf(1) > -1) {
        return 'statics/logo/personal_logo.jpg'
      } else {
        return 'statics/sad.svg'
      }
    },
  },
  watch: {
    brandFlag: function(newVal, oldVal) {
      if (newVal == 'light-blue-6') {
        this.$store.commit('user/SetBrandColor', 'light-blue-6')
      } else if (newVal == 'amber-6') {
        this.$store.commit('user/SetBrandColor', 'amber-6')
      } else if (newVal == 'pink-4') {
        this.$store.commit('user/SetBrandColor', 'pink-4')
      } else if (newVal == 'deep-purple-4') {
        this.$store.commit('user/SetBrandColor', 'deep-purple-4')
      } else if (newVal == 'light-green-6') {
        this.$store.commit('user/SetBrandColor', 'light-green-6')
      } else {
        this.$store.commit('user/SetBrandColor', 'light-green-6')
      }
    },
  },
  methods: {
    openURL,
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
    logout() {
      this.$q
        .dialog({
          title: '退出登录',
          message: '你确定要退出登录吗？',
          ok: '确定',
          cancel: '取消',
        })
        .then(() => {
          this.$store.dispatch('user/FedLogout').then(() => {
            this.$router.push('/auth/login')
            this.notify('positive', '已登出')
          })
        })
    },
    notify(type, message) {
      this.$q.notify({
        message: message,
        type: type,
      })
    },
    resetScroll(el, done) {
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      done()
    },
    //reset password
    openPasswordDialog() {
      this.$v.user.$reset()
      Object.assign(this.user, this.$options.data.call(this).user)
      this.passwordDialogOpened = true
    },
    modifyPassword(id, password) {
      this.$v.user.$touch()
      if (this.$v.user.$invalid) {
        return
      }
      this.$v.user.$reset()
      updatePassword(id, password).then((response) => {
        let data = response.data
        this.notify('positive', data.msg)
        this.passwordDialogOpened = false
      })
    },
  },
  mounted() {
    this.brandFlag = this.brandColor
  },
}
</script>

<style lang="stylus">
@import '~variables'
.force-color
  color: $primary
</style>
