<template>
	<!-- <v-app dark>
		<h1 v-if="error.statusCode === 404">
			{{ pageNotFound }}
		</h1>
		<h1 v-else>
			{{ otherError }}
		</h1>
		<NuxtLink to="/"> Home page </NuxtLink>
	</v-app> -->
	<div class="nuxt-error">
		<component :is="errorPage" :error="error" />
	</div>
</template>

<script>
import error404 from '~/components/error/404.vue';
export default {
	name: 'nuxt-error',
	layout: 'blank_layout', // optional
	props: {
		error: {
			type: Object,
			default: () => {},
		},
	},
	computed: {
		errorPage() {
			if (this.error.statusCode === 404) {
				return error404;
			}
			// catch everything else
			return error404;
		},
	},
};
</script>

<style scoped>
h1 {
	font-size: 20px;
}
</style>
