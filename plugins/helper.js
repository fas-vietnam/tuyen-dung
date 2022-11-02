import { saveAs } from 'file-saver'; // IMPORTANT: giup client save file xuong may

const changeObjectKeys = (item, replaceKeys) => {
	let newItem = {};
	Object.keys(item).forEach((key) => {
		newItem[replaceKeys[key]] = item[key];
	});
	return newItem;
};

const timerPoller = (callback, ms) => {
	let interval;

	return {
		isRun: function () {
			return interval != undefined;
		},
		start: function () {
			interval = setInterval(callback, ms);
		},
		stop: function () {
			clearInterval(interval);
			interval = undefined;
		},
	};
};

// const excelJSExport = async (ctx, data, fileName = 'Export') => {
// 	const wb = new ExcelJS.Workbook();
// 	const ws = wb.addWorksheet();
// 	const boderColor = { style: 'thin', color: { argb: '974706' } };
// 	const headerCellFill = {
// 		type: 'pattern',
// 		pattern: 'solid',
// 		// fgColor: { argb: '974700' },
// 		fgColor: { argb: 'FFFFFF00' },
// 	};
// 	if (Array.isArray(data)) {
// 		if (data.length > 0) {
// 			const header = Object.keys(data[0]);
// 			header.forEach((key, idx) => {
// 				const hRow = ws.getRow(1);
// 				hRow.getCell(idx + 1).font = { bold: true };
// 				hRow.getCell(idx + 1).value = key;
// 				hRow.getCell(idx + 1).border = {
// 					top: boderColor,
// 					left: boderColor,
// 					bottom: boderColor,
// 					right: boderColor,
// 				};
// 				hRow.getCell(idx + 1).fill = headerCellFill;
// 				hRow.commit();
// 			});
// 			ws.views = [{ state: 'frozen', ySplit: 1 }];
// 			data.forEach((item, idx) => {
// 				const row = ws.getRow(2 + idx);
// 				header.forEach((key, idx) => {
// 					row.getCell(idx + 1).value = item[key];
// 					row.getCell(idx + 1).border = {
// 						top: boderColor,
// 						left: boderColor,
// 						bottom: boderColor,
// 						right: boderColor,
// 					};
// 				});
// 				row.commit();
// 			});
// 			header.forEach((key, idx) => {
// 				const column = ws.getColumn(idx + 1);
// 				const lengths = column.values.map((v) => v.toString().length);
// 				let maxLength = Math.max(
// 					...lengths.filter((v) => typeof v === 'number'),
// 				);
// 				// console.log(maxLength, key.length);
// 				maxLength =
// 					maxLength > key.length ? maxLength + 5 : key.length + 5;
// 				column.width = maxLength;
// 			});
// 		}
// 	} else {
// 		data(ws);
// 	}
// 	const buf = await wb.xlsx.writeBuffer();
// 	saveAs(new Blob([buf]), fileName + '.xlsx');
// };

