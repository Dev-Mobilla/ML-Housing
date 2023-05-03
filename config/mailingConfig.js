const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const hbs = require('nodemailer-express-handlebars');
const OAuth2 = google.auth.OAuth2;
// const Logger = require('../logs/logger')

require('dotenv').config();

const setTransporter = async () => {
    
    const nodeTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'vpo-carf@mlhuillier.com',
            pass: 'pkienleaoyvrpbau',
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            accessToken: process.env.ACCESS_TOKEN,
            refreshToken: process.env.REFRESH_TOKEN,
            
        }
    });
    // Logger.loggerInfo.addContext('context', 'mailConfig - setTransporter - ');
    // Logger.loggerInfo.info(`nodeTransporter : ${nodeTransporter.MailMessage}`);

    const handlebarOptions = {
        viewEngine: {
            extName: '.handlebars',
            partialsDir: 'Views/partials',
            layoutsDir: 'Views/layouts',
            defaultLayout: '',
        },
        viewPath: 'Views/templates',
        extName: '.handlebars',
    };
    nodeTransporter.use('compile', hbs(handlebarOptions));

    return nodeTransporter;
};

module.exports = setTransporter;