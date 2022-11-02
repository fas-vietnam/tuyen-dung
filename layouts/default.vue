<template>
	<v-app>
		<div ref="falling" id="falling" class="">
			<div v-if="eventName == 'womenday'">
				<div class="snowflake">👗</div>
				<div class="snowflake">💓</div>
				<div class="snowflake">👠</div>
				<div class="snowflake">💝</div>
				<div class="snowflake">🅷🅰🅿🅿🆈-🆆🅾🅼🅴🅽❜🆂-🅳🅰🆈</div>
				<div class="snowflake">💍</div>
				<div class="snowflake">💐</div>
				<div class="snowflake">🌷</div>
				<div class="snowflake">🍫</div>
				<div class="snowflake">💄</div>
			</div>
			<div v-if="eventName == 'valentine'">
				<div class="snowflake">💛</div>
				<div class="snowflake">💓</div>
				<div class="snowflake">💕</div>
				<div class="snowflake">💝</div>
				<div class="snowflake">🅷🅰🅿🅿🆈-🆅🅰🅻🅴🅽🆃🅸🅽🅴❜🆂-🅳🅰🆈</div>
				<div class="snowflake">💞</div>
				<div class="snowflake">💘</div>
				<div class="snowflake">💜</div>
				<div class="snowflake">💌</div>
				<div class="snowflake">💑</div>
			</div>
			<div v-if="eventName == 'new-year'">
				<div class="snowflake">📅</div>
				<div class="snowflake">🎁</div>
				<div class="snowflake">🎇</div>
				<div class="snowflake">💝</div>
				<div class="snowflake">🅷🅰🅿🅿🆈-🅽🅴🆆-🆈🅴🅰🆁❗</div>
				<div class="snowflake">🍷</div>
				<div class="snowflake">🎉</div>
				<div class="snowflake">💜</div>
				<div class="snowflake">🍊</div>
				<div class="snowflake">🎊</div>
			</div>
			<div v-if="eventName == 'halloween'">
				<div class="snowflake">💀</div>
				<div class="snowflake">💣</div>
				<div class="snowflake">🎃</div>
				<div class="snowflake">👻</div>
				<div class="snowflake">🆃🆁🅸🅲🅺-🅾🆁-🆃🆁🅴🅰🆃</div>
				<div class="snowflake">🍭</div>
				<div class="snowflake">🍬</div>
				<div class="snowflake">👹</div>
				<div class="snowflake">🦇</div>
				<div class="snowflake">🦉</div>
			</div>
			<div v-if="eventName == 'chrismas'">
				<div class="snowflake">❅</div>
				<div class="snowflake">🎄</div>
				<div class="snowflake">🎅</div>
				<div class="snowflake">🔥</div>
				<div class="snowflake">🅼🅴🆁🆁🆈-🅲🅷🅸🆁🆂🅼🅰🆂</div>
				<div class="snowflake">👪</div>
				<div class="snowflake">🦌</div>
				<div class="snowflake">🎁</div>
				<div class="snowflake">⛄</div>
				<div class="snowflake">⛪</div>
			</div>
		</div>
		<v-app-bar
			:hide-on-scroll="$nuxt.context.isMobile"
			dense
			app
			dark
			color="blue accent-4"
		>
			<!-- <v-app-bar-nav-icon @click.stop="drawer = !drawer" /> -->
			<v-spacer />
			<v-toolbar-title>{{ title }}{{ eventName }}</v-toolbar-title>
			<v-spacer />
			<span v-if="$nuxt.context.userInfo">
				<v-menu bottom min-width="200px" offset-y>
					<template v-slot:activator="{ on }">
						<v-btn icon x-large v-on="on" class="mr-2">
							<span>
								<v-icon>mdi-account</v-icon>
								<!-- <v-icon>mdi-logout-variant</v-icon> -->
								<!-- <v-chip outlined>{{
									$nuxt.context.userInfo.C_EMPLOYEE
								}}</v-chip> -->
							</span>
						</v-btn>
					</template>
					<v-card>
						<v-list-item-content class="justify-center">
							<div class="mx-auto text-center">
								<!-- <v-avatar color="brown" size="36">
									<span class="white--text text-h5">{{
										$nuxt.context.userInfo.C_EMPLOYEE
									}}</span>
								</v-avatar> -->
								<h3 class="green--text">
									{{ $nuxt.context.userInfo.C_EMPLOYEE }}
								</h3>
								<v-divider class="my-1"></v-divider>
								<p class="text-caption mt-1">
									DEPT COD:<b>{{
										$nuxt.context.userInfo.C_DEPT
									}}</b>
								</p>
								<v-divider class="my-1"></v-divider>
								<v-btn color="red" block text @click="doLogout">
									Đăng Xuất
								</v-btn>
							</div>
						</v-list-item-content>
					</v-card>
				</v-menu>
			</span>
		</v-app-bar>
		<v-fab-transition>
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
		</v-fab-transition>
		<v-main>
			<!-- <v-container :fluid="fluid"> -->
			<div id="page-container" class="mx-5">
				<Nuxt />
			</div>
			<!-- </v-container> -->
		</v-main>
		<Confirm ref="confirm" />
		<LoginConfirm ref="loginconfirm" />
		<Snackbar ref="snackbar" />
		<!-- <v-footer :absolute="!fixed" app :padless="padless">
			<v-card flat tile width="100%" class="blue lighten-1 text-center">
				<v-card-text class="white--text">
					<span>&copy; {{ new Date().getFullYear() }}</span> —
					<strong>FAVV</strong>
				</v-card-text>
			</v-card>
		</v-footer> -->
		<!-- <v-footer :absolute="!fixed" app dark class="blue text-center"> -->
		<v-alert
			color="linear-gradient(red, yellow)"
			class="v-alert-footer mb-0 py-1"
		>
			<!-- <v-alert color="#696969" class="v-alert-footer mb-0 py-1"> -->
			<div
				:class="$nuxt.context.isMobile ? 'small-footer' : ''"
				class="font-italic"
			>
				<span
					>&copy;
					<span v-if="new Date().getFullYear() > 2021">2021-</span
					>{{ new Date().getFullYear() }}</span
				>
				<span class="">
					<a :href="$nuxt.context.base" style="text-decoration: auto">
						<v-icon color="yellow">mdi-home-circle</v-icon>
						<!-- FAVV Home -->
					</a>
				</span>
				<span style="color: lightblue">
					Furukawa Automotive Systems Vinh Long Viet Nam inc.</span
				>
				<!-- | -->
				<span class="grey--text" v-if="version"> V{{ version }} </span>
				<span style="display: flex; float: right">
					<v-chip small color="yellow">
						<v-icon>mdi-clock</v-icon>
						<b>
							{{ $nuxt.context.current_time }}
						</b>
					</v-chip>
				</span>
			</div>
		</v-alert>
		<!-- </v-footer> -->
	</v-app>
