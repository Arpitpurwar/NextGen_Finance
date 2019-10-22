const logger = require('../../loaders/logger')(__filename);
const {
       ROR_DETAILS_DISPLAY, AUDIT_LOG_DISPLAY, 
       ROR_RESOURCING_DISPLAY, ROR_OUTCOME_DISPLAY, ROR_DISPLAY, DB_PREFIX,ROR_CHILD_DISPLAY, 
       ROR_PRICING_DISPLAY,
       MAIN_TABLE : { ROR_DETAILS_FIELDS, ROR_RESOURCING_FIELDS, ROR_OUTCOME_FIELDS,ROR_PRICING_DETAILS},
       OTHER_TABLE:{ AUDIT },ROR_CHILD_EXPENSES_DISPLAY
      } = require('../../config/column.json');
const { runQuery, runTransaction } = require('../common/runDBQuery');

async function getRORDetails(req) {
   // USER_ID is not dynamically fetching  
    let query='';
    let tempquery='';   
    if(Object.keys(req)[0]=='page')
          {   tempquery=`SELECT ${ROR_DISPLAY.map(value => value.replace("dm.",""))}
              from [${DB_PREFIX}].[${ROR_DETAILS_FIELDS}]
              where RO_PARENT is null order by RO_NUMBER  offset ${(req.page-1) * 5} ROWS fetch next 5 rows only`    
          }
    else if(Object.keys(req)[0]=="search")
          {
        tempquery=`SELECT ${ROR_DISPLAY.map(value => value.replace("dm.",""))}
        from [${DB_PREFIX}].[${ROR_DETAILS_FIELDS}]
        where (RO_NUMBER LIKE '%${req.search}%' OR RO_PARENT LIKE '%${req.search}%' OR RO_TITLE LIKE '%${req.search}%') and RO_PARENT is null  order by RO_NUMBER  offset ${(req.page-1) * 5} ROWS fetch next 5 rows only`
          }
    
    query=`WITH parent
    AS ( ${tempquery}
        UNION ALL
        SELECT ${ ROR_DISPLAY } FROM parent
        JOIN [${DB_PREFIX}].[${ROR_DETAILS_FIELDS}] as dm
        ON dm.RO_PARENT = parent.RO_NUMBER
      ),
      ParentCount(parentCount) AS(
      select count(*) from [${DB_PREFIX}].[${ROR_DETAILS_FIELDS}]  
      where RO_PARENT is null
      )
    SELECT * FROM parent,ParentCount;`

    let record = await runQuery(query);
    let parentArray=[];
    let childArray=[];
    let ROR_COUNT;
    parentArray=record.filter(ROR => ROR.RO_PARENT==null);
    childArray=record.filter(ROR => ROR.RO_PARENT!=null);
    parentArray.forEach(function(val,index) { 
    let child=[];
    
    child=childArray.filter(ROR_CHILD=>ROR_CHILD.RO_PARENT===val.RO_NUMBER);
    child.forEach(value => delete value.parentCount);
    val["CHILD_DATA"]=child;
    ROR_COUNT = val.parentCount;
    delete val.parentCount;
    })

    let tempObj = {
      "SUCCESS": true,
      "ROR_COUNT": ROR_COUNT,
      "PAGE_NUMBER":req.page,
      "USER_ID": 1,
      "ROR_DATA": parentArray
    }
    return tempObj;
}

async function getROR(rorId) {

    // USER_ID is not displaying Dynamic
    let query = ` select ${ ROR_DETAILS_DISPLAY } from [${ DB_PREFIX }].[${ ROR_DETAILS_FIELDS }] where RO_NUMBER = '${ rorId }' and IS_ACTIVE='true' ORDER BY RO_NUMBER desc;
                  select ${ ROR_OUTCOME_DISPLAY } from [${ DB_PREFIX }].[${ ROR_OUTCOME_FIELDS }]where RO_NUMBER = '${ rorId }' and IS_ACTIVE='true' ORDER BY RO_NUMBER desc;
                  select ${ ROR_RESOURCING_DISPLAY } from [${ DB_PREFIX }].[${ ROR_RESOURCING_FIELDS }] where RO_NUMBER = '${ rorId }'and IS_ACTIVE='true' ORDER BY RO_NUMBER desc;
                  select ${ ROR_CHILD_EXPENSES_DISPLAY } from [${ DB_PREFIX }].[${ ROR_DETAILS_FIELDS }] where RO_PARENT = '${ rorId }'and IS_ACTIVE='true' ORDER BY RO_NUMBER desc;
                  select ${ AUDIT_LOG_DISPLAY } from [${ DB_PREFIX }].[${ AUDIT }] where RO_NUMBER = '${ rorId }' ORDER BY RO_NUMBER desc;
                  select ${ROR_CHILD_DISPLAY} from [${ DB_PREFIX }].[${ ROR_DETAILS_FIELDS }] where RO_PARENT = '${ rorId }'and IS_ACTIVE='true';
                  select ${ROR_PRICING_DISPLAY} from [${ DB_PREFIX }].[${ROR_PRICING_DETAILS}] where RO_NUMBER = '${ rorId }'and IS_ACTIVE='true';
                  `
    let result = await runTransaction(query);
    let ROR_DETIALS=result[0][0];
    ROR_DETIALS["ROR_CHILD_EXPENSES"]=result[3];
    ROR_DETIALS["ROR_AUDIT_LOG"]=result[4];
    ROR_DETIALS["ROR_CHILD_STATUS"]=result[5];
    let record = {
      "SUCCESS": true,
      "RO_NUMBER": rorId,
      "USER_ID": 1,
      "ROR_DETAILS_FIELDS":ROR_DETIALS,
      "ROR_OUTCOME_FIELDS": result[1],
      "ROR_RESOURCING_FIELDS": result[2]  ,
      "ROR_PRICING_DETAILS": result[6] 
    }
  
    return record;
}

module.exports = { getRORDetails, getROR }
  