const {getROR ,getRORDetails} = require('./fetchROR');
const { initiateRORInsert,insertBulkROR } = require('./insertROR');
const {updateRORDetails} = require('./updateROR');
const { masterData } = require('./masterRORData');
const { exportROR } = require('./exportROR');



module.exports = { getROR, getRORDetails, initiateRORInsert, insertBulkROR, updateRORDetails, masterData,exportROR};