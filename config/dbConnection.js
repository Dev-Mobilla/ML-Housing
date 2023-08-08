// const dotenv = require('dotenv');
// dotenv.config();
// const logger = require('../logs/logger');
// const mysql = require('mysql2')

// const dbConnection = mysql.createPool({
//     host: process.env.DEV_DB_HOST,
//     user: process.env.DEV_DB_USER,
//     password: process.env.DEV_DB_PASSWORD,
//     database: process.env.DEV_DB_NAME,
// })

// dbConnection.getConnection((err) => {
//     if (!err) {
//         console.log('Branch Connected.');
//         // logger.loggerInfo.addContext('context', `${process.env.BRANCH_DB_HOST} - ${process.env.BRANCH_DB_NAME} -`);
//         // logger.loggerInfo.info('Branch Connected.')
        
//     } else {
//         console.log(`Branch Connection Failed. ${err}`);
//         // logger.loggerFatal.addContext('context', `${process.env.BRANCH_DB_HOST} - ${process.env.BRANCH_DB_NAME} -`);
//         // logger.loggerFatal.fatal(`Branch Connection Failed. ${err}`)
//     }
// })
// module.exports = dbConnection;
