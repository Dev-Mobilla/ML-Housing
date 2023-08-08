const dotenv = require('dotenv').config();

const axios = require('axios');
const Logger = require('../logger/logger');

module.exports = {

    async sendSmsNotification(mobile_no, message) {

        const response = await axios.post(process.env.SMS_API, {
            username: process.env.SMS_USERNAME,
            password: process.env.SMS_PASSWORD,
            mobileno: mobile_no,
            msg: message,
            sender: process.env.SMS_SENDER
        });

        Logger.loggerInfo.addContext('context', 'SmsController - sendSmsNotification');
        Logger.loggerInfo.info(` - ${JSON.stringify(response.data)}`);

        return response.data
    },

    async sendSmsNotificationApi(req, res) {

        try {

            let mobile_no = req.body.mobileno
            let message = req.body.message

            const response = await axios.post(process.env.SMS_API, {
                username: process.env.SMS_USERNAME,
                password: process.env.SMS_PASSWORD,
                mobileno: mobile_no,
                msg: message,
                sender: process.env.SMS_SENDER
            });
            console.log(response);
            res.send({ res: response.data })

        } catch (error) {
            res.send({ Error: error })
        }
        // return response
    }
}