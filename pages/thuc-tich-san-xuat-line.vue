<script>
const ChromiumUtils = require('../plugins/chromium-utils');
export default {
	head: {
		title: '生産実績サマリー',
	},
	data() {
		return {
			kameStyle: false,
			ttIrcsHinbanData: [],
			ttSXData: [],
			selectedDate: null,
			ruikeiStartDate: null,
			editedRuikei: {},
			dialog_Edit_Ruikei: false,
			selectedDates: null,
			selectedIrcsTime: null,
			selectedLine: null,
			pageInit: null,
			lineAmDetail: {},
			dateScope: [],
			rawFile: null,
			title: '生産実績サマリー ● Thực tích sản xuất - LINE',
			loading: false,
			today: new Date().toISOString().substring(0, 10),
			maxNichiCol: 3,
			selectedStatus: 'ALL',
			pickerOptions: {
				disabledDate(e) {
					let fromD = new Date();
					let toD = new Date();
					fromD.setDate(fromD.getDate() - 150);
					toD.setDate(toD.getDate() + 4);
					return (
						e.getTime() < fromD.getTime() ||
						e.getTime() > toD.getTime()
					);
				},
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
			version: '1.0.0',
			options: { replace: true },
		});

		try {
			let res = await this.$axios.get('tt-sx/init');
			this.pageInit = res.data;
		} catch (err) {
			console.log(err);
		} finally {
		}

		if (this.shijiMaxDate) {
			this.selectedDates = [
				this.$moment().add(-10, 'day').format('YYYY-MM-DD'),
				this.shijiMaxDate,
			];
		} else {
			this.selectedDates = [
				this.$moment().add(-10, 'day').format('YYYY-MM-DD'),
				this.$moment().add(2, 'day').format('YYYY-MM-DD'),
			];
		}

		await this.getData();

		if (this.$route.query.type == 'ruikeiDaily') {
			await this.excelDownload();
		}
	},
	computed: {
		searchKey() {
			return this.keyWorld.toUpperCase();
		},
		shijiMaxDate() {
			if (this.pageInit && this.pageInit.SIJI_INFO.length > 0)
				return this.pageInit.SIJI_INFO[0].D_SIJI_MAX;
			return null;
		},
		headers() {
			let mHeader = [
				{
					text: 'LINE NO.',
					value: 'ラインNO',
					width: 80,
					minWidth: 80,
					excelWidth: 15,
					class: ['tbl-header'],
					fixed: true,
				},
				{
					text: '顧客',
					value: 'C_MKCOD',
					width: 100,
					minWidth: 100,
					excelWidth: 15,
					class: ['tbl-header'],
					fixed: true,
				},
				{
					text: '車種',
					value: 'C_SAJYU',
					width: 100,
					minWidth: 100,
					excelWidth: 15,
					class: ['tbl-header'],
					fixed: true,
				},
				{
					text: 'WH種類',
					value: 'C_HARNESSJYU',
					width: 100,
					minWidth: 100,
					excelWidth: 15,
					class: ['tbl-header'],
					fixed: true,
				},
				{
					text: '',
					value: 'C_NAME',
					width: 80,
					minWidth: 80,
					excelWidth: 10,
					class: ['tbl-header'],
					fixed: true,
				},
			];
			this.dayRange.forEach((d) => {
				mHeader.push(this.createHeaderCol(d.substring(5), d, 50));
			});

			return mHeader;
		},
		excelHeader() {
			excelH = [];
		},
		ttSX_Data() {
			let cookedData = this.ttSXData.map((item, idx, arr) => {
				let newItem = {
					C_SAJYU: item.C_SAJYU,
					C_HARNESSJYU: item.C_HARNESSJYU,
					ラインNO: item.ラインNO,
					C_NAME: item.C_NAME,
					l_order: this.getRowOrder(item.C_NAME),
				};

				this.dayRangeRuikei.forEach((d) => {
					let mDate = this.$moment(d);

					if (
						(item.C_NAME == '計画' || item.C_NAME == '実績') &&
						mDate.day() != 0
					) {
						newItem[d] = item[d] || 0;
					} else {
						newItem[d] = item[d];
					}

					if (item.C_NAME == '実績') {
						newItem[d + '_C_HIN'] = item[d + '_C_HIN'];
					}
				});

				return newItem;
			});

			cookedData.push(...this.createAdditionRow('差', 5));
			cookedData.push(...this.createAdditionRow('累計', 6));

			cookedData.sort((a, b) => {
				if (a.ラインNO.substring(1, 3) > b.ラインNO.substring(1, 3))
					return 1;
				if (a.ラインNO.substring(1, 3) < b.ラインNO.substring(1, 3))
					return -1;

				if (a.ラインNO.length > b.ラインNO.length) return 1;
				if (a.ラインNO.length < b.ラインNO.length) return -1;

				if (a.ラインNO > b.ラインNO) return 1;
				if (a.ラインNO < b.ラインNO) return -1;

				if (a.l_order > b.l_order) return 1;
				if (a.l_order < b.l_order) return -1;

				return 0;
			});

			let sttAm = {};
			let sttRuikeiAm = {};

			this.lineAmDetail = {};

			return cookedData.map((item) => {
				if (item.C_NAME == '差') {
					this.dayRange.forEach((d) => {
						if (!this.lineAmDetail[d]) this.lineAmDetail[d] = {};
						if (item[d] < 0) {
							if (!sttAm[d]) {
								sttAm[d] = 1;
							} else {
								sttAm[d] = sttAm[d] + 1;
							}
							item[d + '_sttAm'] = sttAm[d];
							this.lineAmDetail[d]['差'] =
								(this.lineAmDetail[d]['差'] || '差') +
								'<br/>' +
								sttAm[d] +
								'. ' +
								item.ラインNO +
								': <span style="color:red;font-weight:bold">' +
								item[d] +
								'</span>';
							this.lineAmDetail[d]['差_copy'] =
								(this.lineAmDetail[d]['差_copy'] || '差') +
								'\n' +
								item.ラインNO +
								': ' +
								item[d];
						}
					});
				}
				if (item.C_NAME == '累計') {
					this.dayRange.forEach((d) => {
						if (!this.lineAmDetail[d]) this.lineAmDetail[d] = {};
						if (item[d] < 0) {
							if (!sttRuikeiAm[d]) {
								sttRuikeiAm[d] = 1;
							} else {
								sttRuikeiAm[d] = sttRuikeiAm[d] + 1;
							}
							item[d + '_sttAm'] = sttRuikeiAm[d];
							this.lineAmDetail[d]['累計'] =
								(this.lineAmDetail[d]['累計'] || '累計') +
								'<br/>' +
								sttRuikeiAm[d] +
								'. ' +
								item.ラインNO +
								': <span style="color:red;font-weight:bold">' +
								item[d] +
								'</span>';
							this.lineAmDetail[d]['累計_copy'] =
								(this.lineAmDetail[d]['累計_copy'] || '累計') +
								'\n' +
								item.ラインNO +
								': ' +
								item[d];
						}
					});
				}
				return item;
			});
		},
		ttExcelData() {
			return this.ttSX_Data.filter((item) => {
				return item.C_NAME != 'RUIKEI';
			});
		},
		dayRange() {
			let dRange = [];

			if (
				this.selectedDates &&
				this.selectedDates.length == 2 &&
				this.ttSXData.length > 0
			) {
				let sDate = this.$moment(this.selectedDates[0]);
				let tDate = this.$moment(this.selectedDates[1]);
				let diff = tDate.diff(sDate, 'days');

				dRange.push(sDate.format('YYYY-MM-DD'));

				for (let i = 0; i < diff; i++) {
					sDate.add(1, 'day');
					dRange.push(sDate.format('YYYY-MM-DD'));
				}
			}

			return dRange;
		},
		dayRangeRuikei() {
			let dRRuikei = [];

			if (
				this.selectedDates &&
				this.selectedDates.length == 2 &&
				this.ttSXData.length > 0
			) {
				let sDate = this.$moment(this.ruikeiStartDate);
				let tDate = this.$moment(this.selectedDates[1]);
				let diff = tDate.diff(sDate, 'days');

				dRRuikei.push(sDate.format('YYYY-MM-DD'));

				for (let i = 0; i < diff; i++) {
					sDate.add(1, 'day');
					dRRuikei.push(sDate.format('YYYY-MM-DD'));
				}
			}

			return dRRuikei;
		},
		lines() {
			const lineNames = this.ttSXData.map((item) => {
				return item.ラインNO;
			});
			return [...new Set(lineNames)];
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
		async onHeaderClicked(h) {
			if (/^\d+-\d+-\d+$/.test(h.value)) {
				if (this.lineAmDetail[h.value]) {
					await this.$copyText(
						(this.lineAmDetail[h.value].差_copy || '') +
							'\n' +
							(this.lineAmDetail[h.value].累計_copy || ''),
					);
					this.$root.$Snackbar.show({ message: 'Đã Copy!!' });
				} else {
					await this.$copyText('');
				}
			}
		},
		async copyContent(content) {
			await this.$copyText(content);
			this.$root.$Snackbar.show({ message: 'Đã Copy!!' });
		},
		createHeaderCol(name, val, width) {
			let nHeader = {
				text: name,
				excellText: val,
				excelWidth: 10,
				value: val,
				width: width || '100%',
				class: ['tbl-header'],
				rowClass: ['cell-number'],
				type: 'number',
			};

			if (this.isStringSunday(val)) {
				nHeader.class.push('header-sunday');
				nHeader.rowClass.push('cell-sunday');
			}

			//dem so luong 	差 <0
			nHeader['lAm'] = this.ttSX_Data.reduce((prev, cur) => {
				return cur.C_NAME == '差' && cur[val] < 0 ? prev + 1 : prev;
			}, 0);
			nHeader['lRuikeiAm'] = this.ttSX_Data.reduce((prev, cur) => {
				return cur.C_NAME == '累計' && cur[val] < 0 ? prev + 1 : prev;
			}, 0);

			return nHeader;
		},
		createAdditionRow(cName, order) {
			return this.lines.map((lineName) => {
				let rAdd = {
					ラインNO: lineName,
					C_NAME: cName,
					l_order: order,
				};

				this.dayRangeRuikei.forEach((day, idx) => {
					if (cName == '差') {
						rAdd[day] =
							this.ttSXData.reduce((prev, cur) => {
								return cur.ラインNO == lineName &&
									cur.C_NAME == '実績'
									? prev + (cur[day] || 0)
									: prev;
							}, 0) -
							this.ttSXData.reduce((prev, cur) => {
								return cur.ラインNO == lineName &&
									cur.C_NAME == '計画'
									? prev + (cur[day] || 0)
									: prev;
							}, 0);
					} else if (cName == '累計') {
						if (idx == 0) {
							rAdd[day] =
								this.ttSXData.reduce((prev, cur) => {
									return cur.ラインNO == lineName &&
										cur.C_NAME == '実績'
										? prev + (cur[day] || 0)
										: prev;
								}, 0) -
								this.ttSXData.reduce((prev, cur) => {
									return cur.ラインNO == lineName &&
										cur.C_NAME == '計画'
										? prev + (cur[day] || 0)
										: prev;
								}, 0);
						} else {
							rAdd[day] =
								rAdd[this.dayRangeRuikei[idx - 1]] +
								this.ttSXData.reduce((prev, cur) => {
									return cur.ラインNO == lineName &&
										cur.C_NAME == '実績'
										? prev + (cur[day] || 0)
										: prev;
								}, 0) -
								this.ttSXData.reduce((prev, cur) => {
									return cur.ラインNO == lineName &&
										cur.C_NAME == '計画'
										? prev + (cur[day] || 0)
										: prev;
								}, 0);
						}

						this.ttSXData.forEach((item) => {
							if (
								item.ラインNO == lineName &&
								item.C_NAME == 'RUIKEI'
							) {
								if (typeof item[day] == 'number') {
									rAdd[day] = item[day];
									rAdd[day + '_RUIKEI'] = item[day];
								}
							}
						});
					}
				});

				return rAdd;
			});
		},
		rowClass(item) {
			let rClass = ['cell-normal'];

			if (item.C_NAME == '計画') {
				rClass.push('cell-ke-hoach');
			}
			if (item.C_NAME == '差') {
				rClass.push('cell-sai');
			}
			if (item.C_NAME == '累計') {
				rClass.push('cell-ruikei');
			}
			if (item.C_NAME == '実績') {
				rClass.push('cell-thuc-tich');
			}

			return rClass;
		},
		isStringSunday(str) {
			let d = this.$moment(str);
			if (d.isValid()) {
				return d.day() == 0;
			}
			return false;
		},
		getRows(rows) {
			const result = [];
			this.headers.forEach((i, key) => {
				let colVal;
				if (i.children) {
					i.children.forEach((i1, key1) => {
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
		async getData() {
			this.ttSXData = [];
			if (!this.selectedDates || this.selectedDates.length != 2) return;
			this.loading = true;
			// console.log('load data @ ' + this.selectedDate);
			let apiURL = '/tt-sx-line?1=1';
			if (
				this.selectedDates &&
				this.selectedDates.length &&
				this.selectedDates.length > 0
			) {
				apiURL =
					apiURL +
					'&dStart=' +
					this.selectedDates[0] +
					'&dEnd=' +
					this.selectedDates[1];
			}
			if (this.selectedIrcsTime && this.selectedIrcsTime !== '') {
				apiURL = apiURL + '&dIrcs=' + this.selectedIrcsTime;
			}

			try {
				let res = await this.$axios.get(apiURL);
				let tNow = new Date();
				// handle success
				console.log(res.data.data);
				this.ttSXData = [...res.data.data];
				this.ruikeiStartDate = res.data.startDate;
			} catch (err) {
				console.log(err);
			} finally {
				this.loading = false;
			}
		},
		getRowOrder(name) {
			switch (name) {
				case '計画':
					return 1;
				case '昼勤実績':
					return 2;
				case '夜勤実績':
					return 3;
				case '実績':
					return 4;
				case '差':
					return 5;
				case '累計':
					return 6;
			}
		},
		onDateChanged(date) {
			this.getData();
		},

		onClearDate() {
			this.selectedDate = '';
			this.getData();
		},
		tryUpdateRuikei() {
			console.log(this.$route.name);
			if (
				this.$nuxt.context.appConfig.secretCODE[this.$route.name] !=
				this.editedRuikei.pass
			) {
				this.$root.$Snackbar.show({ message: 'Sai mật khẩu!!!' });
			} else {
			}
			// this.getData();
		},
		handleUploadBtnClick() {
			this.$refs.uploadFile.value = null;
			this.$refs.uploadFile.click();
		},
		handleFileChange(e) {
			if (!this.$refs.uploadFile.value) {
				return;
			}

			this.rawFile = e.target.files[0];
			console.log(this.rawFile);
		},
		async excelDownload() {
			let filename =
				'TT_SX_LINE_' +
				(this.selectedDates[0] || '') +
				'_' +
				this.selectedDates[1];
			ChromiumUtils.excelJSExport(
				(ws) => {
					const startRow = 3;
					const startCol = 2;
					const boderLine = {
						style: 'thin',
						color: { argb: 'FF000000' },
					};
					const boderHair = {
						style: 'hair',
						color: { argb: 'FF000000' },
					};
					const headerFill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: 'FFD9D9D9' },
					};
					const keHoachRowFill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: 'FFE2EFDA' },
						bgColor: { argb: 'FFE2EFDA' },
					};
					const saiRowFill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: 'FFFFF2CC' },
						bgColor: { argb: 'FFFFF2CC' },
					};
					const ruikeiRowFill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: 'FFC6E0B4' },
						bgColor: { argb: 'FFC6E0B4' },
					};
					const sundayRowFill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: 'FFD9D9D9' },
						bgColor: { argb: 'FFD9D9D9' },
					};
					const mergedCelllAlign = {
						vertical: 'middle',
						horizontal: 'center',
					};
					const headerCelllAlign = {
						vertical: 'middle',
						horizontal: 'center',
					};

					ws.properties.defaultRowHeight = 18.75;
					ws.properties.defaultColWidth = 10;
					const hRow = ws.getRow(startRow);
					this.headers.forEach((h, idx) => {
						hRow.getCell(idx + startCol).font = { bold: true };
						if (/^\d+-\d+-\d+$/.test(h.excellText || h.text)) {
							hRow.getCell(idx + startCol).value = new Date(
								Date.parse(h.excellText),
							);
						} else {
							hRow.getCell(idx + startCol).value =
								h.excellText || h.text;
						}

						hRow.getCell(idx + startCol).border = {
							top: boderLine,
							left: boderLine,
							bottom: boderLine,
							right: boderLine,
						};

						hRow.getCell(idx + startCol).fill = headerFill;
						hRow.getCell(idx + startCol).numFmt = 'mm/dd';
						hRow.getCell(idx + startCol).alignment =
							headerCelllAlign;
					});
					hRow.font = { name: 'BIZ UDゴシック' };
					hRow.commit();

					ws.views = [
						{
							state: 'frozen',
							ySplit: 3,
							xSplit: 6,
							showGridLines: false,
						},
					];

					this.ttExcelData.forEach((item, idx) => {
						const row = ws.getRow(startRow + 1 + idx);
						this.headers.forEach((h, id_h) => {
							row.getCell(id_h + startCol).value = item[h.value];

							if (h.value == 'C_NAME')
								row.getCell(id_h + startCol).alignment =
									headerCelllAlign;

							if (item.C_NAME == '計画') {
								row.getCell(id_h + startCol).border = {
									top: boderLine,
									left: boderLine,
									bottom: boderHair,
									right: boderLine,
								};
							} else if (item.C_NAME == '累計') {
								row.getCell(id_h + startCol).border = {
									top: boderHair,
									left: boderLine,
									bottom: boderLine,
									right: boderLine,
								};
							} else {
								row.getCell(id_h + startCol).border = {
									top: boderHair,
									left: boderLine,
									bottom: boderHair,
									right: boderLine,
								};
							}

							if (h.type == 'number')
								row.getCell(id_h + startCol).numFmt = '#,##0';
						});
						row.font = { name: 'BIZ UDゴシック' };
						row.commit();
					});

					//chinh chieu ngang cot
					this.headers.forEach((h, idx) => {
						const column = ws.getColumn(idx + startCol);
						if (h.excelWidth) {
							column.width = h.excelWidth;
						} else {
							const lengths = column.values.map(
								(v) => v.toString().length,
							);
							let maxLength = Math.max(
								...lengths.filter((v) => typeof v === 'number'),
							);
							maxLength =
								maxLength > h.value.length
									? maxLength + 2
									: h.value.length + 2;

							column.width = maxLength;
						}
					});

					for (let i = 7; i < 7 + this.dayRange.length; i++) {
						ws.getCell(
							this.$getExcelColumnName(i) + (startRow - 2),
						).value = {
							formula:
								'COUNTIFS($F:$F,"差",' +
								this.$getExcelColumnName(i) +
								':' +
								this.$getExcelColumnName(i) +
								',"<0")',
							result: 0,
						};
						ws.getCell(
							this.$getExcelColumnName(i) + (startRow - 1),
						).value = {
							formula:
								'COUNTIFS($F:$F,"累計",' +
								this.$getExcelColumnName(i) +
								':' +
								this.$getExcelColumnName(i) +
								',"<0")',
							result: 0,
						};
					}

					//add filter
					// ws.autoFilter = startRow + ':' + startRow;

					let i = startRow + 1;
					do {
						ws.mergeCells('A' + i + ':A' + (i + 5));
						ws.getCell('A' + i).alignment = mergedCelllAlign;

						ws.mergeCells('B' + i + ':B' + (i + 5));
						ws.getCell('B' + i).alignment = mergedCelllAlign;

						ws.mergeCells('C' + i + ':C' + (i + 5));
						ws.getCell('C' + i).alignment = mergedCelllAlign;

						ws.mergeCells('D' + i + ':D' + (i + 5));
						ws.getCell('D' + i).alignment = mergedCelllAlign;

						ws.mergeCells('E' + i + ':E' + (i + 5));
						ws.getCell('E' + i).alignment = mergedCelllAlign;

						i = i + 6;
					} while (i < this.ttExcelData.length);

					//To mau ke hoach
					ws.addConditionalFormatting({
						ref:
							`F${startRow}:` +
							this.$getExcelColumnName(
								this.headers.length + startCol - 1,
							) +
							(this.ttExcelData.length + startRow),
						rules: [
							{
								type: 'expression',
								formulae: [`$F${startRow}="計画"`],
								style: {
									fill: keHoachRowFill,
								},
							},
						],
					});

					//To mau sai
					ws.addConditionalFormatting({
						ref:
							`F${startRow}:` +
							this.$getExcelColumnName(
								this.headers.length + startCol - 1,
							) +
							(this.ttExcelData.length + startRow),
						rules: [
							{
								type: 'expression',
								formulae: [`$F${startRow}="差"`],
								style: {
									fill: saiRowFill,
								},
							},
						],
					});

					//To mau 累計
					ws.addConditionalFormatting({
						ref:
							`F${startRow}:` +
							this.$getExcelColumnName(
								this.headers.length + startCol - 1,
							) +
							(this.ttExcelData.length + startRow),
						rules: [
							{
								type: 'expression',
								formulae: [`$F${startRow}="累計"`],
								style: {
									fill: ruikeiRowFill,
								},
							},
						],
					});

					//To mau cot chu nhat
					ws.addConditionalFormatting({
						ref:
							`G${startRow}:` +
							this.$getExcelColumnName(
								this.headers.length + startCol - 1,
							) +
							(this.ttExcelData.length + startRow),
						rules: [
							{
								type: 'expression',
								formulae: [`WEEKDAY(G$${startRow})=1`],
								style: {
									fill: sundayRowFill,
								},
							},
						],
					});

					//So am -> chu mau do
					ws.addConditionalFormatting({
						ref:
							`G${startRow}:` +
							this.$getExcelColumnName(
								this.headers.length + startCol - 1,
							) +
							(this.ttExcelData.length + startRow),
						rules: [
							{
								type: 'expression',
								formulae: [`G${startRow}<0`],
								style: {
									font: {
										color: { argb: 'FFFF0000' },
									},
								},
							},
						],
					});

					//ten cot chu nhat -> chu mau do
					ws.addConditionalFormatting({
						ref:
							`G${startRow}:` +
							this.$getExcelColumnName(
								this.headers.length + startCol - 1,
							) +
							startRow,
						rules: [
							{
								type: 'expression',
								formulae: [`WEEKDAY(G${startRow})=1`],
								style: {
									font: {
										color: { argb: 'FFFF0000' },
									},
								},
							},
						],
					});
				},
				{
					sheetName: '生産実績サマリー',
					opts: {
						pageSetup: {
							fitToPage: true,
							fitToHeight: 1, //0: auto
							fitToWidth: 1,
							// orientation: 'landscape',
							paperSize: 8,
							printArea:
								'B3:' +
								this.$getExcelColumnName(
									this.headers.length + 2,
								) +
								(this.ttExcelData.length + 3),
						},
					},
				},
				filename,
				// {
				// 	to: 'ho.172318.tan@furukawaelectric.com',
				// 	subject: 'test',
				// 	html: 'TUNA',
				// },
			);
		},
	},
	beforeDestroy() {},
};
</script>

