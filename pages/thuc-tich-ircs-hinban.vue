<script>
const ChromiumUtils = require('../plugins/chromium-utils');

/**
 * Generate a time mask based on input value (23:59)
 * @param {string} value
 */
export function timeMask(value) {
	const hours = [/[0-2]/, value.charAt(0) === '2' ? /[0-3]/ : /[0-9]/];
	const minutes = [/[0-5]/, /[0-9]/];
	return value.length > 2 ? [...hours, ':', ...minutes] : hours;
}

/**
 * Generate a time range mask based on input value (00:00-23:59)
 * @param {string} value
 */
export function timeRangeMask(value) {
	const numbers = value.replace(/[^0-9]/g, '');
	if (numbers.length > 4) {
		return [
			...timeMask(numbers.substring(0, 4)),
			'-',
			...timeMask(numbers.substring(4)),
		];
	}
	return [...timeMask(numbers)];
}

export default {
	head: {
		title: '品番-IRCS 実績',
	},
	data() {
		return {
			timeRangeMask,
			alert: false,
			kameStyle: false,
			ttIrcsHinbanData: [],
			nhanCongData: [],
			selectedDate: null,
			selectedSGDate: null,
			selectedLine: null,
			mSelectDate: false,
			mSelectSGDate: null,
			mSelecMasterKaikeiDate: null,
			mSelecKaikeiExpDate: null,
			kaikeiDialog: false,
			dateScope: [],
			rawFile: null,
			xlsData: [],
			title: '品番-IRCS 実績 - Thực tích IRCS theo Sản Phẩm',
			initData: null,
			loading: false,
			today: new Date().toISOString().substring(0, 10),
			maxNichiCol: 3,
			selectedStatus: 'ALL',
			statusOptionsItems: [
				{ text: 'ALL', value: 'ALL' },
				{ text: '中', value: '中' },
				{ text: '完成', value: '完成' },
				{ text: '未完成', value: '未完成' },
				{ text: 'まだ', value: 'まだ' },
			],
			// pickerOptions: {
			// 	disabledDate(e) {
			// 		let fromD = new Date();
			// 		let toD = new Date();
			// 		fromD.setDate(fromD.getDate() - 90);
			// 		toD.setDate(toD.getDate() + 1);
			// 		return (
			// 			e.getTime() < fromD.getTime() ||
			// 			e.getTime() > toD.getTime()
			// 		);
			// 	},
			// },
			percentFormatter: new Intl.NumberFormat('en-US', {
				style: 'percent',
				maximumFractionDigits: 2,
			}),
			kaikei: {
				d_assy: null,
				ca: null,
				line: null,
				masterRes: [],
				selectedMasterItems: [],
				editingMasterItem: {},
				masterHeader: [
					{
						value: 'ACTION',
						text: 'ACTION',
						class: ['tbl-kaikei-header'],
						width: 50,
					},
					{
						value: 'D_ASSY',
						text: 'Ngày Assy',
						class: ['tbl-kaikei-header'],
						width: 70,
					},
					{
						value: 'C_LINE',
						text: 'LINE',
						class: ['tbl-kaikei-header'],
						width: 70,
					},
					{
						value: 'C_CA',
						text: 'CA',
						class: ['tbl-kaikei-header'],
						width: 70,
					},
					{
						value: 'C_START',
						text: 'START',
						class: ['tbl-kaikei-header'],
						width: 70,
					},
					{
						value: 'C_END',
						text: 'END',
						class: ['tbl-kaikei-header'],
						width: 70,
					},
					{
						value: 'SUB_NGUOI',
						text: 'SUB - 人',
						class: ['tbl-kaikei-header'],
						width: 70,
					},
					{
						value: 'SUB_TG',
						text: 'SUB - 時間(phút)',
						class: ['tbl-kaikei-header'],
						width: 70,
					},
					{
						value: 'ASSY_NGUOI',
						text: 'ASSY - 人',
						class: ['tbl-kaikei-header'],
						width: 70,
					},
					{
						value: 'ASSY_TG',
						text: 'ASSY - 時間(phút)',
						class: ['tbl-kaikei-header'],
						width: 70,
					},
					{
						value: 'QC_NGUOI',
						text: 'QC - 人',
						class: ['tbl-kaikei-header'],
						width: 70,
					},
					{
						value: 'QC_TG',
						text: 'QC - 時間(phút)',
						class: ['tbl-kaikei-header'],
						width: 70,
					},
					// {
					// 	value: 'L_SO_PHUT_GIAI_LAO',
					// 	text: 'GIAI LAO(phút)',
					// 	class: ['tbl-kaikei-header'],
					// 	width: 70,
					// },
					{
						value: 'C_USER',
						text: 'User',
						class: ['tbl-kaikei-header'],
						width: 70,
					},
					{
						value: 'D_UPDATE',
						text: 'Ngày Update',
						class: ['tbl-kaikei-header'],
						width: 70,
					},
				],
			},
			kaikeiExp: {
				// d_assy: null,
				// ca: null,
				// line: null,
				kaikeiRes: [],
				kaikeiHeader: [
					{
						value: 'SUB_NGUOI',
						text: 'SUB - 人',
						class: ['tbl-kaikei-header'],
						width: '2%',
						excelHeader: 'SUB - 人',
					},
					{
						value: 'SUB_TG',
						text: 'SUB - 時間(phút)',
						class: ['tbl-kaikei-header'],
						width: '2%',
						excelHeader: 'SUB - 時間(phút)',
					},
					{
						value: 'ASSY_NGUOI',
						text: 'ASSY - 人',
						class: ['tbl-kaikei-header'],
						width: '2%',
						excelHeader: 'ASSY - 人',
					},
					{
						value: 'ASSY_TG',
						text: 'ASSY - 時間(phút)',
						class: ['tbl-kaikei-header'],
						width: '2%',
						excelHeader: 'ASSY - 時間(phút)',
					},
					{
						value: 'QC_NGUOI',
						text: 'QC - 人',
						class: ['tbl-kaikei-header'],
						width: '2%',
						excelHeader: 'QC - 人',
					},
					{
						value: 'QC_TG',
						text: 'QC - 時間(phút)',
						class: ['tbl-kaikei-header'],
						width: '2%',
						excelHeader: 'QC - 時間(phút)',
					},
					{
						value: 'L_NHAN_CONG_SUB',
						text: 'C.Số TT SUB',
						class: ['tbl-kaikei-header'],
						width: '4%',
						excelHeader: 'C.Số TT SUB',
					},
					{
						value: 'L_NHAN_CONG_ASSY',
						text: 'C.Số TT ASSY',
						class: ['tbl-kaikei-header'],
						width: '4%',
						excelHeader: 'C.Số TT ASSY',
					},
					{
						value: 'L_NHAN_CONG_QC',
						text: 'C.Số TT KT',
						class: ['tbl-kaikei-header'],
						width: '4%',
						excelHeader: 'C.Số TT KT',
					},
					{
						value: 'L_NHAN_CONG_ALL',
						text: 'C.Số Thực Tế',
						class: ['tbl-kaikei-header'],
						width: '8%',
						excelHeader: 'C.Số Thực Tế',
					},
					{
						value: 'C_START',
						text: 'START',
						class: ['tbl-kaikei-header'],
						width: '2%',
						excelHeader: 'START',
					},
					{
						value: 'C_END',
						text: 'END',
						class: ['tbl-kaikei-header'],
						width: '2%',
						excelHeader: 'END',
					},
					{
						value: 'C_HIN',
						text: 'HIN',
						align: 'left',
						class: ['tbl-kaikei-header'],
						width: '10%',
						excelHeader: 'HIN',
					},
					{
						value: 'LOT',
						text: 'LOT',
						align: 'left',
						class: ['tbl-kaikei-header'],
						width: '10%',
						excelHeader: 'LOT',
					},
					{
						value: 'L_SAN_LUONG_IRCS',
						text: 'Sản Lượng IRCS',
						class: ['tbl-kaikei-header'],
						width: '2%',
						excelHeader: 'Sản Lượng IRCS',
					},
					{
						value: 'CA_CQ',
						text: 'C.Số chuẩn SUB',
						class: ['tbl-kaikei-header'],
						width: '4%',
						excelHeader: 'C.Số chuẩn SUB',
					},
					{
						value: 'DA_DP',
						text: 'C.Số chuẩn Assy',
						class: ['tbl-kaikei-header'],
						width: '4%',
						excelHeader: 'C.Số chuẩn Assy',
					},
					{
						value: 'EA_EP',
						text: 'C.Số chuẩn KT',
						class: ['tbl-kaikei-header'],
						width: '4%',
						excelHeader: 'C.Số chuẩn KT',
					},
					{
						value: 'ST_ALL',
						text: 'C.Số Chuẩn',
						class: ['tbl-kaikei-header'],
						width: '4%',
						excelHeader: 'C.Số Chuẩn',
					},
					{
						value: 'SUB_PERCENT',
						text: 'SUB%',
						class: ['tbl-kaikei-header'],
						width: '2%',
						excelHeader: 'SUB%',
					},
					{
						value: 'ASSY_PERCENT',
						text: 'ASSY%',
						class: ['tbl-kaikei-header'],
						width: '2%',
						excelHeader: 'ASSY%',
					},
					{
						value: 'QC_PERCENT',
						text: 'KIEM TRA%',
						class: ['tbl-kaikei-header'],
						width: '2%',
						excelHeader: 'K.TRA%',
					},
					{
						value: 'ALL_PERCENT',
						text: 'ALL%',
						class: ['tbl-kaikei-header'],
						width: '2%',
						excelHeader: 'ALL%',
					},
				],
			},
		};
	},
	components: {
		// 'e-table': Table,
	},
	created() {},
	mounted: async function () {
		this.$nuxt.$emit('page-info', {
			title: this.title,
			version: '1.1.1',
			options: { replace: true },
		});

		await this.getInit();

		if (
			this.$route.query.expDate &&
			(/^\d+-\d+-\d+$/.test(this.$route.query.expDate) ||
				this.$route.query.expDate == 'yesterday')
		) {
			this.selectedSGDate =
				this.$route.query.expDate == 'yesterday'
					? this.$moment().add(-1, 'days').format('YYYY-MM-DD')
					: this.$route.query.expDate;
			await this.getData();
			await this.excelDownload('TT_IRCS_Hinban_' + this.selectedSGDate);
		} else {
			this.selectedSGDate = new Date().toISOString().substring(0, 10);
			await this.getData();
		}
		// this.selectedDate = new Date().toISOString().substring(0, 10);
	},
	computed: {
		searchKey() {
			return this.keyWorld.toUpperCase();
		},
		kameHeader() {
			let kameCol = [];

			kameCol.push(
				this.createTTHeader('1日目', '1日目', '1日目残', '1日目SUB'),
			);
			kameCol.push(
				this.createTTHeader('2日目', '2日目', '2日目残', '2日目SUB'),
			);
			kameCol.push(
				this.createTTHeader('3日目', '3日目', '3日目残', '3日目SUB'),
			);

			if (this.maxNichiCol >= 4) {
				kameCol.push(
					this.createTTHeader(
						'4日目',
						'4日目',
						'4日目残',
						'4日目SUB',
					),
				);
			}
			if (this.maxNichiCol >= 5) {
				kameCol.push(
					this.createTTHeader(
						'5日目',
						'5日目',
						'5日目残',
						'5日目SUB',
					),
				);
			}
			if (this.maxNichiCol >= 6) {
				kameCol.push(
					this.createTTHeader(
						'6日目',
						'6日目',
						'6日目残',
						'6日目SUB',
					),
				);
			}
			if (this.maxNichiCol >= 7) {
				kameCol.push(
					this.createTTHeader(
						'7日目',
						'7日目',
						'7日目残',
						'7日目SUB',
					),
				);
			}

			return kameCol;
		},
		excelHeader() {
			let kaikeiHeader = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FF9933FF' },
			};

			let kaikeiFont = {
				color: { argb: 'FFFFFFFF' },
				bold: true,
			};
			let mHeader = [
				{
					text: 'FAP品番',
					value: 'FAP品番',
					width: 18,
				},
				{
					text: 'ロットNO',
					value: 'ロットNO',
					width: 10,
				},
				{
					text: '回路',
					value: '回路',
					width: 10,
					// headerFill: kaikeiHeader,
					// font: kaikeiFont,
				},
				this.selectedSGDate
					? {
							text: 'ST SUB',
							value: 'CA_CQ',
							width: 10,
							headerFill: kaikeiHeader,
							font: kaikeiFont,
					  }
					: undefined,
				this.selectedSGDate
					? {
							text: 'ST ASSY',
							value: 'DA_DP',
							width: 10,
							headerFill: kaikeiHeader,
							font: kaikeiFont,
					  }
					: undefined,
				this.selectedSGDate
					? {
							text: 'ST K.TRA',
							value: 'EA_EP',
							width: 10,
							headerFill: kaikeiHeader,
							font: kaikeiFont,
					  }
					: undefined,
				this.selectedSGDate
					? {
							text: 'ST ALL',
							value: 'ST_ALL',
							width: 10,
							headerFill: kaikeiHeader,
							font: kaikeiFont,
					  }
					: undefined,
				this.selectedSGDate
					? {
							text: 'DON_GIA',
							value: 'DON_GIA',
							width: 10,
							headerFill: kaikeiHeader,
							font: kaikeiFont,
					  }
					: undefined,
				{
					text: 'ラインNO',
					value: 'ラインNO',
					width: 10,
				},
				{
					text: 'ASSY日',
					value: 'ASSY日',
					width: 13,
				},
				{
					text: 'D_START',
					value: 'D_START',
					width: 16,
				},
				{
					text: 'D_END',
					value: 'D_END',
					width: 16,
				},
				{
					text: '指示数',
					value: '指示数',
					width: 8,
				},
				{
					text: '生産合計',
					value: '生産合計',
					width: 9,
				},
				{
					text: '生産合計_CA4',
					value: '生産合計_CA4',
					width: 14,
				},
				{
					text: '生産合計_CA3',
					value: '生産合計_CA3',
					width: 14,
				},
			];

			mHeader = mHeader.filter((it) => {
				return it;
			});

			if (this.kameStyle) {
				mHeader = [...mHeader, ...this.kameHeader];
			} else {
				this.dateScope.forEach((d_item) => {
					mHeader.push({
						text: d_item,
						value: d_item,
					});
					mHeader.push({
						text: d_item + '_CA4',
						value: d_item + '_CA4',
					});

					if (d_item == this.selectedSGDate) {
						mHeader.push(
							{
								text: 'ST_SUB',
								value: 'ST_SUB%CA4',
								width: 12,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'ST_ASSY',
								value: 'ST_ASSY%CA4',
								width: 12,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'ST_K.TRA',
								value: 'ST_QC%CA4',
								width: 12,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'ST_ALL',
								value: 'ST_ALL%CA4',
								width: 12,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'NGUOI SUB',
								value: 'L_CA4_SUB_NGUOI',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'THOI GIAN',
								value: 'L_CA4_SUB_TG',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'NGUOI ASSY',
								value: 'L_CA4_ASSY_NGUOI',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'THOI GIAN',
								value: 'L_CA4_ASSY_TG',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'NGUOI K.TRA',
								value: 'L_CA4_QC_NGUOI',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'THOI GIAN',
								value: 'L_CA4_QC_TG',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'DOANH THU',
								value: 'DOANH_THU',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'LUONG',
								value: 'L_CA4_LUONG',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'LUONG',
								value: 'LUONG',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
						);
					}

					mHeader.push({
						text: d_item + '_CA3',
						value: d_item + '_CA3',
					});

					if (d_item == this.selectedSGDate) {
						mHeader.push(
							{
								text: 'ST_SUB',
								value: 'ST_SUB%CA3',
								width: 12,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'ST_ASSY',
								value: 'ST_ASSY%CA3',
								width: 12,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'ST_K.TRA',
								value: 'ST_QC%CA3',
								width: 12,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'ST_ALL',
								value: 'ST_ALL%CA3',
								width: 12,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'NGUOI SUB',
								value: 'L_CA3_SUB_NGUOI',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'THOI GIAN',
								value: 'L_CA3_SUB_TG',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'NGUOI ASSY',
								value: 'L_CA3_ASSY_NGUOI',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'THOI GIAN',
								value: 'L_CA3_ASSY_TG',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'NGUOI K.TRA',
								value: 'L_CA3_QC_NGUOI',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'THOI GIAN',
								value: 'L_CA3_QC_TG',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'DOANH THU',
								value: 'DOANH_THU',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'LUONG',
								value: 'L_CA3_LUONG',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
							{
								text: 'LUONG',
								value: 'LUONG',
								width: 13,
								headerFill: kaikeiHeader,
								font: kaikeiFont,
							},
						);
					}

					mHeader.push({
						text: d_item + '_残',
						value: d_item + '_残',
					});
					mHeader.push({
						text: d_item + '_START',
						value: d_item + '_START',
					});
					mHeader.push({
						text: d_item + '_END',
						value: d_item + '_END',
					});
				});
			}

			mHeader.push(
				{
					text: 'IP_SUB_LIST',
					value: 'IP_SUB_LIST',
					width: 10,
				},
				{
					text: 'S01',
					value: 'S01',
					width: 5,
				},
				{
					text: 'S02',
					value: 'S02',
					width: 5,
				},
				{
					text: 'S03',
					value: 'S03',
					width: 5,
				},
				{
					text: 'S04',
					value: 'S04',
					width: 5,
				},
				{
					text: 'S05',
					value: 'S05',
					width: 5,
				},
				{
					text: 'S06',
					value: 'S06',
					width: 5,
				},
				{
					text: 'S07',
					value: 'S07',
					width: 5,
				},
				{
					text: 'S08',
					value: 'S08',
					width: 5,
				},
				{
					text: 'S09',
					value: 'S09',
					width: 5,
				},
				{
					text: 'S10',
					value: 'S10',
					width: 5,
				},
				{
					text: 'S11',
					value: 'S11',
					width: 5,
				},
				{
					text: 'S12',
					value: 'S12',
					width: 5,
				},
				{
					text: 'S13',
					value: 'S13',
					width: 5,
				},
				{
					text: 'S14',
					value: 'S14',
					width: 5,
				},
				{
					text: 'S15',
					value: 'S15',
					width: 5,
				},
				{
					text: 'S16',
					value: 'S16',
					width: 5,
				},
				{
					text: 'S17',
					value: 'S17',
					width: 5,
				},
				{
					text: 'S18',
					value: 'S18',
					width: 5,
				},
				{
					text: 'S19',
					value: 'S19',
					width: 5,
				},
				{
					text: 'S20',
					value: 'S20',
					width: 5,
				},
			);

			return mHeader;
		},
		headers() {
			let mHeader = [
				{
					text: 'FAP品番',
					value: 'FAP品番',
					width: 200,
					class: ['tbl-header', 'fixed'],
					cellClass: [
						'cell-normal',
						'cell-boilder',
						'cell-hinban',
						'fixed',
					],
					fixed: true,
				},
				{
					text: 'ロットNO',
					value: 'ロットNO',
					width: 80,
					class: ['tbl-header', 'fixed'],
					cellClass: ['cell-normal', 'cell-boilder', 'fixed'],
					fixed: true,
				},
				this.selectedStatus != 'ALL'
					? {
							text: 'ラインNO',
							value: 'ラインNO',
							width: 10,
							class: ['tbl-header', 'fixed'],
							cellClass: ['cell-normal', 'cell-boilder', 'fixed'],
					  }
					: undefined,
				{
					text: '回路',
					value: '回路',
					width: 80,
					class: ['tbl-header', 'fixed'],
					cellClass: ['cell-normal', 'cell-boilder', 'fixed'],
					fixed: true,
				},
				{
					text: 'ASSY日',
					value: 'ASSY日',
					width: 110,
					class: ['tbl-header', 'assyDateHeader', 'fixed'],
					cellClass: ['cell-normal', 'fixed'],
					fixed: true,
				},
				{
					text: 'D_START',
					value: 'D_START',
					width: 120,
					class: ['tbl-header', 'assyDateHeader'],
					cellClass: ['cell-normal'],
					fixed: true,
				},
				{
					text: 'D_END',
					value: 'D_END',
					width: 120,
					class: ['tbl-header', 'assyDateHeader'],
					cellClass: ['cell-normal'],
					fixed: true,
				},
				this.kameStyle
					? {
							text: 'SCOPE',
							value: 'SCOPE',
							width: 180,
							class: ['tbl-header', 'assyDateHeader'],
							cellClass: ['cell-normal'],
							fixed: true,
					  }
					: undefined,
				{
					text: '指示数',
					value: '指示数',
					width: 90,
					class: ['tbl-header', 'fixed'],
					cellClass: ['cell-normal', 'cell-shiji', 'fixed'],
					fixed: true,
				},
				{
					text: '生産合計',
					value: '生産合計',
					width: 90,
					class: ['tbl-header', 'fixed'],
					cellClass: ['cell-normal', 'cell-total', 'fixed'],
					fixed: true,
				},
				{
					text: 'SUB',
					value: 'SUB',
					width: 150,
					class: ['tbl-header', 'fixed'],
					cellClass: ['cell-sub', 'fixed'],
					fixed: true,
				},
			];

			mHeader = mHeader.filter((it) => {
				return it;
			});

			if (this.kameStyle) {
				mHeader = [...mHeader, ...this.kameHeader];
			} else {
				this.dateScope.forEach((d_item) => {
					mHeader.push(
						this.createTTHeader(
							d_item.substring(5),
							d_item,
							d_item + '_残',
							d_item + '_SUB',
						),
					);
					if (d_item == this.selectedSGDate) {
						mHeader.push(
							{
								text: 'ST_SUB<br/>%CA4',
								value: 'ST_SUB%CA4',
								width: 100,
								class: ['tbl-header', 'text--center'],
								cellClass: [
									'cell-normal',
									'text--center',
									'cell-percent',
								],
							},
							{
								text: 'ST_ASSY<br/>%CA4',
								value: 'ST_ASSY%CA4',
								width: 100,
								class: ['tbl-header', 'text--center'],
								cellClass: [
									'cell-normal',
									'text--center',
									'cell-percent',
								],
							},
							{
								text: 'ST_K.TRA<br/>%CA4',
								value: 'ST_QC%CA4',
								width: 100,
								class: ['tbl-header', 'text--center'],
								cellClass: [
									'cell-normal',
									'text--center',
									'cell-percent',
								],
							},
							{
								text: 'ST_ALL<br/>%CA4',
								value: 'ST_ALL%CA4',
								width: 100,
								class: ['tbl-header', 'text--center'],
								cellClass: [
									'cell-normal',
									'text--center',
									'cell-percent',
								],
							},
							{
								text: 'ST_SUB<br/>%CA3',
								value: 'ST_SUB%CA3',
								width: 100,
								class: ['tbl-header', 'text--center'],
								cellClass: [
									'cell-normal',
									'text--center',
									'cell-percent',
								],
							},
							{
								text: 'ST_ASSY<br/>%CA3',
								value: 'ST_ASSY%CA3',
								width: 100,
								class: ['tbl-header', 'text--center'],
								cellClass: [
									'cell-normal',
									'text--center',
									'cell-percent',
								],
							},
							{
								text: 'ST_K.TRA<br/>%CA3',
								value: 'ST_QC%CA3',
								width: 100,
								class: ['tbl-header', 'text--center'],
								cellClass: [
									'cell-normal',
									'text--center',
									'cell-percent',
								],
							},
							{
								text: 'ST_ALL<br/>%CA3',
								value: 'ST_ALL%CA3',
								width: 100,
								class: ['tbl-header', 'text--center'],
								cellClass: [
									'cell-normal',
									'text--center',
									'cell-percent',
								],
							},
						);
					}
				});
			}

			return mHeader;
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
		clientLine() {
			let line = null;

			if (
				this.initData &&
				this.initData.CLIENT_LINE &&
				this.initData.CLIENT_LINE.length > 0
			) {
				line = this.initData.CLIENT_LINE[0].C_LINE;
			}

			return line;
		},
		lineList_Exp() {
			let l = [];

			if (this.initData && this.initData.LIST_LINE) {
				l = this.initData.LIST_LINE.map((item) => {
					return item.C_LINE;
				});
			}

			return ['ALL', ...l];
		},
		ircsSumPercent() {
			if (this.nhanCongData.length < 1) {
				return [];
			}
		},
		ttIRCS_Data() {
			this.dateScope = [];

			let sumRow = {};
			return this.ttIrcsHinbanData
				.filter((item) => {
					let d = this.$moment(item.ASSY日);
					if (this.selectedStatus == '中') {
						return (
							item.生産合計 != 0 &&
							item.生産合計 < item.L_SUU &&
							item.FAP品番 &&
							d.isValid() &&
							Math.abs(d.diff(this.$moment(), 'days')) < 15
						);
					}

					if (this.selectedStatus == '完成') {
						return item.生産合計 >= item.L_SUU && item.FAP品番;
					}

					if (this.selectedStatus == '未完成') {
						return (
							item.生産合計 < item.L_SUU &&
							item.FAP品番 &&
							d.isValid() &&
							Math.abs(d.diff(this.$moment(), 'days')) < 15
						);
					}

					if (this.selectedStatus == 'まだ') {
						return (
							item.生産合計 == 0 &&
							item.FAP品番 &&
							d.isValid() &&
							Math.abs(d.diff(this.$moment(), 'days')) < 15
						);
					}

					return true;
				})

				.map((item) => {
					if (this.maxNichiCol < 4 && item['4日目'] > 0) {
						this.maxNichiCol = 4;
					}
					if (this.maxNichiCol < 5 && item['5日目'] > 0) {
						this.maxNichiCol = 5;
					}
					if (this.maxNichiCol < 6 && item['6日目'] > 0) {
						this.maxNichiCol = 6;
					}
					if (this.maxNichiCol < 7 && item['7日目'] > 0) {
						this.maxNichiCol = 7;
					}

					let newItem = {
						FAP品番: item.FAP品番,
						ロットNO: item.ロットNO,
						ラインNO: item.ラインNO,
						ASSY日: item.ASSY日,
						指示数: item.L_SUU,
						D_START: item.D_START,
						D_END: item.D_END,
						SCOPE: item.SCOPE,
						生産合計: item.生産合計,
						生産合計_CA4: item.生産合計_CA4,
						生産合計_CA3: item.生産合計_CA3,
						CA_CQ: item.CA_CQ, //SUB
						DA_DP: item.DA_DP, //ASSY
						EA_EP: item.EA_EP, //K,TRA
						ST_ALL: item.ST_ALL,
						回路: item.回路,
						D_LAST_ASSY: item.D_LAST_ASSY,
						'1日目': item['1日目'],
						'1日目_CA4': item['1日目_CA4'],
						'1日目_CA3': item['1日目_CA3'],
						'1日目_TOTAL': item['1日目_TOTAL'],
						'1日目残': item['1日目_ACC'] || 0,
						// '1日目残': (item['1日目'] || 0) - item.L_SUU,
						'1日目_START': item['1日目_START'],
						'1日目_END': item['1日目_END'],
						'2日目': item['2日目'],
						'2日目_CA4': item['2日目_CA4'],
						'2日目_CA3': item['2日目_CA3'],
						'2日目_TOTAL': item['2日目_TOTAL'],
						'2日目残': item['2日目_ACC'] || 0,
						// '2日目残':
						// 	(item['1日目'] || 0) +
						// 	(item['2日目'] || 0) -
						// 	item.L_SUU,
						'2日目_START': item['2日目_START'],
						'2日目_END': item['2日目_END'],
						'3日目': item['3日目'],
						'3日目_CA4': item['3日目_CA4'],
						'3日目_CA3': item['3日目_CA3'],
						'3日目_TOTAL': item['3日目_TOTAL'],
						'3日目残': item['3日目_ACC'] || 0,
						// '3日目残':
						// 	(item['1日目'] || 0) +
						// 	(item['2日目'] || 0) +
						// 	(item['3日目'] || 0) -
						// 	item.L_SUU,
						'3日目_START': item['3日目_START'],
						'3日目_END': item['3日目_END'],
						'4日目': item['4日目'],
						'4日目_CA4': item['4日目_CA4'],
						'4日目_CA3': item['4日目_CA3'],
						'4日目_TOTAL': item['4日目_TOTAL'],
						'4日目残': item['4日目_ACC'] || 0,
						// '4日目残':
						// 	(item['1日目'] || 0) +
						// 	(item['2日目'] || 0) +
						// 	(item['3日目'] || 0) +
						// 	(item['4日目'] || 0) -
						// 	item.L_SUU,
						'4日目_START': item['4日目_START'],
						'4日目_END': item['4日目_END'],
						'5日目': item['5日目'],
						'5日目_CA4': item['5日目_CA4'],
						'5日目_CA3': item['5日目_CA3'],
						'5日目_TOTAL': item['5日目_TOTAL'],
						'5日目残': item['5日目_ACC'] || 0,
						// '5日目残':
						// 	(item['1日目'] || 0) +
						// 	(item['2日目'] || 0) +
						// 	(item['3日目'] || 0) +
						// 	(item['4日目'] || 0) +
						// 	(item['5日目'] || 0) -
						// 	item.L_SUU,
						'5日目_START': item['5日目_START'],
						'5日目_END': item['5日目_END'],
						'6日目': item['6日目'],
						'6日目_CA4': item['6日目_CA4'],
						'6日目_CA3': item['6日目_CA3'],
						'6日目_TOTAL': item['6日目_TOTAL'],
						'6日目残': item['6日目_ACC'] || 0,
						// '6日目残':
						// 	(item['1日目'] || 0) +
						// 	(item['2日目'] || 0) +
						// 	(item['3日目'] || 0) +
						// 	(item['4日目'] || 0) +
						// 	(item['5日目'] || 0) +
						// 	(item['6日目'] || 0) -
						// 	item.L_SUU,
						'6日目_START': item['6日目_START'],
						'6日目_END': item['6日目_END'],
						'7日目': item['7日目'],
						'7日目_CA4': item['7日目_CA4'],
						'7日目_CA3': item['7日目_CA3'],
						'7日目_TOTAL': item['7日目_TOTAL'],
						'7日目残': item['7日目_ACC'] || 0,
						// '7日目残':
						// 	(item['1日目'] || 0) +
						// 	(item['2日目'] || 0) +
						// 	(item['3日目'] || 0) +
						// 	(item['4日目'] || 0) +
						// 	(item['5日目'] || 0) +
						// 	(item['6日目'] || 0) +
						// 	(item['7日目'] || 0) -
						// 	item.L_SUU,
						'7日目_START': item['7日目_START'],
						'7日目_END': item['7日目_END'],
						IP_SUB_LIST: item.IP_SUB_LIST,
						S01: item.S01,
						S02: item.S02,
						S03: item.S03,
						S04: item.S04,
						S05: item.S05,
						S06: item.S06,
						S07: item.S07,
						S08: item.S08,
						S09: item.S09,
						S10: item.S10,
						S11: item.S11,
						S12: item.S12,
						S13: item.S13,
						S14: item.S14,
						S15: item.S15,
						S16: item.S16,
						S17: item.S17,
						S18: item.S18,
						S19: item.S19,
						S20: item.S20,
					};

					if (item.FAP品番) {
						if (item.D_LAST_ASSY) {
							let d_last = this.$moment(item.D_LAST_ASSY);
							let d_check = this.$moment(
								this.selectedDate || this.selectedSGDate,
							);

							if (
								d_check.isValid() &&
								Math.abs(d_last.diff(d_check, 'days')) >= 13
							) {
								newItem['hinStatus'] = 'comback-hin';
							}
						} else {
							newItem['hinStatus'] = 'new-hin';
						}
					}

					//add timeline value
					if (newItem.SCOPE) {
						let scope = newItem.SCOPE.split(';');
						this.dateScope = [
							...new Set([...scope, ...this.dateScope]),
						].sort();

						scope.forEach((item, idx) => {
							switch (idx) {
								case 0:
									newItem[item] = newItem['1日目'];
									newItem[item + '_CA4'] =
										newItem['1日目_CA4'];
									newItem[item + '_CA3'] =
										newItem['1日目_CA3'];
									newItem[item + '_TOTAL'] =
										newItem['1日目_TOTAL'];
									newItem[item + '_残'] = newItem['1日目残'];
									newItem[item + '_START'] =
										newItem['1日目_START'];
									newItem[item + '_END'] =
										newItem['1日目_END'];

									sumRow[item] =
										(sumRow[item] || 0) +
										(newItem['1日目'] || 0);
									sumRow[item + '_CA4'] =
										(sumRow[item + '_CA4'] || 0) +
										(newItem[item + '_CA4'] || 0);
									sumRow[item + '_CA3'] =
										(sumRow[item + '_CA3'] || 0) +
										(newItem[item + '_CA3'] || 0);

									if (!this.kameStyle) {
										sumRow[item + '_残'] =
											(sumRow[item + '_残'] || 0) +
											(newItem[item + '_残'] || 0);
									}

									break;
								case 1:
									newItem[item] = newItem['2日目'];
									newItem[item + '_CA4'] =
										newItem['2日目_CA4'];
									newItem[item + '_CA3'] =
										newItem['2日目_CA3'];
									newItem[item + '_TOTAL'] =
										newItem['2日目_TOTAL'];
									newItem[item + '_残'] = newItem['2日目残'];
									newItem[item + '_START'] =
										newItem['2日目_START'];
									newItem[item + '_END'] =
										newItem['2日目_END'];

									sumRow[item] =
										(sumRow[item] || 0) +
										(newItem['2日目'] || 0);
									sumRow[item + '_CA4'] =
										(sumRow[item + '_CA4'] || 0) +
										(newItem[item + '_CA4'] || 0);
									sumRow[item + '_CA3'] =
										(sumRow[item + '_CA3'] || 0) +
										(newItem[item + '_CA3'] || 0);

									if (!this.kameStyle) {
										sumRow[item + '_残'] =
											(sumRow[item + '_残'] || 0) +
											(newItem[item + '_残'] || 0);
									}
									break;
								case 2:
									newItem[item] = newItem['3日目'];
									newItem[item + '_CA4'] =
										newItem['3日目_CA4'];
									newItem[item + '_CA3'] =
										newItem['3日目_CA3'];
									newItem[item + '_TOTAL'] =
										newItem['3日目_TOTAL'];
									newItem[item + '_残'] = newItem['3日目残'];
									newItem[item + '_START'] =
										newItem['3日目_START'];
									newItem[item + '_END'] =
										newItem['3日目_END'];

									sumRow[item] =
										(sumRow[item] || 0) +
										(newItem['3日目'] || 0);
									sumRow[item + '_CA4'] =
										(sumRow[item + '_CA4'] || 0) +
										(newItem[item + '_CA4'] || 0);
									sumRow[item + '_CA3'] =
										(sumRow[item + '_CA3'] || 0) +
										(newItem[item + '_CA3'] || 0);

									if (!this.kameStyle) {
										sumRow[item + '_残'] =
											(sumRow[item + '_残'] || 0) +
											(newItem[item + '_残'] || 0);
									}
									break;
								case 3:
									newItem[item] = newItem['4日目'];
									newItem[item + '_CA4'] =
										newItem['4日目_CA4'];
									newItem[item + '_CA3'] =
										newItem['4日目_CA3'];
									newItem[item + '_TOTAL'] =
										newItem['4日目_TOTAL'];
									newItem[item + '_残'] = newItem['4日目残'];
									newItem[item + '_START'] =
										newItem['4日目_START'];
									newItem[item + '_END'] =
										newItem['4日目_END'];

									sumRow[item] =
										(sumRow[item] || 0) +
										(newItem['4日目'] || 0);
									sumRow[item + '_CA4'] =
										(sumRow[item + '_CA4'] || 0) +
										(newItem[item + '_CA4'] || 0);
									sumRow[item + '_CA3'] =
										(sumRow[item + '_CA3'] || 0) +
										(newItem[item + '_CA3'] || 0);

									if (!this.kameStyle) {
										sumRow[item + '_残'] =
											(sumRow[item + '_残'] || 0) +
											(newItem[item + '_残'] || 0);
									}
									break;
								case 4:
									newItem[item] = newItem['5日目'];
									newItem[item + '_CA4'] =
										newItem['5日目_CA4'];
									newItem[item + '_CA3'] =
										newItem['5日目_CA3'];
									newItem[item + '_TOTAL'] =
										newItem['5日目_TOTAL'];
									newItem[item + '_残'] = newItem['5日目残'];
									newItem[item + '_START'] =
										newItem['5日目_START'];
									newItem[item + '_END'] =
										newItem['5日目_END'];

									sumRow[item] =
										(sumRow[item] || 0) +
										(newItem['5日目'] || 0);
									sumRow[item + '_CA4'] =
										(sumRow[item + '_CA4'] || 0) +
										(newItem[item + '_CA4'] || 0);
									sumRow[item + '_CA3'] =
										(sumRow[item + '_CA3'] || 0) +
										(newItem[item + '_CA3'] || 0);

									if (!this.kameStyle) {
										sumRow[item + '_残'] =
											(sumRow[item + '_残'] || 0) +
											(newItem[item + '_残'] || 0);
									}
									break;
								case 5:
									newItem[item] = newItem['6日目'];
									newItem[item + '_CA4'] =
										newItem['6日目_CA4'];
									newItem[item + '_CA3'] =
										newItem['6日目_CA3'];
									newItem[item + '_TOTAL'] =
										newItem['6日目_TOTAL'];
									newItem[item + '_残'] = newItem['6日目残'];
									newItem[item + '_START'] =
										newItem['6日目_START'];
									newItem[item + '_END'] =
										newItem['6日目_END'];

									sumRow[item] =
										(sumRow[item] || 0) +
										(newItem['6日目'] || 0);
									sumRow[item + '_CA4'] =
										(sumRow[item + '_CA4'] || 0) +
										(newItem[item + '_CA4'] || 0);
									sumRow[item + '_CA3'] =
										(sumRow[item + '_CA3'] || 0) +
										(newItem[item + '_CA3'] || 0);

									if (!this.kameStyle) {
										sumRow[item + '_残'] =
											(sumRow[item + '_残'] || 0) +
											(newItem[item + '_残'] || 0);
									}
									break;
								case 6:
									newItem[item] = newItem['7日目'];
									newItem[item + '_CA4'] =
										newItem['7日目_CA4'];
									newItem[item + '_CA3'] =
										newItem['7日目_CA3'];
									newItem[item + '_TOTAL'] =
										newItem['7日目_TOTAL'];
									newItem[item + '_残'] = newItem['7日目残'];
									newItem[item + '_START'] =
										newItem['7日目_START'];
									newItem[item + '_END'] =
										newItem['7日目_END'];

									sumRow[item] =
										(sumRow[item] || 0) +
										(newItem['7日目'] || 0);
									sumRow[item + '_CA4'] =
										(sumRow[item + '_CA4'] || 0) +
										(newItem[item + '_CA4'] || 0);
									sumRow[item + '_CA3'] =
										(sumRow[item + '_CA3'] || 0) +
										(newItem[item + '_CA3'] || 0);

									if (!this.kameStyle) {
										sumRow[item + '_残'] =
											(sumRow[item + '_残'] || 0) +
											(newItem[item + '_残'] || 0);
									}
									break;
								default:
							}
						});

						//Bo sung luong con lai neu ngay do chua san xuat
						if (
							!newItem[this.selectedDate + '_残'] &&
							this.selectedDate &&
							scope.slice(-1)[0] < this.selectedDate
						) {
							newItem[this.selectedDate + '_残'] =
								newItem[scope.slice(-1)[0] + '_残'];
							sumRow[this.selectedDate + '_残'] =
								(sumRow[this.selectedDate + '_残'] || 0) +
								(newItem[this.selectedDate + '_残'] || 0);
						}

						if (
							this.selectedDate &&
							!newItem[this.selectedDate + '_残']
						) {
							if (scope[0] < this.selectedDate) {
								newItem[this.selectedDate + '_残'] = 0;
							} else {
								newItem[this.selectedDate + '_残'] =
									(newItem[this.selectedDate] || 0) -
									(newItem.指示数 || 0);
							}

							sumRow[this.selectedDate + '_残'] =
								(sumRow[this.selectedDate + '_残'] || 0) +
								(newItem[this.selectedDate + '_残'] || 0);
						}
					} else if (!newItem.FAP品番) {
						Object.keys(sumRow).forEach((k) => {
							if (this.selectedSGDate) {
								newItem[k] = sumRow[k];
							} else if (this.selectedDate) {
								if (
									k.substr(0, 10) >= this.selectedDate ||
									k.substr(-2) != '_残'
								) {
									newItem[k] = sumRow[k];
								}
							}
						});
						sumRow = {};

						//bo sung du lieu nhan cong
						if (
							this.selectedSGDate &&
							this.nhanCongData.length > 0
						) {
							let nhancong = this.nhanCongData.filter(
								(item) => item.C_LINE == newItem.ラインNO,
							);

							if (nhancong.length > 0) {
								newItem['L_CA4_SUB_NGUOI'] =
									nhancong[0].L_CA4_SUB_NGUOI;
								newItem['L_CA4_SUB_TG'] =
									nhancong[0].L_CA4_SUB_TG;
								newItem['L_CA4_ASSY_NGUOI'] =
									nhancong[0].L_CA4_ASSY_NGUOI;
								newItem['L_CA4_ASSY_TG'] =
									nhancong[0].L_CA4_ASSY_TG;
								newItem['L_CA4_QC_NGUOI'] =
									nhancong[0].L_CA4_QC_NGUOI;
								newItem['L_CA4_QC_TG'] =
									nhancong[0].L_CA4_QC_TG;
								newItem['L_CA4_LUONG'] =
									nhancong[0].L_CA4_LUONG;
								newItem['L_CA4_LUONG_ALL'] =
									nhancong[0].L_CA4_LUONG_ALL;
								newItem['CA4_NHAN_CONG_SUB'] =
									nhancong[0].CA4_NHAN_CONG_SUB;
								newItem['CA4_NHAN_CONG_ASSY'] =
									nhancong[0].CA4_NHAN_CONG_ASSY;
								newItem['CA4_NHAN_CONG_QC'] =
									nhancong[0].CA4_NHAN_CONG_QC;
								newItem['CA4_NHAN_CONG_ALL'] =
									nhancong[0].CA4_NHAN_CONG_ALL;
								newItem['L_CA3_SUB_NGUOI'] =
									nhancong[0].L_CA3_SUB_NGUOI;
								newItem['L_CA3_SUB_TG'] =
									nhancong[0].L_CA3_SUB_TG;
								newItem['L_CA3_ASSY_NGUOI'] =
									nhancong[0].L_CA3_ASSY_NGUOI;
								newItem['L_CA3_ASSY_TG'] =
									nhancong[0].L_CA3_ASSY_TG;
								newItem['L_CA3_QC_NGUOI'] =
									nhancong[0].L_CA3_QC_NGUOI;
								newItem['L_CA3_QC_TG'] =
									nhancong[0].L_CA3_QC_TG;
								newItem['L_CA3_LUONG'] =
									nhancong[0].L_CA3_LUONG;
								newItem['L_CA3_LUONG_ALL'] =
									nhancong[0].L_CA3_LUONG_ALL;
								newItem['CA3_NHAN_CONG_SUB'] =
									nhancong[0].CA3_NHAN_CONG_SUB;
								newItem['CA3_NHAN_CONG_ASSY'] =
									nhancong[0].CA3_NHAN_CONG_ASSY;
								newItem['CA3_NHAN_CONG_QC'] =
									nhancong[0].CA3_NHAN_CONG_QC;
								newItem['CA3_NHAN_CONG_ALL'] =
									nhancong[0].CA3_NHAN_CONG_ALL;

								//tinh % CONG DOAN
								let phiNhanCong = this.nhanCongData.filter(
									(item) => item.C_LINE == newItem.ラインNO,
								);

								if (phiNhanCong.length == 1) {
									let sData = {};
									this.ttIrcsHinbanData.forEach((it) => {
										if (
											it.ラインNO ==
												phiNhanCong[0].C_LINE &&
											it.SCOPE
										) {
											let scopes = it.SCOPE.split(';');
											scopes.forEach((d, idx) => {
												if (d == this.selectedSGDate) {
													console.log(idx);
													switch (idx) {
														case 0:
															it[
																this
																	.selectedSGDate +
																	'_CA4'
															] = it['1日目_CA4'];
															it[
																this
																	.selectedSGDate +
																	'_CA3'
															] = it['1日目_CA3'];
															// console.log(
															// 	it['1日目_CA4'],
															// );
															break;
														case 1:
															it[
																this
																	.selectedSGDate +
																	'_CA4'
															] = it['2日目_CA4'];
															it[
																this
																	.selectedSGDate +
																	'_CA3'
															] = it['2日目_CA3'];
															break;
														case 2:
															it[
																this
																	.selectedSGDate +
																	'_CA4'
															] = it['3日目_CA4'];
															it[
																this
																	.selectedSGDate +
																	'_CA3'
															] = it['3日目_CA3'];
															break;
														case 3:
															it[
																this
																	.selectedSGDate +
																	'_CA4'
															] = it['4日目_CA4'];
															it[
																this
																	.selectedSGDate +
																	'_CA3'
															] = it['4日目_CA3'];
															break;
														case 4:
															it[
																this
																	.selectedSGDate +
																	'_CA4'
															] = it['5日目_CA4'];
															it[
																this
																	.selectedSGDate +
																	'_CA3'
															] = it['5日目_CA3'];
															break;
														case 5:
															it[
																this
																	.selectedSGDate +
																	'_CA4'
															] = it['6日目_CA4'];
															it[
																this
																	.selectedSGDate +
																	'_CA3'
															] = it['6日目_CA3'];
															break;
														case 6:
															it[
																this
																	.selectedSGDate +
																	'_CA4'
															] = it['7日目_CA4'];
															it[
																this
																	.selectedSGDate +
																	'_CA3'
															] = it['7日目_CA3'];
															break;
													}
												}
											});

											//CA4
											sData['ST_SUB_CA4_SUM'] =
												(sData['ST_SUB_CA4_SUM'] || 0) +
												(it.CA_CQ || 0) *
													(it[
														this.selectedSGDate +
															'_CA4'
													] || 0);

											sData['ST_ASSY_CA4_SUM'] =
												(sData['ST_ASSY_CA4_SUM'] ||
													0) +
												(it.DA_DP || 0) *
													(it[
														this.selectedSGDate +
															'_CA4'
													] || 0);

											sData['ST_QC_CA4_SUM'] =
												(sData['ST_QC_CA4_SUM'] || 0) +
												(it.EA_EP || 0) *
													(it[
														this.selectedSGDate +
															'_CA4'
													] || 0);

											sData['ST_ALL_CA4_SUM'] =
												(sData['ST_ALL_CA4_SUM'] || 0) +
												(it.ST_ALL || 0) *
													(it[
														this.selectedSGDate +
															'_CA4'
													] || 0);

											//CA3
											sData['ST_SUB_CA3_SUM'] =
												(sData['ST_SUB_CA3_SUM'] || 0) +
												(it.CA_CQ || 0) *
													(it[
														this.selectedSGDate +
															'_CA3'
													] || 0);

											sData['ST_ASSY_CA3_SUM'] =
												(sData['ST_ASSY_CA3_SUM'] ||
													0) +
												(it.DA_DP || 0) *
													(it[
														this.selectedSGDate +
															'_CA3'
													] || 0);

											sData['ST_QC_CA3_SUM'] =
												(sData['ST_QC_CA3_SUM'] || 0) +
												(it.EA_EP || 0) *
													(it[
														this.selectedSGDate +
															'_CA3'
													] || 0);

											sData['ST_ALL_CA3_SUM'] =
												(sData['ST_ALL_CA3_SUM'] || 0) +
												(it.ST_ALL || 0) *
													(it[
														this.selectedSGDate +
															'_CA3'
													] || 0);
										}
									});

									// let congSoSUB_CA4 =
									// 	(newItem['L_CA4_SUB_NGUOI'] || 0) *
									// 	(newItem['L_CA4_SUB_TG'] || 0);
									newItem['ST_SUB%CA4'] =
										newItem['CA4_NHAN_CONG_SUB'] > 0
											? sData.ST_SUB_CA4_SUM /
											  newItem['CA4_NHAN_CONG_SUB']
											: 0;
									// let congSoASSY_CA4 =
									// 	(newItem['L_CA4_ASSY_NGUOI'] || 0) *
									// 	(newItem['L_CA4_ASSY_TG'] || 0);
									newItem['ST_ASSY%CA4'] =
										newItem['CA4_NHAN_CONG_ASSY'] > 0
											? sData.ST_ASSY_CA4_SUM /
											  newItem['CA4_NHAN_CONG_ASSY']
											: 0;
									// let congSoQC_CA4 =
									// 	(newItem['L_CA4_QC_NGUOI'] || 0) *
									// 	(newItem['L_CA4_QC_TG'] || 0);
									newItem['ST_QC%CA4'] =
										newItem['CA4_NHAN_CONG_QC'] > 0
											? sData.ST_QC_CA4_SUM /
											  newItem['CA4_NHAN_CONG_QC']
											: 0;
									// let congSoALL_CA4 =
									// 	(newItem['L_CA4_SUB_NGUOI'] || 0) *
									// 		(newItem['L_CA4_SUB_TG'] || 0) +
									// 	(newItem['L_CA4_ASSY_NGUOI'] || 0) *
									// 		(newItem['L_CA4_ASSY_TG'] || 0) +
									// 	(newItem['L_CA4_QC_NGUOI'] || 0) *
									// 		(newItem['L_CA4_QC_TG'] || 0);
									newItem['ST_ALL%CA4'] =
										newItem['CA4_NHAN_CONG_ALL'] > 0
											? sData.ST_ALL_CA4_SUM /
											  newItem['CA4_NHAN_CONG_ALL']
											: 0;

									// let congSoSUB_CA3 =
									// 	(newItem['L_CA3_SUB_NGUOI'] || 0) *
									// 	(newItem['L_CA3_SUB_TG'] || 0);
									newItem['ST_SUB%CA3'] =
										newItem['CA3_NHAN_CONG_SUB'] > 0
											? sData.ST_SUB_CA3_SUM /
											  newItem['CA3_NHAN_CONG_SUB']
											: 0;
									// let congSoASSY_CA3 =
									// 	(newItem['L_CA3_ASSY_NGUOI'] || 0) *
									// 	(newItem['L_CA3_ASSY_TG'] || 0);
									newItem['ST_ASSY%CA3'] =
										newItem['CA3_NHAN_CONG_ASSY'] > 0
											? sData.ST_ASSY_CA3_SUM /
											  newItem['CA3_NHAN_CONG_ASSY']
											: 0;
									// let congSoQC_CA3 =
									// 	(newItem['L_CA3_QC_NGUOI'] || 0) *
									// 	(newItem['L_CA3_QC_TG'] || 0);
									newItem['ST_QC%CA3'] =
										newItem['CA3_NHAN_CONG_QC'] > 0
											? sData.ST_QC_CA3_SUM /
											  newItem['CA3_NHAN_CONG_QC']
											: 0;
									// let congSoALL_CA3 =
									// 	(newItem['L_CA3_SUB_NGUOI'] || 0) *
									// 		(newItem['L_CA3_SUB_TG'] || 0) +
									// 	(newItem['L_CA3_ASSY_NGUOI'] || 0) *
									// 		(newItem['L_CA3_ASSY_TG'] || 0) +
									// 	(newItem['L_CA3_QC_NGUOI'] || 0) *
									// 		(newItem['L_CA3_QC_TG'] || 0);
									newItem['ST_ALL%CA3'] =
										newItem['CA3_NHAN_CONG_ALL'] > 0
											? sData.ST_ALL_CA3_SUM /
											  newItem['CA3_NHAN_CONG_ALL']
											: 0;
								}
							}
						}
					} else {
						if (this.selectedDate) {
							newItem[this.selectedDate + '_残'] =
								newItem.指示数 * -1;

							if (!this.kameStyle) {
								sumRow[this.selectedDate + '_残'] =
									(sumRow[this.selectedDate + '_残'] || 0) +
									(newItem[this.selectedDate + '_残'] || 0);
							}
						}
					}

					//SUB Tooltip
					if (newItem.IP_SUB_LIST) {
						let ipList = newItem.IP_SUB_LIST.split(';');

						ipList.forEach((ip, idx) => {
							if (idx < 4) {
								newItem['subTooltip1'] =
									(newItem['subTooltip1'] || '') +
									ip +
									': ' +
									newItem[`S${this.$pad(idx + 1)}`] +
									'<br>';
							} else if (idx < 8) {
								newItem['subTooltip2'] =
									(newItem['subTooltip2'] || '') +
									ip +
									': ' +
									newItem[`S${this.$pad(idx + 1)}`] +
									'<br>';
							} else if (idx < 12) {
								newItem['subTooltip3'] =
									(newItem['subTooltip3'] || '') +
									ip +
									': ' +
									newItem[`S${this.$pad(idx + 1)}`] +
									'<br>';
							} else if (idx < 16) {
								newItem['subTooltip4'] =
									(newItem['subTooltip4'] || '') +
									ip +
									': ' +
									newItem[`S${this.$pad(idx + 1)}`] +
									'<br>';
							}
						});
					}

					return newItem;
				});
		},
		masterKaikeiView() {
			return [...this.kaikei.masterRes];
		},
		// xlsData_Err() {
		// 	return [];
		// },
		kaikeiView() {
			return [
				{
					C_HIN: ' ',
					SUB_NGUOI: '(1)',
					SUB_TG: '(2)',
					ASSY_NGUOI: '(3)',
					ASSY_TG: '(4)',
					QC_NGUOI: '(5)',
					QC_TG: '(6)',
					L_NHAN_CONG_SUB: '(7)= (1)*(2)',
					L_NHAN_CONG_ASSY: '(8)= (3)*(4)',
					L_NHAN_CONG_QC: '(9)= (5)*(6)',
					L_NHAN_CONG_ALL: '(10)= (7)+(8)+(9)',
					L_SAN_LUONG_IRCS: '(11)',
					ST_ALL: '(12)= sum((11)*(12))',
					ALL_PERCENT: '(13)= (12)/(10)',
				},
				...this.kaikeiExp.kaikeiRes.map((item) => {
					delete item.D_START;
					if (item.C_HIN) {
						delete item.SUB_NGUOI;
						delete item.SUB_TG;
						delete item.ASSY_NGUOI;
						delete item.ASSY_TG;
						delete item.QC_NGUOI;
						delete item.QC_TG;
					} else {
						// delete item.CA_CQ;
						// delete item.DA_DP;
						// delete item.EA_EP;
						// delete item.ST_ALL;
					}
					return item;
				}),
			];
		},
	},
	created: function () {
		// var self = this;
		// setInterval(function() {
		// 	if (self.p < 100) {
		// 		self.p++;
		// 	}
		// }, 100);
	},
	components: {},
	methods: {
		createTTHeader(text, val1, val2, val3) {
			return {
				text: text,
				divider: true,
				class: ['tbl-header', 'text--center'],
				width: 150,
				children: [
					// {
					// 	text: 'SUB',
					// 	value: val3,
					// 	class: ['tbl-header', 'text--center'],
					// 	cellClass: ['cell-number'],
					// 	width: 50,
					// },
					{
						text: '実',
						value: val1,
						class: ['tbl-header', 'text--center'],
						cellClass: ['cell-number'],
						width: 50,
					},
					{
						text: '残',
						value: val2,
						class: ['tbl-header', 'text--center'],
						cellClass: ['cell-number'],
						width: 50,
					},
				],
			};
		},
		createTTExcelHeader(text, val1, val2) {
			return {
				text: text,
				divider: true,
				class: ['tbl-header', 'text--center'],
				width: 100,
				children: [
					{
						text: '実',
						value: val1,
						class: ['tbl-header', 'text--center'],
						cellClass: ['cell-number'],
						width: 50,
					},
					{
						text: '残',
						value: val2,
						class: ['tbl-header', 'text--center'],
						cellClass: ['cell-number'],
						width: 50,
					},
				],
			};
		},
		allowedDatePicker(dateStr) {
			let d_max = new Date();
			let d_min = new Date();
			let d = new Date(dateStr);
			d_max.setDate(d_max.getDate() + 30);
			d_min.setDate(d_min.getDate() - 60);
			return d_min < d && d <= d_max;
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
		rowClass(item) {
			return 'row-normal';
		},
		async getInit() {
			try {
				let res = await this.$axios.get('/tt-ircs/init');

				this.initData = res.data;
				console.log(this.initData);
			} catch (error) {
				console.log(error);
			} finally {
				if (this.clientLine) {
					this.kaikei.line = this.clientLine;
				}
			}
		},
		getSubHeader(headers) {
			let result = [];
			headers
				.filter((i) => i.children)
				.forEach((v) => {
					result = result.concat(v.children);
				});
			return result;
		},
		getRows(rows) {
			// console.log(rows);
			// const result = {};
			const result = [];
			this.headers.forEach((i, key) => {
				// console.log(i, key);
				let colVal;
				if (i.children) {
					i.children.forEach((i1, key1) => {
						// result['c' + key1] = i1;
						// result[i1.value] = rows[i1.value];
						colVal = rows[i1.value];
						result.push({ ...i1, colVal });
					});
				} else {
					colVal = rows[i.value];
					result.push({ ...i, colVal });
				}
			});
			return result;
		},
		dayFormat(dateStr) {
			return dateStr.substring(dateStr.length - 2);
		},
		handleUploadBtnClick() {
			this.$refs.uploadFile.value = null;
			this.$refs.uploadFile.click();
		},
		async openMasterKaikei() {
			this.kaikei.d_assy = this.today;
			this.kaikei.masterRes = [];

			this.searchMasterKaikei();
			this.kaikeiDialog = true;
		},
		async btnMasterKaikeiIMPClick() {
			if (await this.$LOGIN_CONFIRM(this, this.$route.name, 'Q13')) {
				this.$refs.uploadKaikeiFile.value = null;
				this.$refs.uploadKaikeiFile.click();
			}
		},
		async handleFileChange(e) {
			if (!this.$refs.uploadKaikeiFile.value) {
				return;
			}

			let d_assy_min;

			this.rawFile = e.target.files[0];

			this.loading = true;

			let wb = await this.$readXLSX(this, this.rawFile);
			// this.xlsData = this.$XLSX.utils.sheet_to_json(
			// 	wb.Sheets[wb.SheetNames[0]],
			// 	{ raw: false, dateNF: 'yyyy-mm-dd' },
			// );
			let khungGioSai = [];
			let ngayAssySai = [];

			this.xlsData = this.$XLSX.utils
				.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
					raw: false,
					dateNF: 'yyyy-mm-dd HH:mm:ss',
				})
				.filter((item) => {
					if (
						item.D_ASSY != '' &&
						item.D_ASSY &&
						item.C_LINE &&
						item.C_CA &&
						item.C_START &&
						item.C_END
					) {
						if (!d_assy_min || d_assy_min > item.D_ASSY)
							d_assy_min = item.D_ASSY;
					}
					return (
						item.D_ASSY &&
						item.C_LINE &&
						item.C_CA &&
						item.C_START &&
						item.C_END
					);
				})
				.filter((item) => {
					if (!/\d{4}-\d{2}-\d{2}/.test(item.D_ASSY)) {
						ngayAssySai.push(item.D_ASSY);
					}

					return /\d{4}-\d{2}-\d{2}/.test(item.D_ASSY);
				})
				.filter((item) => {
					let d_start = this.$moment(item.C_START);
					let d_end = this.$moment(item.C_END);

					if (
						!/\d{2}:\d{2}/.test(
							item.C_START.replace(
								/^\d{4}-\d{2}-\d{2}\s*/g,
								'',
							).substring(0, 5) || !d_start.isValid(),
						)
					) {
						khungGioSai.push(item.C_START);
						console.log(item.C_START);
					}

					if (
						!/\d{2}:\d{2}/.test(
							item.C_END.replace(
								/^\d{4}-\d{2}-\d{2}\s*/g,
								'',
							).substring(0, 5) || !d_end.isValid(),
						)
					) {
						khungGioSai.push(item.C_END);
						console.log(item.C_END);
					}

					return (
						/\d{2}:\d{2}/.test(
							item.C_START.replace(
								/^\d{4}-\d{2}-\d{2}\s*/g,
								'',
							).substring(0, 5),
						) &&
						/\d{2}:\d{2}/.test(
							item.C_END.replace(
								/^\d{4}-\d{2}-\d{2}\s*/g,
								'',
							).substring(0, 5),
						) &&
						d_start.isValid() &&
						d_end.isValid()
					);
				});
			this.loading = false;
			console.log(this.xlsData);
			// this.updateMaster(this.xlsData);

			if (this.xlsData.length < 1) {
				this.$toast.show(
					`File import không đúng Format hoặc không có dữ liệu!`,
					{
						duration: 5000,
						position: 'bottom-center',
					},
				);
				return;
			}

			if (ngayAssySai.length > 0) {
				this.$toast.show(
					`Có dữ liệu Ngày ASSY bị sai. Hãy kiểm tra lại file IMPORT!!!`,
					{
						duration: 8000,
						position: 'bottom-center',
					},
				);

				console.log(ngayAssySai);
				return;
			}
			if (khungGioSai.length > 0) {
				this.$toast.show(
					`Có dữ liệu giờ bị sai. Hãy kiểm tra lại file IMPORT!!!`,
					{
						duration: 8000,
						position: 'bottom-center',
					},
				);

				console.log(khungGioSai);
				return;
			}
			if (
				d_assy_min &&
				Math.abs(
					this.$moment(d_assy_min).diff(this.$moment(), 'days'),
				) > 20
			) {
				this.$toast.show(`Ngày Assy cách ngày hiện tại quá 20 ngày!`, {
					duration: 5000,
					position: 'bottom-center',
				});
				return;
			}

			//==========================
			this.xlsData = this.xlsData.map((item) => {
				let phut_giai_lao = parseFloat(item['SO_PHUT_GIAI_LAO']) || 0;
				console.log(phut_giai_lao, item['SO_PHUT_GIAI_LAO']);
				item['SUB_TG'] = item['SUB_TG'] || 0;
				item['ASSY_TG'] = item['ASSY_TG'] || 0;
				item['QC_TG'] = item['QC_TG'] || 0;

				if (
					item['SUB_TG'] == 0 &&
					item['ASSY_TG'] == 0 &&
					item['QC_TG'] == 0
				) {
					let d_start = this.$moment(item['C_START']);
					let d_end = this.$moment(item['C_END']);

					if (d_end.isValid() && d_end.format('HH:mm') < '06:30') {
						d_end = d_end.add(1, 'days');
					}

					if (
						d_start.isValid() &&
						d_start.format('HH:mm') < '06:30'
					) {
						d_start = d_start.add(1, 'days');
					}

					if (d_start.isValid() && d_end.isValid()) {
						let diffMinutes = d_end.diff(d_start) / 60000;
						if (phut_giai_lao >= 0) {
							diffMinutes = diffMinutes - phut_giai_lao;
							console.log(diffMinutes);
						}
						if (diffMinutes >= 0) {
							item['SUB_TG'] = diffMinutes;
							item['ASSY_TG'] = diffMinutes;
							item['QC_TG'] = diffMinutes;
						} else {
							item['SUB_TG'] = 0;
							item['ASSY_TG'] = 0;
							item['QC_TG'] = 0;
						}
					}
				}
				return item;
			});

			// else {
			let binDT = {
				d_assy: this.xlsData.map((item) => {
					return item.D_ASSY.substring(0, 10);
				}),
				line: this.xlsData.map((item) => {
					return item.C_LINE;
				}),
				ca: this.xlsData.map((item) => {
					return item.C_CA;
				}),
				start: this.xlsData.map((item) => {
					return item.C_START.replace(
						/^\d{4}-\d{2}-\d{2}\s*/g,
						'',
					).substring(0, 5);
					// return item.C_START | VMask(timeRangeMask);
				}),
				end: this.xlsData.map((item) => {
					return item.C_END.replace(
						/^\d{4}-\d{2}-\d{2}\s*/g,
						'',
					).substring(0, 5);
					// return item.C_END | VMask(timeRangeMask);
				}),
				sub_nguoi: this.xlsData.map((item) => {
					return parseFloat(item.SUB_NGUOI);
				}),
				sub_tg: this.xlsData.map((item) => {
					return parseFloat(item.SUB_TG);
				}),
				assy_nguoi: this.xlsData.map((item) => {
					return parseFloat(item.ASSY_NGUOI);
				}),
				assy_tg: this.xlsData.map((item) => {
					return parseFloat(item.ASSY_TG);
				}),
				qc_nguoi: this.xlsData.map((item) => {
					return parseFloat(item.QC_NGUOI);
				}),
				qc_tg: this.xlsData.map((item) => {
					return parseFloat(item.QC_TG);
				}),
				phut_giai_lao: this.xlsData.map((item) => {
					return parseFloat(item.SO_PHUT_GIAI_LAO) || 0;
				}),
				replace_all: 1,
				user: this.$nuxt.context.confirmedUserInfo.C_EMPLOYEE || null,
			};

			// console.log(ngayAssySai);
			// console.log(khungGioSai);
			console.log(binDT);
			this.updateMaster(binDT);
			// }
		},
		async updateMaster(bindData) {
			console.log(bindData);
			// if (bindData.length > 0)
			try {
				this.loading = true;
				let res = await this.$axios.post(
					'tt-ircs-hinban/update-master-kaikei',
					bindData,
				);
				this.loading = false;
				console.log(res, res.data.message);
				if (res.data.message != 'success') {
					this.$toast.show(`Có lỗi xảy ra!\n${res.data.message}`, {
						duration: 5000,
						position: 'bottom-center',
					});
				} else {
					this.$toast.show('Đã đăng lục xong!', {
						duration: 3000,
						position: 'bottom-center',
					});
				}
			} catch (err) {
				console.log(err);
			} finally {
				this.loading = false;
				this.searchMasterKaikei();
			}
		},
		async editMasterKaikei(item) {
			console.log(item);
			if (!(await this.$LOGIN_CONFIRM(this, this.$route.name, 'Q2'))) {
				return;
			}

			item.state = 1; //edit

			this.kaikei.editingMasterItem = Object.assign({}, item);

			this.kaikei.masterRes = Object.assign([], this.kaikei.masterRes); // rerender view
		},
		cancelEditMasterKaikei(item) {
			item.state = null;
			this.kaikei.editingMasterItem = [];
			this.kaikei.masterRes = Object.assign([], this.kaikei.masterRes);
		},
		async saveEditingMasterKaikei() {
			// console.log(
			// 	Math.abs(
			// 	this.$moment(this.kaikei.editingMasterItem['D_ASSY']).diff(
			// 		this.$moment(),
			// 		'days',
			// 	))>20
			// );
			// return;
			if (
				Math.abs(
					this.$moment(this.kaikei.editingMasterItem['D_ASSY']).diff(
						this.$moment(),
						'days',
					),
				) > 20
			) {
				this.$toast.show(
					`Không được chỉnh sửa/đăng lục Master Kaikei cho ngày Assy quá 20 ngày!`,
					{
						duration: 5000,
						position: 'bottom-center',
					},
				);
				return;
			}

			if (
				!/^\d{2}:\d{2}$/g.test(
					this.kaikei.editingMasterItem['C_START'],
				) ||
				!/^\d{2}:\d{2}$/g.test(this.kaikei.editingMasterItem['C_END'])
			) {
				this.$toast.show(`Không đúng định dạng HH:mm`, {
					duration: 5000,
					position: 'bottom-center',
				});
				return;
			}

			if (
				this.kaikei.editingMasterItem['SUB_NGUOI'] < 0 ||
				this.kaikei.editingMasterItem['SUB_TG'] < 0 ||
				this.kaikei.editingMasterItem['ASSY_NGUOI'] < 0 ||
				this.kaikei.editingMasterItem['ASSY_TG'] < 0 ||
				this.kaikei.editingMasterItem['QC_NGUOI'] < 0 ||
				this.kaikei.editingMasterItem['QC_TG'] < 0
			) {
				this.$toast.show(`Không được nhập số âm!!`, {
					duration: 5000,
					position: 'bottom-center',
				});
				return;
			}

			let bindData = {
				d_assy: [this.kaikei.editingMasterItem['D_ASSY']],
				line: [this.kaikei.editingMasterItem['C_LINE']],
				ca: [this.kaikei.editingMasterItem['C_CA']],
				start: [this.kaikei.editingMasterItem['C_START']],
				end: [this.kaikei.editingMasterItem['C_END']],
				sub_nguoi: [
					this.kaikei.editingMasterItem['SUB_NGUOI']
						? parseFloat(this.kaikei.editingMasterItem['SUB_NGUOI'])
						: null,
				],
				sub_tg: [
					this.kaikei.editingMasterItem['SUB_TG']
						? parseFloat(this.kaikei.editingMasterItem['SUB_TG'])
						: null,
				],
				assy_nguoi: [
					this.kaikei.editingMasterItem['ASSY_NGUOI']
						? parseFloat(
								this.kaikei.editingMasterItem['ASSY_NGUOI'],
						  )
						: null,
				],
				assy_tg: [
					this.kaikei.editingMasterItem['ASSY_TG']
						? parseFloat(this.kaikei.editingMasterItem['ASSY_TG'])
						: null,
				],
				qc_nguoi: [
					this.kaikei.editingMasterItem['QC_NGUOI']
						? parseFloat(this.kaikei.editingMasterItem['QC_NGUOI'])
						: null,
				],
				qc_tg: [
					this.kaikei.editingMasterItem['QC_TG']
						? parseFloat(this.kaikei.editingMasterItem['QC_TG'])
						: null,
				],
				replace_all: 0,
				user: this.$nuxt.context.confirmedUserInfo.C_EMPLOYEE || null,
			};
			// console.Console.apply.
			// if (bindData.length > 0)
			try {
				this.loading = true;
				let res = await this.$axios.post(
					'tt-ircs-hinban/update-master-kaikei',
					// 'tt-ircs-hinban/upload-cong-so',
					bindData,
				);
				this.loading = false;
				console.log(res);
				if (res.data.message != 'success') {
					this.$toast.show(`Có lỗi xảy ra!\n${res.data.message}`, {
						duration: 5000,
						position: 'bottom-center',
					});
				} else {
					this.$toast.show('Đã lưu!', {
						duration: 3000,
						position: 'bottom-center',
					});
				}
			} catch (err) {
				console.log(err);
			} finally {
				this.loading = false;
				this.searchMasterKaikei();
			}
		},
		async addNewMasterKaikei() {
			if (!this.kaikei.d_assy || !this.kaikei.ca || !this.kaikei.line) {
				this.$toast.show(
					`Hãy chọn [Ngày Assy], [Line], [CA] trước!!!!`,
					{
						duration: 5000,
						position: 'bottom-center',
					},
				);
				return;
			}

			if (!(await this.$LOGIN_CONFIRM(this, this.$route.name, 'Q1'))) {
				return;
			}

			let newItem = {
				state: 2,
				D_ASSY: this.kaikei.d_assy,
				C_LINE: this.kaikei.line,
				C_CA: this.kaikei.ca,
			};

			this.kaikei.masterRes.push(newItem);
			this.kaikei.editingMasterItem = newItem;
		},
		async deleteSelectedMasterKaikeiItems() {
			let d_assy_min;
			this.kaikei.selectedMasterItems.forEach((item) => {
				if (!d_assy_min || d_assy_min > item.D_ASSY) {
					d_assy_min = item.D_ASSY;
				}
			});

			if (
				d_assy_min &&
				Math.abs(
					this.$moment(d_assy_min).diff(this.$moment(), 'days'),
				) > 20
			) {
				this.$toast.show(
					`Không được xóa ngày Assy cách ngày hiện tại quá 20 ngày!`,
					{
						duration: 5000,
						position: 'bottom-center',
					},
				);
				return;
			}

			if (!(await this.$LOGIN_CONFIRM(this, this.$route.name, 'Q3'))) {
				return;
			}

			if (
				!(await this.$CONFIRM(
					this,
					'Cảnh Báo',
					`<span class='text-h4'>Bạn có chắc muốn xóa?</span>
				`,
					{
						persistent: true,
						color: 'red',
						okText: 'OK',
						disableCancel: false,
						width: 550,
					},
				))
			) {
				return;
			}

			try {
				this.loading = true;
				let res = await this.$axios.post(
					'tt-ircs-hinban/delete-master-kaikei',
					{
						d_assy: this.kaikei.selectedMasterItems.map((item) => {
							return item.D_ASSY;
						}),
						line: this.kaikei.selectedMasterItems.map((item) => {
							return item.C_LINE;
						}),
						start: this.kaikei.selectedMasterItems.map((item) => {
							return item.C_START;
						}),
					},
				);
				this.loading = false;
				console.log(res);
				if (res.data.message != 'success') {
					this.$toast.show(`Có lỗi xảy ra!\n${res.data.message}`, {
						duration: 5000,
						position: 'bottom-center',
					});
				} else {
					this.$toast.show('Đã xóa!', {
						duration: 3000,
						position: 'bottom-center',
					});
				}
			} catch (err) {
				console.log(err);
			} finally {
				this.loading = false;
				this.searchMasterKaikei();
			}
		},
		async searchMasterKaikei() {
			let apiURL = '/tt-ircs-hinban/search-master-kaikei?1=1';
			if (this.kaikei.d_assy && this.kaikei.d_assy !== '') {
				apiURL = apiURL + '&date=' + this.kaikei.d_assy;
			}
			if (this.kaikei.line && this.kaikei.line !== '') {
				apiURL = apiURL + '&line=' + this.kaikei.line;
			}
			if (this.kaikei.ca && this.kaikei.ca !== '') {
				apiURL = apiURL + '&ca=' + this.kaikei.ca;
			}

			try {
				this.loading = true;

				let res = await this.$axios.get(apiURL);
				// handle success
				console.log(res.data.data);
				this.kaikei.masterRes =
					res.data.data.map((item) => {
						item['id'] = item.D_ASSY + item.C_LINE + item.C_START;
						return item;
					}) || [];

				this.loading = false;
				if (this.kaikei.masterRes.length < 1) {
					this.$toast.show('Không có dữ liệu!', {
						duration: 4000,
						position: 'bottom-center',
					});
				}

				this.kaikei.editingMasterItem = {};
			} catch (err) {
				console.log(err);
				if (this.kaikei.masterRes.length < 1) {
					this.$toast.show('Có lỗi xảy ra!!!', {
						duration: 5000,
						position: 'bottom-center',
					});
				}
			} finally {
				this.loading = false;
				this.kaikei.selectedMasterItems = [];
			}
		},
		async searchKaikei() {
			let apiURL = '/tt-ircs-hinban/search-kaikei?1=1';
			if (this.kaikei.d_assy && this.kaikei.d_assy !== '') {
				apiURL = apiURL + '&date=' + this.kaikei.d_assy;
			}
			if (this.kaikei.line && this.kaikei.line !== '') {
				apiURL = apiURL + '&line=' + this.kaikei.line;
			}
			if (this.kaikei.ca && this.kaikei.ca !== '') {
				apiURL = apiURL + '&ca=' + this.kaikei.ca;
			}

			try {
				this.loading = true;

				let res = await this.$axios.get(apiURL);
				// handle success
				console.log(res.data.data);
				this.kaikeiExp.kaikeiRes = res.data.data || [];

				this.loading = false;
				if (this.kaikeiExp.kaikeiRes.length < 1) {
					this.$toast.show('Không có dữ liệu!', {
						duration: 4000,
						position: 'bottom-center',
					});
				}
			} catch (err) {
				console.log(err);
				if (this.kaikeiExp.kaikeiRes.length < 1) {
					this.$toast.show('Có lỗi xảy ra!!!', {
						duration: 5000,
						position: 'bottom-center',
					});
				}
			} finally {
				this.loading = false;
			}
		},
		async getData() {
			// console.log('load data @ ' + this.selectedDate);
			let apiURL = '/tt-ircs-hinban-v3?1=1';
			if (this.selectedDate && this.selectedDate !== '') {
				apiURL = apiURL + '&date=' + this.selectedDate;
			}
			if (this.selectedSGDate && this.selectedSGDate !== '') {
				apiURL = apiURL + '&sgdate=' + this.selectedSGDate;
			}

			try {
				this.loading = true;
				let res_NhanCong;
				if (this.selectedSGDate) {
					res_NhanCong = await this.$axios.get(
						`/tt-ircs-hinban/get-nhan-cong?date=${this.selectedSGDate}`,
					);

					this.nhanCongData = [...res_NhanCong.data.data];
					// console.log(this.nhanCongData);
				}

				let res = await this.$axios.get(apiURL);
				// handle success
				console.log(res.data.data);
				console.log('have data');
				this.ttIrcsHinbanData = [...res.data.data];

				this.loading = false;
				this.$forceUpdate();
			} catch (err) {
				console.log(err);
			} finally {
				this.loading = false;
			}
		},
		onDateChanged(date) {
			if (date) {
				this.selectedSGDate = null;
			}
			this.getData();
		},
		onSGDateChanged(date) {
			if (date) {
				this.selectedDate = null;
			}
			this.getData();
		},
		onClearDate() {
			this.selectedDate = null;
			this.getData();
		},
		onClearSGDate() {
			this.selectedSGDate = null;
			this.getData();
		},
		onSatusChange(st) {
			// console.log(st);
			this.getData();
		},
		onViewStyleChanged(s) {
			// if (this.selectedSGDate) {
			// 	this.selectedSGDate = null;
			// 	this.getData();
			// }
		},
		async excelDownload(filename = null) {
			let expData = [...this.ttIRCS_Data].map((item) => {
				let nItem = {
					FAP品番: item.FAP品番,
					ロットNO: item.ロットNO,
				};
				if (this.selectedSGDate) nItem['CA_CQ'] = item.CA_CQ;
				if (this.selectedSGDate) nItem['DA_DP'] = item.DA_DP;
				if (this.selectedSGDate) nItem['EA_EP'] = item.EA_EP;
				if (this.selectedSGDate) nItem['ST_ALL'] = item.ST_ALL;
				nItem['回路'] = item.回路;
				nItem['ラインNO'] = item.ラインNO;
				nItem['ASSY日'] = item.ASSY日;
				nItem['D_START'] = item.D_START;
				nItem['D_END'] = item.D_END;
				nItem['指示数'] = item.指示数;
				nItem['生産合計'] = item.生産合計;
				nItem['生産合計_CA4'] = item.生産合計_CA4;
				nItem['生産合計_CA3'] = item.生産合計_CA3;

				// if (this.selectedSGDate) {
				// 	nItem['CA_CQ'] = item.CA_CQ;
				// 	nItem['DA_DP'] = item.DA_DP;
				// 	nItem['EA_EP'] = item.EA_EP;
				// 	nItem['ST_ALL'] = item.ST_ALL;
				// }

				// nItem = nItem.filter((it) => {
				// 	return it;
				// });

				if (this.kameStyle) {
					nItem['SCOPE'] = item.SCOPE;
					nItem['1日目'] = item['1日目'];
					nItem['1CA4'] = item['1CA4'];
					nItem['1CA3'] = item['1CA3'];
					nItem['1日目残'] = item['1日目残'];
					nItem['1日目_START'] = item['1日目_START'];
					nItem['1日目_END'] = item['1日目_END'];

					nItem['2日目'] = item['2日目'];
					nItem['2CA4'] = item['2CA4'];
					nItem['2CA3'] = item['2CA3'];
					nItem['2日目残'] = item['2日目残'];
					nItem['2日目_START'] = item['2日目_START'];
					nItem['2日目_END'] = item['2日目_END'];

					nItem['3日目'] = item['3日目'];
					nItem['3CA4'] = item['3CA4'];
					nItem['3CA3'] = item['3CA3'];
					nItem['3日目残'] = item['3日目残'];
					nItem['3日目_START'] = item['3日目_START'];
					nItem['3日目_END'] = item['3日目_END'];

					if (this.maxNichiCol >= 4) {
						nItem['4日目'] = item['4日目'];
						nItem['4CA4'] = item['4CA4'];
						nItem['4CA3'] = item['4CA3'];
						nItem['4日目残'] = item['4日目残'];
						nItem['4日目_START'] = item['4日目_START'];
						nItem['4日目_END'] = item['4日目_END'];
					}
					if (this.maxNichiCol >= 5) {
						nItem['5日目'] = item['5日目'];
						nItem['5CA4'] = item['5CA4'];
						nItem['5CA3'] = item['5CA3'];
						nItem['5日目残'] = item['5日目残'];
						nItem['5日目_START'] = item['5日目_START'];
						nItem['5日目_END'] = item['5日目_END'];
					}
					if (this.maxNichiCol >= 6) {
						nItem['6日目'] = item['6日目'];
						nItem['6CA4'] = item['6CA4'];
						nItem['6CA3'] = item['6CA3'];
						nItem['6日目残'] = item['6日目残'];
						nItem['6日目_START'] = item['6日目_START'];
						nItem['6日目_END'] = item['6日目_END'];
					}
					if (this.maxNichiCol == 7) {
						nItem['7日目'] = item['7日目'];
						nItem['7CA4'] = item['7CA4'];
						nItem['7CA3'] = item['7CA3'];
						nItem['7日目残'] = item['7日目残'];
						nItem['7日目_START'] = item['7日目_START'];
						nItem['7日目_END'] = item['7日目_END'];
					}
				} else {
					if (nItem.ASSY日 || !nItem.FAP品番) {
						this.dateScope.forEach((dt_item) => {
							nItem[dt_item] = item[dt_item];
							nItem[dt_item + '_CA4'] = item[dt_item + '_CA4'];
							nItem[dt_item + '_CA3'] = item[dt_item + '_CA3'];
							nItem[dt_item + '_残'] = item[dt_item + '_残'];
							nItem[dt_item + '_START'] =
								item[dt_item + '_START'];
							nItem[dt_item + '_END'] = item[dt_item + '_END'];

							if (this.selectedSGDate) {
								nItem['ST_SUB%CA4'] = item['ST_SUB%CA4'];
								nItem['ST_ASSY%CA4'] = item['ST_ASSY%CA4'];
								nItem['ST_QC%CA4'] = item['ST_QC%CA4'];
								nItem['ST_ALL%CA4'] = item['ST_ALL%CA4'];
								nItem['L_CA4_SUB_NGUOI'] =
									item['L_CA4_SUB_NGUOI'];
								nItem['L_CA4_SUB_TG'] = item['L_CA4_SUB_TG'];
								nItem['L_CA4_ASSY_NGUOI'] =
									item['L_CA4_ASSY_NGUOI'];
								nItem['L_CA4_ASSY_TG'] = item['L_CA4_ASSY_TG'];
								nItem['L_CA4_QC_NGUOI'] =
									item['L_CA4_QC_NGUOI'];
								nItem['L_CA4_QC_TG'] = item['L_CA4_QC_TG'];
								nItem['L_CA4_LUONG'] = item['L_CA4_LUONG'];
								nItem['ST_SUB%CA3'] = item['ST_SUB%CA3'];
								nItem['ST_ASSY%CA3'] = item['ST_ASSY%CA3'];
								nItem['ST_QC%CA3'] = item['ST_QC%CA3'];
								nItem['ST_ALL%CA3'] = item['ST_ALL%CA3'];
								nItem['L_CA3_SUB_NGUOI'] =
									item['L_CA3_SUB_NGUOI'];
								nItem['L_CA3_SUB_TG'] = item['L_CA3_SUB_TG'];
								nItem['L_CA3_ASSY_NGUOI'] =
									item['L_CA3_ASSY_NGUOI'];
								nItem['L_CA3_ASSY_TG'] = item['L_CA3_ASSY_TG'];
								nItem['L_CA3_QC_NGUOI'] =
									item['L_CA3_QC_NGUOI'];
								nItem['L_CA3_QC_TG'] = item['L_CA3_QC_TG'];
								nItem['L_CA3_LUONG'] = item['L_CA3_LUONG'];
							}
						});
					}
				}

				nItem['IP_SUB_LIST'] = item['IP_SUB_LIST'];
				nItem['S01'] = item['S01'];
				nItem['S02'] = item['S02'];
				nItem['S03'] = item['S03'];
				nItem['S04'] = item['S04'];
				nItem['S05'] = item['S05'];
				nItem['S06'] = item['S06'];
				nItem['S07'] = item['S07'];
				nItem['S08'] = item['S08'];
				nItem['S09'] = item['S09'];
				nItem['S10'] = item['S10'];
				nItem['S11'] = item['S11'];
				nItem['S12'] = item['S12'];
				nItem['S13'] = item['S13'];
				nItem['S14'] = item['S14'];
				nItem['S15'] = item['S15'];
				nItem['S16'] = item['S16'];
				nItem['S17'] = item['S17'];
				nItem['S18'] = item['S18'];
				nItem['S19'] = item['S19'];
				nItem['S20'] = item['S20'];

				return nItem;
			});

			// let filename =
			// 	'TT_IRCS_Hinban' +
			// 	(this.selectedzSGDate || '') +
			// 	'_' +
			// 	this.selectedStatus +
			// 	'.xlsx';
			if (!filename) {
				filename =
					'TT_IRCS_Hinban_' +
					(this.selectedSGDate || '') +
					'_' +
					this.selectedStatus +
					'_' +
					this.$moment().format('YYYYMMDD_HHmmss');
			}

			ChromiumUtils.excelJSExport(
				(ws) => {
					// let header = Object.keys(expData[0]);
					const boderColor = {
						style: 'thin',
						color: { argb: '974706' },
					};
					const headerFill = {
						type: 'pattern',
						pattern: 'solid',
						// fgColor: { argb: '974700' },
						fgColor: { argb: 'FFFFFF00' },
					};
					const sumRowFill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: '0000FFFF' },
					};
					this.excelHeader.forEach((key, idx) => {
						const hRow = ws.getRow(1);
						hRow.getCell(idx + 1).font = key.font || { bold: true };
						hRow.getCell(idx + 1).value = key.text;
						hRow.getCell(idx + 1).border = {
							top: boderColor,
							left: boderColor,
							bottom: boderColor,
							right: boderColor,
						};
						hRow.getCell(idx + 1).fill =
							key.headerFill || headerFill;

						if (
							key.value == 'L_CA4_LUONG' ||
							key.value == 'L_CA3_LUONG'
						) {
							hRow.getCell(idx + 1).alignment = {
								vertical: 'middle',
								horizontal: 'center',
							};

							ws.mergeCells(
								this.$getExcelColumnName(idx + 1) +
									'1:' +
									this.$getExcelColumnName(idx + 2) +
									'1',
							);
						}
						hRow.commit();
					});
					if (this.selectedSGDate) {
						ws.views = [{ state: 'frozen', ySplit: 1, xSplit: 14 }];
					} else {
						ws.views = [{ state: 'frozen', ySplit: 1, xSplit: 9 }];
					}
					expData.forEach((item, idx) => {
						const row = ws.getRow(2 + idx);
						this.excelHeader.forEach((key, idx) => {
							row.getCell(idx + 1).value = item[key.value];
							row.getCell(idx + 1).border = {
								top: boderColor,
								left: boderColor,
								bottom: boderColor,
								right: boderColor,
							};
							if (!item['FAP品番']) {
								row.getCell(idx + 1).fill = sumRowFill;
								row.getCell(idx + 1).font = { bold: true };
							}
						});
						row.commit();
					});
					//chinh chieu ngang cot
					this.excelHeader.forEach((key, idx) => {
						const column = ws.getColumn(idx + 1);
						const lengths = column.values.map((v) =>
							v ? v.toString().length : v,
						);
						let maxLength = Math.max(
							...lengths.filter((v) => typeof v === 'number'),
						);
						// console.log(maxLength, key.length);
						maxLength = key.width
							? key.width
							: maxLength > key.text.length
							? maxLength + 3
							: key.text.length + 3;
						column.width = maxLength;
					});

					if (this.selectedSGDate) {
						let currentRow = 2;
						let currentLine;
						let lineBegin = 2;
						let lineColName = 'I';
						let stSubColName = 'D';
						let stAssyColName = 'E';
						let stKTColName = 'F';
						let stAllColName = 'G';
						let stTankaColName = 'H';

						do {
							if (
								ws.getCell(lineColName + currentRow).value !=
								currentLine
							) {
								currentLine = ws.getCell(
									lineColName + currentRow,
								).value;
								lineBegin = currentRow;
							}

							if (!ws.getCell('A' + currentRow).value) {
								ws.getCell(stSubColName + currentRow).value = {
									formula: `AVERAGE(${stSubColName}${lineBegin}:${stSubColName}${
										currentRow - 1
									})`,
									result: 0,
								};

								// console.log(
								// 	ws.getCell(stSubColName + currentRow).value,
								// );
								ws.getCell(stAssyColName + currentRow).value = {
									formula: `AVERAGE(${stAssyColName}${lineBegin}:${stAssyColName}${
										currentRow - 1
									})`,
									result: 0,
								};
								ws.getCell(stKTColName + currentRow).value = {
									formula: `AVERAGE(${stKTColName}${lineBegin}:${stKTColName}${
										currentRow - 1
									})`,
									result: 0,
								};
								ws.getCell(stAllColName + currentRow).value = {
									formula: `AVERAGE(${stAllColName}${lineBegin}:${stAllColName}${
										currentRow - 1
									})`,
									result: 0,
								};

								this.excelHeader.forEach((h, idx) => {
									if (
										h.value ==
											this.selectedSGDate + '_CA4' ||
										h.value == this.selectedSGDate + '_CA3'
									) {
										//========================SUB
										// let subFormula = '';
										// for (
										// 	let i = lineBegin;
										// 	i < currentRow;
										// 	i++
										// ) {
										// 	subFormula =
										// 		subFormula +
										// 		`+(${stSubColName}` +
										// 		i +
										// 		'*' +
										// 		this.$getExcelColumnName(
										// 			idx + 1,
										// 		) +
										// 		i +
										// 		')';
										// }
										// ws.getCell(
										// 	this.$getExcelColumnName(idx + 2) +
										// 		lineBegin,
										// ).value = {
										// 	formula: `(${subFormula})/(${
										// 		this.$getExcelColumnName(
										// 			idx + 6,
										// 		) + lineBegin
										// 	}*${
										// 		this.$getExcelColumnName(
										// 			idx + 7,
										// 		) + lineBegin
										// 	})`,
										// 	result: 0,
										// };

										// ws.getCell(
										// 	this.$getExcelColumnName(idx + 2) +
										// 		lineBegin,
										// ).numFmt = '0.00%';

										// ws.mergeCells(
										// 	this.$getExcelColumnName(idx + 2) +
										// 		lineBegin +
										// 		':' +
										// 		(this.$getExcelColumnName(
										// 			idx + 2,
										// 		) +
										// 			(currentRow - 1)),
										// );

										// ws.getCell(
										// 	this.$getExcelColumnName(idx + 2) +
										// 		lineBegin,
										// ).alignment = {
										// 	vertical: 'middle',
										// 	horizontal: 'center',
										// };

										// ws.getCell(
										// 	this.$getExcelColumnName(idx + 2) +
										// 		currentRow,
										// ).value = null;

										ws.getCell(
											this.$getExcelColumnName(idx + 2) +
												lineBegin,
										).value = ws.getCell(
											this.$getExcelColumnName(idx + 2) +
												currentRow,
										).value;

										ws.getCell(
											this.$getExcelColumnName(idx + 2) +
												lineBegin,
										).numFmt = '0.00%';

										ws.mergeCells(
											this.$getExcelColumnName(idx + 2) +
												lineBegin +
												':' +
												(this.$getExcelColumnName(
													idx + 2,
												) +
													(currentRow - 1)),
										);

										ws.getCell(
											this.$getExcelColumnName(idx + 2) +
												lineBegin,
										).alignment = {
											vertical: 'middle',
											horizontal: 'center',
										};

										ws.getCell(
											this.$getExcelColumnName(idx + 2) +
												currentRow,
										).value = null;

										//==================ASSY
										// let assyFormula = '';
										// for (
										// 	let i = lineBegin;
										// 	i < currentRow;
										// 	i++
										// ) {
										// 	assyFormula =
										// 		assyFormula +
										// 		`+(${stAssyColName}` +
										// 		i +
										// 		'*' +
										// 		this.$getExcelColumnName(
										// 			idx + 1,
										// 		) +
										// 		i +
										// 		')';
										// }
										// ws.getCell(
										// 	this.$getExcelColumnName(idx + 3) +
										// 		lineBegin,
										// ).value = {
										// 	formula: `(${assyFormula})/(${
										// 		this.$getExcelColumnName(
										// 			idx + 8,
										// 		) + lineBegin
										// 	}*${
										// 		this.$getExcelColumnName(
										// 			idx + 9,
										// 		) + lineBegin
										// 	})`,
										// 	result: 0,
										// };

										// ws.getCell(
										// 	this.$getExcelColumnName(idx + 3) +
										// 		lineBegin,
										// ).numFmt = '0.00%';

										// ws.mergeCells(
										// 	this.$getExcelColumnName(idx + 3) +
										// 		lineBegin +
										// 		':' +
										// 		(this.$getExcelColumnName(
										// 			idx + 3,
										// 		) +
										// 			(currentRow - 1)),
										// );

										// ws.getCell(
										// 	this.$getExcelColumnName(idx + 3) +
										// 		lineBegin,
										// ).alignment = {
										// 	vertical: 'middle',
										// 	horizontal: 'center',
										// };

										ws.getCell(
											this.$getExcelColumnName(idx + 3) +
												lineBegin,
										).value = ws.getCell(
											this.$getExcelColumnName(idx + 3) +
												currentRow,
										).value;

										ws.getCell(
											this.$getExcelColumnName(idx + 3) +
												lineBegin,
										).numFmt = '0.00%';

										ws.mergeCells(
											this.$getExcelColumnName(idx + 3) +
												lineBegin +
												':' +
												(this.$getExcelColumnName(
													idx + 3,
												) +
													(currentRow - 1)),
										);

										ws.getCell(
											this.$getExcelColumnName(idx + 3) +
												lineBegin,
										).alignment = {
											vertical: 'middle',
											horizontal: 'center',
										};

										ws.getCell(
											this.$getExcelColumnName(idx + 3) +
												currentRow,
										).value = null;

										//===============QC
										// let qcFormula = '';
										// for (
										// 	let i = lineBegin;
										// 	i < currentRow;
										// 	i++
										// ) {
										// 	qcFormula =
										// 		qcFormula +
										// 		`+(${stKTColName}` +
										// 		i +
										// 		'*' +
										// 		this.$getExcelColumnName(
										// 			idx + 1,
										// 		) +
										// 		i +
										// 		')';
										// }
										// ws.getCell(
										// 	this.$getExcelColumnName(idx + 4) +
										// 		lineBegin,
										// ).value = {
										// 	formula: `(${qcFormula})/(${
										// 		this.$getExcelColumnName(
										// 			idx + 10,
										// 		) + lineBegin
										// 	}*${
										// 		this.$getExcelColumnName(
										// 			idx + 11,
										// 		) + lineBegin
										// 	})`,
										// 	result: 0,
										// };

										// ws.getCell(
										// 	this.$getExcelColumnName(idx + 4) +
										// 		lineBegin,
										// ).numFmt = '0.00%';

										// ws.mergeCells(
										// 	this.$getExcelColumnName(idx + 4) +
										// 		lineBegin +
										// 		':' +
										// 		(this.$getExcelColumnName(
										// 			idx + 4,
										// 		) +
										// 			(currentRow - 1)),
										// );

										// ws.getCell(
										// 	this.$getExcelColumnName(idx + 4) +
										// 		lineBegin,
										// ).alignment = {
										// 	vertical: 'middle',
										// 	horizontal: 'center',
										// };

										ws.getCell(
											this.$getExcelColumnName(idx + 4) +
												lineBegin,
										).value = ws.getCell(
											this.$getExcelColumnName(idx + 4) +
												currentRow,
										).value;

										ws.getCell(
											this.$getExcelColumnName(idx + 4) +
												lineBegin,
										).numFmt = '0.00%';

										ws.mergeCells(
											this.$getExcelColumnName(idx + 4) +
												lineBegin +
												':' +
												(this.$getExcelColumnName(
													idx + 4,
												) +
													(currentRow - 1)),
										);

										ws.getCell(
											this.$getExcelColumnName(idx + 4) +
												lineBegin,
										).alignment = {
											vertical: 'middle',
											horizontal: 'center',
										};

										ws.getCell(
											this.$getExcelColumnName(idx + 4) +
												currentRow,
										).value = null;

										//===============ST_ALL
										// let stAllFormula = '';
										// for (
										// 	let i = lineBegin;
										// 	i < currentRow;
										// 	i++
										// ) {
										// 	stAllFormula =
										// 		stAllFormula +
										// 		`+(${stAllColName}` +
										// 		i +
										// 		'*' +
										// 		this.$getExcelColumnName(
										// 			idx + 1,
										// 		) +
										// 		i +
										// 		')';
										// }
										// ws.getCell(
										// 	this.$getExcelColumnName(idx + 5) +
										// 		lineBegin,
										// ).value = {
										// 	formula: `(${stAllFormula})/((${
										// 		this.$getExcelColumnName(
										// 			idx + 6,
										// 		) + lineBegin
										// 	}*${
										// 		this.$getExcelColumnName(
										// 			idx + 7,
										// 		) + lineBegin
										// 	})+(${
										// 		this.$getExcelColumnName(
										// 			idx + 8,
										// 		) + lineBegin
										// 	}*${
										// 		this.$getExcelColumnName(
										// 			idx + 9,
										// 		) + lineBegin
										// 	})+(${
										// 		this.$getExcelColumnName(
										// 			idx + 10,
										// 		) + lineBegin
										// 	}*${
										// 		this.$getExcelColumnName(
										// 			idx + 11,
										// 		) + lineBegin
										// 	}))`,
										// 	result: 0,
										// };

										// ws.getCell(
										// 	this.$getExcelColumnName(idx + 5) +
										// 		lineBegin,
										// ).numFmt = '0.00%';

										// ws.mergeCells(
										// 	this.$getExcelColumnName(idx + 5) +
										// 		lineBegin +
										// 		':' +
										// 		(this.$getExcelColumnName(
										// 			idx + 5,
										// 		) +
										// 			(currentRow - 1)),
										// );

										// ws.getCell(
										// 	this.$getExcelColumnName(idx + 5) +
										// 		lineBegin,
										// ).alignment = {
										// 	vertical: 'middle',
										// 	horizontal: 'center',
										// };

										ws.getCell(
											this.$getExcelColumnName(idx + 5) +
												lineBegin,
										).value = ws.getCell(
											this.$getExcelColumnName(idx + 5) +
												currentRow,
										).value;

										ws.getCell(
											this.$getExcelColumnName(idx + 5) +
												lineBegin,
										).numFmt = '0.00%';

										ws.mergeCells(
											this.$getExcelColumnName(idx + 5) +
												lineBegin +
												':' +
												(this.$getExcelColumnName(
													idx + 5,
												) +
													(currentRow - 1)),
										);

										ws.getCell(
											this.$getExcelColumnName(idx + 5) +
												lineBegin,
										).alignment = {
											vertical: 'middle',
											horizontal: 'center',
										};

										ws.getCell(
											this.$getExcelColumnName(idx + 5) +
												currentRow,
										).value = null;

										//=============== du lieu master
										ws.getCell(
											this.$getExcelColumnName(idx + 6) +
												lineBegin,
										).value = ws.getCell(
											this.$getExcelColumnName(idx + 6) +
												currentRow,
										).value;

										ws.mergeCells(
											this.$getExcelColumnName(idx + 6) +
												lineBegin +
												':' +
												(this.$getExcelColumnName(
													idx + 6,
												) +
													(currentRow - 1)),
										);

										ws.getCell(
											this.$getExcelColumnName(idx + 6) +
												lineBegin,
										).alignment = {
											vertical: 'middle',
											horizontal: 'center',
										};

										ws.getCell(
											this.$getExcelColumnName(idx + 6) +
												currentRow,
										).value = null;

										//------------------------

										ws.getCell(
											this.$getExcelColumnName(idx + 7) +
												lineBegin,
										).value = ws.getCell(
											this.$getExcelColumnName(idx + 7) +
												currentRow,
										).value;

										ws.mergeCells(
											this.$getExcelColumnName(idx + 7) +
												lineBegin +
												':' +
												(this.$getExcelColumnName(
													idx + 7,
												) +
													(currentRow - 1)),
										);

										ws.getCell(
											this.$getExcelColumnName(idx + 7) +
												lineBegin,
										).alignment = {
											vertical: 'middle',
											horizontal: 'center',
										};

										ws.getCell(
											this.$getExcelColumnName(idx + 7) +
												currentRow,
										).value = null;

										//------------------------

										ws.getCell(
											this.$getExcelColumnName(idx + 8) +
												lineBegin,
										).value = ws.getCell(
											this.$getExcelColumnName(idx + 8) +
												currentRow,
										).value;

										ws.mergeCells(
											this.$getExcelColumnName(idx + 8) +
												lineBegin +
												':' +
												(this.$getExcelColumnName(
													idx + 8,
												) +
													(currentRow - 1)),
										);

										ws.getCell(
											this.$getExcelColumnName(idx + 8) +
												lineBegin,
										).alignment = {
											vertical: 'middle',
											horizontal: 'center',
										};

										ws.getCell(
											this.$getExcelColumnName(idx + 8) +
												currentRow,
										).value = null;

										//------------------------

										ws.getCell(
											this.$getExcelColumnName(idx + 9) +
												lineBegin,
										).value = ws.getCell(
											this.$getExcelColumnName(idx + 9) +
												currentRow,
										).value;

										ws.mergeCells(
											this.$getExcelColumnName(idx + 9) +
												lineBegin +
												':' +
												(this.$getExcelColumnName(
													idx + 9,
												) +
													(currentRow - 1)),
										);

										ws.getCell(
											this.$getExcelColumnName(idx + 9) +
												lineBegin,
										).alignment = {
											vertical: 'middle',
											horizontal: 'center',
										};

										ws.getCell(
											this.$getExcelColumnName(idx + 9) +
												currentRow,
										).value = null;

										//------------------------

										ws.getCell(
											this.$getExcelColumnName(idx + 10) +
												lineBegin,
										).value = ws.getCell(
											this.$getExcelColumnName(idx + 10) +
												currentRow,
										).value;

										ws.mergeCells(
											this.$getExcelColumnName(idx + 10) +
												lineBegin +
												':' +
												(this.$getExcelColumnName(
													idx + 10,
												) +
													(currentRow - 1)),
										);

										ws.getCell(
											this.$getExcelColumnName(idx + 10) +
												lineBegin,
										).alignment = {
											vertical: 'middle',
											horizontal: 'center',
										};

										ws.getCell(
											this.$getExcelColumnName(idx + 10) +
												currentRow,
										).value = null;

										//------------------------

										ws.getCell(
											this.$getExcelColumnName(idx + 11) +
												lineBegin,
										).value = ws.getCell(
											this.$getExcelColumnName(idx + 11) +
												currentRow,
										).value;

										ws.mergeCells(
											this.$getExcelColumnName(idx + 11) +
												lineBegin +
												':' +
												(this.$getExcelColumnName(
													idx + 11,
												) +
													(currentRow - 1)),
										);

										ws.getCell(
											this.$getExcelColumnName(idx + 11) +
												lineBegin,
										).alignment = {
											vertical: 'middle',
											horizontal: 'center',
										};

										ws.getCell(
											this.$getExcelColumnName(idx + 11) +
												currentRow,
										).value = null;

										//==================================DOANH THU

										for (
											let i = lineBegin;
											i < currentRow;
											i++
										) {
											ws.getCell(
												this.$getExcelColumnName(
													idx + 12,
												) + i,
											).value = {
												formula: `${stTankaColName}${i}*${
													this.$getExcelColumnName(
														idx + 1,
													) + i
												}`,
												result: 0,
											};
										}

										ws.getCell(
											this.$getExcelColumnName(idx + 12) +
												currentRow,
										).value = {
											formula: `SUM(${
												this.$getExcelColumnName(
													idx + 12,
												) + lineBegin
											}:${
												this.$getExcelColumnName(
													idx + 12,
												) +
												(currentRow - 1)
											})`,
											result: 0,
										};

										//=======================LUONG TONG
										ws.getCell(
											this.$getExcelColumnName(idx + 13) +
												lineBegin,
										).value = ws.getCell(
											this.$getExcelColumnName(idx + 13) +
												currentRow,
										).value;

										ws.mergeCells(
											this.$getExcelColumnName(idx + 13) +
												lineBegin +
												':' +
												(this.$getExcelColumnName(
													idx + 13,
												) +
													(currentRow - 1)),
										);

										ws.getCell(
											this.$getExcelColumnName(idx + 13) +
												lineBegin,
										).alignment = {
											vertical: 'middle',
											horizontal: 'center',
										};

										ws.getCell(
											this.$getExcelColumnName(idx + 13) +
												currentRow,
										).value = null;

										//-------------------------------

										ws.getCell(
											this.$getExcelColumnName(idx + 14) +
												lineBegin,
										).value = {
											formula: `((${
												this.$getExcelColumnName(
													idx + 6,
												) + lineBegin
											}*(${
												this.$getExcelColumnName(
													idx + 7,
												) + lineBegin
											}/60))+(${
												this.$getExcelColumnName(
													idx + 8,
												) + lineBegin
											}*(${
												this.$getExcelColumnName(
													idx + 9,
												) + lineBegin
											}/60))+(${
												this.$getExcelColumnName(
													idx + 10,
												) + lineBegin
											}*(${
												this.$getExcelColumnName(
													idx + 11,
												) + lineBegin
											}/60)))*${
												this.$getExcelColumnName(
													idx + 13,
												) + lineBegin
											}`,
											result: 0,
										};

										ws.getCell(
											this.$getExcelColumnName(idx + 14) +
												lineBegin,
										).numFmt = '#,##0.00;[Red]-#,##0.00';

										ws.mergeCells(
											this.$getExcelColumnName(idx + 14) +
												lineBegin +
												':' +
												(this.$getExcelColumnName(
													idx + 14,
												) +
													(currentRow - 1)),
										);

										ws.getCell(
											this.$getExcelColumnName(idx + 14) +
												lineBegin,
										).alignment = {
											vertical: 'middle',
											horizontal: 'center',
										};

										ws.getCell(
											this.$getExcelColumnName(idx + 14) +
												currentRow,
										).value = {
											formula:
												this.$getExcelColumnName(
													idx + 12,
												) +
												currentRow +
												'-' +
												(this.$getExcelColumnName(
													idx + 14,
												) +
													lineBegin),
											result: 0,
										};

										ws.getCell(
											this.$getExcelColumnName(idx + 14) +
												currentRow,
										).numFmt = '#,##0.00;[Red]-#,##0.00';
									}
								});
							}

							currentRow += 1;
						} while (ws.getCell(lineColName + currentRow).value);
					}
				},
				{ sheetName: 'Sheet1', opts: {} },
				filename,
			);
		},
		async exportKaikeiData() {
			let filename =
				'Kaikei_data_' +
				this.kaikei.d_assy +
				(this.kaikei.line ? '_' + this.kaikei.line : '') +
				(this.kaikei.ca ? '_' + this.kaikei.ca : '');
			ChromiumUtils.excelJSExport(
				(ws) => {
					const mergedCelllAlign = {
						vertical: 'middle',
						horizontal: 'center',
					};
					const boderColor = {
						style: 'thin',
						color: { argb: 'FFA6A6A6' },
					};
					const headerFill = {
						type: 'pattern',
						pattern: 'solid',
						// fgColor: { argb: 'FFFFFF00' },
						fgColor: { argb: 'FF00FFFF' },
					};
					const subSumRowFill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: 'FFEEECE1' },
						bgColor: { argb: 'FFEEECE1' },
						// fgColor: { argb: 'FFD8E4BC' },
						// bgColor: { argb: 'FFD8E4BC' },
					};
					const sumRowFill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: 'FFD7BF8F' },
						bgColor: { argb: 'FFD7BF8F' },
						// fgColor: { argb: 'FF92D050' },
						// bgColor: { argb: 'FF92D050' },
					};
					const hRow = ws.getRow(1);

					let headers = [
						{
							value: 'D_ASSY',
							excelHeader: 'D_ASSY',
						},
						{
							value: 'C_LINE',
							excelHeader: 'LINE',
						},
						{
							value: 'C_CA',
							excelHeader: 'CA',
						},
						...this.kaikeiExp.kaikeiHeader,
					];
					headers.forEach((h, idx) => {
						hRow.getCell(idx + 1).font = { bold: true };
						hRow.getCell(idx + 1).value = h.excelHeader;
						hRow.getCell(idx + 1).border = {
							top: boderColor,
							left: boderColor,
							bottom: boderColor,
							right: boderColor,
						};
						hRow.getCell(idx + 1).fill = headerFill;
						// hRow.getCell(idx + 1).numFmt = 'mm/dd';
						hRow.getCell(idx + 1).alignment = mergedCelllAlign;
					});
					hRow.commit();

					ws.views = [{ state: 'frozen', ySplit: 2 }];
					this.kaikeiView.forEach((item, idx) => {
						const row = ws.getRow(2 + idx);
						headers.forEach((h, id_h) => {
							row.getCell(id_h + 1).value = item[h.value];
							row.getCell(id_h + 1).border = {
								top: boderColor,
								left: boderColor,
								bottom: boderColor,
								right: boderColor,
							};

							if (
								h.value == 'SUB_PERCENT' ||
								h.value == 'ASSY_PERCENT' ||
								h.value == 'QC_PERCENT' ||
								h.value == 'ALL_PERCENT'
							) {
								row.getCell(id_h + 1).numFmt = '0.00%';
							}

							if (!item.C_START && !item.C_HIN) {
								row.getCell(id_h + 1).font = {
									bold: true,
									size: 12,
								};
							}
						});
						row.commit();
					});

					//chinh chieu ngang cot
					this.kaikeiExp.kaikeiHeader.forEach((h, idx) => {
						const column = ws.getColumn(idx + 1);
						const lengths = column.values.map(
							(v) => v.toString().length,
						);
						let maxLength = Math.max(
							...lengths.filter((v) => typeof v === 'number'),
						);
						maxLength =
							maxLength > h.excelHeader.length
								? maxLength + 2
								: h.excelHeader.length + 2;

						column.width = maxLength;
					});

					//To mau sum CA
					ws.addConditionalFormatting({
						ref:
							'A2:' +
							this.$getExcelColumnName(headers.length) +
							(this.kaikeiView.length + 1),
						rules: [
							{
								type: 'expression',
								formulae: ['AND(ISBLANK($D2),ISBLANK($P2))'],
								style: {
									fill: sumRowFill,
								},
							},
						],
					});

					//To mau sum khoang thoi gian
					ws.addConditionalFormatting({
						ref:
							'A2:' +
							this.$getExcelColumnName(headers.length) +
							(this.kaikeiView.length + 1),
						rules: [
							{
								type: 'expression',
								formulae: [
									'AND(ISBLANK($D2)=FALSE,ISBLANK($P2))',
								],
								style: {
									fill: subSumRowFill,
									// numFmt: '#,##0',
								},
							},
						],
					});
				},
				{ sheetName: 'Sheet1', opts: {} },
				filename,
			);
		},
	},

	beforeDestroy() {},
};
</script>
<style lang="scss">
.tbl-kaikei-header {
	background-color: aqua !important;
	color: darkblue;
}

