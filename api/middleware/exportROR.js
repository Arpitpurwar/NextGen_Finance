const logger = require('../../loaders/logger')(__filename);
const ExcelJS = require('exceljs');
var moment = require('moment');
var fs = require('fs');
const tempWrite = require('temp-write');

const {
       DB_PREFIX, EXPORT_COLUMNS,
       MAIN_TABLE : { ROR_DETAILS_FIELDS },
      } = require('../../config/column.json');

 const request = require('../../loaders/db');


async function exportROR() {
  let query=`select ${ EXPORT_COLUMNS } from [${DB_PREFIX}].[${ROR_DETAILS_FIELDS}] where RO_PARENT is null order by RO_NUMBER `;
  try
  {
    return await combineStreamData(query);
  }
  catch(e) 
  {
    return e
  }
}


function combineStreamData(query) {
  
  return new Promise((resolve, reject) => {
      try {
          let { db } = request.db();
          db.stream=true;
          db.query(query);
          let currentTime = moment().format("YYYY-MMM-DD-HH-mm-ss");
          let tempPath = 'ROR_EXPORT_' + currentTime + '.xlsx';
          const filepath = tempWrite.sync('location');
          fs.readFileSync(filepath, 'utf8');
          path = tempWrite.sync('location', tempPath);
      console.log("done",EXPORT_COLUMNS);
        let options = {
        filename:path,
        useStyles: true,
        useSharedStrings: true
       };
        let workbook = new ExcelJS.stream.xlsx.WorkbookWriter(options);
        let sheet = workbook.addWorksheet('new'); 
        let colum = [];
        EXPORT_COLUMNS.forEach(element => {
          colum.push({ header: element, key: element, width: 10 } )         
        });
        sheet.columns = colum;
      
       db.on('row', row => {
       
          sheet.addRow(row).commit();
         });
      
      db.on('error', err => {
          // May be emitted multiple times
          console.log("error",err);
          reject(err);
      })
      
      db.on('done', result => {
          sheet.commit();
          console.log('Worksheet created');
       workbook.commit().then(function() {
            resolve(path);
          }).catch((error) => {
              console.error(error);
              reject({
                "SUCCESS": false,
                "MESSAGE": error
        });
          });
      });
    
    }
      catch (e) {
          reject({
                  "SUCCESS": false,
                  "MESSAGE": e.error
          });
      }

  })
}



 module.exports = { exportROR }
  