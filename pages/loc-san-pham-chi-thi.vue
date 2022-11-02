<script>
export default {
	data() {
		return {
			selectedFile: null,
			fileMau: `2022/08/13 0:00:00,"82121-B1571-W",32,"62SM10","1",3,2022/08/13 0:00:00,"4530",,"CA4","F1-22"`,
			csvData: [],
			loading: false,
			fileNames: [],
			selectedCheckOpt: 'SP NHÔM + BATTERY',
			checkOptBefore: null,
			checkOptionsItems: [
				{
					text: 'Lọc SP NHÔM + BATTERY',
					value: 'SP NHÔM + BATTERY',
					color: 'pink',
				},
				{
					text: 'Lọc SP NHÔM',
					value: 'SP_NHÔM',
					color: 'green lighten-3',
				},
				{
					text: 'Lọc SP BATTERY',
					value: 'SP_BATTERY',
					color: 'blue darken-2',
				},
			],
		};
	},
	head() {
		return {
			title: 'Lọc Sản Phẩm Dây Nhôm',
		};
	},
	computed: {},
	methods: {
		readCSVFile(e) {},
		async onSelectedFileChange(e) {
			if (!e || e.length < 1) return;
			this.fileNames = [];

			try {
				for (let i = 0; i < e.length; i++) {
					let res = await this.$readCSV2(e[i]);
					this.fileNames.push(e[i].name.replace(/\.[^/.]+$/, ''));
					res = res.map((item) => {
						//item: 2022/08/13 0:00:00,"82121-B1571-W",32,"62SM10","1",3,2022/08/13 0:00:00,"4530",,"CA4","F1-22"

						let hin = item.split(',')[1].replace(/^"(.*)"$/, '$1');
						return {
							content: item,
							hin: hin,
							fileName: e[i].name.replace(/\.[^/.]+$/, ''),
						};
					});
					this.csvData.push(...res);
				}

				console.log(this.csvData);

				if (this.selectedCheckOpt == 'SP_NHÔM') {
					await this.kiemTraDayNhom();
				} else if (this.selectedCheckOpt == 'SP_BATTERY') {
					await this.kiemTraDayBattery();
				} else {
					await this.kiemTraDayBattery();
					await this.kiemTraDayNhom();
				}

				this.selectedFile = null;
				this.csvData = [];
			} catch (err) {
				console.log(err);
			}
		},
		async onOptionsChanged(val) {
			// console.log('e', this.checkOptBefore, val);
			if (
				!(await this.$CONFIRM(
					this,
					'Xác Nhận',
					`Bạn muốn chuyển điều kiện lọc sang <span style='color:red;'><b>${val}</b></span>?`,
					{
						persistent: true,
						color: 'orange',
						okText: 'OK',
						spacer: true,
						disableCancel: false,
					},
				))
			) {
				this.selectedCheckOpt = this.checkOptBefore.toString();
			}
		},
		onMouseDown(e) {
			this.checkOptBefore = this.selectedCheckOpt.toString();
			// console.log(e, this.selectedCheckOpt);
		},
		async kiemTraDayNhom() {
			return new Promise(async (resolve, reject) => {
				if (this.csvData.length < 1) {
					resolve(false);
					return;
				}

				try {
					this.loading = true;
					let res = await this.$axios.post(
						'loc-san-pham-chi-thi/loc-day-nhom',
						{
							hin: this.csvData.map((it) => {
								return it.hin;
							}),
						},
					);

					this.loading = false;
					if (res.data.data && res.data.status == 'success') {
						let spDayNhom = {};
						// console.log(res.data.data);
						res.data.data.forEach((el, idx) => {
							if (el.C_DAY_NHOM == 1) {
								if (!spDayNhom[this.csvData[idx].fileName]) {
									spDayNhom[this.csvData[idx].fileName] = [
										this.csvData[idx].content,
									];
								} else {
									spDayNhom[this.csvData[idx].fileName].push(
										this.csvData[idx].content,
									);
								}
							}
						});

						for (let i = 0; i < this.fileNames.length; i++) {
							if (spDayNhom[this.fileNames[i]]) {
								await this.$exportTextFile(
									spDayNhom[this.fileNames[i]],
									this.fileNames[i] + '_SP_NHOM.csv',
								);
							} else {
								this.$toast.show(
									`"${this.fileNames[i]}" ➡ Không có SP Dây Nhôm! `,
									{
										duration: 5000,
										position: 'bottom-center',
									},
								);
							}
						}
					} else {
						this.$toast.show('ERROR!!', {
							duration: 5000,
							position: 'bottom-center',
						});
					}
					resolve(true);
				} catch (err) {
					console.log(err);
					reject(err);
				} finally {
					// this.getInit();
					this.loading = false;
					// this.selectedFile = null;
					// this.csvData = [];
				}
			});
		},
		async kiemTraDayBattery() {
			return new Promise(async (resolve, reject) => {
				if (this.csvData.length < 1) {
					resolve(false);
					return;
				}

				try {
					this.loading = true;
					let res = await this.$axios.post(
						'loc-san-pham-chi-thi/loc-day-battery',
						{
							hin: this.csvData.map((it) => {
								return it.hin;
							}),
						},
					);

					this.loading = false;
					if (res.data.data && res.data.status == 'success') {
						let spDayBattery = {};
						// console.log(res.data.data);
						res.data.data.forEach((el, idx) => {
							if (el.C_DAY_BATTERY == 1) {
								if (!spDayBattery[this.csvData[idx].fileName]) {
									spDayBattery[this.csvData[idx].fileName] = [
										this.csvData[idx].content,
									];
								} else {
									spDayBattery[
										this.csvData[idx].fileName
									].push(this.csvData[idx].content);
								}
							}
						});

						for (let i = 0; i < this.fileNames.length; i++) {
							if (spDayBattery[this.fileNames[i]]) {
								await this.$exportTextFile(
									spDayBattery[this.fileNames[i]],
									this.fileNames[i] + '_SP_BAT.csv',
								);
							} else {
								this.$toast.show(
									`"${this.fileNames[i]}" ➡ Không có SP Dây Battery! `,
									{
										duration: 5000,
										position: 'bottom-center',
									},
								);
							}
						}
					} else {
						this.$toast.show('ERROR!!', {
							duration: 5000,
							position: 'bottom-center',
						});
					}
					resolve(true);
				} catch (err) {
					console.log(err);
					reject(err);
				} finally {
					// this.getInit();
					this.loading = false;
					// this.selectedFile = null;
					// this.csvData = [];
				}
			});
		},
	},
};
</script>