.row-kaikei-all {
	td {
		background-color: yellow;
		font-weight: bolder;
		font-size: 1.2rem !important;
	}
}

.row-kaikei-jikan {
	td {
		background-color: lightgray;
		font-weight: bold;
	}
}

.row-note {
	td {
		font-size: 0.7rem !important;
		font-style: italic;
		background-color: papayawhip;
	}
}

.cell-kaikei-percent {
	font-weight: bold;
}

.cell-kaikei-percent-all {
	font-weight: bold;
	color: red;
}

#page-thuc-tich-ircs-hinban {
	// Vuetify Table
	.tbl-header {
		background-color: burlywood !important;
		font-size: 1.2rem !important;
		padding: 0 8px !important;
		color: darkblue;
	}

	.text--center {
		text-align: center !important;
	}

	.cell-boilder {
		text-align: left;
		font-weight: bolder;
	}
	.cell-normal {
		padding: 0 3px !important;
		text-align: left;
		font-size: 1.1rem;
	}
	.cell-sub {
		padding: 0 !important;
		// text-align: left;
		// font-size: 1.1rem;
		background-color: turquoise;
	}
	.cell-number {
		padding: 0 3px !important;
		text-align: right;
		font-size: 1.6rem;
	}
	.cell-percent {
		padding: 0 3px !important;
		// text-align: right;
		font-size: 1.5rem;
	}
	.cell-shiji {
		// padding: 0 5px !important;
		text-align: right;
		font-size: 1.8rem;
		color: fuchsia;
		background-color: oldlace;
	}
	.cell-total {
		// padding: 0 5px !important;
		text-align: right;
		font-size: 1.8rem;
		color: green;
		background-color: oldlace;
	}

	.cell-new-hin {
		background-color: orange !important;
	}

	.cell-comback-hin {
		background-color: hotpink !important;
	}

	.row-normal {
		td {
			font-size: 1.8rem !important;
		}
	}
	.row-sum {
		td {
			background-color: lightgrey;
		}
	}
	.cell-zero {
		color: blue;
	}
	.cell-negative {
		// color: crimson;
		color: red;
	}

	.tbl-sub td {
		border: 1px solid tomato;
		padding: 0 2px;
	}

	// FIXED COLUMN

	// table > tbody > tr > td:nth-child(1),
	// table > thead > tr:nth-child(1) > th:nth-child(1) {
	// 	position: sticky !important;
	// 	position: -webkit-sticky !important;
	// 	z-index: 9998;
	// 	background: white;
	// 	left: 0;
	// 	max-width: 150px;
	// 	min-width: 150px;
	// }

	// table > thead > tr:nth-child(1) > th:nth-child(1) {
	// 	z-index: 9999;
	// }

	// table > tbody > tr > td:nth-child(2),
	// table > thead > tr:nth-child(1) > th:nth-child(2) {
	// 	position: sticky !important;
	// 	position: -webkit-sticky !important;
	// 	z-index: 9998;
	// 	background: white;
	// 	left: 150px;
	// 	max-width: 110px;
	// 	min-width: 110px;
	// }

	// table > thead > tr:nth-child(1) > th:nth-child(2) {
	// 	z-index: 9999;
	// }

	// table > tbody > tr > td:nth-child(3),
	// table > thead > tr:nth-child(1) > th:nth-child(3) {
	// 	position: sticky !important;
	// 	position: -webkit-sticky !important;
	// 	z-index: 9998;
	// 	background: white;
	// 	left: 260px;
	// 	max-width: 100px;
	// 	min-width: 100px;
	// }

	// table > thead > tr:nth-child(1) > th:nth-child(3) {
	// 	z-index: 9999;
	// }

	// table > tbody > tr > td:nth-child(4),
	// table > thead > tr:nth-child(1) > th:nth-child(4) {
	// 	position: sticky !important;
	// 	position: -webkit-sticky !important;
	// 	z-index: 9998;
	// 	background: white;
	// 	left: 360px;
	// 	max-width: 100px;
	// 	min-width: 100px;
	// }

	// table > thead > tr:nth-child(1) > th:nth-child(4) {
	// 	z-index: 9999;
	// }

	// table > tbody > tr > td:nth-child(7),
	// table > thead > tr:nth-child(1) > th:nth-child(7) {
	// 	position: sticky !important;
	// 	position: -webkit-sticky !important;
	// 	z-index: 9998;
	// 	background: white;
	// 	left: 460px;
	// 	max-width: 100px;
	// 	min-width: 100px;
	// }

	// table > thead > tr:nth-child(1) > th:nth-child(7) {
	// 	z-index: 9999;
	// }

	// table > tbody > tr > td:nth-child(8),
	// table > thead > tr:nth-child(1) > th:nth-child(8) {
	// 	position: sticky !important;
	// 	position: -webkit-sticky !important;
	// 	z-index: 9998;
	// 	background: white;
	// 	left: 560px;
	// 	max-width: 100px;
	// 	min-width: 100px;
	// }

	// table > thead > tr:nth-child(1) > th:nth-child(8) {
	// 	z-index: 9999;
	// }

	// END FIXED COLUMN

	table {
		border-collapse: collapse;
	}
	font-family: ＭＳ Ｐゴシック;

	.v-data-footer__select .v-select {
		margin-top: 1px !important;
		margin-bottom: 1px !important;
	}
}

