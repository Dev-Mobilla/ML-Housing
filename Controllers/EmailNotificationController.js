
const dotenv = require('dotenv');
dotenv.config()

const setTransporter = require('../config/mailingConfig');

const SendEmail = async (options) => {
    let gmailTransporter = await setTransporter();
    return await gmailTransporter.sendMail(options);
  };

  const SendEmailNotificationRequestor = async (appId, reqEmail, application) => {

    let send = SendEmail(
        {
            subject: `M Lhuillier Home Loan Application: ${appId}`,
            to: reqEmail,
            from: "'ML Home Loan Service <donotreply@mlhuillier.com>'",
            template: "requestorReceipt",
            context: {
                application: application,
                appId: appId,
            }
        }
    );
    return send
}
const SendEmailNotificationSender = async (application, attachment) => {

    let appType = application.applicationType

    let send = SendEmail(
        {
            subject: `${appType.toUpperCase()}: ${application.applicationId}`,
            to: process.env.SYSTEM_EMAIL,
            from: "'ML Housing Loan Service <donotreply@mlhuillier.com>'",
            template: "senderReceipt",
            context: {
                appId: application.applicationId,
                date: application.date,
                applicationType: application.applicationType
            },
            attachments: [{
                filename: `ML HOUSING LOAN ${application.applicationId}.pdf`,
                content: attachment,
                contentDisposition: 'application/pdf'
            }]
        }
    );
    return send
}

module.exports = {
    SendEmailNotificationRequestor,
    SendEmailNotificationSender
}