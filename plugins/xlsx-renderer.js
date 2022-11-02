const XR = require('xlsx-renderer');

const xlsxRender = async (
	data,
	fileName = 'Export',
	sheetOpts = { sheetName: 'sheet1', opts: {} },
) => {
	// const wb = new ExcelJS.Workbook();
	if (Array.isArray(data)) {
		// const ws = wb.addWorksheet(sheetOpts.sheetName, sheetOpts.opts);
		// const boderColor = { style: 'thin', color: { argb: '974706' } };
		// const headerCellFill = {
		// 	type: 'pattern',
		// 	pattern: 'solid',
		// 	fgColor: { argb: 'FFFFFF00' },
		// };
		if (data.length > 0) {
			// const header = Object.keys(data[0]);
			// header.forEach((key, idx) => {
			// 	const hRow = ws.getRow(1);
			// 	hRow.getCell(idx + 1).font = { bold: true };
			// 	hRow.getCell(idx + 1).value = key;
			// 	hRow.getCell(idx + 1).border = {
			// 		top: boderColor,
			// 		left: boderColor,
			// 		bottom: boderColor,
			// 		right: boderColor,
			// 	};
			// 	hRow.getCell(idx + 1).fill = headerCellFill;
			// 	hRow.commit();
			// });
			// ws.views = [{ state: 'frozen', ySplit: 1 }];
			// data.forEach((item, idx) => {
			// 	const row = ws.getRow(2 + idx);
			// 	header.forEach((key, idx) => {
			// 		row.getCell(idx + 1).value = item[key];
			// 		row.getCell(idx + 1).border = {
			// 			top: boderColor,
			// 			left: boderColor,
			// 			bottom: boderColor,
			// 			right: boderColor,
			// 		};
			// 	});
			// 	row.commit();
			// });
			// header.forEach((key, idx) => {
			// 	const column = ws.getColumn(idx + 1);
			// 	const lengths = column.values.map((v) => v.toString().length);
			// 	let maxLength = Math.max(
			// 		...lengths.filter((v) => typeof v === 'number'),
			// 	);
			// 	// console.log(maxLength, key.length);
			// 	maxLength =
			// 		maxLength > key.length ? maxLength + 5 : key.length + 5;
			// 	column.width = maxLength;
			// });
		}
	} else {
		// await data(wb);
	}
	const viewModel = {
		name: 'World',
		items: [
			/*...*/
		],
	};
	// 1. Download a template.
	let response = await fetch('/thuc-tich-ircs/f_set_h.xlsx');
	let dBuff = await response.arrayBuffer();
	let report = await new XR.Renderer().renderFromArrayBuffer(
		dBuff,
		viewModel,
	);
	const buf = await report.xlsx.writeBuffer();
	saveAs(new Blob([buf]), fileName + '.xlsx');

	// fetch('/thuc-tich-ircs/f_set_h.xlsx')
	// 	// 2. Get template as ArrayBuffer.
	// 	.then((response) => response.arrayBuffer())
	// 	// 3. Fill the template with data (generate a report).
	// 	.then((buffer) =>
	// 		new Renderer().renderFromArrayBuffer(buffer, viewModel),
	// 	)
	// 	// 4. Get a report as buffer.
	// 	.then((report) => report.xlsx.writeBuffer())
	// 	// 5. Use `saveAs` to download on browser site.
	// 	.then((buffer) =>
	// 		saveAs(new Blob([buffer]), `report.xlsx`),
	// 	)
	// 	// Handle errors.
	// 	.catch((err) => console.log('Error writing excel export', err));
};

const exportXLSX = async (
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
	let response = await fetch('/thuc-tich-ircs/f_set_h.xlsx');
	let dBuff = await response.arrayBuffer();
	var wbout = await ctx.$XLSX.read(dBuff, { type: 'buffer' });
	console.log(wbout);
	let wbuff = await ctx.$XLSX.write(wbout, {
		type: 'buffer',
		bookType: 'xlsx',
	});

	// the saveAs call downloads a file on the local machine
	saveAs(
		new Blob([wbuff], {
			type: 'application/octet-stream',
		}),
		fileName + '.xlsx',
	);
	// saveAs(new Blob([buf]), fileName + '.xlsx');

	// if (ctx.$nuxt.context.isIE) {
	// 	// const BOM = '\uFEFF';
	// 	const xlsxBlob = new Blob([sheetToArrayBuffer(wbout)], {
	// 		type: 'application/octet-stream',
	// 	});
	// 	navigator.msSaveBlob(xlsxBlob, fileName + '.xlsx');
	// } else {
	// 	let myBlob = new Blob([sheetToArrayBuffer(wbout)], {
	// 		type: 'application/octet-stream',
	// 	});

	// 	let a = document.createElement('a');
	// 	document.body.appendChild(a);
	// 	a.style = 'display: none';
	// 	let url = window.URL.createObjectURL(myBlob);
	// 	a.href = url;
	// 	a.download = fileName + '.xlsx';
	// 	a.click();
	// 	document.body.removeChild(a);
	// }
};

function sheetToArrayBuffer(s) {
	var buf = new ArrayBuffer(s.length);
	var view = new Uint8Array(buf);
	// for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
	return buf;
}

module.exports = {
	xlsxRender: xlsxRender,
	exportXLSX: exportXLSX,
};