<style lang="scss">
#page-thuc-tich-san-xuat-line {
	// Vuetify Table
	.tbl-header {
		background-color: #d9d9d9 !important;
		font-size: 1.1rem !important;
		padding: 0 8px !important;
		color: darkblue;
		border: 1px solid black;
		text-align: center;
	}
	.cell-sunday {
		background-color: lightgrey !important;
	}
	.header-sunday {
		color: red !important;
	}
	.cell-ke-hoach {
		background-color: #e2efda !important;
		font-weight: bold;
		border-top: 2px solid black !important;
	}
	.cell-thuc-tich {
		font-weight: bold;
	}
	.cell-sai {
		background-color: #fff2cc !important;
		font-weight: bold;
	}
	.cell-ruikei {
		background-color: #c6e0b4 !important;
		font-weight: bold;
	}

	.text--center {
		text-align: center !important;
	}

	.cell-boilder {
		text-align: left;
		font-weight: bolder;
	}
	.cell-normal {
		border-left: 1px solid black;
		border-right: 1px solid black;
		border-top: 1px dashed black;
		border-bottom: 1px dashed black;
		padding: 0 3px !important;
		text-align: left;
		font-size: 1.3rem;
		height: 20px !important;
	}
	.cell-number {
		padding: 0 3px !important;
		text-align: right;
		font-size: 1.3rem;
	}
	.cell-shiji {
		// padding: 0 5px !important;
		text-align: right;
		font-size: 1.8rem;
		color: crimson;
		background-color: oldlace;
	}
	.cell-total {
		// padding: 0 5px !important;
		text-align: right;
		font-size: 1.8rem;
		color: green;
		background-color: oldlace;
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
		color: red;
	}
	.cell-num-over {
		color: blue !important;
	}

	table {
		border-collapse: collapse;
	}
	// font-family: ＭＳ Ｐゴシック;
	font-family: BIZ UDゴシック;

	.v-data-footer__select .v-select {
		margin-top: 1px !important;
		margin-bottom: 1px !important;
	}

	.v-badge__badge {
		font-size: 10px !important;
	}
}
// .custom-tooltip {
// 	opacity: 1 !important;
// }

