<template>
	<v-app>
		<!-- <v-app-bar
			:hide-on-scroll="$nuxt.context.isMobile"
			dense
			app
			dark
			color="blue accent-4"
		>
			<v-spacer />
			<v-toolbar-title>{{ title }}</v-toolbar-title>
			<v-spacer />
		</v-app-bar> -->
		<!-- <v-fab-transition>
			<v-btn
				v-scroll="onScroll"
				v-show="fab"
				fab
				fixed
				bottom
				right
				color="error"
				@click="toTop"
			>
				<v-icon>mdi-chevron-up</v-icon>
			</v-btn>
		</v-fab-transition> -->
		<v-main>
			<v-container :fluid="fluid">
				<Nuxt />
			</v-container>
		</v-main>
		<!-- <v-alert
			text
			color="info"
			class="v-alert-footer mb-0 py-1 grey lighten-4"
		>
			<div
				:class="$nuxt.context.isMobile ? 'small-footer' : ''"
				class="font-italic"
			>
				<span
					>&copy;
					<span v-if="new Date().getFullYear() > 2021">2021-</span
					>{{ new Date().getFullYear() }}</span
				>
				—
				<strong>
					Furukawa Automotive Systems Vinh Long Viet Nam inc.</strong
				>
				|
				<span class="grey--text text--darken-4">
					V{{ $nuxt.context.pkg.version }}
				</span>
			</div>
		</v-alert> -->
	</v-app>
</template>

<script>
export default {
	data() {
		return {
			clipped: false,
			drawer: false,
			fixed: false,
			miniVariant: false,
			right: true,
			rightDrawer: false,
			title: 'FAVV Login Portal',
			fab: false,
			fluid: false,
		};
	},
	mounted: function () {
		// console.log('mounted default template');
	},
	created() {},
	methods: {
		onScroll(e) {
			if (typeof window === 'undefined') return;
			const top = window.pageYOffset || e.target.scrollTop || 0;
			this.fab = top > 20;
		},
		toTop() {
			this.$vuetify.goTo(0);
		},
	},
	beforeDestroy() {
		// $off method will turn off the event listner
		this.$nuxt.$off('page-info');
	},
};
</script>
<style lang="scss">
.v-toolbar__title {
	font-size: 2rem;
	color: gold;
}

.container {
	/* padding: 20px 12px 12px; */
}
.v-footer {
	font-size: 0.9rem;
	// padding: 1px 80px;
	color: gold !important;

	.small-footer {
		font-size: xx-small;
	}
}
.v-alert-footer {
	font-size: 0.9rem;
	// padding: 1px 80px;
	color: gold !important;

	.small-footer {
		font-size: xx-small;
	}
}
</style>
