'use strict'

const extend = require('extend')
const dotenv = require('dotenv')

const envFound = dotenv.config();
const environment = process.env.NODE_ENV || 'development';

if (!envFound) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

function load(filePath, required) {
  try {
    return require(filePath)
  } catch (error) {
    if (error.name === 'SyntaxError') {
      console.error(`Loading ${filePath} file failed!\n`, error.message)
      process.exit(1)
    } else if (error.code === 'MODULE_NOT_FOUND') {
      console.warn(`NO ${filePath} FILE FOUND! This may cause issues...`)
      if (required) {
        process.exit(1)
      }
      return {}
    } else {
      console.dir(`Unknown error in loading ${filePath} config file.\n`, error)
    }
  }
}

// Override default with environment specific configurations and export as unified object
module.exports = extend(
  true, // enable deep copy
  load('./default', true),
  load(`./env/${environment}`),
  { environment }
)