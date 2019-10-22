const logger = require('../../loaders/logger')(__filename);
const { MAIN_TABLE:modelTable,  OTHER_TABLE:{ AUDIT }, DB_PREFIX,
        AUDIT_INSERT}  = require('../../config/column.json');
const { runTransaction } = require('../common/runDBQuery');
const { createRORInsertQuery } = require('../common/commonFunc');
const _ = require('lodash');

function beautifyUpdateRORQuery(data) {
    let columnsGroup = [];
    Object.keys(data).forEach((key) => {
      if (typeof (data[key]) == ("number" || "boolean")) {
        columnsGroup.push(`${key}=${data[key]}`);
      }
      else {
        if (data[key] == null) {
          columnsGroup.push(`${key}=${data[key]}`);
        } else {
          columnsGroup.push(`${key}='${data[key]}'`);
        }
  
      }
    });
  
    return columnsGroup;
}


async function updateRORDetails(data) {
    if (data["ROR_DELETE"]) {
      let transaction = `update [${DB_PREFIX}].[${modelTable.ROR_DETAILS_FIELDS}] set IS_ACTIVE='false' where RO_NUMBER='${data.RO_NUMBER}';
                         update [${DB_PREFIX}].[${modelTable.ROR_RESOURCING_FIELDS}] set IS_ACTIVE='false' where RO_NUMBER='${data.RO_NUMBER}';
                         update [${DB_PREFIX}].[${modelTable.ROR_OUTCOME_FIELDS}] set IS_ACTIVE='false' where RO_NUMBER='${data.RO_NUMBER}';
                         update [${DB_PREFIX}].[${modelTable.ROR_PRICING}] set IS_ACTIVE='false' where RO_NUMBER='${data.RO_NUMBER}';`
      let result = await runTransaction(transaction);
      return result;
    }
    else {
      let query = buildRORQuery(data);
      let result = await runTransaction(query);
      return result;
    }
}
  
function updateRORQuery(table, data, roNumber, deleteFlag) {
    let partsOfQuery = '';
    if (Array.isArray(data)) {
      if (table == modelTable.ROR_RESOURCING_FIELDS) {
        if (deleteFlag) {
          data.map((value) => {
            let resource_id = value["RESOURCE_ID"];
            partsOfQuery += `update [${DB_PREFIX}].[${table}] set IS_ACTIVE='false' where RO_NUMBER='${roNumber}' and RESOURCE_ID ='${resource_id}';`
          })
        }
        else {
          data.map((value) => {
            let resource_id = value["RESOURCE_ID"];
            delete value.RESOURCE_ID;
            let tempArray = beautifyUpdateRORQuery(value);
            partsOfQuery += `update [${DB_PREFIX}].[${table}] set ${tempArray} where RO_NUMBER='${roNumber}' and RESOURCE_ID ='${resource_id}';`
          })
        }
  
      }
      else if(table == modelTable.ROR_OUTCOME_FIELDS){
        if (deleteFlag) {
          data.map((value) => {
            let outcomeID = value["OUTCOME_ID"];
            partsOfQuery += `update [${DB_PREFIX}].[${table}] set IS_ACTIVE='false' where RO_NUMBER='${roNumber}' and OUTCOME_ID ='${outcomeID}';`
          })
  
        } else {
          data.map((value) => {
            let outcomeID = value["OUTCOME_ID"];
            delete value.OUTCOME_ID;
            let tempArray = beautifyUpdateRORQuery(value);
            partsOfQuery += `update [${DB_PREFIX}].[${table}] set ${tempArray} where RO_NUMBER='${roNumber}' and OUTCOME_ID ='${outcomeID}';`
          })
        }
  
      }
      else if(table == modelTable.ROR_PRICING){
        if (deleteFlag) {
          data.map((value) => {
            let pricingID = value["PRICING_ID"];
            partsOfQuery += `update [${DB_PREFIX}].[${table}] set IS_ACTIVE='false' where RO_NUMBER='${roNumber}' and PRICING_ID ='${pricingID}';`
          })
  
        } else {
          data.map((value) => {
            let pricingID = value["PRICING_ID"];
            delete value.PRICING_ID;
            let tempArray = beautifyUpdateRORQuery(value);
            partsOfQuery += `update [${DB_PREFIX}].[${table}] set ${tempArray} where RO_NUMBER='${roNumber}' and PRICING_ID ='${pricingID}';`
          })
        }
  
      }
      else{
        data.map((value) => {
          let ro_child = value["RO_NUMBER"];
          delete value.RO_NUMBER;
          partsOfQuery += `update [${DB_PREFIX}].[${table}] set IS_ACTIVE='false' where RO_NUMBER='${ro_child}';`
        })
      }
    }
    else {
      let tempArray = beautifyUpdateRORQuery(data);
      partsOfQuery += `update [${DB_PREFIX}].[${table}] set ${tempArray} where RO_NUMBER='${roNumber}';`
    }
    return partsOfQuery;
  
}