.v-tooltip__content.menuable__content__active {
	opacity: 1 !important;
	// overflow: scroll;
}

#page-thuc-tich-san-xuat-line.mobile {
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
		min-width: 110px;
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
		id="page-thuc-tich-san-xuat-line"
		:class="$nuxt.context.isMobile ? 'mobile' : ''"
	>
		<v-toolbar dark height="60px" color="orange darken-3" dense>
			<v-spacer></v-spacer>
			<!-- <input
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
				>
					Update Master
					<v-icon right dark> mdi-cloud-upload </v-icon>
				</v-btn> -->
			<v-divider vertical class="mx-2"></v-divider>

			<el-date-picker
				v-model="selectedDates"
				type="daterange"
				range-separator="To"
				start-placeholder="Start date"
				end-placeholder="End date"
				value-format="yyyy-MM-dd"
				:picker-options="pickerOptions"
				@change="getData"
			>
			</el-date-picker>
			<v-divider vertical class="mx-2"></v-divider>
			<v-hover>
				<template v-slot:default="{ hover }">
					<v-btn
						color="green"
						class="white--text"
						:class="`elevation-${hover ? 24 : 6}`"
						:disabled="ttSX_Data.length <= 0 || loading"
						@click="excelDownload"
						:small="$nuxt.context.isMobile"
						v-if="!$nuxt.context.isMobile"
					>
						Excel
						<v-icon right dark> mdi-cloud-download </v-icon>
					</v-btn>
				</template>
			</v-hover>
			<v-divider vertical class="mx-2"></v-divider>
			<v-btn
				color="blue"
				class="white--text"
				:disabled="loading"
				@click="getData"
				:small="$nuxt.context.isMobile"
				elevation="5"
			>
				Search
				<v-icon
					right
					dark
					v-if="!$nuxt.context.isMobile"
					:class="loading ? 'mdi-spin' : ''"
				>
					mdi-refresh-circle
				</v-icon>
			</v-btn>
			<!-- <v-divider vertical class="mx-2"></v-divider> -->
			<v-spacer></v-spacer>
		</v-toolbar>
		<v-row>
			<v-col sm="12">
				<div>
					<v-data-table
						:headers="headers"
						:fixed-header="true"
						:items="ttExcelData"
						:item-class="'rowClass'"
						height="75vh"
						:multi-sort="false"
						:disable-sort="true"
						class="elevation-1"
						:loading="loading"
						:hide-default-footer="false"
						hide-default-header
						mobile-breakpoint="0"
						:items-per-page="500"
						:footer-props="{
							'items-per-page-options': [
								100, 200, 500, 1000, 1500, -1,
							],
						}"
					>
						<template #header="{}">
							<thead class="v-data-table-header">
								<tr>
									<th
										v-for="(h, i) in headers"
										:key="i"
										:class="h.class"
										:width="h.width"
										:style="
											h.minWidth
												? 'min-width:' +
												  h.minWidth +
												  'px'
												: ''
										"
										@click="onHeaderClicked(h)"
									>
										<v-badge
											:elevation="25"
											bottom
											:content="h.lRuikeiAm"
											color="blue"
											v-if="h.lAm > 0 || h.lRuikeiAm"
										>
											<v-badge
												:inline="false"
												:overlap="false"
												:content="h.lAm"
												:color="
													h.lAm
														? 'purple'
														: 'transparent'
												"
												v-if="h.lAm > 0 || h.lRuikeiAm"
											>
												<v-tooltip
													bottom
													allow-overflow
												>
													<template
														v-slot:activator="{
															on,
															attrs,
														}"
													>
														<span
															v-bind="attrs"
															v-on="on"
														>
															{{ h.text }}
														</span>
													</template>
													<span
														v-if="
															lineAmDetail[
																h.value
															]
														"
													>
														<v-row>
															<v-col
																v-if="
																	lineAmDetail[
																		h.value
																	]['差']
																"
															>
																<v-banner
																	class="px-2"
																	transition="slide-y-transition"
																	color="purple lighten-3"
																	v-html="
																		lineAmDetail[
																			h
																				.value
																		][
																			'差'
																		] || ''
																	"
																>
																</v-banner>
															</v-col>
															<v-col
																v-if="
																	lineAmDetail[
																		h.value
																	]['累計']
																"
															>
																<v-banner
																	class="px-2"
																	transition="slide-y-transition"
																	color="blue lighten-3"
																	v-html="
																		lineAmDetail[
																			h
																				.value
																		][
																			'累計'
																		] || ''
																	"
																>
																</v-banner>
															</v-col>
														</v-row>
													</span>
												</v-tooltip>
											</v-badge>
										</v-badge>
										<span v-else>
											{{ h.text }}
										</span>
									</th>
								</tr>
							</thead>
						</template>
						<template #item="props">
							<tr :class="''">
								<td
									v-for="(c, ci) in getRows(props.item)"
									:key="ci"
									style=""
									:class="[
										...rowClass(props.item),
										...(c.rowClass || []),
										c.colVal < 0 ||
										(props.item[c.value + '_hs'] < 0 &&
											props.item['C_NAME'] == '実績')
											? 'cell-negative'
											: props.item[c.value + '_hs'] > 0 &&
											  props.item['C_NAME'] == '実績'
											? 'cell-num-over'
											: '',
									]"
								>
									<span
										v-if="
											props.item['C_NAME'] == '計画' ||
											ci > 3
										"
									>
										<v-icon
											v-if="
												props.item['C_NAME'] ==
													'累計' &&
												ci > 4 &&
												false
											"
											small
											class=""
											:color="
												props.item[c.value + '_RUIKEI']
													? 'red'
													: ''
											"
											@click="
												editedRuikei.C_LINE =
													props.item['ラインNO'];
												editedRuikei.DT_ASSY = c.value;
												editedRuikei.RUIKEI =
													props.item[
														c.value + '_RUIKEI'
													];
												dialog_Edit_Ruikei = true;
											"
										>
											mdi-pencil
										</v-icon>
										<v-badge
											:inline="false"
											:overlap="false"
											:content="
												props.item[c.value + '_sttAm']
											"
											:color="
												props.item['C_NAME'] == '差'
													? 'purple'
													: 'blue'
											"
											v-if="
												(props.item['C_NAME'] == '差' ||
													props.item['C_NAME'] ==
														'累計') &&
												props.item[c.value + '_sttAm']
											"
										>
											{{
												c.type &&
												c.type == 'number' &&
												c.colVal
													? ('' + c.colVal).replace(
															/(\d)(?=(\d{3})+(?!\d))/g,
															'$1,',
													  )
													: c.colVal
											}}
										</v-badge>
										<span
											v-else-if="
												props.item['C_NAME'] ==
													'実績' &&
												props.item[c.value + '_C_HIN']
											"
										>
											<v-tooltip top>
												<template
													v-slot:activator="{
														on,
														attrs,
													}"
												>
													<span
														v-bind="attrs"
														v-on="on"
														@click="
															copyContent(
																props.item[
																	c.value +
																		'_C_HIN'
																].replaceAll(
																	',',
																	'\n',
																),
															)
														"
													>
														{{
															c.type &&
															c.type ==
																'number' &&
															c.colVal
																? (
																		'' +
																		c.colVal
																  ).replace(
																		/(\d)(?=(\d{3})+(?!\d))/g,
																		'$1,',
																  )
																: c.colVal
														}}
													</span>
												</template>
												<p
													v-html="
														props.item[
															c.value + '_C_HIN'
														].replaceAll(
															',',
															'<br/>',
														)
													"
												></p>
											</v-tooltip>
										</span>
										<span v-else>
											{{
												c.type &&
												c.type == 'number' &&
												c.colVal
													? ('' + c.colVal).replace(
															/(\d)(?=(\d{3})+(?!\d))/g,
															'$1,',
													  )
													: c.colVal
											}}
										</span>
									</span>
								</td>
							</tr>
						</template>
					</v-data-table>
				</div>
			</v-col>
		</v-row>
		<v-dialog v-model="dialog_Edit_Ruikei" max-width="500px">
			<v-card>
				<v-card-title>
					<span class="text-h5">Chỉnh Sửa Lũy Kế</span>
				</v-card-title>

				<v-card-text>
					<v-container>
						<v-row>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="editedRuikei.C_LINE"
									label="LINE"
									disabled
								></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="editedRuikei.DT_ASSY"
									label="Ngày Assy"
									disabled
								></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="editedRuikei.RUIKEI"
									label="Số Lũy Kế"
									clearable
								></v-text-field>
							</v-col>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="editedRuikei.pass"
									label="PASSWORD"
									clearable
									type="password"
								></v-text-field>
							</v-col>
						</v-row>
					</v-container>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color="gray darken-1"
						text
						@click="dialog_Edit_Ruikei = false"
					>
						Cancel
					</v-btn>
					<v-btn color="red darken-1" text @click="tryUpdateRuikei">
						Save
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>