</template>

<script>
export default {
	data() {
		return {
			clipped: false,
			drawer: false,
			fixed: false,
			timer: null,
			timerTime: 1000,
			items: [
				{
					icon: 'mdi-apps',
					title: 'Welcome',
					to: '/',
				},
				{
					icon: 'mdi-chart-bubble',
					title: 'Inspire',
					to: '/inspire',
				},
			],
			miniVariant: false,
			right: true,
			rightDrawer: false,
			title: 'FAVV WebApp',
			version: '',
			fab: false,
			fluid: false,
			eventName: '',
		};
	},
	mounted() {
		console.log('mounted default template', this.$nuxt.$route.name);
		this.$root.$Snackbar = this.$refs.snackbar;
		// const page = this.$refs.page.componentInstance;
		if (this.$store.state.loginRequired && !this.$nuxt.context.userInfo) {
			this.$router.push('/login');
		}

		this.timer = this.$timerPoller(this.timerWork, this.timerTime);
		this.timer.start();
		// this.$moment()
		this.showEvent();
	},
	created() {
		this.$nuxt.$on('page-info', ({ title, version, options }) => {
			if (options && options.replace) {
				this.title = title;
			} else {
				this.title = 'FAVV WebApp';
				this.title = title + ' - ' + this.title;
			}

			if (version) {
				this.version = version;
			}

			this.fluid = options.fluid || false;
		});
		this.$nuxt.$on('logout', () => {
			this.$nuxt.context.userInfo = null;
			localStorage.removeItem(this.$nuxt.context.pkg.app_key);
			this.$store.commit('SET_USER_INFO', null);
			// this.$store.commit('SET_LOGIN_REQUIRED', loginRequired);
			this.$forceUpdate();
			if (
				this.$store.state.loginRequired &&
				!this.$nuxt.context.userInfo
			) {
				this.$router.push('/login');
			}
		});
		console.log('layout created!');
	},
	computed: {
		isLogin() {
			return this.$nuxt.context.userInfo != null;
		},
	},
	watch: {
		$route() {
			console.log('route changed', this.$route);
		},
		isLogin(nVal, oldVal) {
			console.log(nVal);
			if (!nVal) {
				this.$router.push('/login');
			}
		},
	},
	methods: {
		showEvent() {
			if (this.$nuxt.context.appConfig.events) {
				// console.log(this.$nuxt.$route);
				this.$nuxt.context.appConfig.events.forEach((ev) => {
					// console.log(ev, this.$nuxt.$route.name);
					if (ev.allowedEventPages.includes(this.$nuxt.$route.name)) {
						if (ev.dates) {
							let dates = ev.dates.split('-');
							let fromD = dates[0];
							let toD = dates.pop();
							let year = this.$moment().format('YYYY');
							if (
								this.$moment().format('YYYY/MM/DD') >=
									year + `/${fromD}` &&
								this.$moment().format('YYYY/MM/DD') <=
									year + `/${toD}`
							) {
								this.eventName = ev.name;
								this.$refs.falling.classList.add(ev.name);
								if (ev.timmer > 0) {
									setTimeout(() => {
										this.$refs.falling.classList.remove(
											ev.name,
										);
									}, ev.timmer);
								}
							}
						}
					}
				});
			}
		},
		onScroll(e) {
			if (typeof window === 'undefined') return;
			const top = window.pageYOffset || e.target.scrollTop || 0;
			this.fab = top > 20;
		},
		toTop() {
			this.$vuetify.goTo(0);
		},
		doLogout() {
			this.$nuxt.$emit('logout');
		},
		timerWork() {
			let timeNow = this.$moment();
			this.$nuxt.context.current_date = timeNow.format('YYYY-MM-DD');
			this.$nuxt.context.current_assy_date =
				timeNow.format('HH:mm') < '06:30'
					? timeNow.add(-1, 'days').format('YYYY-MM-DD')
					: timeNow.format('YYYY-MM-DD');
			this.$nuxt.context.current_assy_ca =
				timeNow.format('HH:mm') >= '06:30' &&
				timeNow.format('HH:mm') < '20:00'
					? 'CA4'
					: 'CA3';
			this.$nuxt.context.current_hour = timeNow.format('YYYY-MM-DD HH');
			this.$nuxt.context.current_hour_minute =
				timeNow.format('YYYY-MM-DD HHmm');
			this.$nuxt.context.current_time = timeNow.format('HH:mm:ss');
			this.$nuxt.context.current_datetime = timeNow.format(
				'YYYY-MM-DD HH:mm:ss',
			);
			this.$forceUpdate();
		},
	},
	beforeDestroy() {
		// $off method will turn off the event listner
		this.$nuxt.$off('page-info');
		this.$nuxt.$off('logout');
		if (this.$nuxt.context.userInfo) {
			this.$nuxt.context.userInfo['expriedTime'] =
				Date.now() + this.$nuxt.context.appConfig.keepLoginMinute;
			localStorage.setItem(
				this.$nuxt.context.pkg.app_key,
				JSON.stringify(this.$nuxt.context.userInfo),
			);
		}

		if (this.timer) this.timer.stop();
	},
};
</script>
<style lang="scss">
/* customizable snowflake styling */
#falling {
	display: none;
}
#falling.chrismas,
#falling.womenday,
#falling.halloween,
#falling.new-year,
#falling.valentine {
	display: block;
	.snowflake {
		color: #fff;
		font-size: 1em;
		font-family: Arial;
		text-shadow: 0 0 1px #000;
	}

	@-webkit-keyframes snowflakes-fall {
		0% {
			top: -10%;
		}
		100% {
			top: 100%;
		}
	}
	@-webkit-keyframes snowflakes-shake {
		0% {
			-webkit-transform: translateX(0px);
			transform: translateX(0px);
		}
		50% {
			-webkit-transform: translateX(80px);
			transform: translateX(80px);
		}
		100% {
			-webkit-transform: translateX(0px);
			transform: translateX(0px);
		}
	}
	@keyframes snowflakes-fall {
		0% {
			top: -10%;
		}
		100% {
			top: 100%;
		}
	}
	@keyframes snowflakes-shake {
		0% {
			transform: translateX(0px);
		}
		50% {
			transform: translateX(80px);
		}
		100% {
			transform: translateX(0px);
		}
	}
	.snowflake {
		position: fixed;
		top: -10%;
		z-index: 9999;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		cursor: default;
		-webkit-animation-name: snowflakes-fall, snowflakes-shake;
		-webkit-animation-duration: 10s, 3s;
		-webkit-animation-timing-function: linear, ease-in-out;
		-webkit-animation-iteration-count: infinite, infinite;
		-webkit-animation-play-state: running, running;
		animation-name: snowflakes-fall, snowflakes-shake;
		animation-duration: 10s, 3s;
		animation-timing-function: linear, ease-in-out;
		animation-iteration-count: infinite, infinite;
		animation-play-state: running, running;
	}
	.snowflake:nth-of-type(0) {
		left: 1%;
		-webkit-animation-delay: 0s, 0s;
		animation-delay: 0s, 0s;
	}
	.snowflake:nth-of-type(1) {
		left: 10%;
		-webkit-animation-delay: 1s, 1s;
		animation-delay: 1s, 1s;
	}
	.snowflake:nth-of-type(2) {
		left: 20%;
		-webkit-animation-delay: 6s, 0.5s;
		animation-delay: 6s, 0.5s;
	}
	.snowflake:nth-of-type(3) {
		left: 30%;
		-webkit-animation-delay: 4s, 2s;
		animation-delay: 4s, 2s;
	}
	.snowflake:nth-of-type(4) {
		left: 40%;
		-webkit-animation-delay: 2s, 2s;
		animation-delay: 2s, 2s;
	}
	.snowflake:nth-of-type(5) {
		left: 50%;
		-webkit-animation-delay: 8s, 3s;
		animation-delay: 8s, 3s;
	}
	.snowflake:nth-of-type(6) {
		left: 60%;
		-webkit-animation-delay: 6s, 2s;
		animation-delay: 6s, 2s;
	}
	.snowflake:nth-of-type(7) {
		left: 70%;
		-webkit-animation-delay: 2.5s, 1s;
		animation-delay: 2.5s, 1s;
	}
	.snowflake:nth-of-type(8) {
		left: 80%;
		-webkit-animation-delay: 1s, 0s;
		animation-delay: 1s, 0s;
	}
	.snowflake:nth-of-type(9) {
		left: 90%;
		-webkit-animation-delay: 3s, 1.5s;
		animation-delay: 3s, 1.5s;
	}
}
@media print {
	.mx-5 {
		margin: 0 !important;
	}
}

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
	color: lightgrey !important;
	// background-color: #696969;
	background-image: linear-gradient(#696969, #363636) !important;

	border-radius: 0 !important;

	.small-footer {
		font-size: xx-small;
	}
}
</style>
