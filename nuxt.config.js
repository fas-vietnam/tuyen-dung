import colors from 'vuetify/es5/util/colors';
const pkg = require('./package.json');
import path from 'path';
import fs from 'fs';

export default {
	// Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
	ssr: false,

	// Target: https://go.nuxtjs.dev/config-target
	target: 'static',

	server: {
		//for https on localhost
		// https: {
		// 	key: fs.readFileSync(path.join(path.resolve('certs'), '/key.pem')),
		// 	cert: fs.readFileSync(
		// 		path.join(path.resolve('certs'), '/cert.pem'),
		// 	),
		// },
	},

	// Global page headers: https://go.nuxtjs.dev/config-head
	head: {
		titleTemplate: '%s - FAVV WebApp',
		title: 'Home',
		htmlAttrs: {
			lang: 'en',
		},
		meta: [
			{ charset: 'utf-8' },
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			{ hid: 'description', name: 'description', content: '' },
			{ name: 'format-detection', content: 'telephone=no' },
		],
		link: [
			{
				rel: 'icon',
				type: 'image/x-icon',
				href: pkg.base + '/favicon.ico',
			},
			{
				rel: 'stylesheet',
				type: 'text/css',
				href:
					pkg.base +
					'/material-icon-offline/css/materialdesignicons.min.css',
			},
		],
	},
	// vender: ['element-ui'],
	// Global CSS: https://go.nuxtjs.dev/config-css
	css: ['element-ui/lib/theme-chalk/index.css'],

	// Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
	plugins: [
		'~plugins/utils',
		'~plugins/helper',
		'~plugins/element-ui',
		'~plugins/directives',
		'@/plugins/axios',
		// '~plugins/repository',
	],

	// Auto import components: https://go.nuxtjs.dev/config-components
	components: true,

	// Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
	buildModules: [
		// https://go.nuxtjs.dev/typescript
		'@nuxt/typescript-build',
		// https://go.nuxtjs.dev/vuetify
		'@nuxtjs/vuetify',
		'@nuxtjs/moment',
	],

	// Modules: https://go.nuxtjs.dev/config-modules
	modules: [
		// https://go.nuxtjs.dev/axios
		'@nuxtjs/axios',
		'@nuxtjs/toast',
		'nuxt-clipboard',
		// [
		// 	'nuxt-mail',
		// 	{
		// 		message: {
		// 			to: 'ho.200319.tan@furukawaelectric.com',
		// 		},
		// 		smtp: {
		// 			host: 'smtp.fites.fitec.co.jp',
		// 			port: 25,
		// 			secure: false,
		// 			tls: {
		// 				rejectUnauthorized: false,
		// 			},
		// 		},
		// 	},
		// ],
	],

	// Axios module configuration: https://go.nuxtjs.dev/config-axios
	axios: {
		// baseURL: '',
	},

	toast: {
		position: 'top-center',
		register: [
			// Register custom toasts
			{
				name: 'my-error',
				message: 'Oops...Something went wrong',
				options: {
					type: 'error',
				},
			},
		],
	},

	// Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
	vuetify: {
		// defaultAssets: false,
		// defaultAssets: { icons: false },
		customVariables: ['~/assets/variables.scss'],
		theme: {
			dark: false,
			themes: {
				light: {
					primary: '#2196f3',
					secondary: '#03a9f4',
					accent: '#00bcd4',
					error: '#f44336',
					warning: '#ffc107',
					info: '#009688',
					success: '#4caf50',
				},
				dark: {
					primary: colors.blue.darken2,
					accent: colors.grey.darken3,
					secondary: colors.amber.darken3,
					info: colors.teal.lighten1,
					warning: colors.amber.base,
					error: colors.deepOrange.accent4,
					success: colors.green.accent3,
				},
			},
		},
	},

	// Build Configuration: https://go.nuxtjs.dev/config-build
	build: {
		terser: {
			// https://github.com/terser/terser#compress-options
			terserOptions: {
				compress: {
					drop_console: false, //hide console.log()
				},
			},
		},
	},
	router: {
		base: pkg.base,
		middleware: ['init', 'user-agent', 'isMobile', 'auth'],
	},
};