<style>
.v-slider span {
	font-size: 20px;
}
h1 {
	color: #ff7043;
}
h2 {
	margin-top: 10px;
	margin-bottom: 10px;
	color: #666666;
}
h1 {
	display: inline-block;
	color: #ffffff; /* 文字の色 */
	font-size: 28pt; /* 文字のサイズ */
	letter-spacing: 4px; /* 文字間 */
	text-shadow: 2px 2px 1px #d84315, -2px 2px 1px #d84315, 2px -2px 1px #d84315,
		-2px -2px 1px #d84315, 2px 0px 1px #d84315, 0px 2px 1px #d84315,
		-2px 0px 1px #d84315, 0px -2px 1px #d84315; /* 文字の影 */
}
h1.timer {
	margin-top: 30px;
	margin-bottom: 30px;
	font-size: 65px;
}
h1.finishMessage {
	margin-top: 30px;
	margin-bottom: 30px;
	font-size: 42px;
}
</style>
<template>
	<v-layout column justify-center align-center>
		<h1>Lọc Sản Phẩm Chỉ Thị</h1>
		<h2>Seigi FAVV</h2>
		<v-flex xs12 md6>
			<div>
				<span>Định dạng file đầu vào:</span>
				<pre
					style="
						background-color: turquoise;
						text-align: left;
						white-space: pre-line;
					"
				>
					{{ fileMau }}
				</pre
				>
				<v-radio-group
					v-model="selectedCheckOpt"
					row
					background-color="grey"
					@change="onOptionsChanged"
					@mousedown="onMouseDown"
				>
					<v-layout>
						<v-flex
							v-for="item in checkOptionsItems"
							:key="item.value"
						>
							<v-radio
								:value="item.value"
								:label="item.text"
								:color="item.color"
								dark
							></v-radio>
						</v-flex>
					</v-layout>
				</v-radio-group>
				<v-file-input
					@change="onSelectedFileChange"
					multiple
					color="black"
					accept=".csv"
					placeholder="Chọn File"
					v-model="selectedFile"
				></v-file-input>
			</div>
		</v-flex>
	</v-layout>
</template>
