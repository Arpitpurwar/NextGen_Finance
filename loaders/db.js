const config = require('../config');
const Logger = require('./logger')(__filename);
const sql = require('mssql/msnodesqlv8');
let db,transaction;


async function connection ()
{

let dbConfig = {
  server: config.server,
  database: config.databaseName,
  driver: sql,
  options: 
    {
      trustedConnection: true
    }
  };

  sql.connect(dbConfig, function (err) {

    if (err) {
      Logger.error("connection error with MS SQL Server",err);
      return 
    }
    
    Logger.info('✌️DB Connected');
    // create Request object

    db = new sql.Request();
    transaction = new sql.Transaction();
    return db;

  });

}

var getconnection = function(){
  return {db,transaction};
}

module.exports= {
  connect: connection,
  db : getconnection

}