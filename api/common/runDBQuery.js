const request = require('../../loaders/db');
const logger = require('../../loaders/logger')(__filename);

// We can use this function to run one query at a time.
function runQuery(query) {
    return new Promise((resolve, reject) => {
        try {
            let { db } = request.db();
            db.query(query, function (err, result) {
                if (err) {
                    logger.error("error in runQuery() ", err);
                    reject({ "SUCCESS": false, "MESSAGE": err })
                }
                else {
                    if (result.recordset == undefined) {
                        resolve({ "SUCCESS": true, "MESSAGE": "Query run successfully" });
                    }
                    else {
                        resolve(result.recordset);
                    }
            }
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

// We can use this function to run multiple query (Transaction) at a time
function runTransaction(query) {
    return new Promise((resolve, reject) => {
      try {
        let { transaction } = request.db();
        transaction.begin(err => {
          let rolledBack = false
          transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true
          });
          const request = transaction.request();
          request.query(query, (err, result) => {
  
            if (err) {
              logger.error("error in query of runTransaction() ", err);
              let errString = `${err}`; 
              reject({
                "SUCCESS": false,
                "MESSAGE": errString
              });
  
              if (!rolledBack) {
                transaction.rollback(err => {
                  // ... error checks
                  if (!err) {
                    logger.info("Transaction rolledback successfully");
  
                  }
                })
              }
            }
  
            else {
              transaction.commit(err => {
                // ... error checks
                if (err) {
                  logger.error("error in commit of runTransaction() ", err);
                  reject({ "SUCCESS": false, "MESSAGE": err })
                }
                else {                
                  if (result.recordset == undefined) {
                    resolve({ "SUCCESS": true, "MESSAGE": "Transaction run successfully" });
                  } else {
                    resolve(result.recordsets);
                  }
  
                }
              })
            }
          });
  
        })
      }
      catch (e) {
        reject({
          "SUCCESS": false,
          "MESSAGE": e.error
        });
      }
    })
  
}

function runQueryStream(query) {
  
  return new Promise((resolve, reject) => {
      try {
          let { db } = request.db();
          db.stream=true;
          db.query(query)
                // db.on('recordset', columns => {
                //   console.log("errr",columns) 
                //     // Emitted once for each recordset in a query
                // })
                let rows=[];
                db.on('row', row => {
                  // Emitted for each row in a recordset
                  rows.push(row);
              })

                db.on('error', err => {
                  console.log("errr",err)
                  reject({ "SUCCESS": false, "MESSAGE": err })
              })
                db.on('done', result => {
                  // Always emitted as the last one
                  resolve(rows);
              })
    
    }
      catch (e) {
          reject({
                  "SUCCESS": false,
                  "MESSAGE": e.error
          });
      }

  })
}

module.exports = { runQuery, runTransaction,runQueryStream}