<template>
	<v-dialog
		v-model="dialog"
		:max-width="options.width"
		:style="{ zIndex: options.zIndex }"
		@keydown.esc="cancel"
		:persistent="options.persistent || false"
	>
		<v-card>
			<v-toolbar dark :color="options.color" dense flat>
				<v-toolbar-title
					class="white--text"
					v-html="title"
				></v-toolbar-title>
			</v-toolbar>
			<v-card-text
				v-show="!!message"
				class="pa-4"
				v-html="message"
			></v-card-text>
			<v-card-actions class="pt-0">
				<v-spacer v-if="!options.spacer"></v-spacer>
				<v-btn
					color="error darken-1"
					text
					@click.native="agree"
					outlined
					>{{ options.okText || 'Yes' }}</v-btn
				>
				<v-spacer v-if="options.spacer"></v-spacer>
				<v-btn
					color="grey"
					text
					@click.native="cancel"
					outlined
					ref="cfmBtnCancel"
					v-if="!options.disableCancel"
					>{{ options.cancelText || 'Cancel' }}</v-btn
				>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
/**
 * Vuetify Confirm Dialog component
 *
 * Insert component where you want to use it:
 * <confirm ref="confirm"></confirm>
 *
 * Call it:
 * this.$refs.confirm.open('Delete', 'Are you sure?', { color: 'red' }).then((confirm) => {})
 * Or use await:
 * if (await this.$refs.confirm.open('Delete', 'Are you sure?', { color: 'red' })) {
 *   // yes
 * }
 * else {
 *   // cancel
 * }
 *
 * Alternatively you can place it in main App component and access it globally via this.$root.$confirm
 * <template>
 *   <v-app>
 *     ...
 *     <confirm ref="confirm"></confirm>
 *   </v-app>
 * </template>
 *
 * mounted() {
 *   this.$root.$confirm = this.$refs.confirm.open
 * }
 */
export default {
	data: () => ({
		dialog: false,
		resolve: null,
		reject: null,
		message: null,
		title: null,
		options: {
			color: 'primary',
			width: 290,
			zIndex: 200,
		},
	}),
	methods: {
		open(title, message, options) {
			this.dialog = true;
			this.title = title;
			this.message = message;
			this.options = Object.assign(this.options, options);
			return new Promise((resolve, reject) => {
				this.resolve = resolve;
				this.reject = reject;
			});
		},
		agree() {
			this.resolve(true);
			this.dialog = false;
		},
		cancel() {
			this.resolve(false);
			this.dialog = false;
		},
	},
	watch: {
		dialog(visible) {
			if (visible) {
				console.log('Dialog Confirm was opened!');
				// this.$refs['cfmBtnCancel'].focus();
				// console.log(this.$nuxt);
			} else {
				console.log('Dialog Confirm was closed!');
			}
		},
	},
};
</script>
