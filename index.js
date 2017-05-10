const fs = require('fs');
const path = require('path');
const xlsx = require('node-xlsx').default;
const jsonfile = require('jsonfile');

const inputDir = `${__dirname}/data-xlsx`;
const fipsCodes = [];
const outputJSON = [];
const columnOffset = 3;

fs.readdir(inputDir, (err, files) => {
  files.forEach(fileName => parseFile(fileName));
  jsonfile.writeFile('output.json', outputJSON, { spaces: 2 }, err => {
    console.error(err);
  });
});

function parseFile(fileName) {
  if (path.extname(fileName) !== '.xlsx') {
    return;
  }

  let worksheet = xlsx.parse(`${inputDir}/${fileName}`)[0];
  let { data } = worksheet;

  let title = data[0][0];
  console.log(`Parsing ${title}`);

  let years = data[0].filter(cell => !isNaN(cell));
  let columnsPerYear = data[0].indexOf(years[1]) - data[0].indexOf(years[0]);
  let columnNames = data[1].slice(3, 3 + columnsPerYear);
  data = data.splice(2);

  data.forEach(row => {
    let countyCode = row[1];
    let countyData = findOrCreateCountyData(countyCode, row);

    years.forEach((year, i) => {
      let yearData = { year: year };
      columnNames.forEach((colName, j) => {
        yearData[colName] = row[columnOffset + (i * columnsPerYear) + j];
      });

      countyData[`${title}`] = countyData[`${title}`] || [];
      countyData[`${title}`].push(yearData);
      saveCountyData(countyData);
    });
  });
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
      county: row[2]
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
