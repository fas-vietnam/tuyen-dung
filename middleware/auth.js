const pkg = require('../package.json');
const auth = async (context) => {
	context.pkg = pkg;
	const appConfig = (
		await context.$axios.get(pkg.base + '/app-config.json', {
			baseURL: window.location.origin,
		})
	).data;

	// window.localStorage.setItem(pkg.app_key, 'tuna');
	// console.log(window.localStorage.getItem(pkg.app_key));
	console.log('auth', context.route.name, appConfig);

	//USER ======load userInfo backup to check login session
	// window.localStorage.removeItem(pkg.app_key);
	context.store.commit(
		'SET_LOGIN_REQUIRED',
		appConfig.loginRequiredPage.indexOf(context.route.name) >= 0,
	);
	let uBackup = JSON.parse(window.localStorage.getItem(pkg.app_key));
	if (uBackup) {
		console.log(uBackup);
		if (Date.now() <= uBackup.expriedTime) {
			context.userInfo = uBackup;
			context.store.commit('SET_USER_INFO', uBackup);
			context.store.commit('SET_PAGE_PERMISSION', context.route.name);

			uBackup = undefined;
		} else {
			window.localStorage.removeItem(pkg.app_key);
			uBackup = undefined;
			context.userInfo = null;
		}
	}

	if (context.store.state.loginRequired) {
		if (!context.userInfo) {
			context.redirect('/login');
		}
	}
};

export default auth;
