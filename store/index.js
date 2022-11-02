export const state = () => {
	return {
		loginRequired: false,
		userInfo: null,
		pagePermission: [],
	};
};

export const mutations = {
	SET_LOGIN_REQUIRED(state, val) {
		state.loginRequired = val;
	},
	SET_PAGE_PERMISSION(state, pathName) {
		if (state.userInfo && state.userInfo.C_EMPLOYEE) {
			state.pagePermission = state.userInfo.permissionList.reduce(
				(total, cur) => {
					if (cur.C_FORM_NO == pathName)
						console.log(cur.C_FORM_NO, pathName);
					total.push(cur.C_PERMISSION_NO);
					return total;
				},
				[],
			);
		}
	},
	SET_USER_INFO(state, val) {
		state.userInfo = val;
	},
};
