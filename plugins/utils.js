import Vue from 'vue';
import VueMask from 'v-mask';

// import axios from 'axios'
// import accounting from 'accounting'
import XLSX from 'xlsx';
// import VueNotifications from 'vue-notifications'

// Vue.use(VueNotifications)
// Vue.prototype.$http = axios
Vue.prototype.$XLSX = XLSX;
// Vue.prototype.$accounting = accounting

Vue.use(VueMask);
