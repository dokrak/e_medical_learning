const fs = require('fs');
const Papa = require('papaparse');

// Read CSV file
const csv = fs.readFileSync('./src/data/hospital_name.csv', 'utf8');
// Parse CSV
const parsed = Papa.parse(csv, { header: false });
const rows = parsed.data;

// Extract Thai hospital names (column 2 or 3, adjust as needed)
const hospitalNames = [];
for (let i = 1; i < rows.length; i++) {
  const thaiName = rows[i][2]; // Adjust index if needed
  if (thaiName && !hospitalNames.includes(thaiName)) {
    hospitalNames.push(thaiName);
  }
}

// Write to JS file
const output = `export const thaiHospitals = ${JSON.stringify(hospitalNames, null, 2)};\n`;
fs.writeFileSync('./src/thaiHospitals.js', output);
console.log(`Extracted ${hospitalNames.length} hospitals.`);