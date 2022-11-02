<script>
const ChromiumUtils = require('../plugins/chromium-utils');
const XLSXRenderer = require('../plugins/xlsx-renderer');
export default {
	head: {
		title: 'IRCS 実績',
	},
	data() {
		return {
			timer: null,
			timerTime: 120000,
			liveInterval: null,
			ttIrcsDataTbl: [],
			setHDialog: false,
			initData: null,
			setTargetDialog: false,
			// now: new Date(),
			// nowMoment: null,
			selectedSumElement: null,
			ca4Hours: [
				{ h: '0630', h1: '0730', val: '06', text: '06:30~07:30' },
				{ h: '0730', h1: '0830', val: '07', text: '07:30~08:30' },
				{ h: '0830', h1: '0930', val: '08', text: '08:30~09:30' },
				{ h: '0930', h1: '1030', val: '09', text: '09:30~10:30' },
				{ h: '1030', h1: '1130', val: '10', text: '10:30~11:30' },
				{ h: '1130', h1: '1230', val: '11', text: '11:30~12:30' },
				{ h: '1230', h1: '1330', val: '12', text: '12:30~13:30' },
				{ h: '1330', h1: '1430', val: '13', text: '13:30~14:30' },
				{ h: '1430', h1: '1530', val: '14', text: '14:30~15:30' },
				{ h: '1530', h1: '1630', val: '15', text: '15:30~16:30' },
				{ h: '1630', h1: '1730', val: '16', text: '16:30~17:30' },
				{ h: '1730', h1: '1830', val: '17', text: '17:30~18:30' },
				{ h: '1830', h1: '2000', val: '18+19', text: '18:30~19:30' },
			],
			ca3Hours: [
				{ h: '2000', h1: '2100', val: '20', text: '20:00~21:00' },
				{ h: '2100', h1: '2200', val: '21', text: '21:00~22:00' },
				{ h: '2200', h1: '2300', val: '22', text: '22:00~23:00' },
				{ h: '2300', h1: '2400', val: '23', text: '23:00~00:00' },
				{ h: '0000', h1: '0100', val: '00', text: '00:00~01:00' },
				{ h: '0100', h1: '0200', val: '01', text: '01:00~02:00' },
				{ h: '0200', h1: '0300', val: '02', text: '02:00~03:00' },
				{ h: '0300', h1: '0400', val: '03', text: '03:00~04:00' },
				{ h: '0400', h1: '0500', val: '04', text: '04:00~05:00' },
				{ h: '0500', h1: '0630', val: '05', text: '05:00~06:00' },
			],
			targetData: {
				d_assy: null,
				ca: null,
				line: null,
				t_gia_dong: null,
				l_ke_hoach: null,
				l_so_nguoi: null,
				rest_hour: '11',
				user: 'SYS',
			},
			target_rules: {
				d_assy: [
					(val) => (val || '').length > 0 || 'Không được để trống!',
				],
				ca: [(val) => (val || '').length > 0 || 'Không được để trống!'],
				line: [
					(val) => (val || '').length > 0 || 'Không được để trống!',
				],
				tgiadong: [
					// (val) => (val || '').length > 0 || 'Không được để trống!',
					(val) => /^\d+(\.\d+)?$/.test(val || '') || 'chỉ nhập số!',
				],
				lkehoach: [
					// (val) => (val || '').length > 0 || 'Không được để trống!',
					// (val) => /^\d+(\.\d+)?$/.test(val || '') || 'chỉ nhập số!',
				],
				rest_hour: [
					// (val) => (val || '').length > 0 || 'Không được để trống!',
				],
			},
			// selectedDates: null,
			selectedDateSH: null,
			isLive: true,
			lastTime: '--:--:--',
			selectedCA: '',
			caOptionsItems: [
				{ text: '一日中', value: 'ALL' },
				{ text: 'CA4', value: 'CA4' },
				{ text: 'CA3', value: 'CA3' },
			],
			selectedDate: detechTodayCA(),
			mSelectDate: false,
			title: 'IRCS 実績 - Thực tích IRCS',
			loading: false,
			pickerOptions: {
				disabledDate(e) {
					let fromD = new Date();
					let toD = new Date();
					fromD.setDate(fromD.getDate() - 150);
					toD.setDate(toD.getDate());
					return (
						e.getTime() < fromD.getTime() ||
						e.getTime() > toD.getTime()
					);
				},
			},
			listSeisan: [],
		};
	},
	mounted: async function () {
		this.$nuxt.$emit('page-info', {
			title: this.title,
			version: '1.0.0',
			options: { replace: true },
		});
		this.selectedCA = 'CA4';
		// this.selectedDates = [
		// 	this.$moment().format('YYYY-MM-DD'),
		// 	this.$moment().format('YYYY-MM-DD'),
		// ];
		await this.getInit();
		this.selectedDateSH = this.$moment().format('YYYY-MM-DD');
		await this.getData(new Date().toISOString().substring(0, 10));
		this.timer = this.$timerPoller(this.timerWork, this.timerTime);
		this.timer.start();
	},
	computed: {
		searchKey() {
			return this.keyWorld.toUpperCase();
		},
		today() {
			let d = this.now;
			if (d.getHours() > 6) {
				return d.toISOString().substring(0, 10);
			}
			return d
				.setDate(d.getDate() + 1)
				.toISOString()
				.substring(0, 10);
		},
		// current_hour() {
		// 	// return this.$moment().format('YYYY-MM-DD HH');
		// 	if (this.nowMoment) return this.nowMoment.format('YYYY-MM-DD HH');

		// 	return '';
		// },
		// current_hour_minute() {
		// 	// return this.$moment().format('YYYY-MM-DD HHmm');
		// 	if (this.nowMoment) return this.nowMoment.format('YYYY-MM-DD HHmm');

		// 	return '';
		// },
		selectedDateNext() {
			if (this.selectedDate) {
				return this.$moment(this.selectedDate)
					.add(1, 'days')
					.format('YYYY-MM-DD');
			}
			return null;
		},
		lineList() {
			let l = [];

			if (this.initData && this.initData.LIST_LINE) {
				l = this.initData.LIST_LINE.map((item) => {
					return item.C_LINE;
				});
			}

			return l;
		},
		fullDayHours() {
			if (this.targetData.ca == 'CA4') {
				return this.ca4Hours;
			} else if (this.targetData.ca == 'CA3') {
				return this.ca3Hours;
			} else {
				return [...this.ca4Hours, ...this.ca3Hours];
			}
		},
		headers() {
			let mHeader = [
				{
					text: 'LINE名',
					value: 'REGISTLINENAME',
					width: 100,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
					fixed: true,
				},
				{
					text: '工程',
					value: 'C_CONG_DOAN_JP',
					width: 85,
					class: ['tbl-header'],
					cellClass: ['cell-normal', 'cell-congdoan'],
					fixed: true,
				},
			];

			let ca4Cols = [
				{
					text: '06:30~\r\n07:30',
					value: '06',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '07:30~\r\n08:30',
					value: '07',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '08:30~\r\n09:30',
					value: '08',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '09:40~\r\n10:30',
					value: '09',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '10:30~\r\n11:30',
					value: '10',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '11:30~\r\n12:30',
					value: '11',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '12:30~\r\n13:30',
					value: '12',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '13:30~\r\n14:30',
					value: '13',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '14:40~\r\n15:30',
					value: '14',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '15:30~\r\n16:30',
					value: '15',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '16:30~\r\n17:30',
					value: '16',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '17:30~\r\n18:30',
					value: '17',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '18:30~\r\n19:30',
					value: '18+19',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
			];

			let ca3Cols = [
				// {
				// 	text: '19:30~\r\n20:30',
				// 	value: '19',
				// 	width: 50,
				// 	class: ['tbl-header'],
				// 	cellClass: ['cell-normal'],
				// },
				{
					text: '20:00~\r\n21:00',
					value: '20',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '21:00~\r\n21:50',
					value: '21',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '22:00~\r\n23:00',
					value: '22',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '23:00~\r\n00:00',
					value: '23',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '00:00~\r\n01:00',
					value: '00',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '01:00~\r\n01:50',
					value: '01',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '02:00~\r\n03:00',
					value: '02',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '03:00~\r\n04:00',
					value: '03',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '04:00~\r\n05:00',
					value: '04',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
				{
					text: '05:00~\r\n06:00',
					value: '05',
					width: 50,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
				},
			];

			if (this.selectedCA == 'CA4') {
				mHeader.push(...ca4Cols);
			} else if (this.selectedCA == 'CA3') {
				mHeader.push(...ca3Cols);
			} else {
				mHeader.push(...ca4Cols);
				mHeader.push(...ca3Cols);
			}

			mHeader.push({
				text: '総計',
				value: 'l_sum',
				width: 50,
				class: ['tbl-header'],
				cellClass: ['cell-normal', 'cell-sum'],
			});

			return mHeader;
		},

		ttIrcsData() {
			let dt = [];
			dt = this.ttIrcsDataTbl.map((item) => {
				let l_sum = 0;

				item['18+19'] = (item['18'] || 0) + (item['19'] || 0);
				if (item.L_ORDER >= 100) {
					// return { ...item, l_sum };
				} else if (item.L_ORDER == 0) {
					//dong muc tieu

					let sum_ca4_temp = 0;
					let sum_ca3_temp = 0;
					let ttCDCuoi = this.ttCongDoanCuoi(item.REGISTLINENAME);
					if (item.L_KE_HOACH_CA4 > 0) {
						this.ca4Hours.forEach((t, idx) => {
							// console.log(this.selectedDateNext);
							if (
								this.selectedDate + ' ' + t.h1 <
								this.$nuxt.context.current_hour_minute
							) {
								if (
									(ttCDCuoi[t.val] == 0 &&
										(this.isLive || t.val < '07')) ||
									sum_ca4_temp >= item.L_KE_HOACH_CA4
								) {
									item[t.val] = 0;
								}
							}

							if (t.val == item.C_REST_HOUR_CA4) {
								item[t.val] = 0;
							}

							let sai =
								item[t.val] +
								sum_ca4_temp -
								item.L_KE_HOACH_CA4;
							if (sai > 0) {
								item[t.val] = item[t.val] - sai;
							} else if (idx + 1 == this.ca4Hours.length) {
								item[t.val] = item[t.val] - sai;
							}

							sum_ca4_temp = sum_ca4_temp + item[t.val];

							if (
								this.selectedDate + ' ' + t.h1 <
								this.$nuxt.context.current_hour_minute
							) {
								item[t.val + '_sai'] =
									ttCDCuoi[t.val] - item[t.val];
							} else {
								item[t.val + '_incompleted'] = true;
							}
						});
					}

					if (item.L_KE_HOACH_CA3 > 0) {
						this.ca3Hours.forEach((t, idx) => {
							// console.log(this.selectedDateNext);
							if (
								(t.val > '05' &&
									this.selectedDate + ' ' + t.h1 <
										this.$nuxt.context
											.current_hour_minute) ||
								(t.val <= '05' &&
									this.selectedDateNext + ' ' + t.h1 <
										this.$nuxt.context.current_hour_minute)
							) {
								if (
									(ttCDCuoi[t.val] == 0 &&
										(this.isLive ||
											(t.val < '21' && t.val > '05'))) ||
									sum_ca3_temp >= item.L_KE_HOACH_CA3
								) {
									item[t.val] = 0;
								}
							}

							if (t.val == item.C_REST_HOUR_CA3) {
								item[t.val] = 0;
							}

							let sai =
								item[t.val] +
								sum_ca3_temp -
								item.L_KE_HOACH_CA3;
							if (sai > 0) {
								item[t.val] = item[t.val] - sai;
							} else if (idx + 1 == this.ca3Hours.length) {
								item[t.val] = item[t.val] - sai;
							}

							sum_ca3_temp = sum_ca3_temp + item[t.val];

							if (
								(t.val > '05' &&
									this.selectedDate + ' ' + t.h1 <
										this.$nuxt.context
											.current_hour_minute) ||
								(t.val <= '05' &&
									this.selectedDateNext + ' ' + t.h1 <
										this.$nuxt.context.current_hour_minute)
							) {
								item[t.val + '_sai'] =
									ttCDCuoi[t.val] - item[t.val];
							} else {
								item[t.val + '_incompleted'] = true;
							}
						});
					}

					//tinh sum ke hoach
					if (this.selectedCA == 'CA4') {
						l_sum = sum_ca4_temp || 0;
						// l_sum = item.L_KE_HOACH_CA4 || 0;
					} else if (this.selectedCA == 'CA3') {
						l_sum = sum_ca3_temp || 0;
						// l_sum = item.L_KE_HOACH_CA3 || 0;
					} else {
						if (
							this.$nuxt.context.current_hour >
							this.selectedDateNext + ' 05'
						) {
							l_sum = sum_ca4_temp + sum_ca3_temp;
						} else {
							l_sum =
								(item.L_KE_HOACH_CA4 || 0) +
								(item.L_KE_HOACH_CA3 || 0);
						}
					}

					item.REGISTLINENAME_tooltip =
						'<b>' +
						item.REGISTLINENAME +
						'</b>' +
						(item.T_GIA_DONG_CA4
							? '<br>稼働_CA4: <b>' +
							  item.T_GIA_DONG_CA4 +
							  '</b>(分)'
							: '') +
						(item.L_KE_HOACH_CA4
							? '<br>計画数_CA4: <b>' +
							  item.L_KE_HOACH_CA4 +
							  '</b>(SET)'
							: '') +
						(item.C_REST_HOUR_CA4
							? '<br>食事時間_CA4: <b>' +
							  (this.ca4Hours.find((it) => {
									return it.val == item.C_REST_HOUR_CA4;
							  }) || {})['text'] +
							  '</b>'
							: '') +
						(item.T_GIA_DONG_CA3
							? '<hr/><br/>稼働_CA3: <b>' +
							  item.T_GIA_DONG_CA3 +
							  '</b>(分)'
							: '') +
						(item.L_KE_HOACH_CA3
							? '<br>計画数_CA3: <b>' +
							  item.L_KE_HOACH_CA3 +
							  '</b>(SET)'
							: '') +
						(item.C_REST_HOUR_CA3
							? '<br>食事時間_CA3: <b>' +
							  (this.ca3Hours.find((it) => {
									return it.val == item.C_REST_HOUR_CA3;
							  }) || {})['text'] +
							  '</b>'
							: '');

					// return { ...item, l_sum };
				} else {
					l_sum = 0;
					if (this.selectedCA == 'CA4') {
						l_sum =
							l_sum +
							(item['06'] || 0) +
							(item['07'] || 0) +
							(item['08'] || 0) +
							(item['09'] || 0) +
							(item['10'] || 0) +
							(item['11'] || 0) +
							(item['12'] || 0) +
							(item['13'] || 0) +
							(item['14'] || 0) +
							(item['15'] || 0) +
							(item['16'] || 0) +
							(item['17'] || 0) +
							(item['18'] || 0) +
							(item['19'] || 0);
					} else if (this.selectedCA == 'CA3') {
						l_sum =
							l_sum +
							(item['20'] || 0) +
							(item['21'] || 0) +
							(item['22'] || 0) +
							(item['23'] || 0) +
							(item['00'] || 0) +
							(item['01'] || 0) +
							(item['02'] || 0) +
							(item['03'] || 0) +
							(item['04'] || 0) +
							(item['05'] || 0);
					} else {
						l_sum =
							l_sum +
							(item['06'] || 0) +
							(item['07'] || 0) +
							(item['08'] || 0) +
							(item['09'] || 0) +
							(item['10'] || 0) +
							(item['11'] || 0) +
							(item['12'] || 0) +
							(item['13'] || 0) +
							(item['14'] || 0) +
							(item['15'] || 0) +
							(item['16'] || 0) +
							(item['17'] || 0) +
							(item['18'] || 0) +
							(item['19'] || 0) +
							(item['20'] || 0) +
							(item['21'] || 0) +
							(item['22'] || 0) +
							(item['23'] || 0) +
							(item['00'] || 0) +
							(item['01'] || 0) +
							(item['02'] || 0) +
							(item['03'] || 0) +
							(item['04'] || 0) +
							(item['05'] || 0);
					}

					// return { ...item, l_sum };
				}
				return { ...item, l_sum };
			});

			return dt;
		},
		setH_Data() {
			if (this.listSeisan.length == 0) {
				return {};
			}

			let fData = {};

			this.listSeisan.forEach((item) => {
				// if (
				// 	item.C_LINE != 'UNKNOWN' &&
				// 	item.D_SAGYO >= this.selectedDates[0] &&
				// 	item.D_SAGYO <= this.selectedDates[1]
				// ) {
				// 	if (!fData[item.C_LINE]) {
				// 		fData[item.C_LINE] = [item];
				// 	} else {
				// 		fData[item.C_LINE].push(item);
				// 	}
				// }
				item['18+19'] = (item['18'] || 0) + (item['19'] || 0);
				if (
					item.C_LINE != 'UNKNOWN' &&
					item.D_SAGYO >= this.selectedDateSH &&
					item.D_SAGYO <= this.selectedDateSH
				) {
					if (!fData[item.C_LINE]) {
						fData[item.C_LINE] = [item];
					} else {
						fData[item.C_LINE].push(item);
					}
				}
			});

			return fData;
		},
	},
	created: function () {
		// var self = this;
		// setInterval(function() {
		// 	if (self.p < 100) {
		// 		self.p++;
		// 	}
		// }, 100);

		setInterval(() => {
			this.$forceUpdate();
		}, 1000);
	},
	components: {},
	methods: {
		allowedDatePicker(dateStr) {
			return new Date(dateStr) < new Date();
		},
		weekdayFormat(dateStr) {
			switch (new Date(dateStr).getDay()) {
				case 0:
					return '日';
				case 1:
					return '月';
				case 2:
					return '火';
				case 3:
					return '水';
				case 4:
					return '木';
				case 5:
					return '金';
				case 6:
					return '土';
			}
		},
		dayFormat(dateStr) {
			return dateStr.substring(dateStr.length - 2);
		},
		async getInit() {
			try {
				let res = await this.$axios.get('/tt-ircs/init');

				this.initData = res.data;
				console.log(this.initData);
			} catch (error) {
				console.log(error);
			} finally {
			}
		},
		tableScroll() {
			if (this.selectedSumElement) {
				this.selectedSumElement.parentNode.removeChild(
					this.selectedSumElement,
				);
			}
		},
		mouseUpOnTable(e) {
			// console.log(e);
			let selectString = window.getSelection().toString().trim();
			// console.log(selectString);
			if (selectString && selectString.length > 1) {
				let lSelect = selectString.split(/(\t|\n)/);
				let sum = 0;

				lSelect.forEach((str) => {
					if (/^\d+$/.test(str)) {
						sum = sum + parseFloat(str);
					}
				});

				// console.log(sum);
				let selection = window.getSelection(), // get the selection then
					range = selection.getRangeAt(0), // the range at first selection group
					rect = range.getBoundingClientRect(); // and convert this to useful data

				if (rect.width > 0) {
					if (this.selectedSumElement) {
						this.selectedSumElement.parentNode.removeChild(
							this.selectedSumElement,
						);
					}
					this.selectedSumElement = document.createElement('div'); // make box
					this.selectedSumElement.innerHTML =
						'<span class="select-sum">' + sum + '</span>';
					this.selectedSumElement.class = 'rect';
					// this.selectedSumElement.style.border = '2px solid black'; // with outline
					this.selectedSumElement.style.position = 'fixed'; // fixed positioning = easy mode
					this.selectedSumElement.style.top = e.clientY + 'px'; // set coordinates
					this.selectedSumElement.style.left = e.clientX + 'px';
					this.selectedSumElement.style.height = rect.height + 'px'; // and size
					// this.selectedSumElement.style.width = rect.width + 'px';
					document.body.appendChild(this.selectedSumElement); // finally append
				}
			}
		},
		clearSumSelect(e) {
			if (this.selectedSumElement) {
				this.selectedSumElement.parentNode.removeChild(
					this.selectedSumElement,
				);
				this.selectedSumElement = null;
			}
		},
		openMokuhyo() {
			this.targetData = {
				d_assy: this.today,
				ca:
					this.selectedDate + ' 2000' >
					this.$nuxt.context.current_hour_minute
						? 'CA4'
						: 'CA3',
				line: null,
				t_gia_dong: null,
				l_ke_hoach: null,
				l_so_nguoi: null,
				rest_hour:
					this.selectedDate + ' 2000' >
					this.$nuxt.context.current_hour_minute
						? '11'
						: '00',
				user: 'SYS',
			};
			this.setTargetDialog = true;
		},
		ttCongDoanCuoi(line) {
			let dt = [];
			dt = this.ttIrcsDataTbl.filter((item) => {
				return (
					item.REGISTLINENAME == line && item.C_CONG_DOAN == 'PACKING'
				);
			});

			return dt[0] || {};
		},
		onMucTieuCaChanged() {
			let it = this.targetData.item || {};
			if (this.targetData.ca == 'CA4') {
				this.targetData.rest_hour = it.C_REST_HOUR_CA4 || '11';
			}
			if (this.targetData.ca == 'CA3') {
				this.targetData.rest_hour = it.C_REST_HOUR_CA3 || '00';
			}
		},
		// formatResponedData() {
		// 	this.ttIrcsDataTbl = this.ttIrcsDataTbl.map((item) => {
		// 		let l_sum = '';

		// 		item['18+19'] = (item['18'] || 0) + (item['19'] || 0);
		// 		if (item.L_ORDER >= 100) {
		// 			return { ...item, l_sum };
		// 		} else if (item.L_ORDER == 0) {
		// 			if (this.selectedCA == 'CA4') {
		// 				l_sum = item.L_KE_HOACH_CA4 || 0;
		// 			} else if (this.selectedCA == 'CA3') {
		// 				l_sum = item.L_KE_HOACH_CA3 || 0;
		// 			} else {
		// 				l_sum =
		// 					(item.L_KE_HOACH_CA4 || 0) +
		// 					(item.L_KE_HOACH_CA3 || 0);
		// 			}
		// 			return { ...item, l_sum };
		// 		} else {
		// 			l_sum = 0;
		// 			if (this.selectedCA == 'CA4') {
		// 				l_sum =
		// 					l_sum +
		// 					(item['06'] || 0) +
		// 					(item['07'] || 0) +
		// 					(item['08'] || 0) +
		// 					(item['09'] || 0) +
		// 					(item['10'] || 0) +
		// 					(item['11'] || 0) +
		// 					(item['12'] || 0) +
		// 					(item['13'] || 0) +
		// 					(item['14'] || 0) +
		// 					(item['15'] || 0) +
		// 					(item['16'] || 0) +
		// 					(item['17'] || 0) +
		// 					(item['18'] || 0) +
		// 					(item['19'] || 0);
		// 			} else if (this.selectedCA == 'CA3') {
		// 				l_sum =
		// 					l_sum +
		// 					(item['20'] || 0) +
		// 					(item['21'] || 0) +
		// 					(item['22'] || 0) +
		// 					(item['23'] || 0) +
		// 					(item['00'] || 0) +
		// 					(item['01'] || 0) +
		// 					(item['02'] || 0) +
		// 					(item['03'] || 0) +
		// 					(item['04'] || 0) +
		// 					(item['05'] || 0);
		// 			} else {
		// 				l_sum =
		// 					l_sum +
		// 					(item['06'] || 0) +
		// 					(item['07'] || 0) +
		// 					(item['08'] || 0) +
		// 					(item['09'] || 0) +
		// 					(item['10'] || 0) +
		// 					(item['11'] || 0) +
		// 					(item['12'] || 0) +
		// 					(item['13'] || 0) +
		// 					(item['14'] || 0) +
		// 					(item['15'] || 0) +
		// 					(item['16'] || 0) +
		// 					(item['17'] || 0) +
		// 					(item['18'] || 0) +
		// 					(item['19'] || 0) +
		// 					(item['20'] || 0) +
		// 					(item['21'] || 0) +
		// 					(item['22'] || 0) +
		// 					(item['23'] || 0) +
		// 					(item['00'] || 0) +
		// 					(item['01'] || 0) +
		// 					(item['02'] || 0) +
		// 					(item['03'] || 0) +
		// 					(item['04'] || 0) +
		// 					(item['05'] || 0);
		// 			}

		// 			return { ...item, l_sum };
		// 		}
		// 	});
		// },
		async getData(date, ca = 'CA4') {
			this.loading = true;
			console.log('load data @ ' + this.selectedCA);
			try {
				this.$toast.show('Loading data...');
				let res = await this.$axios.get('/tt-ircs?1=1&date=' + date);

				let tNow = new Date();
				// this.ttIrcsData = [...res.data.data];
				this.ttIrcsDataTbl = [...res.data.data];
				// this.formatResponedData();
				this.loading = false;
				this.lastTime =
					'' +
					(tNow.getHours() < 10 ? '0' : '') +
					tNow.getHours() +
					':' +
					(tNow.getMinutes() < 10 ? '0' : '') +
					tNow.getMinutes() +
					':' +
					(tNow.getSeconds() < 10 ? '0' : '') +
					tNow.getSeconds();
				this.$toast.clear();
			} catch (error) {
				console.log(error);
			} finally {
				this.loading = false;
				this.now = new Date();
				this.nowMoment = this.$moment();
			}
		},
		dblclickRow(e, item) {
			if (item.item.C_CONG_DOAN_JP != '目標') return;
			//kiem tra doi tuong click phai la td
			let ele = e.target;
			while (ele.tagName != 'TD') {
				ele = ele.parentNode;
			}

			let pNode = ele.parentNode;
			let children = [...pNode.childNodes];
			for (let i = 0; i < children.length; i++) {
				if (ele === children[i]) {
					console.log(i, children[i]);
				}
			}
		},
		rowClass(item) {
			let classes = [];
			if (item.C_CONG_DOAN_JP == '目標') {
				classes.push('row-muc-tieu');
			} else {
				classes.push('row-normal');
			}

			return classes;
		},
		onDateChanged(date) {
			this.timer.stop();
			if (date !== this.today) {
				this.isLive = false;
			} else {
				this.isLive = true;
				this.timer.start();
			}

			this.getData(date);
		},
		onCAChange(ca) {
			// this.formatResponedData();
			// clearInterval(this.timer);
			// if (date !== this.today) {
			// 	this.isLive = false;
			// }else{
			// 	this.startLive();
			// }
			// this.getData(thi);
		},
		onLiveToggle(val) {
			this.timer.stop();
			if (val) {
				this.selectedDate = this.today;
				this.getData(this.selectedDate, this.selectedCA);

				this.timer.start();
			}
		},
		timerWork() {
			// console.log('timerWork run');
			if (this.isLive) {
				this.selectedDate = this.$nuxt.context.current_assy_date;
				if (this.selectedCA != 'ALL')
					this.selectedCA = this.$nuxt.context.current_assy_ca;
				console.log('live', this.selectedDate, this.selectedCA);
				this.getData(this.selectedDate, this.selectedCA);
			} else {
				this.timer.stop();
			}
		},
		editMucTieu(item) {
			if (this.isLive) {
				(this.targetData = {
					d_assy: this.selectedDate,
					ca:
						this.selectedDate + ' 2000' >
						this.$nuxt.context.current_hour_minute
							? 'CA4'
							: 'CA3',
					line: item.REGISTLINENAME || null,
					t_gia_dong:
						this.selectedDate + ' 2000' >
						this.$nuxt.context.current_hour_minute
							? item.T_GIA_DONG_CA4
							: item.T_GIA_DONG_CA3,
					l_ke_hoach:
						this.selectedDate + ' 2000' >
						this.$nuxt.context.current_hour_minute
							? item.L_KE_HOACH_CA4
							: item.L_KE_HOACH_CA3,
					l_so_nguoi:
						this.selectedDate + ' 2000' >
						this.$nuxt.context.current_hour_minute
							? item.L_SO_NGUOI_CA4
							: item.L_SO_NGUOI_CA3,
					user: 'SYS',
					rest_hour:
						this.selectedDate + ' 2000' >
						this.$nuxt.context.current_hour_minute
							? item.C_REST_HOUR_CA4 || '11'
							: item.C_REST_HOUR_CA3 || '00',
					item: item,
				}),
					(this.setTargetDialog = true);
			}
		},
		excelDownload() {
			// let dataExport = this.ttIrcsDataTbl
			let dataExport = this.ttIrcsData
				.filter((item) => {
					return item.L_ORDER < 100;
				})
				.map((item) => {
					let newItem = {
						REGISTDATE: item.REGISTDATE,
						REGISTLINENAME: item.REGISTLINENAME,
						C_CONG_DOAN_JP: item.C_CONG_DOAN_JP,
					};
					if (this.selectedCA == 'CA4') {
						newItem['06:30~'] = item['06'];
						newItem['07:30~'] = item['07'];
						newItem['08:30~'] = item['08'];
						newItem['09:30~'] = item['09'];
						newItem['10:30~'] = item['10'];
						newItem['11:30~'] = item['11'];
						newItem['12:30~'] = item['12'];
						newItem['13:30~'] = item['13'];
						newItem['14:40~'] = item['14'];
						newItem['15:30~'] = item['15'];
						newItem['16:30~'] = item['16'];
						newItem['17:30~'] = item['17'];
						newItem['18:30~'] = item['18+19'];
					} else if (this.selectedCA == 'CA3') {
						newItem['20:00~'] = item['20'];
						newItem['21:00~'] = item['21'];
						newItem['22:00~'] = item['22'];
						newItem['23:00~'] = item['23'];
						newItem['00:00~'] = item['00'];
						newItem['01:00~'] = item['01'];
						newItem['02:00~'] = item['02'];
						newItem['03:00~'] = item['03'];
						newItem['04:00~'] = item['04'];
						newItem['05:00~'] = item['05'];
					} else {
						newItem['06:30~'] = item['06'];
						newItem['07:30~'] = item['07'];
						newItem['08:30~'] = item['08'];
						newItem['09:30~'] = item['09'];
						newItem['10:30~'] = item['10'];
						newItem['11:30~'] = item['11'];
						newItem['12:30~'] = item['12'];
						newItem['13:30~'] = item['13'];
						newItem['14:40~'] = item['14'];
						newItem['15:30~'] = item['15'];
						newItem['16:30~'] = item['16'];
						newItem['17:30~'] = item['17'];
						newItem['18:30~'] = item['18+19'];
						// newItem['19:30~'] = item['19'];

						newItem['20:00~'] = item['20'];
						newItem['21:00~'] = item['21'];
						newItem['22:00~'] = item['22'];
						newItem['23:00~'] = item['23'];
						newItem['00:00~'] = item['00'];
						newItem['01:00~'] = item['01'];
						newItem['02:00~'] = item['02'];
						newItem['03:00~'] = item['03'];
						newItem['04:00~'] = item['04'];
						newItem['05:00~'] = item['05'];
					}
					newItem['L_SUM'] = item.l_sum;
					return newItem;
				});
			this.exportXLSX(
				dataExport,
				'IRCS実績@' + this.selectedDate + '_' + this.selectedCA,
			);
		},
		async updateTarget() {
			try {
				this.loading = true;
				let res = await this.$axios.post(
					'tt-ircs/update-muc-tieu-ircs',
					this.targetData,
				);

				this.loading = false;
				if (res.data.message == 'success') {
					await this.getData(this.selectedDate, this.selectedCA);
					this.$toast.show('Đã đăng lục xong!', {
						duration: 3000,
						position: 'bottom-center',
					});
					console.log(res);
					this.setTargetDialog = false;
				} else {
					this.$toast.show('ERROR!!', {
						duration: 5000,
						position: 'bottom-center',
					});
					console.log(res.data.message);
				}
			} catch (err) {
				console.log(err);
				this.loading = false;
			} finally {
				this.getInit();
			}
		},
		exportXLSX(data, fileName = 'Exported') {
			ChromiumUtils.excelJSExport(
				data,
				{ sheetName: 'Sheet1', opts: {} },
				fileName,
			);
		},
		exportXLSX_old(data, fileName = 'Exported') {
			const wopts = {
				bookType: 'xlsx',
				bookSST: false,
				type: 'binary',
			};

			const ws = this.$XLSX.utils.json_to_sheet(data);

			//create the workbook:
			const wb = {
				SheetNames: ['Export'],
				Sheets: {},
				Props: {},
			};

			//put data in the sheet:
			wb.Sheets['Export'] = ws;

			// make a file
			let wbout = this.$XLSX.write(wb, wopts);

			// the saveAs call downloads a file on the local machine
			// saveAs(new Blob([sheetToArrayBuffer(wbout)], { type: "application/octet-stream" }), fileName + ".xlsx");

			if (this.$nuxt.context.isIE) {
				// const BOM = '\uFEFF';
				const xlsxBlob = new Blob([sheetToArrayBuffer(wbout)], {
					type: 'application/octet-stream',
				});
				navigator.msSaveBlob(xlsxBlob, fileName + '.xlsx');
			} else {
				let myBlob = new Blob([sheetToArrayBuffer(wbout)], {
					type: 'application/octet-stream',
				});

				let a = document.createElement('a');
				document.body.appendChild(a);
				a.style = 'display: none';
				let url = window.URL.createObjectURL(myBlob);
				a.href = url;
				a.download = fileName + '.xlsx';
				a.click();
				document.body.removeChild(a);
			}
		},
		async downloadSetH_Data() {
			try {
				let res = await this.$axios.get(
					`/tt-ircs/set-h-data?fDate=${this.selectedDateSH}&tDate=${this.selectedDateSH}`,
					// `/tt-ircs/set-h-data?fDate=${this.selectedDates[0]}&tDate=${this.selectedDates[1]}`,
				);
				this.listSeisan = res.data || [];
				console.log(res.data);
				// console.log(res.data.LIST_SEISAN);

				if (Object.keys(this.setH_Data).length > 0) {
					await ChromiumUtils.excelJSExportWB(async (wb) => {
						let response = await fetch(
							this.$nuxt.context.base +
								'thuc-tich-ircs/f_set_h.xlsx',
						);
						let data = await response.blob();
						await wb.xlsx.load(data);

						const ws_mau = wb.getWorksheet('F_MAU');

						if (ws_mau) {
							let lineList = Object.keys(this.setH_Data);
							lineList.forEach((lineName) => {
								let copySheet = wb.addWorksheet('Sheet');
								copySheet.model = ws_mau.model;
								copySheet.name = lineName;

								this.setH_Data[lineName].forEach(
									(item, idx) => {
										if (idx == 0) {
											//Add Data CA4
											copySheet.getCell('C1').value =
												lineName;
											copySheet.getCell('B3').value =
												item.D_SAGYO;
											copySheet.getCell('B5').value =
												item.HIN_CA4 || '';
											copySheet.getCell('E5').value = {
												formula: `${
													item.T_GIA_DONG_CA4 || 0
												}/60
										`,
												result: 0,
											};
											copySheet.mergeCells('B4:D4');
											copySheet.mergeCells('B5:D5');
											copySheet.mergeCells('B7:D7');
											copySheet.getCell('G5').value =
												item.L_KE_HOACH_CA4 || 0;

											if (item['06']) {
												copySheet.getCell('G8').value =
													item['06'];
											}
											if (item['07']) {
												copySheet.getCell('G9').value =
													item['07'];
											}
											if (item['08']) {
												copySheet.getCell('G10').value =
													item['08'];
											}
											if (item['09']) {
												copySheet.getCell('G11').value =
													item['09'];
											}
											if (item['10']) {
												copySheet.getCell('G12').value =
													item['10'];
											}
											if (item['11']) {
												copySheet.getCell('G13').value =
													item['11'];
											}
											if (item['12']) {
												copySheet.getCell('G14').value =
													item['12'];
											}
											if (item['13']) {
												copySheet.getCell('G15').value =
													item['13'];
											}
											if (item['14']) {
												copySheet.getCell('G16').value =
													item['14'];
											}
											if (item['15']) {
												copySheet.getCell('G17').value =
													item['15'];
											}
											if (item['16']) {
												copySheet.getCell('G18').value =
													item['16'];
											}
											if (item['17']) {
												copySheet.getCell('G19').value =
													item['17'];
											}
											if (item['18+19']) {
												copySheet.getCell('G20').value =
													item['18+19'];
											}

											//Add Data CA3
											copySheet.getCell('N1').value =
												lineName;
											copySheet.getCell('M3').value =
												item.D_SAGYO;
											copySheet.getCell('M5').value =
												item.HIN_CA3 || '';
											copySheet.getCell('P5').value = {
												formula: `${
													item.T_GIA_DONG_CA3 || 0
												}/60
										`,
												result: 0,
											};
											copySheet.mergeCells('M4:O4');
											copySheet.mergeCells('M5:O5');
											copySheet.mergeCells('M7:O7');
											copySheet.getCell('R5').value =
												item.L_KE_HOACH_CA3 || 0;

											if (item['20']) {
												copySheet.getCell('R8').value =
													item['20'];
											}
											if (item['21']) {
												copySheet.getCell('R9').value =
													item['21'];
											}
											if (item['22']) {
												copySheet.getCell('R10').value =
													item['22'];
											}
											if (item['23']) {
												copySheet.getCell('R11').value =
													item['23'];
											}
											if (item['00']) {
												copySheet.getCell('R12').value =
													item['00'];
											}
											if (item['01']) {
												copySheet.getCell('R13').value =
													item['01'];
											}
											if (item['02']) {
												copySheet.getCell('R14').value =
													item['02'];
											}
											if (item['03']) {
												copySheet.getCell('R15').value =
													item['03'];
											}
											if (item['04']) {
												copySheet.getCell('R16').value =
													item['04'];
											}
											if (item['05']) {
												copySheet.getCell('R17').value =
													item['05'];
											}
										}
									},
								);
							});
						}

						const sheet1 = wb.getWorksheet('Sheet1');
						wb.removeWorksheet(sheet1.id);
					}, 'Set-H_Data_' + this.selectedDateSH);
					this.setHDialog = false;
				} else {
					this.$toast.show('No Data!', {
						duration: 4000,
						position: 'bottom-center',
					});
				}

				// await XLSXRenderer.exportXLSX(this, [], 'TestRenderer');
			} catch (err) {
				console.log(err);
			}
		},
	},
	beforeDestroy() {
		this.timer.stop();
	},
};

function sheetToArrayBuffer(s) {
	var buf = new ArrayBuffer(s.length);
	var view = new Uint8Array(buf);
	for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
	return buf;
}

function date2String(date, format = 'yyyy-mm-dd') {
	let y = date.getFullYear().toString();
	let m = (date.getMonth() + 1).toString();
	let d = date.getDate().toString();
	d.length == 1 && (d = '0' + d);
	m.length == 1 && (m = '0' + m);

	switch (format) {
		case 'yyyy/mm/dd':
			return y + '/' + m + '/' + d;
		case 'yyyy-mm-dd':
			return y + '-' + m + '-' + d;
		default:
			return '';
	}
}

function detechTodayCA() {
	let d = new Date();
	if (d.getHours() > 6) {
		return d.toISOString().substring(0, 10);
	}
	return d
		.setDate(d.getDate() + 1)
		.toISOString()
		.substring(0, 10);
}
</script>
<style lang="scss">
.select-sum {
	font-size: 3.5rem;
	color: gold;
	background-color: crimson;
	padding: 1rem;
	border-radius: 2.5rem;
	font-family: tahoma;
	opacity: 0.8;
}

#page-thuc-tich-ircs {
	.tbl-header {
		background-color: burlywood !important;
		font-size: initial !important;
		padding: 0 8px !important;
		border: 1px solid black;
	}

	.cell-congdoan {
		text-align: left;
		font-weight: bolder;
	}
	.cell-normal {
		padding: 0 !important;
		border: 1px solid black !important;
	}
	.row-muc-tieu {
		td {
			background-color: khaki;
			font-size: 2.5rem !important;
		}

		.khong-dat-muc-tieu {
			// min-width: 100%;
			background-color: hotpink !important;
			display: block;
		}

		.muc-tieu-incompleted {
			background-color: lightgreen !important;
			display: block;
		}
	}
	.row-normal {
		td {
			font-size: 2.5rem !important;
		}
	}
	.row-normal:contains('0') {
		color: blue;
	}
	.cell-sum {
		color: deeppink;
	}

	.cell-muc-tieu {
		color: red !important;
	}

	.blue--text {
		color: blue !important;
	}

	table {
		border-collapse: collapse;
	}
	font-family: ＭＳ Ｐゴシック;
}

#page-thuc-tich-ircs.mobile {
	.tbl-header {
		font-size: 0.75rem !important;
	}

	.row-muc-tieu {
		td {
			font-size: 1.5rem !important;
		}

		.khong-dat-muc-tieu {
			// min-width: 100%;
			background-color: hotpink !important;
			display: block;
		}

		.muc-tieu-incompleted {
			background-color: lightgreen !important;
			display: block;
		}
	}
	.row-normal {
		td {
			font-size: 1.5rem !important;
		}
	}
}
</style>

