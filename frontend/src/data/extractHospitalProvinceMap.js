const fs = require('fs');
const Papa = require('papaparse');

// Read CSV file
const csv = fs.readFileSync('./src/data/hospital_name.csv', 'utf8');

// Parse CSV
const parsed = Papa.parse(csv, { header: false });
const rows = parsed.data;

// Build mapping: hospital name (column 2) => province (column 1)
const hospitalProvinceMap = {};
for (let i = 1; i < rows.length; i++) {
  const province = rows[i][1];
  const hospital = rows[i][2];
  if (hospital && province) {
    hospitalProvinceMap[hospital] = province;
  }
}

// Write to JS file
const output = `export const hospitalProvinceMap = ${JSON.stringify(hospitalProvinceMap, null, 2)};\n`;
fs.writeFileSync('./src/hospitalProvinceMap.js', output);

console.log(`Extracted ${Object.keys(hospitalProvinceMap).length} hospital-province pairs.`);