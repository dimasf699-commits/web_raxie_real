const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

function readHeaders(filename) {
    const filePath = path.join(__dirname, '..', filename);
    if (fs.existsSync(filePath)) {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Read top 4 rows
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        console.log(`\n=== Headers for ${filename} ===`);
        // Shopee templates usually have 3 rows of headers, data starts at row 4
        console.log("Row 1 (Group):", data[0]);
        console.log("Row 2 (Column Name):", data[1]);
        console.log("Row 3 (Notes):", data[2]);
        console.log("Row 4 (First Data):", data[3]);
    } else {
        console.log(`File ${filename} not found.`);
    }
}

readHeaders('mass_update_media_info_87287679_20260812211501.xlsx');
readHeaders('mass_update_sales_info_87287679_20260812211948.xlsx');
