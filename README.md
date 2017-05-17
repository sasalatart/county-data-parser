# County Data Parser

> Centers for Disease Control and Prevention's .xlsx Data Parser (2004-2013)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Code Climate](https://codeclimate.com/github/sasalatart/county-data-parser/badges/gpa.svg)](https://codeclimate.com/github/sasalatart/county-data-parser)

## About

This script parses the [.xslx files published by the CDC](https://www.cdc.gov/diabetes/data/countydata/countydataindicators.html) regarding diabetes statistics between 2004 and 2013 among different counties into one single JSON file.

## Usage

2. Clone this repository
2. Download the `.xlsx` files
3. Run `node index.js inputDir outputDir`. For example:

  ```sh
    node index.js data-xlsx output.json
  ```
