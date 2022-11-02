const isMobile = (context: any) => {
	// context.isMobile = false;
	let userAgent = '';
	if (context.req) {
		userAgent = context.req.headers['user-agent'];
	} else {
		userAgent = navigator.userAgent;
	}

	context.isMobile = /mobile/i.test(userAgent);
};

export default isMobile;