#page-thuc-tich-ircs-hinban.mobile {
	// Vuetify Table
	.tbl-header {
		font-size: 0.6rem !important;
	}
	.lineHeader {
		min-width: 50px;
	}
	.assyDateHeader {
		min-width: 65px;
	}
	.cell-normal {
		font-size: 0.7rem;
	}
	.cell-hinban {
		// min-width: 110px;
	}
	.cell-number {
		font-size: 0.7rem;
	}
	.cell-shiji {
		font-size: 0.8rem;
		font-weight: bold;
	}
	.cell-total {
		font-size: 0.8rem;
		font-weight: bold;
	}
	.row-normal {
		td {
			font-size: 0.7rem !important;
		}
	}
}
</style>
<template>
	<div
		id="page-thuc-tich-ircs-hinban"
		:class="$nuxt.context.isMobile ? 'mobile' : ''"
	>
		<div>
			<v-alert
				:value="alert"
				type="warning"
				border="top"
				transition="scale-transition"
			>
				Lỗi!!
			</v-alert>
			<v-toolbar dark height="60px" color="brown" dense>
				<a :href="$nuxt.context.pkg.base + '/thuc-tich-ircs'" style="">
					<span style="color: greenyellow; font-size: 1rem"
						><span>IRCS 実績</span
						><span v-if="!$nuxt.context.isMobile"
							>ページへ</span
						></span
					></a
				>
				<v-spacer></v-spacer>
				<v-divider vertical></v-divider>
				<div class="mx-2" v-if="!$nuxt.context.isMobile">
					<v-menu
						v-model="mSelectSGDate"
						:close-on-content-click="false"
						:nudge-right="40"
						:disabled="loading"
						transition="scale-transition"
						offset-y
					>
						<template v-slot:activator="{ on, attrs }">
							<v-text-field
								v-model="selectedSGDate"
								label="作業日"
								readonly
								:disabled="loading"
								:hide-details="true"
								v-bind="attrs"
								v-on="on"
								:clearable="true"
								@click:clear="onClearSGDate"
							></v-text-field>
						</template>
						<v-date-picker
							v-model="selectedSGDate"
							@input="mSelectSGDate = false"
							:allowed-dates="allowedDatePicker"
							:show-week="true"
							:show-adjacent-months="false"
							locale="jp-jp"
							:day-format="dayFormat"
							@change="onSGDateChanged"
							no-title
						></v-date-picker>
					</v-menu>
				</div>
				<v-btn-toggle
					v-model="selectedStatus"
					color="yellow"
					dense
					group
					v-if="!$nuxt.context.isMobile"
					mandatory
				>
					<v-btn
						:disabled="loading || selectedSGDate != null"
						:value="'ALL'"
						text
					>
						ALL
					</v-btn>

					<v-btn
						:disabled="loading || selectedSGDate != null"
						:value="'中'"
						text
					>
						中
					</v-btn>

					<v-btn
						:disabled="loading || selectedSGDate != null"
						:value="'完成'"
						text
					>
						完成
					</v-btn>
					<v-btn
						:disabled="loading || selectedSGDate != null"
						:value="'未完成'"
						text
					>
						未完成
					</v-btn>
					<v-btn
						:disabled="loading || selectedSGDate != null"
						:value="'まだ'"
						text
					>
						まだ
					</v-btn>
				</v-btn-toggle>
				<v-select
					v-model="selectedStatus"
					:items="statusOptionsItems"
					@change="onSatusChange"
					v-if="$nuxt.context.isMobile"
				></v-select>
				<v-divider vertical></v-divider>

				<div class="mx-2" v-if="!$nuxt.context.isMobile">
					<v-menu
						v-model="mSelectDate"
						:close-on-content-click="false"
						:nudge-right="40"
						:disabled="loading"
						transition="scale-transition"
						offset-y
					>
						<template v-slot:activator="{ on, attrs }">
							<v-text-field
								v-model="selectedDate"
								label="ASSY日"
								readonly
								:disabled="loading"
								:hide-details="true"
								v-bind="attrs"
								v-on="on"
								:clearable="true"
								@click:clear="onClearDate"
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
							no-title
						></v-date-picker>
					</v-menu>
				</div>
				<v-divider vertical></v-divider>

				<v-btn
					color="green"
					class="ma-2 white--text"
					:disabled="ttIRCS_Data.length <= 0 || loading"
					@click="excelDownload()"
					:small="$nuxt.context.isMobile"
					v-if="!$nuxt.context.isMobile"
				>
					Excel
					<v-icon right dark> mdi-cloud-download </v-icon>
				</v-btn>
				<v-divider vertical></v-divider>
				<v-btn
					color="pink"
					class="ma-2 white--text"
					:disabled="loading"
					@click="getData"
					:small="$nuxt.context.isMobile"
				>
					更新
					<v-icon
						right
						dark
						v-if="!$nuxt.context.isMobile"
						:class="loading ? 'mdi-spin' : ''"
					>
						mdi-refresh-circle
					</v-icon>
				</v-btn>
				<v-divider vertical></v-divider>
				<v-spacer></v-spacer>
				<!-- <v-switch
					v-model="kameStyle"
					label="日目Style"
					color="red"
					:disabled="selectedDate == null"
					inset
					hide-details
					v-if="!$nuxt.context.isMobile"
				></v-switch> -->
				<!-- <a
					class=""
					v-if="1 == 2"
					:href="
						$nuxt.context.pkg.base +
						'/thuc-tich-ircs-hinban/F_IMPORT_CONG_SO.xlsx'
					"
					>file mẫu</a
				>
				<input
					ref="uploadFile"
					type="file"
					hidden="hidden"
					@change="handleFileChange"
				/>
				<v-btn
					color="blue"
					class="ma-2 white--text"
					@click="handleUploadBtnClick"
					:small="$nuxt.context.isMobile"
					v-if="1 == 2"
				>
					Upload 工数
					<v-icon right dark> mdi-cloud-upload </v-icon>
				</v-btn> -->
				<v-btn
					color="red"
					class="ma-2 white--text"
					@click="openMasterKaikei"
					:small="$nuxt.context.isMobile"
				>
					Kaikei
					<!-- <v-icon right dark> mdi-cloud-upload </v-icon> -->
				</v-btn>
			</v-toolbar>
			<!-- {{ selectedDate }} -->
			<v-row>
				<v-col sm="12">
					<!-- <v-layout row="row" wrap="wrap"> -->
					<div>
						<v-data-table
							:headers="headers"
							:fixed-header="true"
							:items="ttIRCS_Data"
							:item-class="'rowClass'"
							height="75vh"
							:multi-sort="false"
							:disable-sort="true"
							class="elevation-1"
							:loading="loading"
							:hide-default-footer="false"
							hide-default-header
							mobile-breakpoint="0"
							show-expand
							single-expand
							:items-per-page="500"
							:footer-props="{
								'items-per-page-options': [500, 1000, 1500, -1],
							}"
						>
							<template #header="{}">
								<thead class="v-data-table-header">
									<tr>
										<th
											v-for="(h, i) in headers"
											:key="i"
											:class="h.class"
											:rowspan="h.children ? 1 : 2"
											:colspan="
												h.children
													? h.children.length
													: 1
											"
											:width="h.width"
											style="border: 1px solid black"
										>
											<span v-html="h.text"> </span>
										</th>
									</tr>
									<tr>
										<th
											v-for="(h1, i1) in getSubHeader(
												headers,
											)"
											:key="i1"
											:class="h1.class"
											style="border: 1px solid black"
											:width="h1.width"
										>
											<span v-html="h1.text"> </span>
										</th>
									</tr>
								</thead>
							</template>
							<template #item="props">
								<tr
									:class="
										!props.item.FAP品番 ? 'row-sum' : ''
									"
								>
									<td
										v-for="(c, ci) in getRows(props.item)"
										:key="ci"
										:class="[
											...c.cellClass,
											...(c.colVal == 0
												? ['cell-zero']
												: []),
											...(c.colVal < 0
												? ['cell-negative']
												: []),
											...(c.value == 'FAP品番' &&
											props.item.hinStatus == 'new-hin'
												? ['cell-new-hin']
												: []),
											...(c.value == 'FAP品番' &&
											props.item.hinStatus ==
												'comback-hin'
												? ['cell-comback-hin']
												: []),
										]"
										:style="
											!props.item.FAP品番 &&
											(selectedSGDate + '_残' ==
												c.value ||
												selectedDate + '_残' == c.value)
												? 'border: 1px solid black;background-color: yellow'
												: 'border: 1px solid black'
										"
									>
										<v-chip
											small
											color="green accent-4"
											class="text-h6 white--text"
											v-if="
												!props.item.FAP品番 && ci == 1
											"
										>
											{{ c.colVal }}
										</v-chip>

										<v-badge
											inline
											overlap
											left
											:color="
												props.item[c.value + '_CA4']
													? 'blue'
													: 'transparent'
											"
											:content="
												props.item[c.value + '_CA4']
											"
											v-else-if="
												c.colVal &&
												(props.item[c.value + '_CA4'] ||
													props.item[
														c.value + '_CA3'
													])
											"
										>
											<v-badge
												inline
												overlap
												:color="
													props.item[c.value + '_CA3']
														? 'red'
														: 'transparent'
												"
												:content="
													props.item[c.value + '_CA3']
												"
											>
												<v-tooltip bottom>
													<template
														v-slot:activator="{
															on,
															attrs,
														}"
													>
														<span
															v-bind="attrs"
															v-on="on"
															>{{
																c.colVal
															}}</span
														>
													</template>
													<span>
														CA4 ->
														{{
															props.item[
																c.value + '_CA4'
															]
														}}
														<br />
														CA3 ->
														{{
															props.item[
																c.value + '_CA3'
															]
														}}
													</span>
													<br />
													<span
														v-if="
															props.item[
																'FAP品番'
															]
														"
													>
														{{
															props.item[
																c.value +
																	'_START'
															] ||
															props.item[
																'D_START'
															]
														}}
														<br />
														{{
															props.item[
																c.value + '_END'
															] ||
															props.item['D_END']
														}}
													</span>
												</v-tooltip>
											</v-badge>
										</v-badge>
										<span
											v-else-if="
												c.value == 'ASSY日' ||
												c.value == 'D_START' ||
												c.value == 'D_END'
											"
										>
											{{
												c.colVal
													? c.colVal.substring(5)
													: ''
											}}
										</span>
										<span
											v-else-if="
												c.value == 'ST_SUB%CA4' ||
												c.value == 'ST_ASSY%CA4' ||
												c.value == 'ST_QC%CA4' ||
												c.value == 'ST_ALL%CA4'
											"
											class="green--text font-weight-bold"
										>
											{{
												c.colVal
													? percentFormatter.format(
															c.colVal,
													  )
													: ''
											}}
										</span>
										<span
											v-else-if="
												c.value == 'ST_SUB%CA3' ||
												c.value == 'ST_ASSY%CA3' ||
												c.value == 'ST_QC%CA3' ||
												c.value == 'ST_ALL%CA3'
											"
											class="deep-orange--text font-weight-bold"
										>
											{{
												c.colVal
													? percentFormatter.format(
															c.colVal,
													  )
													: ''
											}}
										</span>
										<span
											v-else-if="
												c.value == 'SUB' &&
												props.item['FAP品番']
											"
										>
											<v-tooltip bottom>
												<template
													v-slot:activator="{
														on,
														attrs,
													}"
												>
													<table
														width="100%"
														class="tbl-sub"
														v-bind="attrs"
														v-on="on"
													>
														<tr>
															<td>
																{{
																	props.item[
																		'S01'
																	] || '-'
																}}
															</td>
															<td>
																{{
																	props.item[
																		'S02'
																	] || '-'
																}}
															</td>
															<td>
																{{
																	props.item[
																		'S03'
																	] || '-'
																}}
															</td>
															<td>
																{{
																	props.item[
																		'S04'
																	] || '-'
																}}
															</td>
														</tr>
														<tr>
															<td>
																{{
																	props.item[
																		'S05'
																	] || '-'
																}}
															</td>
															<td>
																{{
																	props.item[
																		'S06'
																	] || '-'
																}}
															</td>
															<td>
																{{
																	props.item[
																		'S07'
																	] || '-'
																}}
															</td>
															<td>
																{{
																	props.item[
																		'S08'
																	] || '-'
																}}
															</td>
														</tr>
														<tr>
															<td>
																{{
																	props.item[
																		'S09'
																	] || '-'
																}}
															</td>
															<td>
																{{
																	props.item[
																		'S10'
																	] || '-'
																}}
															</td>
															<td>
																{{
																	props.item[
																		'S11'
																	] || '-'
																}}
															</td>
															<td>
																{{
																	props.item[
																		'S12'
																	] || '-'
																}}
															</td>
														</tr>
														<tr>
															<td>
																{{
																	props.item[
																		'S13'
																	] || '-'
																}}
															</td>
															<td>
																{{
																	props.item[
																		'S14'
																	] || '-'
																}}
															</td>
															<td>
																{{
																	props.item[
																		'S15'
																	] || '-'
																}}
															</td>
															<td>
																{{
																	props.item[
																		'S16'
																	] || '-'
																}}
															</td>
														</tr>
														<tr
															v-if="
																props.item[
																	'S17'
																]
															"
														>
															<td>
																{{
																	props.item[
																		'S17'
																	] || '-'
																}}
															</td>
															<td>
																{{
																	props.item[
																		'S18'
																	] || '-'
																}}
															</td>
															<td>
																{{
																	props.item[
																		'S19'
																	] || '-'
																}}
															</td>
															<td>
																{{
																	props.item[
																		'S20'
																	] || '-'
																}}
															</td>
														</tr>
													</table>
												</template>
												<span>
													<!-- <span>SUB Detail</span> -->
													<table>
														<tr>
															<td>
																<v-banner
																	v-if="
																		props
																			.item
																			.subTooltip1
																	"
																	class="px-2"
																	transition="slide-y-transition"
																	color="purple lighten-3"
																	v-html="
																		props
																			.item
																			.subTooltip1 ||
																		''
																	"
																>
																</v-banner>
															</td>
															<td>
																<v-banner
																	v-if="
																		props
																			.item
																			.subTooltip2
																	"
																	class="px-2"
																	transition="slide-y-transition"
																	color="purple lighten-3"
																	v-html="
																		props
																			.item
																			.subTooltip2 ||
																		''
																	"
																>
																</v-banner>
															</td>
															<td>
																<v-banner
																	v-if="
																		props
																			.item
																			.subTooltip3
																	"
																	class="px-2"
																	transition="slide-y-transition"
																	color="purple lighten-3"
																	v-html="
																		props
																			.item
																			.subTooltip3 ||
																		''
																	"
																>
																</v-banner>
															</td>
															<td>
																<v-banner
																	v-if="
																		props
																			.item
																			.subTooltip4
																	"
																	class="px-2"
																	transition="slide-y-transition"
																	color="purple lighten-3"
																	v-html="
																		props
																			.item
																			.subTooltip4 ||
																		''
																	"
																>
																</v-banner>
															</td>
														</tr>
													</table>
												</span>
											</v-tooltip>
										</span>
										<span v-else>
											{{ c.colVal }}
										</span>
									</td>
								</tr>
							</template>
							<!-- <template v-slot:expanded-item="{ headers, item }">
								<td :colspan="headers.length">
									More info about {{ item.FAP品番 }}
								</td>
							</template> -->
						</v-data-table>
					</div>
					<!-- </v-layout> -->
				</v-col>
			</v-row>
		</div>
		<v-dialog
			v-model="kaikeiDialog"
			fullscreen
			hide-overlay
			transition="dialog-bottom-transition"
		>
			<!-- <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          dark
          v-bind="attrs"
          v-on="on"
        >
          Open Dialog
        </v-btn>
      </template> -->
			<!-- <v-container> -->
			<v-card>
				<v-toolbar dark color="red">
					<v-btn
						icon
						dark
						@click="
							kaikeiDialog = false;
							kaikei.masterRes = [];
							kaikei.selectedMasterItems = [];
							kaikeiExp.kaikeiRes = [];
						"
					>
						<v-icon>mdi-close</v-icon>
					</v-btn>
					<v-spacer></v-spacer>
					<v-toolbar-title class="">会計 計算</v-toolbar-title>
					<v-spacer></v-spacer>
				</v-toolbar>
				<v-container fluid>
					<v-tabs color="pink" left background-color="black">
						<v-tab class="white--text">1.Master</v-tab>
						<v-divider vertical></v-divider>
						<v-tab class="white--text">2.Kaikei Data</v-tab>
						<v-tab-item style="height: 85vh" class="grey lighten-4">
							<v-toolbar dark color="black">
								<!-- <el-date-picker
									v-model="kaikei.d_assy"
									type="date"
									placeholder="Ngày Assy"
									value-format="yyyy-MM-dd"
									:picker-options="pickerOptions"
									required
									class="mr-2"
								>
								</el-date-picker> -->
								<v-menu
									v-model="mSelecMasterKaikeiDate"
									:close-on-content-click="false"
									:nudge-right="40"
									:disabled="loading"
									transition="scale-transition"
									offset-y
								>
									<template v-slot:activator="{ on, attrs }">
										<v-text-field
											v-model="kaikei.d_assy"
											label="ASSY日"
											readonly
											:disabled="loading"
											:hide-details="true"
											v-bind="attrs"
											v-on="on"
											:clearable="true"
											class="shrink mr-2"
											outlined
											dense
											@click:clear="kaikei.d_assy = null"
										></v-text-field>
									</template>
									<v-date-picker
										v-model="kaikei.d_assy"
										@input="mSelecMasterKaikeiDate = false"
										:allowed-dates="allowedDatePicker"
										:show-week="true"
										:show-adjacent-months="false"
										locale="jp-jp"
										:day-format="dayFormat"
										no-title
									></v-date-picker>
								</v-menu>
								<v-select
									:items="lineList"
									label="chọn LINE"
									color="pink"
									outlined
									dense
									clearable
									v-model="kaikei.line"
									hide-details="auto"
									class="shrink mr-2 search-field"
								></v-select>
								<v-select
									:items="['CA3', 'CA4']"
									label="chọn CA"
									color="pink"
									outlined
									dense
									clearable
									v-model="kaikei.ca"
									hide-details="auto"
									class="shrink mr-2 search-field"
								></v-select>

								<v-divider vertical class="mx-2"></v-divider>
								<v-btn
									@click="searchMasterKaikei()"
									color="primary"
									class="mr-2"
								>
									SEARCH
								</v-btn>
								<v-spacer></v-spacer>
								<v-divider vertical class="mx-2"></v-divider>
								<a
									class=""
									:href="
										$nuxt.context.pkg.base +
										'/thuc-tich-ircs-hinban/F_import_master_kaikei.xls'
									"
									>file mẫu</a
								>
								<input
									ref="uploadKaikeiFile"
									type="file"
									hidden="hidden"
									@change="handleFileChange"
								/>
								<v-btn
									color="green"
									@click="btnMasterKaikeiIMPClick"
									class="ml-2"
								>
									IMPORT
								</v-btn>
							</v-toolbar>
							<span>
								<v-btn
									color="red"
									densen
									class="my-1 white--text"
									:disabled="
										kaikei.selectedMasterItems.length < 1
									"
									@click="deleteSelectedMasterKaikeiItems"
								>
									XÓA
									<v-icon> mdi-delete-circle </v-icon>
								</v-btn>
								<v-btn
									color="green"
									densen
									class="my-1 white--text"
									:disabled="
										!!kaikei.editingMasterItem.D_ASSY
									"
									@click="addNewMasterKaikei"
								>
									Thêm
									<v-icon> mdi-plus-circle </v-icon>
								</v-btn>
							</span>
							<v-data-table
								:items="masterKaikeiView"
								:fixed-header="true"
								disable-sort
								height="70vh"
								dense
								show-select
								v-model="kaikei.selectedMasterItems"
								item-key="id"
								:headers="kaikei.masterHeader"
								:items-per-page="-1"
								class="elevation-1"
								hide-default-footer
							>
								<template v-slot:item.ACTION="{ item }">
									<span>
										<span style="display: none">
											{{ item.state }}
										</span>
										<v-tooltip top v-if="item.D_UPDATE">
											<template
												v-slot:activator="{ on, attrs }"
											>
												<v-icon
													small
													color="blue"
													v-bind="attrs"
													v-on="on"
													@click="
														editMasterKaikei(item)
													"
													:disabled="
														!Object.keys(
															kaikei.editingMasterItem,
														).length == 0
													"
													class="mdi-24px"
												>
													mdi-pencil-circle
												</v-icon>
											</template>
											<span>Chỉnh sửa</span>
										</v-tooltip>
										<v-tooltip top v-if="item.state">
											<template
												v-slot:activator="{ on, attrs }"
											>
												<v-icon
													small
													color="green"
													v-bind="attrs"
													v-on="on"
													@click="
														saveEditingMasterKaikei()
													"
													class="mdi-24px"
												>
													mdi-content-save
												</v-icon>
											</template>
											<span>Save</span>
										</v-tooltip>
										<v-tooltip top v-if="item.state">
											<template
												v-slot:activator="{ on, attrs }"
											>
												<v-icon
													small
													color="red"
													v-bind="attrs"
													v-on="on"
													@click="
														if (item.state == 2) {
															searchMasterKaikei();
														} else {
															cancelEditMasterKaikei(
																item,
															);
														}
													"
													class="mdi-18px"
												>
													mdi-cancel
												</v-icon>
											</template>
											<span>Hủy</span>
										</v-tooltip>
									</span>
								</template>
								<template v-slot:item.C_CA="{ item }">
									<span>
										<span v-if="!item.state">{{
											item.C_CA
										}}</span>
										<span v-if="item.state">
											<input
												type="text"
												style="
													border: 1px solid blue;
													width: 50px;
												"
												v-model="
													kaikei.editingMasterItem[
														'C_CA'
													]
												"
											/>
										</span>
									</span>
								</template>
								<template v-slot:item.C_START="{ item }">
									<span>
										<span
											v-if="
												!item.state || item.state == 1
											"
											>{{ item.C_START }}</span
										>
										<span v-if="item.state == 2">
											<input
												type="text"
												style="
													border: 1px solid blue;
													width: 100px;
												"
												v-model="
													kaikei.editingMasterItem[
														'C_START'
													]
												"
												v-mask="timeRangeMask"
											/>
										</span>
									</span>
								</template>
								<template v-slot:item.C_END="{ item }">
									<span>
										<span v-if="!item.state">{{
											item.C_END
										}}</span>
										<span v-if="item.state">
											<input
												type="text"
												style="
													border: 1px solid blue;
													width: 100px;
												"
												v-model="
													kaikei.editingMasterItem[
														'C_END'
													]
												"
												v-mask="timeRangeMask"
											/>
										</span>
									</span>
								</template>
								<template v-slot:item.SUB_NGUOI="{ item }">
									<span>
										<span v-if="!item.state">{{
											item.SUB_NGUOI
										}}</span>
										<span v-if="item.state">
											<input
												type="number"
												style="
													border: 1px solid blue;
													width: 60px;
												"
												v-model="
													kaikei.editingMasterItem[
														'SUB_NGUOI'
													]
												"
											/>
										</span>
									</span>
								</template>
								<template v-slot:item.SUB_TG="{ item }">
									<span>
										<span v-if="!item.state">{{
											item.SUB_TG
										}}</span>
										<span v-if="item.state">
											<input
												type="number"
												style="
													border: 1px solid blue;
													width: 60px;
												"
												v-model="
													kaikei.editingMasterItem[
														'SUB_TG'
													]
												"
											/>
										</span>
									</span>
								</template>
								<template v-slot:item.ASSY_NGUOI="{ item }">
									<span>
										<span v-if="!item.state">{{
											item.ASSY_NGUOI
										}}</span>
										<span v-if="item.state">
											<input
												type="number"
												style="
													border: 1px solid blue;
													width: 60px;
												"
												v-model="
													kaikei.editingMasterItem[
														'ASSY_NGUOI'
													]
												"
											/>
										</span>
									</span>
								</template>
								<template v-slot:item.ASSY_TG="{ item }">
									<span>
										<span v-if="!item.state">{{
											item.ASSY_TG
										}}</span>
										<span v-if="item.state">
											<input
												type="number"
												style="
													border: 1px solid blue;
													width: 60px;
												"
												v-model="
													kaikei.editingMasterItem[
														'ASSY_TG'
													]
												"
											/>
										</span>
									</span>
								</template>
								<template v-slot:item.QC_NGUOI="{ item }">
									<span>
										<span v-if="!item.state">{{
											item.QC_NGUOI
										}}</span>
										<span v-if="item.state">
											<input
												type="number"
												style="
													border: 1px solid blue;
													width: 60px;
												"
												v-model="
													kaikei.editingMasterItem[
														'QC_NGUOI'
													]
												"
											/>
										</span>
									</span>
								</template>
								<template v-slot:item.QC_TG="{ item }">
									<span>
										<span v-if="!item.state">{{
											item.QC_TG
										}}</span>
										<span v-if="item.state">
											<input
												type="number"
												style="
													border: 1px solid blue;
													width: 60px;
												"
												v-model="
													kaikei.editingMasterItem[
														'QC_TG'
													]
												"
											/>
										</span>
									</span>
								</template>
							</v-data-table>
						</v-tab-item>
						<v-tab-item style="height: 85vh" class="grey lighten-4">
							<v-toolbar dark color="brown accent-4">
								<v-menu
									v-model="mSelecKaikeiExpDate"
									:close-on-content-click="false"
									:nudge-right="40"
									:disabled="loading"
									transition="scale-transition"
									offset-y
								>
									<template v-slot:activator="{ on, attrs }">
										<v-text-field
											v-model="kaikei.d_assy"
											label="ASSY日"
											readonly
											:disabled="loading"
											:hide-details="true"
											v-bind="attrs"
											v-on="on"
											:clearable="true"
											class="shrink mr-2"
											outlined
											dense
											@click:clear="kaikei.d_assy = null"
										></v-text-field>
									</template>
									<v-date-picker
										v-model="kaikei.d_assy"
										@input="mSelecKaikeiExpDate = false"
										:allowed-dates="allowedDatePicker"
										:show-week="true"
										:show-adjacent-months="false"
										locale="jp-jp"
										:day-format="dayFormat"
										no-title
									></v-date-picker>
								</v-menu>
								<v-select
									:items="lineList"
									label="chọn LINE"
									color="pink"
									outlined
									dense
									clearable
									v-model="kaikei.line"
									hide-details="auto"
									class="shrink mr-2 search-field"
								></v-select>
								<v-select
									:items="['CA3', 'CA4']"
									label="chọn CA"
									color="pink"
									outlined
									dense
									clearable
									v-model="kaikei.ca"
									hide-details="auto"
									class="shrink mr-2 search-field"
								></v-select>

								<v-divider vertical class="mx-2"></v-divider>
								<v-btn
									@click="searchKaikei()"
									color="primary"
									class="mr-2"
								>
									SEARCH
								</v-btn>
								<v-spacer></v-spacer>
								<v-divider vertical class="mx-2"></v-divider>
								<v-btn
									color="green"
									class="ml-2"
									:disabled="kaikeiExp.kaikeiRes.length < 1"
									@click="exportKaikeiData"
								>
									EXPORT
								</v-btn>
							</v-toolbar>
							<v-data-table
								:items="kaikeiView"
								:fixed-header="true"
								disable-sort
								height="75vh"
								dense
								item-key="id"
								:item-class="
									(it) => {
										let classes = [];
										if (!it.C_START && !it.C_HIN) {
											classes.push('row-kaikei-all');
										} else {
											if (
												!it.C_HIN
												// &&	it.L_SAN_LUONG_IRCS > 0
											) {
												classes.push(
													'row-kaikei-jikan',
												);
											}
											classes.push('row-kaikei-normal');
										}

										if (!(it.L_SAN_LUONG_IRCS >= 0)) {
											classes.push('row-note');
										}

										return classes;
									}
								"
								:headers="kaikeiExp.kaikeiHeader"
								:items-per-page="-1"
								class="elevation-1"
								hide-default-footer
							>
								<template v-slot:item.C_START="{ item }">
									<span>
										<span
											v-if="!item.C_START && !item.C_HIN"
										>
											<v-chip color="green">
												<b>{{ item.C_LINE }}</b>
											</v-chip>
										</span>
										<span v-else>
											{{ item.C_START }}
										</span>
									</span>
								</template>
								<template v-slot:item.C_END="{ item }">
									<span>
										<span v-if="!item.C_END && !item.C_HIN">
											<v-chip
												:color="
													item.C_CA == 'CA4'
														? 'blue'
														: 'red'
												"
											>
												<b>{{ item.C_CA }}</b>
											</v-chip>
										</span>
										<span v-else>
											{{ item.C_END }}
										</span>
									</span>
								</template>
								<template v-slot:item.SUB_NGUOI="{ item }">
									<span class="">
										<span
											v-if="!item.C_HIN || !item.C_START"
										>
											{{ item.SUB_NGUOI }}
										</span>
									</span>
								</template>
								<template v-slot:item.SUB_TG="{ item }">
									<span class="">
										<span
											v-if="!item.C_HIN || !item.C_START"
										>
											{{ item.SUB_TG }}
										</span>
									</span>
								</template>
								<template v-slot:item.ASSY_NGUOI="{ item }">
									<span class="">
										<span
											v-if="!item.C_HIN || !item.C_START"
										>
											{{ item.ASSY_NGUOI }}
										</span>
									</span>
								</template>
								<template v-slot:item.ASSY_TG="{ item }">
									<span class="">
										<span
											v-if="!item.C_HIN || !item.C_START"
										>
											{{ item.ASSY_TG }}
										</span>
									</span>
								</template>
								<template v-slot:item.QC_NGUOI="{ item }">
									<span class="">
										<span
											v-if="!item.C_HIN || !item.C_START"
										>
											{{ item.QC_NGUOI }}
										</span>
									</span>
								</template>
								<template v-slot:item.QC_TG="{ item }">
									<span class="">
										<span
											v-if="!item.C_HIN || !item.C_START"
										>
											{{ item.QC_TG }}
										</span>
									</span>
								</template>
								<template
									v-slot:item.L_NHAN_CONG_ALL="{ item }"
								>
									<span class="cell-kaikei-percent-all">
										{{ item.L_NHAN_CONG_ALL }}
									</span>
								</template>
								<template v-slot:item.ST_ALL="{ item }">
									<span
										:class="
											!item.C_HIN ||
											!(item.L_SAN_LUONG_IRCS > 0)
												? 'cell-kaikei-percent-all'
												: ''
										"
									>
										{{ item.ST_ALL }}
									</span>
								</template>
								<template v-slot:item.SUB_PERCENT="{ item }">
									<span class="cell-kaikei-percent">
										<span v-if="item.SUB_PERCENT > 0">
											{{
												item.SUB_PERCENT.toLocaleString(
													undefined,
													{
														style: 'percent',
														minimumFractionDigits: 2,
													},
												)
											}}
										</span>
									</span>
								</template>
								<template v-slot:item.ASSY_PERCENT="{ item }">
									<span class="cell-kaikei-percent">
										<span v-if="item.ASSY_PERCENT > 0">
											{{
												item.ASSY_PERCENT.toLocaleString(
													undefined,
													{
														style: 'percent',
														minimumFractionDigits: 2,
													},
												)
											}}
										</span>
									</span>
								</template>
								<template v-slot:item.QC_PERCENT="{ item }">
									<span class="cell-kaikei-percent">
										<span v-if="item.QC_PERCENT > 0">
											{{
												item.QC_PERCENT.toLocaleString(
													undefined,
													{
														style: 'percent',
														minimumFractionDigits: 2,
													},
												)
											}}
										</span>
									</span>
								</template>
								<template v-slot:item.ALL_PERCENT="{ item }">
									<span class="cell-kaikei-percent-all">
										<span v-if="item.ALL_PERCENT > 0">
											{{
												item.ALL_PERCENT.toLocaleString(
													undefined,
													{
														style: 'percent',
														minimumFractionDigits: 2,
													},
												)
											}}
										</span>
										<span v-else>
											{{ item.ALL_PERCENT }}
										</span>
									</span>
								</template>
							</v-data-table>
						</v-tab-item>
					</v-tabs>
				</v-container>
			</v-card>
			<!-- </v-container> -->
		</v-dialog>
	</div>
</template>
