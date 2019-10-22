const expressLoader = require('./express');
const Logger = require('./logger')(__filename);
const dbLoader = require('./db');

module.exports= {
    load: async({ app }) => {
        
        await dbLoader.connect();
        
        await expressLoader.load({ app });
        Logger.info('✌️ Express loaded');
  }

}