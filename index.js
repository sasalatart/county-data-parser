const fs = require('fs');
const path = require('path');
const xlsx = require('node-xlsx').default;
const jsonfile = require('jsonfile');
const camelCase = require('camelcase');

const inputDir = `${__dirname}/${process.argv[2]}`;
const outputDir = process.argv[3];
const fipsCodes = [];
const outputJSON = [];
const columnOffset = 3;

fs.readdir(inputDir, (err, files) => {
  files.forEach(fileName => parseFile(fileName));
  jsonfile.writeFile(outputDir, outputJSON, { spaces: 2 }, err => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Results written to ${outputDir}.`);
    }
  });
});

function parseFile(fileName) {
  if (path.extname(fileName) !== '.xlsx') {
    return;
  }

  let worksheet = xlsx.parse(`${inputDir}/${fileName}`)[0];
  let { data } = worksheet;

  let title = camelCase(data[0][0]);
  console.log(`Parsing ${title}`);

  let years = data[0].filter(cell => !isNaN(cell));
  let columnsPerYear = data[0].indexOf(years[1]) - data[0].indexOf(years[0]);
  let columnNames = data[1].slice(3, 3 + columnsPerYear);
  columnNames = columnNames.map(name => camelCaseColumn(name));
  data = data.splice(2);

  data.forEach(row => parseRow(title, row, years, columnNames));
}

function parseRow(title, row, years, columnNames) {
  let countyCode = row[1];
  let countyData = findOrCreateCountyData(countyCode, row);

  years.forEach((year, i) => {
    let yearData = { year: year };

    let containsInvalidData = false;
    columnNames.forEach((colName, j) => {
      let value = row[columnOffset + (i * columnNames.length) + j];

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
  let countyDataIndex = fipsCodes.indexOf(countyCode);
  if (countyDataIndex > -1) {
    return outputJSON[countyDataIndex];
  } else {
    fipsCodes.push(countyCode);
    let countyData = {
      state: row[0],
      fipsCode: countyCode,
      name: row[2]
    };
    outputJSON.push(countyData);
    return countyData;
  }
}

function saveCountyData(county) {
  let countyDataIndex = fipsCodes.indexOf(county.fipsCode);
  if (countyDataIndex > -1) {
    outputJSON[countyDataIndex] = county;
  } else {
    outputJSON.push(county);
  }
}
