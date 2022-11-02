const ExcelJS = require('exceljs');
const axios = require('axios');

const excelJSExport = async (
	data,
	sheetOpts = { sheetName: 'sheet1', opts: {} },
	fileName = 'Export',
	options = { expRaw: false },
) => {
	const wb = new ExcelJS.Workbook();
	const ws = wb.addWorksheet(sheetOpts.sheetName, sheetOpts.opts);
	const boderColor = { style: 'thin', color: { argb: '974706' } };
	const headerCellFill = {
		type: 'pattern',
		pattern: 'solid',
		// fgColor: { argb: '974700' },
		fgColor: { argb: 'FFFFFF00' },
	};
	if (Array.isArray(data)) {
		if (data.length > 0) {
			const header = Object.keys(data[0]);
			header.forEach((key, idx) => {
				const hRow = ws.getRow(1);
				hRow.getCell(idx + 1).font = { bold: true };
				hRow.getCell(idx + 1).value = key;
				hRow.getCell(idx + 1).border = {
					top: boderColor,
					left: boderColor,
					bottom: boderColor,
					right: boderColor,
				};
				hRow.getCell(idx + 1).fill = headerCellFill;
				hRow.commit();
			});
			ws.views = [{ state: 'frozen', ySplit: 1 }];
			if (options.expRaw) {
				data.forEach((item, idx) => {
					const row = ws.getRow(2 + idx);
					header.forEach((key, idx) => {
						row.getCell(idx + 1).value = item[key];
					});
					row.commit();
				});
			} else {
				data.forEach((item, idx) => {
					const row = ws.getRow(2 + idx);
					header.forEach((key, idx) => {
						row.getCell(idx + 1).value = item[key];
						row.getCell(idx + 1).border = {
							top: boderColor,
							left: boderColor,
							bottom: boderColor,
							right: boderColor,
						};
					});
					row.commit();
				});
				header.forEach((key, idx) => {
					const column = ws.getColumn(idx + 1);
					const lengths = column.values.map(
						(v) => v.toString().length,
					);
					let maxLength = Math.max(
						...lengths.filter((v) => typeof v === 'number'),
					);
					// console.log(maxLength, key.length);
					maxLength =
						maxLength > key.length ? maxLength + 5 : key.length + 5;
					column.width = maxLength;
				});
			}
		}
	} else {
		data(ws);
	}
	const buf = await wb.xlsx.writeBuffer();
	// console.log(buf);
	if (typeof fileName == 'string') {
		//download file
		saveAs(new Blob([buf]), fileName + '.xlsx');
	} else {
		//send mail
		let res = await axios.post('http://172.25.216.213:3368/api/sendmail', {
			mailOpts: {
				...fileName,
			},
		});
		console.log(res);
	}
};

const excelJSExportWB = async (
	data,
	fileName = 'Export',
	sheetOpts = { sheetName: 'sheet1', opts: {} },
) => {
	const wb = new ExcelJS.Workbook();
	if (Array.isArray(data)) {
		const ws = wb.addWorksheet(sheetOpts.sheetName, sheetOpts.opts);
		const boderColor = { style: 'thin', color: { argb: '974706' } };
		const headerCellFill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FFFFFF00' },
		};
		if (data.length > 0) {
			const header = Object.keys(data[0]);
			header.forEach((key, idx) => {
				const hRow = ws.getRow(1);
				hRow.getCell(idx + 1).font = { bold: true };
				hRow.getCell(idx + 1).value = key;
				hRow.getCell(idx + 1).border = {
					top: boderColor,
					left: boderColor,
					bottom: boderColor,
					right: boderColor,
				};
				hRow.getCell(idx + 1).fill = headerCellFill;
				hRow.commit();
			});
			ws.views = [{ state: 'frozen', ySplit: 1 }];
			data.forEach((item, idx) => {
				const row = ws.getRow(2 + idx);
				header.forEach((key, idx) => {
					row.getCell(idx + 1).value = item[key];
					row.getCell(idx + 1).border = {
						top: boderColor,
						left: boderColor,
						bottom: boderColor,
						right: boderColor,
					};
				});
				row.commit();
			});
			header.forEach((key, idx) => {
				const column = ws.getColumn(idx + 1);
				const lengths = column.values.map((v) => v.toString().length);
				let maxLength = Math.max(
					...lengths.filter((v) => typeof v === 'number'),
				);
				// console.log(maxLength, key.length);
				maxLength =
					maxLength > key.length ? maxLength + 5 : key.length + 5;
				column.width = maxLength;
			});
		}
	} else {
		await data(wb);
	}
	// console.log(wb);
	const buf = await wb.xlsx.writeBuffer();
	// console.log(buf);
	if (typeof fileName == 'string') {
		//download file
		saveAs(new Blob([buf]), fileName + '.xlsx');
	} else {
		//send mail
		let res = await axios.post('http://172.25.216.213:3368/api/sendmail', {
			mailOpts: {
				...fileName,
			},
		});
		console.log(res);
	}
};

const excelJSReadFile = async (file, fn) => {
	const reader = new FileReader();
	const wb = new ExcelJS.Workbook();
	reader.readAsArrayBuffer(file);

	reader.onload = async () => {
		const buffer = reader.result;
		await wb.xlsx.load(buffer);

		if (typeof fn == 'function') {
			fn(wb);
		}
	};
};

module.exports = {
	excelJSExport: excelJSExport,
	excelJSReadFile: excelJSReadFile,
	excelJSExportWB: excelJSExportWB,
};