function buildRORQuery(data) {
  let roNumber = data.RO_NUMBER;
  let userId = data.USER_ID;
  let auditLog=`insert into [${ DB_PREFIX }].[${ AUDIT }] (${ AUDIT_INSERT }) values('${roNumber}',${userId},'Update Happens');`
  let finalQuery = '';
  Object.keys(data).forEach((key) => {
    let tableName = modelTable[key];
      if (tableName != undefined) {
        if (Object.keys(data[key]).length != 0 && data[key].constructor === Object) {
          if (tableName === modelTable.ROR_DETAILS_FIELDS) {
            if(_.has(data[key],'ROR_CHILD_EXPENSES')){
              let remainingData = _.omit(data[key], ['ROR_CHILD_EXPENSES']);
              let { ROR_CHILD_EXPENSES } = _.pick(data[key],['ROR_CHILD_EXPENSES']);
              finalQuery += updateRORQuery(tableName, ROR_CHILD_EXPENSES, null, false);
              finalQuery += updateRORQuery(tableName, remainingData, roNumber, false);
            }
            else
            {
              finalQuery += updateRORQuery(tableName, data[key], roNumber, userId);
            }
          }
          if (tableName === modelTable.ROR_RESOURCING_FIELDS) {
            if (data[key]["NEW_RESOURCE"].length != 0) {
              data[key]["NEW_RESOURCE"].forEach(value => value["RO_NUMBER"] = roNumber);
              finalQuery += createRORInsertQuery(tableName, data[key]["NEW_RESOURCE"], roNumber);
            }
            if (data[key]["UPDATE_RESOURCE"].length != 0) {
              finalQuery += updateRORQuery(tableName, data[key]["UPDATE_RESOURCE"], roNumber, false);
            }
            if (data[key]["DELETE_RESOURCE"].length != 0) {
              finalQuery += updateRORQuery(tableName, data[key]["DELETE_RESOURCE"], roNumber, true);
            }
          }
          if (tableName === modelTable.ROR_OUTCOME_FIELDS) {
            if (data[key]["NEW_OUTCOME"].length != 0) {
              data[key]["NEW_OUTCOME"].forEach(value => value["RO_NUMBER"] = roNumber);
              finalQuery += createRORInsertQuery(tableName, data[key]["NEW_OUTCOME"], type, roNumber);
            }
            if (data[key]["UPDATE_OUTCOME"].length != 0) {
              finalQuery += updateRORQuery(tableName, data[key]["UPDATE_OUTCOME"], roNumber, false);
            }
            if (data[key]["DELETE_OUTCOME"].length != 0) {
              finalQuery += updateRORQuery(tableName, data[key]["DELETE_OUTCOME"], roNumber, true);
            }
          }

          if (tableName === modelTable.ROR_PRICING_DETAILS) {
             if (data[key]["NEW_PRICING"].length != 0) {
             data[key]["NEW_PRICING"].forEach(value => value["RO_NUMBER"] = roNumber);
              finalQuery += createRORInsertQuery(tableName, data[key]["NEW_PRICING"], roNumber);
                     }
            if (data[key]["UPDATE_PRICING"].length != 0) {             
              finalQuery += updateRORQuery(tableName, data[key]["UPDATE_PRICING"], roNumber, false);
            }
            }
        }
      }
  })
  
  return finalQuery + auditLog;
  
}

  
module.exports = { updateRORDetails }
  