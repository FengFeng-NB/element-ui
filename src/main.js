import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'

import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//  导入富文本编辑器样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
import axios from 'axios'
// 配置请求的跟路径
axios.defaults.baseURL = 'http://47.115.124.102:8888/api/private/v1/'
// 设置拦截器
// config为请求对象
axios.interceptors.request.use(config=>{
  console.log(config);
  config.headers.Authorization=window.sessionStorage.getItem('token')
  // 必须返回config
  return config
})

// $http可以自定义名字
Vue.prototype.$http=axios

Vue.config.productionTip = false

Vue.component('tree-table',TreeTable)

// /注册为全局的
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