<template>
	<div
		id="page-thuc-tich-ircs"
		:class="$nuxt.context.isMobile ? 'mobile' : ''"
		@mousedown="clearSumSelect"
	>
		<div style="text-align: center">
			<v-toolbar dark height="60px" color="black" dense bottom>
				<!-- <v-chip
					rounded
					outlined
					color="yellow"
					v-if="!$nuxt.context.isMobile"
				>
					最終更新: <b>{{ lastTime }}</b>
				</v-chip> -->
				<span v-if="!$nuxt.context.isMobile" style="color: yellow">
					最終更新: <b>{{ lastTime }}</b></span
				>
				<v-divider vertical></v-divider>
				<!-- <v-list dense rounded color="black">
					<v-list-item to="/thuc-tich-ircs-hinban" router>
						<v-list-item-content>
							<v-list-item-title
								><span style="color:greenyellow;font-size:1rem;"
									>品番ーIRCS 実績ページへ</span
								></v-list-item-title
							>
						</v-list-item-content>
					</v-list-item>
				</v-list> -->
				<a
					:href="$nuxt.context.pkg.base + '/thuc-tich-ircs-hinban'"
					style=""
				>
					<span
						style="
							color: greenyellow;
							font-size: 1rem;
							padding-left: 5px;
						"
						><span>品番IRCS</span>
						<span v-if="!$nuxt.context.isMobile"
							>実績ページへ</span
						></span
					></a
				>
				<v-spacer></v-spacer>

				<div class="mx-4" v-if="!$nuxt.context.isMobile">
					<v-menu
						v-model="mSelectDate"
						:close-on-content-click="false"
						:nudge-right="40"
						transition="scale-transition"
						offset-y
						min-width="auto"
					>
						<template v-slot:activator="{ on, attrs }">
							<v-text-field
								v-model="selectedDate"
								label="日付"
								prepend-icon="mdi-calendar"
								readonly
								:hide-details="true"
								v-bind="attrs"
								v-on="on"
							></v-text-field>
						</template>
						<v-date-picker
							v-model="selectedDate"
							@input="mSelectDate = false"
							:allowed-dates="allowedDatePicker"
							:show-week="true"
							:show-adjacent-months="false"
							locale="jp-jp"
							:day-format="dayFormat"
							@change="onDateChanged"
						></v-date-picker>
					</v-menu>
				</div>
				<v-divider vertical></v-divider>

				<v-btn-toggle
					v-model="selectedCA"
					color="yellow"
					dense
					group
					@change="onCAChange"
					v-if="!$nuxt.context.isMobile"
					mandatory
				>
					<v-btn
						v-for="item in caOptionsItems"
						:key="item.value"
						:value="item.value"
						text
					>
						{{ item.text }}
					</v-btn>
				</v-btn-toggle>
				<v-select
					v-model="selectedCA"
					:items="caOptionsItems"
					v-if="$nuxt.context.isMobile"
				></v-select>
				<v-divider vertical></v-divider>
				<v-btn
					color="green"
					class="ma-2 white--text"
					:disabled="ttIrcsData.length <= 0"
					@click="excelDownload"
					:small="$nuxt.context.isMobile"
				>
					Excel
					<v-icon right dark v-if="!$nuxt.context.isMobile">
						mdi-cloud-download
					</v-icon>
				</v-btn>
				<v-divider vertical></v-divider>
				<v-btn
					color="pink"
					class="ma-2 white--text"
					:disabled="ttIrcsData.length <= 0"
					@click.stop="setHDialog = true"
					:small="$nuxt.context.isMobile"
				>
					SET/H 出力
					<v-icon right dark v-if="!$nuxt.context.isMobile">
						mdi-av-timer
					</v-icon>
				</v-btn>
				<v-divider vertical></v-divider>
				<v-btn
					color="yellow darken-3"
					class="ma-2 white--text"
					@click.stop="openMokuhyo"
					:small="$nuxt.context.isMobile"
				>
					目標入力
					<v-icon right dark v-if="!$nuxt.context.isMobile">
						mdi-target
					</v-icon>
				</v-btn>
				<v-spacer></v-spacer>
				<v-switch
					v-model="isLive"
					label="生動（毎2分更新）"
					color="red"
					inset
					hide-details
					@change="onLiveToggle"
					v-if="!$nuxt.context.isMobile"
				></v-switch>
			</v-toolbar>
			<v-row>
				<v-col sm="12">
					<div @mouseup="mouseUpOnTable">
						<v-data-table
							:headers="headers"
							:fixed-header="true"
							:items="
								ttIrcsData.filter(
									(item) => item.C_CONG_DOAN !== 'L_WORK',
								)
							"
							:item-class="rowClass"
							height="81vh"
							min-height="700px"
							:multi-sort="false"
							:disable-sort="true"
							class="elevation-1"
							:loading="loading"
							:items-per-page="-1"
							:hide-default-footer="true"
							@dblclick:row="dblclickRow"
							mobile-breakpoint="0"
							@scroll="tableScroll"
						>
							<template
								v-slot:item.REGISTLINENAME="{ isMobile, item }"
							>
								<v-tooltip
									bottom
									v-if="
										item.C_CONG_DOAN_JP == '目標' ||
										isMobile
									"
								>
									<template v-slot:activator="{ on, attrs }">
										<v-chip
											color="green"
											v-bind="attrs"
											v-on="on"
											@click="editMucTieu(item)"
										>
											<b>{{ item.REGISTLINENAME }}</b>
										</v-chip>
									</template>
									<span>
										<v-banner
											class="px-2"
											transition="slide-y-transition"
											color="yellow darken-3"
											v-html="item.REGISTLINENAME_tooltip"
										>
										</v-banner>
									</span>
								</v-tooltip>
							</template>
							<template v-slot:item.C_CONG_DOAN_JP="{ item }">
								<v-chip color="red" outlined>
									<b>{{ item.C_CONG_DOAN_JP }}</b>
								</v-chip>
							</template>
							<template v-slot:item.00="{ item }">
								<span
									:class="[
										item['00_sai'] && item['00_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['00_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['00'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['00'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.01="{ item }">
								<span
									:class="[
										item['01_sai'] && item['01_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['01_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['01'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['01'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.02="{ item }">
								<span
									:class="[
										item['02_sai'] && item['02_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['02_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['02'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['02'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.03="{ item }">
								<span
									:class="[
										item['03_sai'] && item['03_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['03_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['03'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['03'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.04="{ item }">
								<span
									:class="[
										item['04_sai'] && item['04_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['04_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['04'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['04'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.05="{ item }">
								<span
									:class="[
										item['05_sai'] && item['05_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['05_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['05'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['05'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.06="{ item }">
								<span
									:class="[
										item['06_sai'] && item['06_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['06_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['06'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['06'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.07="{ item }">
								<span
									:class="[
										item['07_sai'] && item['07_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['07_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['07'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['07'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.08="{ item }">
								<span
									:class="[
										item['08_sai'] && item['08_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['08_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['08'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['08'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.09="{ item }">
								<span
									:class="[
										item['09_sai'] && item['09_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['09_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['09'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['09'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.10="{ item }">
								<span
									:class="[
										item['10_sai'] && item['10_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['10_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['10'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['10'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.11="{ item }">
								<span
									:class="[
										item['11_sai'] && item['11_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['11_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['11'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['11'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.12="{ item }">
								<span
									:class="[
										item['12_sai'] && item['12_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['12_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['12'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['12'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.13="{ item }">
								<span
									:class="[
										item['13_sai'] && item['13_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['13_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['13'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['13'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.14="{ item }">
								<span
									:class="[
										item['14_sai'] && item['14_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['14_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['14'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['14'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.15="{ item }">
								<span
									:class="[
										item['15_sai'] && item['15_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['15_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['15'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['15'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.16="{ item }">
								<span
									:class="[
										item['16_sai'] && item['16_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['16_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['16'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['16'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.17="{ item }">
								<span
									:class="[
										item['17_sai'] && item['17_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['17_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['17'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['17'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.18="{ item }">
								<span
									:class="[
										item['18_sai'] && item['18_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['18_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['18'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['18'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.18+19="{ item }">
								<span
									:class="[
										item['18+19_sai'] &&
										item['18+19_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['18+19_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['18+19'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['18+19'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.19="{ item }">
								<span
									:class="[
										item['19_sai'] && item['19_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['19_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['19'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['19'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.20="{ item }">
								<span
									:class="[
										item['20_sai'] && item['20_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['20_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['20'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['20'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.21="{ item }">
								<span
									:class="[
										item['21_sai'] && item['21_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['21_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['21'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['21'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.22="{ item }">
								<span
									:class="[
										item['22_sai'] && item['22_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['22_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['22'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['22'] }}
									</span>
								</span>
							</template>
							<template v-slot:item.23="{ item }">
								<span
									:class="[
										item['23_sai'] && item['23_sai'] < 0
											? 'khong-dat-muc-tieu'
											: '',
										item['23_incompleted']
											? 'muc-tieu-incompleted'
											: '',
										item['23'] == 0 ? 'blue--text' : '',
									]"
								>
									<span>
										{{ item['23'] }}
									</span>
								</span>
							</template>
						</v-data-table>
						<!-- {{ selectedInvoice }} -->
					</div>
				</v-col>
			</v-row>
			<v-dialog v-model="setHDialog" max-width="40vw" persistent>
				<v-card>
					<v-card-title class="text-h5"> SET/H 出力 </v-card-title>

					<v-card-text>
						<v-container>
							<v-toolbar
								dark
								height="60px"
								color="orange darken-3"
								dense
							>
								<v-spacer></v-spacer>
								<el-date-picker
									v-model="selectedDateSH"
									type="date"
									placeholder="Select Date"
									value-format="yyyy-MM-dd"
									:picker-options="pickerOptions"
									@change="
										!selectedDateSH ? (listSeisan = []) : 0
									"
								>
								</el-date-picker>
								<!-- <el-date-picker
									v-model="selectedDates"
									type="daterange"
									range-separator="⇒"
									start-placeholder="Start date"
									end-placeholder="End date"
									value-format="yyyy-MM-dd"
									:picker-options="pickerOptions"
									title="日範囲を選択"
									@change="
										!selectedDates[0]
											? (listSeisan = [])
											: 0
									"
								>
								</el-date-picker> -->
								<v-spacer></v-spacer>
							</v-toolbar>
						</v-container>
					</v-card-text>

					<v-card-actions>
						<v-spacer></v-spacer>

						<v-btn
							color="grey darken-1"
							text
							@click="setHDialog = false"
						>
							Cancel
						</v-btn>

						<v-btn
							color="green darken-1"
							text
							@click="downloadSetH_Data"
							:disabled="!selectedDateSH"
						>
							Download
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
			<v-dialog v-model="setTargetDialog" max-width="40vw" persistent>
				<v-card>
					<v-card-title class="text-h4"> 目標 </v-card-title>

					<v-card-text>
						<v-container>
							<v-row no-gutters>
								<v-col>
									<el-date-picker
										v-model="targetData.d_assy"
										type="date"
										placeholder="Ngày Assy"
										value-format="yyyy-MM-dd"
										:picker-options="pickerOptions"
										:rules="target_rules.ca"
										required
									>
									</el-date-picker>
								</v-col>
								<v-col>
									<v-select
										:items="['CA3', 'CA4']"
										label="chọn CA"
										color="pink"
										outlined
										dense
										clearable
										v-model="targetData.ca"
										hide-details="auto"
										class="shrink mr-2 search-field"
										required
										:rules="target_rules.ca"
										@change="onMucTieuCaChanged"
									></v-select>
								</v-col>
								<v-col>
									<v-select
										:items="lineList"
										label="chọn LINE"
										color="pink"
										outlined
										dense
										clearable
										v-model="targetData.line"
										hide-details="auto"
										class="shrink mr-2 search-field"
										required
										:rules="target_rules.line"
									></v-select>
									<!-- <v-text-field
										label="nhập LINE"
										outlined
										v-model="targetData.line"
										dense
										class="shrink"
										clearable
										required
										:rules="target_rules.line"
									></v-text-field> -->
								</v-col>
							</v-row>
							<v-row>
								<v-col>
									<v-text-field
										label="TG.Gia động(phút)"
										outlined
										dense
										class="shrink"
										v-model="targetData.t_gia_dong"
										clearable
										required
										:rules="target_rules.tgiadong"
										type="number"
									></v-text-field>
								</v-col>
								<v-col>
									<v-text-field
										label="Kế Hoạch(SET)"
										outlined
										dense
										class="shrink"
										v-model="targetData.l_ke_hoach"
										clearable
										required
										:rules="target_rules.lkehoach"
										type="number"
									></v-text-field>
								</v-col>
							</v-row>
							<v-row>
								<v-col>
									<v-select
										:items="fullDayHours"
										item-text="text"
										item-value="val"
										label="chọn giờ dùng cơm"
										color="purple"
										outlined
										dense
										clearable
										v-model="targetData.rest_hour"
										hide-details="auto"
										class="shrink mr-2 search-field"
										required
										:rules="target_rules.rest_hour"
									></v-select>
								</v-col>
								<v-col> </v-col>
							</v-row>
						</v-container>
					</v-card-text>

					<v-card-actions>
						<v-spacer></v-spacer>

						<v-btn
							color="grey darken-1"
							text
							outlined
							@click="setTargetDialog = false"
							class="mr-4"
						>
							Cancel
						</v-btn>

						<v-btn
							color="pink darken-1"
							text
							outlined
							@click="updateTarget"
							:disabled="
								!targetData.line ||
								!targetData.ca ||
								// !targetData.l_ke_hoach ||
								// !targetData.t_gia_dong ||
								!targetData.d_assy
							"
						>
							SAVE
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</div>
	</div>
</template>
