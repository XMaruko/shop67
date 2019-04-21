import Vue from 'vue'
import App from './App'
import router from './router'

// 引入当前项目的全局css样式控制文件
import './assets/css/global.css'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
