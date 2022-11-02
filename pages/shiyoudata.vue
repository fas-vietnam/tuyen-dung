<style lang="scss">
#shiyoudata-page {
	.jexcel_container {
		// width: 100%;
	}
	.jexcel_content {
		// box-shadow: none !important;
		// width: 100% !important;
		// max-height: none !important;
	}
}
</style>
<template>
	<div id="shiyoudata-page">
		<v-toolbar color="secondary" dense>
			<v-switch
				v-model="isDataBK"
				label="Tìm trong dữ liệu Backup"
				color="red"
				inset
				hide-details
			></v-switch>
			<v-divider vertical></v-divider>
			<v-btn
				color="pink"
				class="ma-2 white--text"
				:disabled="false"
				@click="btnGetDataClick"
				:small="$nuxt.context.isMobile"
				ref="downloadbtn"
			>
				Lấy dữ liệu!
				<v-icon
					right
					dark
					v-if="!$nuxt.context.isMobile"
					:class="loading ? 'mdi-spin' : ''"
				>
					mdi-cloud-download
				</v-icon>
			</v-btn>
			<v-spacer></v-spacer>
			<v-btn
				color="yellow darken-4"
				class="ma-2 white--text"
				:disabled="!sheetHaveData"
				@click="spreadsheet.setData(hinbanData)"
				:small="$nuxt.context.isMobile"
			>
				Nhập Lại
				<v-icon right dark v-if="!$nuxt.context.isMobile">
					mdi-window-close
				</v-icon>
			</v-btn>
		</v-toolbar>
		<div>
			<v-alert text color="" class="mb-0 py-1 font-italic"
				><v-icon color="warning" class="mdi-spin mdi-36px"
					>mdi-radioactive</v-icon
				>
				<span class="green--text text-decoration-underline">
					Nhập dữ liệu vào lưới(Enter thêm dòng mới) hoặc dán từ
					Excel</span
				>
			</v-alert>
		</div>
		<v-row>
			<v-col xs="12" sm="3"> </v-col>
			<v-col>
				<div ref="spreadsheet"></div>
			</v-col>
		</v-row>
		<v-dialog v-model="dialog" persistent max-width="50%">
			<v-card>
				<v-card-title class="text-h5">
					Có 1 số sản phẩm không tìm thấy dữ liệu!
				</v-card-title>
				<v-card-text
					>Bạn có muốn tìm tiếp trong dữ liệu backup
					không?</v-card-text
				>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="red darken-1" text @click="dialog = false">
						Không
					</v-btn>
					<v-btn color="green darken-1" text @click="reSearch">
						OK
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-overlay :value="loading">
			<v-progress-circular indeterminate size="64"></v-progress-circular>
			<div>Xin hãy chờ...</div>
		</v-overlay>
	</div>
</template>

<script>
// import jspreadsheet from 'jspreadsheet-ce';
// import 'jspreadsheet-ce/dist/jspreadsheet.css';
import jexcel from 'jexcel';
import 'jexcel/dist/jexcel.css';

export default {
	ref: '#spreadsheet',
	data() {
		return {
			title: '使用データ',
			isDataBK: false,
			refresh: false,
			loading: false,
			dialog: false,
			hin_error: [],
			spreadsheet: null,
		};
	},
	mounted: function () {
		this.$nuxt.$emit('page-info', {
			title: this.title,
			version: '1.0.0',
			options: { replace: true },
		});
		let options = {
			data: this.hinbanData,
			columns: [
				{ type: 'text', title: 'C_HIN', width: '300px', align: 'left' },
				{
					type: 'text',
					title: 'L_SET',
					width: '150px',
					align: 'left',
				},
			],
			onchange: this.onDataTableChange,
			ondeleterow: this.onDataTableChange,
			includeHeadersOnDownload: true,
			columnSorting: false,
			rowDrag: false,
			csvFileName: 'a.xlsx',
			search: false,
			lazyLoading: true,
			loadingSpin: true,
			tableOverflow: true,
			tableHeight: '100%',
			tableWidth: '100%',
			noRecordsFound: 'Không có dữ liệu',
			areYouSureToDeleteTheSelectedRows: 'Bạn có chắc muốn xóa dòng này?',
		};

		this.spreadsheet = jexcel(this.$refs['spreadsheet'], options);
		// Object.assign(this, { spreadsheet });

		// jexcel.fromSpreadsheet(
		// 	'http://localhost:3000/DS_hoan_tien_JLPT.xlsx',
		// 	function(result) {
		// 		if (!result.length) {
		// 			console.error('jspreadsheet: Something went wrong.');
		// 		} else {
		// 			if (result.length == 1) {
		// 				jspreadsheet(
		// 					document.getElementById('spreadsheet4'),
		// 					result[0],
		// 				);
		// 			} else {
		// 				jexcel.createTabs(
		// 					document.getElementById('spreadsheet4'),
		// 					result,
		// 				);
		// 			}
		// 		}
		// 	},
		// );

		// this.getDT();
	},
	computed: {
		hinbanData() {
			let arr = [];
			for (let i = 0; i < 25; i++) {
				arr.push({ C_HIN: '', L_SET: null });
			}
			return arr;
			// return new Array(25);
		},
		sheetHaveData() {
			if (this.refresh) {
			}
			if (this.spreadsheet)
				return (
					this.spreadsheet.getData().filter((item) => {
						return item[0] || item[1];
					}).length > 0
				);

			return false;
		},
	},
	methods: {
		btnGetDataClick() {
			let bindData = {
				c_hins: [],
				l_sets: [],
				fromDataSource: this.isDataBK ? '2' : '1',
			};

			let sheetData = this.spreadsheet.getData();
			sheetData.forEach((item) => {
				if (item[0] && item[0].trim() !== '') {
					bindData.c_hins.push(item[0].trim());
					bindData.l_sets.push(
						!isNaN(item[1]) && item[1] ? parseInt(item[1]) : 1,
					);
				}
			});

			console.log(bindData);
			if (bindData.c_hins.length > 0) {
				this.getDT(bindData);
			}
		},
		async getDT(bindData) {
			// /https://raw.githubusercontent.com/hbt272/loto/master/package.json
			try {
				this.loading = true;
				let res = await this.$axios.post('shiyoudata/find', bindData);

				console.log(res);
				this.loading = false;
				if (res.data.shiyoudata.length > 0)
					this.$exportXLSX(
						this,
						res.data.shiyoudata,
						'shiyoudata_' +
							this.$date2String(new Date(), 'yyyymmddhhnnss'),
					);
				if (res.data.hin_error.length > 0 && !this.isDataBK) {
					this.hin_error = [...res.data.hin_error];
					this.dialog = true;
				}
			} catch (err) {
				console.log(err);
				this.loading = false;
			}
		},
		reSearch() {
			this.isDataBK = true;
			this.spreadsheet.setData(this.hin_error);
			this.dialog = false;
			this.$refs.downloadbtn.$el.click();
		},
		getSheetData() {
			console.log(this.spreadsheet.getData());
		},
		setSheetData() {
			this.spreadsheet.setData([
				{
					C_HIN: 'FAVV-FAPV-9999',
					L_SET: 1,
				},
			]);

			this.onDataTableChange();
		},
		onDataTableChange() {
			this.refresh = !this.refresh;
		},
	},
};
</script>
