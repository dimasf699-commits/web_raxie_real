const xlsx = require('xlsx');
const path = require('path');

function inspectExcel(filename) {
  const filePath = path.join(__dirname, '..', filename);
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  console.log(`\n=== Rows in ${filename} ===`);
  for (let i = 0; i < Math.min(data.length, 15); i++) {
    console.log(`Row ${i}:`, data[i]?.slice(0, 8));
  }
}

inspectExcel('mass_update_media_info_87287679_20260812211501.xlsx');
inspectExcel('mass_update_sales_info_87287679_20260812211948.xlsx');
