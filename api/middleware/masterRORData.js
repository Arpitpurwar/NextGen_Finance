const logger = require('../../loaders/logger')(__filename);
const { MASTER_DATA_DISPLAY, MASTER_LOCATION_DISPLAY, SIGNING_QTR_DISPLAY,MASTER_ROLES_DISPLAY,
        DB_PREFIX, OTHER_TABLE:{ MASTER, SINGING_QUARTER, LOCATION, ROLES }} = require('../../config/column.json');
const { runTransaction } = require('../common/runDBQuery');


async function masterData() {

    let query =
      `select ${MASTER_DATA_DISPLAY} from [${DB_PREFIX}].[${MASTER}] WHERE IS_ACTIVE='true';
    select ${SIGNING_QTR_DISPLAY} from [${DB_PREFIX}].[${SINGING_QUARTER}] WHERE IS_ACTIVE='true';
    select ${MASTER_LOCATION_DISPLAY} from [${ DB_PREFIX}].[${LOCATION}] WHERE IS_ACTIVE='true';
    select ${MASTER_ROLES_DISPLAY} from [${ DB_PREFIX}].[${ROLES}] WHERE IS_ACTIVE='true';
    `;
  
   
    let result = await runTransaction(query);
    //return result;
    let record = {
      "SUCCESS": true,
      "SERVICE_TYPE_MODEL": result[0].filter(ob => ob.DATA_KEY == 'SERVICE_TYPE_MODEL'),
      "PRICE_TYPE": result[0].filter(ob => ob.DATA_KEY == 'NEXTGEN_PRICE_TYPE').map(el => {
        return { ID: el.ID, Name: el.NAME }
      }),
      "BP_BUSINESS_SEGMENT": result[0].filter(ob => ob.DATA_KEY == 'BP_BUSINESS_SEGMENT').map(el => {
        return { ID: el.ID, Name: el.NAME };
      }),
      "SHIFT": result[0].filter(ob => ob.DATA_KEY == 'SHIFT').map(el => {
        return { ID: el.ID, Name: el.NAME };
      }),
      "LANDED": result[0].filter(ob => ob.DATA_KEY == 'LANDED').map(el => {
        return { ID: el.ID, Name: el.NAME };
      }),
      "RO_CONTRACTUAL_STATUS": result[0].filter(ob => ob.DATA_KEY == 'RO_CONTRACTUAL_STATUS').map(el => {
        return { ID: el.ID, Name: el.NAME };
      }),
      "RO_STATUS": result[0].filter(ob => ob.DATA_KEY == 'RO_STATUS').map(el => {
        return { ID: el.ID, Name: el.NAME };
      }),
      "IBM_CONTRACTUAL_STATUS": result[0].filter(ob => ob.DATA_KEY == 'IBM_CONTRACTUAL_STATUS').map(el => {
        return { ID: el.ID, Name: el.NAME };
      }),
      "IBM_LOADING_STATUS": result[0].filter(ob => ob.DATA_KEY == 'IBM_LOADING_STATUS').map(el => {
        return { ID: el.ID, Name: el.NAME };
      }),
      "OUTCOME_STATUS": result[0].filter(ob => ob.DATA_KEY == 'OUTCOME_STATUS').map(el => {
        return { ID: el.ID, Name: el.NAME };
      }),
      "IBM_GROWTH_PLATFORM": result[0].filter(ob => ob.DATA_KEY == 'IBM_GROWTH_PLATFORM').map(el => {
        return { ID: el.ID, Name: el.NAME };
      }),
      "RO_CURRENCY": result[0].filter(ob => ob.DATA_KEY == 'RO_CURRENCY').map(el => {
        return { ID: el.ID, Name: el.NAME };
      }),
      "RATE_CARD_TYPE": result[0].filter(ob => ob.DATA_KEY == 'RATE_CARD_TYPE').map(el => {
        return { ID: el.ID, Name: el.NAME };
      }),
      "DOCUMENT_TYPE": result[0].filter(ob => ob.DATA_KEY == 'DOCUMENT_TYPE').map(el => {
        return { ID: el.ID, Name: el.NAME };
      }),
      "IBM_BAND": result[0].filter(ob => ob.DATA_KEY == 'IBM_BAND').map(el => {
        return { ID: el.ID, Name: el.NAME };
      }),
      "EXPECTED_SIGNING_QUARTER": result[1],
      "RESOURCE_HOME_LOCATION": result[2].filter(ob => ob.DATA_KEY == 'RESOURCE_WORK_LOCATION').map(el => {
        return { ID: el.ID, Name: el.NAME };
      }),
      "RESOURCE_WORK_LOCATION": result[2].filter(ob => ob.DATA_KEY == 'RESOURCE_WORK_LOCATION').map(el => {
        return { ID: el.ID, Name: el.NAME };
      }),
      "INVOICE_LOCATION": result[2].filter(ob => ob.DATA_KEY == 'INVOICE_LOCATION').map(el => {
        return { ID: el.ID, Name: el.NAME };
      }),
      "IBM_COUNTRY": result[2].filter(ob => ob.DATA_KEY == 'IBM_COUNTRY').map(el => {
        return { ID: el.ID, Name: el.NAME };
      })
      ,
      "NEXTGEN_ROLES": result[3]
    }
  
    return record;
  }

module.exports = { masterData }