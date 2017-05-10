const fs = require('fs');
const xlsx = require('node-xlsx').default;
const jsonfile = require('jsonfile');

const inputDir = `${__dirname}/data-xlsx`;

fs.readdir(inputDir, (err, files) => {
  files.forEach(fileName => parseFile(fileName));
});

function parseFile(fileName) {
  let worksheet = xlsx.parse(`${inputDir}/${fileName}`)[0];
  let { name, data } = worksheet;

  console.log(`Parsing ${name} (${fileName})`);
}
