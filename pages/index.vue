<style lang="scss">
#favv-page {
	.tbl-header {
		background-color: teal;
		color: white;
		font-size: 1rem;
	}

	.cell-normal {
		font-size: 18px;
	}

	.row-normal {
	}

	tbody tr:nth-of-type(even) {
		background-color: #f5f8d8;
	}

	table {
		border-collapse: collapse;
		text-indent: initial;
		td,
		th {
			border: solid black 1px;
		}
	}
	font-family: Consolas;
	a {
		font-size: 20px;
		font-weight: 700;
	}
	a:-webkit-any-link {
		color: -webkit-link;
		cursor: pointer;
		text-decoration: underline;
	}
}

#favv-page.mobile {
	.tbl-header {
		font-size: 0.8rem;
	}
	.cell-normal {
		font-size: 0.6rem;
	}
}
</style>
<template>
	<div id="favv-page" :class="$nuxt.context.isMobile ? 'mobile' : ''">
		<v-toolbar color="white" dense class="mt-2">
			<v-text-field
				label="Nhập Từ khóa Tìm Kiếm"
				dense
				clearable
				:hide-details="true"
				ref="find"
				v-model="keyWord"
				append-icon="mdi-magnify"
			></v-text-field>
		</v-toolbar>
		<v-data-table
			:headers="headers"
			:fixed-header="true"
			:items="appListTbl"
			item-class="row-normal"
			height="80vh"
			:dense="false"
			:multi-sort="false"
			:disable-sort="true"
			:loading="loading"
			:hide-default-footer="true"
			mobile-breakpoint="0"
			:items-per-page="-1"
			:footer-props="{
				'items-per-page-options': [10, 20, 50, 100, -1],
			}"
		>
			<template v-slot:item.Name="{ isMobile, item, index }">
				<span>
					<a :href="urlCorrector(item.Url)" target="_blank" style="">
						<!-- <pre style="">{{ item.Name }}</pre> -->
						{{ item.Name }}
					</a>
				</span>
			</template>
		</v-data-table>
	</div>
</template>
<script>
export default {
	data: () => {
		return {
			loading: false,
			keyWord: '',
			appList: [],
			title: 'FAVV App Hub',
		};
	},
	mounted: function () {
		this.getAppList();
		this.$refs.find.focus();
		this.$nuxt.$emit('page-info', {
			title: this.title,
			options: { replace: true, fluid: true },
		});
	},
	computed: {
		headers() {
			return [
				{
					text: 'App ID',
					value: 'ID',
					// width: 100,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
					fixed: true,
				},
				{
					text: 'Tên Chương Trình',
					value: 'Name',
					// width: 250,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
					fixed: true,
				},
				{
					text: 'Ghi chú',
					value: 'Note',
					// width: 250,
					class: ['tbl-header'],
					cellClass: ['cell-normal'],
					fixed: true,
				},
			];
		},

		appListTbl() {
			let dt = [];
			if (this.keyWord && this.keyWord.trim() != '') {
				let regex = new RegExp(this.keyWord, 'gi');
				// dt = this.appList.match(regex);
				dt = this.appList.filter((item) => {
					return (
						regex.test(item.Name) ||
						regex.test(item.KeyWord) ||
						regex.test(item.Note) ||
						regex.test(item.Url)
					);
				});
			} else {
				dt = [...this.appList];
			}
			return dt;
		},
	},
	methods: {
		async getAppList() {
			this.loading = true;
			try {
				this.$toast.show('Loading data...');
				let res = await this.$axios.get('/applist');

				if (res.status == 200) {
					// console.log(res.data);
					this.appList = [...res.data];
					this.loading = false;
					this.$toast.clear();
				}
			} catch (error) {
				console.log(error);
				this.loading = false;
			}
		},
		urlCorrector(url) {
			if (!/^http/.test(url)) {
				return $nuxt.context.base + url;
			}
			return url;
		},
		// onKeyPress(e) {
		// 	if (e.keyCode == 13) {
		// 		this.search();
		// 	}
		// },
		// search() {
		// 	if (this.keyWord && this.keyWord.trim() != '')
		// 		console.log(this.keyWord);
		// },
	},
};
</script>