const exportXLSX = (
	ctx,
	data,
	fileName = 'Exported',
	sheetName = 'Export',
	fcEditSheet = null,
) => {
	//NOTE => ctx: truyền this vào
	const wopts = {
		bookType: 'xlsx',
		bookSST: false,
		type: 'binary',
	};

	//create the workbook:
	const wb = {
		SheetNames: [sheetName],
		Sheets: {},
		Props: {},
	};

	let ws;
	if (data) {
		ws = ctx.$XLSX.utils.json_to_sheet(data);
	} else {
		ws = ctx.$XLSX.utils.json_to_sheet([['']]);
	}

	if (fcEditSheet) {
		// ws = fcEditSheet(ws);
		fcEditSheet(ws);
	}

	//put data in the sheet:
	wb.Sheets[sheetName] = ws;

	// make a file
	let wbout = ctx.$XLSX.write(wb, wopts);

	// the saveAs call downloads a file on the local machine
	// saveAs(new Blob([sheetToArrayBuffer(wbout)], { type: "application/octet-stream" }), fileName + ".xlsx");

	if (ctx.$nuxt.context.isIE) {
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
};

const exportCSV = (ctx, data, fileName = 'Exported') => {
	//NOTE => ctx: truyền this vào
	// const wopts = {
	// 	bookType: 'xlsx',
	// 	bookSST: false,
	// 	type: 'binary',
	// };

	// //create the workbook:
	// const wb = {
	// 	SheetNames: [sheetName],
	// 	Sheets: {},
	// 	Props: {},
	// };
	// let sheetName = 'Export';
	let ws;
	if (data) {
		ws = ctx.$XLSX.utils.json_to_sheet(data);
	} else {
		ws = ctx.$XLSX.utils.json_to_csv([['']]);
	}

	let csv = ctx.$XLSX.utils.sheet_to_csv(ws);

	if (ctx.$nuxt.context.isIE) {
		// const BOM = '\uFEFF';
		const csvBlob = new Blob([sheetToArrayBuffer(csv)], {
			type: 'application/octet-stream',
		});
		navigator.msSaveBlob(csvBlob, fileName + '.csv');
	} else {
		let myBlob = new Blob([sheetToArrayBuffer(csv)], {
			type: 'application/octet-stream',
		});

		let a = document.createElement('a');
		document.body.appendChild(a);
		a.style = 'display: none';
		let url = window.URL.createObjectURL(myBlob);
		a.href = url;
		a.download = fileName + '.csv';
		a.click();
		document.body.removeChild(a);
	}
};

const exportTextFile = (data, fileName = 'Exported.txt') => {
	return new Promise((resolve, reject) => {
		try {
			let dtExp = '';

			if (Array.isArray(data)) {
				data.forEach((r) => {
					dtExp = dtExp + r + `\n`;
				});
			} else {
				dtExp = data;
			}

			var element = document.createElement('a');
			element.setAttribute(
				'href',
				'data:text/plain;charset=utf-8,' + encodeURIComponent(dtExp),
			);
			element.setAttribute('download', fileName);

			element.style.display = 'none';
			document.body.appendChild(element);

			element.click();

			document.body.removeChild(element);
			resolve(true);
		} catch (err) {
			reject(err);
		}
	});
};

function sheetToArrayBuffer(s) {
	var buf = new ArrayBuffer(s.length);
	var view = new Uint8Array(buf);
	for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
	return buf;
}

// function s2ab(s) {
// 	var buf = new ArrayBuffer(s.length);
// 	var view = new Uint8Array(buf);
// 	for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
// 	return buf;
// }

const date2String = (date, format = 'yyyy-mm-dd') => {
	let y = date.getFullYear().toString();
	let m = (date.getMonth() + 1).toString();
	let d = date.getDate().toString();
	let h = date.getHours();
	let mn = date.getMinutes();
	let s = date.getSeconds();
	d.length == 1 && (d = '0' + d);
	m.length == 1 && (m = '0' + m);
	h.length == 1 && (h = '0' + h);
	mn.length == 1 && (mn = '0' + mn);
	s.length == 1 && (s = '0' + s);

	switch (format) {
		case 'yyyy/mm/dd':
			return y + '/' + m + '/' + d;
		case 'yyyy-mm-dd':
			return y + '-' + m + '-' + d;
		case 'yyyymmdd':
			return y + m + d;
		case 'yyyy.mm.dd':
			return y + '.' + m + '.' + d;
		case 'yyyy.mm.dd hh:nn':
			return y + '.' + m + '.' + d + ' ' + h + ':' + mn;
		case 'yyyymmddhhnnss':
			return y + m + d + h + mn + s;
		default:
			return '';
	}
};

const pad = (d) => {
	return d < 10 ? '0' + d.toString() : d.toString();
};

const getExcelColumnName = (num) => {
	for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
		ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
	}
	return ret;
};

const readXLSX = (ctx, file) => {
	let reader = new FileReader();
	let fixdata = (data) => {
		let o = '',
			l = 0,
			w = 10240;
		for (; l < data.byteLength / w; ++l) {
			o += String.fromCharCode.apply(
				null,
				new Uint8Array(data.slice(l * w, l * w + w)),
			);
		}
		o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
		return o;
	};
	return new Promise((resolve, reject) => {
		try {
			reader.onload = (renderEvent) => {
				let data = renderEvent.target.result;
				if (ctx.rABS) {
					/* if binary string, read with type 'binary' */
					resolve(
						ctx.$XLSX.read(data, {
							type: 'binary',
							cellText: false,
							cellDates: true,
						}),
					);
				} else {
					/* if array buffer, convert to base64 */
					let arr = fixdata(data);
					resolve(
						ctx.$XLSX.read(btoa(arr), {
							type: 'base64',
							cellText: false,
							cellDates: true,
						}),
					);
				}
			};
			reader.onerror = (error) => {
				reject(error);
			};
			if (ctx.rABS) {
				reader.readAsBinaryString(file);
			} else {
				reader.readAsArrayBuffer(file);
			}
		} catch (error) {
			reject(error);
		}
	});
};

