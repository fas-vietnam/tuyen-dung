export default function(context) {
	context.userAgent = process.server
		? context.req.headers['user-agent']
		: navigator.userAgent;

	context.isIE = process.server ? false : _isIE11();
}

function _isIE11() {
	let iev = 0;
	const ieold = /MSIE (\d+\.\d+);/.test(navigator.userAgent);
	const trident = !!navigator.userAgent.match(/Trident\/7.0/);
	const rv = navigator.userAgent.indexOf('rv:11.0');

	if (ieold) {
		iev = Number(RegExp.$1);
	}
	if (navigator.appVersion.indexOf('MSIE 10') !== -1) {
		iev = 10;
	}
	if (trident && rv !== -1) {
		iev = 11;
	}

	return iev === 11;
}
