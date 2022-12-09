// Configuration for your app

module.exports = function (ctx) {
  return {
    plugins: [
      'i18n',
      'axios',
      'vue-echarts',
      'vue-simply-markdown',
      'vuelidate',
      'route-permission',
      'draggable'
    ],
    css: [
      'app.styl'
    ],
    extras: [
      ctx.theme.mat ? 'roboto-font' : null,
      ctx.theme.ios ? 'ionicons' : null,
      'material-icons',
      'mdi'
    ],
    supportIE: true,
    build: {
      scopeHoisting: true,
      vueRouterMode: 'hash',
      // vueCompiler: true,
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      extendWebpack(cfg) {
        cfg.module.rules.push({
          test: /\.md$/,
          loader: 'text-loader'
        })
      },
      env: ctx.dev
        ? { // so on dev we'll have
          API: JSON.stringify('/api')
        }
        : { // and on build (production):
          API: JSON.stringify('https://ims-backend.beyond-itservice.com')
        }
    },
    devServer: {
      //https: true,
      port: 9089,
      open: true, // opens browser window automatically
      index: '/',
      proxy: {
        // proxy all requests starting with /api to jsonplaceholder
        '/api': {
          target: 'http://11.12.1.164:8080',
          changeOrigin: true,
          pathRewrite: {
            '^/api': ''
          }
        }
      }
    },
    // framework: 'all' --- includes everything; for dev only!
    framework: {
      components: [
        'QLayout',
        'QLayoutHeader',
        'QLayoutDrawer',
        'QLayoutFooter',
        'QPageContainer',
        'QPageSticky',
        'QPage',
        'QScrollArea',
        'QToolbar',
        'QToolbarTitle',
        'QBtn',
        'QIcon',
        'QList',
        'QCollapsible',
        'QListHeader',
        'QField',
        'QItem',
        'QItemMain',
        'QItemSide',
        'QItemTile',
        'QItemSeparator',
        'QTable',
        'QTh',
        'QTr',
        'QTd',
        'QTableColumns',
        'QSelect',
        'QToggle',
        'QTooltip',
        'QInput',
        'QCard',
        'QCardTitle',
        'QCardMain',
        'QCardMedia',
        'QCardSeparator',
        'QCardActions',
        'QChip',
        'QCheckbox',
        'QTree',
        'QDialog',
        'QModal',
        'QModalLayout',
        'QSearch',
        'QUploader',
        'QTabs',
        'QTab',
        'QTabPane',
        'QRouteTab',
        'QInnerLoading',
        'QSpinnerGears',
        'QAjaxBar',
        'QAutocomplete',
        'QBtnDropdown',
        'QBtnGroup',
        'QOptionGroup',
        'QPopupEdit',
        'QDatetime',
        'QTimeline',
        'QTimelineEntry',
        'QJumbotron'
      ],
      directives: [
        'Ripple',
        'CloseOverlay'
      ],
      plugins: [
        'Notify',
        'LocalStorage',
        'SessionStorage',
        'Dialog'
      ],
      config: {
        notify: {
          position: 'top-right',
          timeout: 1500
        },
        cordova: {
          iosStatusBarPadding: true, // add the dynamic top padding on iOS mobile devices
          backButtonExit: false  // Quasar handles app exit on mobile phone back button
        }
      },
      i18n: 'zh-hans',
      iconSet: ctx.theme.mat ? 'material-icons' : 'ionicons'
    },
    animations: 'all',
    // animations: [
    // ],
    ssr: {
      pwa: false
    },
    pwa: {
      // workboxPluginMode: 'InjectManifest',
      // workboxOptions: {},
      manifest: {
        // name: 'Quasar App',
        // short_name: 'Quasar-PWA',
        // description: 'Best PWA App in town!',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            'src': 'statics/icons/icon-128x128.png',
            'sizes': '128x128',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-192x192.png',
            'sizes': '192x192',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-256x256.png',
            'sizes': '256x256',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-384x384.png',
            'sizes': '384x384',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-512x512.png',
            'sizes': '512x512',
            'type': 'image/png'
          }
        ]
      }
    },
    cordova: {
      // id: 'org.cordova.quasar.app'
    },
    electron: {
      // bundler: 'builder', // or 'packager'
      extendWebpack(cfg) {
        // do something with Electron process Webpack cfg
      },
      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Window only
        // win32metadata: { ... }
      },
      builder: {
        // https://www.electron.build/configuration/configuration

        // appId: 'IMS'
      }
    }
  }
}
