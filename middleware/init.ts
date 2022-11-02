const pkg = require('../package.json');
const init = async (context: any) => {
	context.pkg = pkg;
	const appConfig = await context.$axios.get(pkg.base + '/app-config.json', {
		baseURL: window.location.origin,
	});

	if (location.protocol == 'https:') {
		appConfig.data = {
			...appConfig.data,
			...appConfig.data.httpsAPI,
		};
	} else {
		appConfig.data = {
			...appConfig.data,
			...appConfig.data.httpAPI,
		};
	}
	context.appConfig = appConfig.data;
	let tDate = new Date();

	//YYYY-MM-DD
	context.current_date = tDate.toISOString().substring(0, 10);

	//HH:mm:ss
	context.current_time =
		'' +
		('0' + tDate.getHours()).slice(-2) +
		':' +
		('0' + tDate.getMinutes()).slice(-2) +
		':' +
		('0' + tDate.getSeconds()).slice(-2);

	//YYYY-MM-DD HH:mm:ss
	context.current_datetime =
		tDate.toISOString().substring(0, 10) +
		' ' +
		('0' + tDate.getHours()).slice(-2) +
		':' +
		('0' + tDate.getMinutes()).slice(-2) +
		':' +
		('0' + tDate.getSeconds()).slice(-2);

	//YYYY-MM-DD HH
	context.current_hour =
		tDate.toISOString().substring(0, 10) +
		' ' +
		('0' + tDate.getHours()).slice(-2);

	//YYYY-MM-DD HHmm
	context.current_hour_minute =
		tDate.toISOString().substring(0, 10) +
		' ' +
		('0' + tDate.getHours()).slice(-2) +
		'' +
		('0' + tDate.getMinutes()).slice(-2);

	if (
		'' +
			('0' + tDate.getHours()).slice(-2) +
			':' +
			('0' + tDate.getMinutes()).slice(-2) <
		'06:30'
	) {
		tDate.setDate(tDate.getDate() - 1);
	}
	//HH:mm:ss
	context.current_assy_date = tDate.toISOString().substring(0, 10);

	if (appConfig.data.baseAPI)
		context.$axios.defaults.baseURL = appConfig.data.baseAPI;
	console.log(context);
};

export default init;
