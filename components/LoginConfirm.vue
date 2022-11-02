<template>
	<div>
		<v-dialog v-model="dialog" persistent max-width="450px">
			<div>
				<v-tabs
					show-arrows
					background-color="error"
					icons-and-text
					dark
					grow
				>
					<v-tab>
						<v-icon large>mdi-account</v-icon>
						<div class="caption py-1">{{ title }}</div>
					</v-tab>
					<v-tab-item>
						<v-card class="px-4">
							<v-card-text>
								<v-form
									ref="loginForm"
									v-model="valid"
									lazy-validation
								>
									<v-row>
										<v-col cols="12">
											<v-text-field
												v-model="txtUsername"
												label="Username"
												required
												clearable
												v-disabled-icon-focus
												ref="username"
											></v-text-field>
										</v-col>
										<v-col cols="12">
											<v-text-field
												v-model="txtPassword"
												:append-icon="
													show1
														? 'mdi-eye'
														: 'mdi-eye-off'
												"
												:type="
													show1 ? 'text' : 'password'
												"
												label="Password"
												@click:append="show1 = !show1"
												v-disabled-icon-focus
												ref="password"
												@keypress="checkLogin"
											></v-text-field>
										</v-col>
									</v-row>
								</v-form>
							</v-card-text>
							<v-card-actions>
								<v-spacer></v-spacer>
								<v-btn color="gray" @click="cancel()">
									Cancel
								</v-btn>
								<v-btn
									color="success"
									@click="checkLogin('clicked')"
								>
									Đăng Nhập
								</v-btn>
							</v-card-actions>
						</v-card>
					</v-tab-item>
					<!-- <v-tab-item>
						<v-card class="px-4">
							<v-card-text>
								<v-form
									ref="registerForm"
									v-model="valid"
									lazy-validation
								>
									<v-row>
										<v-col cols="12" sm="6" md="6">
											<v-text-field
												v-model="firstName"
												:rules="[rules.required]"
												label="First Name"
												maxlength="20"
												required
											></v-text-field>
										</v-col>
										<v-col cols="12" sm="6" md="6">
											<v-text-field
												v-model="lastName"
												:rules="[rules.required]"
												label="Last Name"
												maxlength="20"
												required
											></v-text-field>
										</v-col>
										<v-col cols="12">
											<v-text-field
												v-model="email"
												:rules="emailRules"
												label="E-mail"
												required
											></v-text-field>
										</v-col>
										<v-col cols="12">
											<v-text-field
												v-model="password"
												:append-icon="
													show1
														? 'mdi-eye'
														: 'mdi-eye-off'
												"
												:rules="[
													rules.required,
													rules.min,
												]"
												:type="
													show1 ? 'text' : 'password'
												"
												name="input-10-1"
												label="Password"
												hint="At least 8 characters"
												counter
												@click:append="show1 = !show1"
											></v-text-field>
										</v-col>
										<v-col cols="12">
											<v-text-field
												block
												v-model="verify"
												:append-icon="
													show1
														? 'mdi-eye'
														: 'mdi-eye-off'
												"
												:rules="[
													rules.required,
													passwordMatch,
												]"
												:type="
													show1 ? 'text' : 'password'
												"
												name="input-10-1"
												label="Confirm Password"
												counter
												@click:append="show1 = !show1"
											></v-text-field>
										</v-col>
										<v-spacer></v-spacer>
										<v-col
											class="d-flex ml-auto"
											cols="12"
											sm="3"
											xsm="12"
										>
											<v-btn
												x-large
												block
												:disabled="!valid"
												color="success"
												@click="validate"
												>Register</v-btn
											>
										</v-col>
									</v-row>
								</v-form>
							</v-card-text>
						</v-card>
					</v-tab-item> -->
				</v-tabs>
			</div>
		</v-dialog>
	</div>
</template>

<script>
export default {
	data: () => ({
		dialog: false,
		resolve: null,
		reject: null,
		message: null,
		title: 'Xác nhận đăng nhập',
		valid: true,
		appId: '',
		pageId: '',
		fCode: '',
		keepLogin: false,
		txtUsername: '',
		txtPassword: '',
		show1: false,
		options: {
			color: 'primary',
			width: 290,
			zIndex: 200,
		},
	}),
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
	updated(e) {
		setTimeout(() => {
			try {
				if (!this.txtUsername && !this.txtPassword)
					this.$refs['username'].focus();
			} catch (err) {}
		}, 300);
	},
	methods: {
		openConfirm(pageId, fCode, options = {}) {
			this.dialog = true;
			this.pageId = pageId;
			this.fCode = fCode;
			this.txtUsername = '';
			this.txtPassword = '';
			this.keepLogin = false;
			// this.options = Object.assign(this.options, options);
			if (options.title) this.title = options.title;
			return new Promise((resolve, reject) => {
				this.resolve = resolve;
				this.reject = reject;
			});
		},
		openLogin(options = {}) {
			this.dialog = true;
			this.txtUsername = '';
			this.txtPassword = '';
			this.keepLogin = true;
			// this.options = Object.assign(this.options, options);
			this.title = options.title || 'Đăng Nhập';
			return new Promise((resolve, reject) => {
				this.resolve = resolve;
				this.reject = reject;
			});
		},
		async checkLogin(e) {
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

					// console.log(res.data);
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
						if (this.keepLogin) {
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

							this.resolve(true);
							this.dialog = false;
						} else {
							let pagePermissions =
								res.data.data.permissionList.filter((item) => {
									return item.C_FORM_NO == this.pageId;
								}) || [];
							console.log(pagePermissions, this.fCode);
							if (
								pagePermissions.length > 0 &&
								new RegExp(`(^|,)` + this.fCode + `(,|$)`).test(
									pagePermissions[0].C_PERMISSION_NO,
								)
							) {
								this.$nuxt.context.confirmedUserInfo =
									res.data.data.userInfo;
								this.resolve(true);
								this.dialog = false;
							} else {
								this.resolve(false);
								this.dialog = false;
								this.$toast.show('User chưa được cấp quyền!', {
									duration: 3000,
									position: 'bottom-center',
								});
							}
						}
					}
				} catch (err) {
					console.log(err);
				} finally {
				}
			}
		},
		cancel() {
			this.resolve(false);
			this.dialog = false;
		},
	},
};
</script>
