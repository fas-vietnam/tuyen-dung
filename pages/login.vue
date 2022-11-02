<style lang="scss">
#login-page {
	.loginOverlay {
		background-color: burlywood;
	}
}
</style>
<template>
	<div id="page-login">
		<v-container fluid fill-height class="loginOverlay mt-12">
			<v-layout align-center justify-center>
				<v-flex xs12 sm6 md5 lg4 xl3>
					<v-card rounded class="elevation-24 mt-12">
						<v-toolbar class="blue darken-4 text-center">
							<v-toolbar-title class="white--text"
								><h4 class="justify-space-between">
									Đăng Nhập FAVV
								</h4></v-toolbar-title
							>
						</v-toolbar>
						<v-card-text class="pt-4">
							<v-container px-6>
								<v-form v-model="valid" ref="form">
									<v-text-field
										prepend-icon="mdi-account"
										label="Username"
										v-model="txtUsername"
										:rules="usernameRules"
										required
										clearable
										v-disabled-icon-focus
										ref="username"
									></v-text-field>
									<v-text-field
										prepend-icon="mdi-lock"
										label="Mật khẩu"
										v-model="txtPassword"
										:append-icon="
											e1 ? 'mdi-eye' : 'mdi-eye-off'
										"
										@click:append="() => (e1 = !e1)"
										:type="e1 ? 'text' : 'password'"
										:rules="passwordRules"
										required
										clearable
										v-disabled-icon-focus
										@keypress="doLogin"
										ref="password"
									></v-text-field>
									<v-layout justify-space-between>
										<!-- <a href="">Quên mật khẩu</a> -->
										<span></span>
										<v-btn
											large
											@click="doLogin('clicked')"
											:class="{
												'pink darken-1 white--text':
													valid,
											}"
											:disabled="!valid"
											class="elevation-2"
											>Đăng nhập</v-btn
										>
									</v-layout>
								</v-form>
							</v-container>
						</v-card-text>
					</v-card>
				</v-flex>
			</v-layout>
		</v-container>
		<!-- <v-container fluid fill-height>
  <v-layout align-center justify-center>
    <v-flex md6>
      <a>HEllO</a>
    </v-flex>
  </v-layout>
</v-container> -->
	</div>
</template>
<script>
export default {
	layout: 'blank_layout',
	directives: {
		disabledIconFocus: {
			update(el) {
				el.querySelectorAll('.v-input__icon button').forEach((x) =>
					x.setAttribute('tabindex', -1),
				);
			},
			bind(el) {
				// console.log(el);
			},
		},
	},
	data() {
		return {
			valid: false,
			e1: false,
			txtPassword: '',
			passwordRules: [(v) => !!v || 'Password is required'],
			txtUsername: '',
			usernameRules: [(v) => !!v || 'Username is required'],
			email: '',
			emailRules: [
				(v) => !!v || 'E-mail is required',
				(v) =>
					/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
					'E-mail must be valid',
			],
		};
	},
	mounted() {
		this.$refs['username'].focus();
		console.log('login mounted');
	},
	created() {
		console.log('login created');
		if (this.$nuxt.context.userInfo) {
			this.$router.back();
		}
	},
	methods: {
		submit() {
			if (this.$refs.form.validate()) {
				this.$refs.form.$el.submit();
			}
		},
		clear() {
			this.$refs.form.reset();
		},
		async doLogin(e) {
			if (e == 'clicked' || e.keyCode == 13) {
				try {
					let res = await this.$axios.post(
						this.$nuxt.context.appConfig.API + '/login',
						{
							appId: this.$nuxt.context.appConfig.appId,
							employeeId: this.txtUsername,
							password: this.txtPassword,
						},
					);

					console.log(res.data);
					if (!res.data.data.userInfo) {
						console.log('user k ton tai');
						this.$toast.show('Username Không Tồn Tại!', {
							duration: 3000,
							position: 'bottom-center',
						});
						this.$refs['username'].focus();
						this.$refs['username'].$el
							.getElementsByTagName('input')[0]
							.select();
						// this.$forceUpdate();
					} else if (res.data.data.userInfo.IS_VALID == 'NO') {
						console.log('Sai Password');
						this.$toast.show('Sai Password!', {
							duration: 3000,
							position: 'bottom-center',
						});
						this.$refs['password'].focus();
						this.$refs['password'].$el
							.getElementsByTagName('input')[0]
							.select();
					} else {
						let userInfo = res.data.data.userInfo;
						userInfo['permissionList'] =
							res.data.data.permissionList;
						userInfo['expriedTime'] =
							Date.now() +
							this.$nuxt.context.appConfig.keepLoginMinute;

						console.log(userInfo);
						this.$nuxt.context.userInfo = userInfo;
						localStorage.setItem(
							this.$nuxt.context.pkg.app_key,
							JSON.stringify(userInfo),
						);

						this.$router.back();
					}
				} catch (err) {
					console.log(err);
				} finally {
				}
			}
		},
		doLogout() {
			localStorage.removeItem(this.$nuxt.context.pkg.app_key);
		},
	},
};
</script>
