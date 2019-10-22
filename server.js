/********************** 
    Importing All dependencies to start BP Server

*/
const config = require('./config');
const express = require('express');
const Logger = require('./loaders/logger')(__filename);

async function startServer() {
  const app = express();

  await require('./loaders').load({ app });
  app.listen(config.PORT, err => {
    if (err) {
      Logger.error(err);
      process.exit(1);
      return;
    }
    Logger.info(`
      ################################################
        [BP Server is running]
        [Environment: ${config.environment}]
        [BP API Host: ${config.HOST}:${config.PORT}]
      ################################################
    `);
 
})
}


startServer();