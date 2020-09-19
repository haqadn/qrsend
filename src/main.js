import Vue from 'vue'
import VueRouter from "vue-router"
import App from './App.vue'
import Transfer from './pages/Transfer.vue'
import VueSocketIO from 'vue-socket.io'
import { v4 as uuidv4 } from 'uuid';
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;
Vue.use(new VueSocketIO({
  debug: false,
  connection: '/'
}));
Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: { name: 'transfer', params: { uuid: uuidv4() } } },
  { path: '/:uuid', name: 'transfer', component: Transfer}
];
const router = new VueRouter({
  routes
});

new Vue({
  render: h => h(App),
  vuetify,
  router
}).$mount('#app');
