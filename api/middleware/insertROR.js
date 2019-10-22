const logger = require('../../loaders/logger')(__filename);
const { MAIN_TABLE:modelTable,  OTHER_TABLE:{ AUDIT, SETTING }, DB_PREFIX,
        AUDIT_INSERT,RO_PREFIX }  = require('../../config/column.json');
const { runTransaction } = require('../common/runDBQuery');
const { createRORInsertQuery } = require('../common/commonFunc');
const _ = require('lodash');

function buildRORQuery(data,check) {
  let roNumber = data.RO_NUMBER;
  let userId = data.USER_ID;
  let auditLog=`insert into [${ DB_PREFIX }].[${ AUDIT }] (${ AUDIT_INSERT }) values('${roNumber}',${userId},'Insert Happens');`
  let finalQuery = '';
  Object.keys(data).forEach((key) => {
    let tableName = modelTable[key];
    if (tableName != undefined) {
      if (!isEmpty(data[key])) {
          if (tableName == 'ROR_DETAILS') {
            data[key]["USER_ID"] = userId;
            data[key]["RO_NUMBER"] = roNumber;
          }
          else {
            data[key].forEach(value => value["RO_NUMBER"] = roNumber);
          }
          finalQuery += createRORInsertQuery(tableName, data[key],roNumber);
        }
      }
    })
  if (roNumber == null) {
    let variableDeclaration = check == 'individual' ?
    `DECLARE @CounterInitialValue varchar(20);
    DECLARE @Counter INT;`:'';
    let getCounter = `
    SET @Counter = (SELECT (value+1) FROM [${ DB_PREFIX }].[${ SETTING }] where [key] = 'RO_COUNTER');
    SET @CounterInitialValue='${RO_PREFIX}_'+CAST(FORMAT(@Counter,'00000','en-US') as varchar);`
    let updateCounter = `update [${ DB_PREFIX }].[${ SETTING }] set value=@Counter where [key] = 'RO_COUNTER';`
    let auditLog=`insert into [${ DB_PREFIX }].[${AUDIT}] (${ AUDIT_INSERT }) values(@CounterInitialValue,${userId},'InsertHappens');`
    let selectRoNumber = check == 'collection' ? '':`select RO_NUMBER from [${ DB_PREFIX }].[${modelTable.ROR_DETAILS_FIELDS}] where RO_NUMBER=@CounterInitialValue;` ;
    return variableDeclaration + getCounter + finalQuery +selectRoNumber+ updateCounter + auditLog;
  }
  else {
    return finalQuery + auditLog;
  }

}

// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {
  // null and undefined are "empty"
  if (obj == null) return true;

  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length > 0) return false;
  if (obj.length === 0) return true;

  // If it isn't an object at this point
  // it is empty, but it can't be anything *but* empty
  // Is it empty?  Depends on your application.
  if (typeof obj !== "object") return true;

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}

async function initiateRORInsert(data) {
  let query = buildRORQuery(data,'individual');
  let result = await runTransaction(query);
  if (data.RO_NUMBER==null)
  {
      return { "SUCCESS": true, "RO_NUMBER":result[0][0].RO_NUMBER}    
  }
  else
  {
    return { "SUCCESS": true,"RO_NUMBER":data.RO_NUMBER}
      }
 }

/**
 * Insert All collection send via Excel Sheet
 */

async function insertBulkROR(bulkData){
  if(bulkData && bulkData.length){
    let query = `DECLARE @CounterInitialValue varchar(20);
    DECLARE @Counter INT;`;
    _.each(bulkData, value => query += buildRORQuery(value,'collection'));
    try{
    await runTransaction(query);
    return { "SUCCESS": true, "MESSAGE" : "All ROR Uploaded SuccessFully" }
    }catch(e){
      return { "SUCCESS" : false, "MESSAGE" : "Uploade Data Failed","ERROR":e }
    }
  }
 

}

module.exports = { initiateRORInsert ,insertBulkROR}