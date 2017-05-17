const fs = require('fs');
const path = require('path');
const xlsx = require('node-xlsx').default;
const jsonfile = require('jsonfile');
const camelCase = require('camelcase');

const INPUT_DIR = `${__dirname}/${process.argv[2]}`;
const OUTPUT_DIR = process.argv[3];
const COLUMN_OFFSET = 3;

const fipsCodes = [];
const outputJSON = [];

fs.readdir(INPUT_DIR, (err, files) => {
  files.forEach(fileName => parseFile(fileName));
  jsonfile.writeFile(OUTPUT_DIR, outputJSON, { spaces: 2 }, err => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Results written to ${OUTPUT_DIR}.`);
    }
  });
});

function parseFile(fileName) {
  if (path.extname(fileName) !== '.xlsx') {
    return;
  }

  const worksheet = xlsx.parse(`${INPUT_DIR}/${fileName}`)[0];
  let { data } = worksheet;

  const title = camelCase(data[0][0]);
  console.log(`Parsing ${title}`);

  const years = data[0].filter(cell => !isNaN(cell));
  const columnsPerYear = data[0].indexOf(years[1]) - data[0].indexOf(years[0]);
  let columnNames = data[1].slice(3, 3 + columnsPerYear);
  columnNames = columnNames.map(name => camelCaseColumn(name));
  data = data.splice(2);

  data.forEach(row => parseRow(title, row, years, columnNames));
}

function parseRow(title, row, years, columnNames) {
  const countyCode = row[1];
  const countyData = findOrCreateCountyData(countyCode, row);

  years.forEach((year, i) => {
    const yearData = { year: year };

    let containsInvalidData = false;
    columnNames.forEach((colName, j) => {
      let value = row[COLUMN_OFFSET + (i * columnNames.length) + j];

      if (isNaN(value)) {
        containsInvalidData = true;
      }

      yearData[colName] = value;
    });

    if (!containsInvalidData) {
      countyData.statistics = countyData.statistics || {};
      countyData.statistics[`${title}`] = countyData.statistics[`${title}`] || [];
      countyData.statistics[`${title}`].push(yearData);
      saveCountyData(countyData);
    }
  });
}

function camelCaseColumn(column) {
  if (column.indexOf('(men)') > -1) {
    column = column.replace('(men)', '');
    column = `male_${column}`;
  } else if (column.indexOf('(women)') > -1) {
    column = column.replace('(women)', '');
    column = `female_${column}`;
  }

  return camelCase(column);
}

function findOrCreateCountyData(countyCode, row) {
  const countyDataIndex = fipsCodes.indexOf(countyCode);
  if (countyDataIndex > -1) {
    return outputJSON[countyDataIndex];
  } else {
    fipsCodes.push(countyCode);
    const countyData = {
      state: row[0],
      fipsCode: countyCode,
      name: row[2]
    };
    outputJSON.push(countyData);
    return countyData;
  }
}

function saveCountyData(county) {
  const countyDataIndex = fipsCodes.indexOf(county.fipsCode);
  if (countyDataIndex > -1) {
    outputJSON[countyDataIndex] = county;
  } else {
    outputJSON.push(county);
  }
}
