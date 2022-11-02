<template>
	<v-snackbar
		:color="color"
		:timeout="timeout"
		v-model="showSnackbar"
		:bottom="bottom"
		:top="top"
		:left="left"
		:right="right"
		:outlined="outlined"
		:rounded="rounded"
		centered
		dark
	>
		<v-icon left v-if="icon">{{ icon }}</v-icon
		>{{ message }}
		<template v-slot:action="{ attrs }">
			<v-btn
				color="pink"
				text
				v-bind="attrs"
				@click="showSnackbar = false"
			>
				Close
			</v-btn>
		</template>
	</v-snackbar>
</template>

<script>
export default {
	name: 'Snackbar',
	data() {
		return {
			showSnackbar: false,
			message: '',
			color: null,
			icon: null,
			timeout: null,
			left: false,
			top: false,
			bottom: false,
			right: false,
			outlined: false,
			rounded: null,
		};
	},
	methods: {
		show(data) {
			this.showSnackbar = false;
			this.message = data.message || 'missing "message".';
			this.color = data.color || 'black';
			this.timeout = data.timeout || 4000;
			this.icon = data.icon || null;
			this.top = data.top || false;
			this.left = data.left || true;
			this.bottom = data.bottom || true;
			this.right = data.right || false;
			this.outlined = data.outlined || false;
			this.rounded = data.rounded || 'pill';

			this.showSnackbar = true;
		},
	},
};
</script>