const confirmF = async (ctx, title, content, option) => {
	let cFirm = ctx.$root.$children.find((x) => x.$refs.confirm);
	if (cFirm) {
		return await cFirm.$refs.confirm.open(
			title || 'Confirm',
			content || 'No content',
			{ ...option },
		);
	}

	return false;
};

const loginConfirm = async (ctx, pageId, fCode, options = {}) => {
	let loginCFirm = ctx.$root.$children.find((x) => x.$refs.loginconfirm);
	if (loginCFirm) {
		return await loginCFirm.$refs.loginconfirm.openConfirm(
			pageId,
			fCode,
			options,
		);
	}

	return false;
};

const login = async (ctx, options = {}) => {
	let loginCFirm = ctx.$root.$children.find((x) => x.$refs.loginconfirm);
	if (loginCFirm) {
		return await loginCFirm.$refs.loginconfirm.openLogin(options);
	}

	return false;
};

const readCSV = async (
	file,
	fn,
	options = { splitRow: true, returnJson: false, noHeader: false },
) => {
	const reader = new FileReader();
	reader.readAsText(file);

	reader.onload = async () => {
		let content = reader.result;

		let res = null;

		if (!options.returnJson) {
			if (options.splitRow) {
				res = content.split('\n').filter((item) => {
					return item;
				});
			} else {
				res = content;
			}
		} else {
			let rows = content.split('\n').filter((item) => {
				return item;
			});

			if (rows.length > 0) {
				res = [];
				let header = rows[0].split(',');

				for (let i = options.noHeader ? 0 : 1; i < rows.length; i++) {
					let r = rows[i];
					let c = r.split(',');
					let rc = {};
					c.forEach((txt, idx) => {
						rc[options.noHeader ? idx : header[idx]] = txt
							.replaceAll(/(?:\\[rn]|[\r\n]+|\\"+)+/g, '') // remove \n \r \"
							.replace(/^"(.*)"$/, '$1'); //trim double quote
					});
					if (r) {
						res.push(rc);
					}
				}
			} else {
				res = [];
			}
		}

		if (typeof fn == 'function') {
			fn(res);
		}
	};
};

const readCSV2 = (
	file,
	options = { splitRow: true, returnJson: false, noHeader: false },
) => {
	return new Promise((resolve, reject) => {
		let content = '';
		const reader = new FileReader();

		reader.onloadend = (e) => {
			content = e.target.result;
			let res = null;

			if (!options.returnJson) {
				if (options.splitRow) {
					res = content.split('\n').filter((item) => {
						return item;
					});
				} else {
					res = content;
				}
			} else {
				let rows = content.split('\n').filter((item) => {
					return item;
				});

				if (rows.length > 0) {
					res = [];
					let header = rows[0].split(',');

					for (
						let i = options.noHeader ? 0 : 1;
						i < rows.length;
						i++
					) {
						let r = rows[i];
						let c = r.split(',');
						let rc = {};
						c.forEach((txt, idx) => {
							rc[options.noHeader ? idx : header[idx]] = txt
								.replaceAll(/(?:\\[rn]|[\r\n]+|\\"+)+/g, '') // remove \n \r \"
								.replace(/^"(.*)"$/, '$1'); //trim double quote
						});
						if (r) {
							res.push(rc);
						}
					}
				} else {
					res = [];
				}
			}

			resolve(res);
		};
		reader.onerror = function (e) {
			reject(e);
		};
		reader.readAsText(file);
	});
};

export default function (context, inject) {
	inject('changeObjectKeys', changeObjectKeys);
	inject('timerPoller', timerPoller);
	inject('exportXLSX', exportXLSX);
	inject('exportCSV', exportCSV);
	inject('exportTextFile', exportTextFile);
	inject('date2String', date2String);
	inject('readXLSX', readXLSX);
	inject('readCSV', readCSV);
	inject('readCSV2', readCSV2);
	inject('getExcelColumnName', getExcelColumnName);
	inject('CONFIRM', confirmF);
	inject('LOGIN_CONFIRM', loginConfirm);
	inject('LOGIN', login);
	inject('pad', pad);
}
