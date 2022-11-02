import Vue from 'vue';
import Maska from 'maska';
import VuetifyConfirm from 'vuetify-confirm';

Vue.use(Maska);

export default ({ app }) => {
	Vue.use(VuetifyConfirm, { vuetify: app.vuetify });
};
