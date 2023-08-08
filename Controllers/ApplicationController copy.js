const Application = require('../Models/Applications');
const { Op, Sequelize } = require('sequelize');

const Logger = require('../logger/logger');

const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { _createPdfStream, _streamToBuffer } = require('../Utils/generatePdf');
const { UploadFileToDrive } = require('./DriveController');
const { sendSmsNotification } = require('./SmsController');

const BpiFolder = 'BPI'
const DeniedFolder = 'DENIED < 25K'
const DeniedFolder2 = 'DENIED FOREIGNER'
const MLLoansFolder = 'ML LOANS'

const GenerateAndStorePdf = (appData, folderName) => {

    let storeInDrive;
    let approvedTemplate = fs.readFileSync(path.join(__dirname, '..', 'Views', 'templates', 'applicationPdf.hbs'), 'utf-8');
    let filename = appData.applicationId;

    let context = {
        data: appData
    }
    let template = handlebars.compile(approvedTemplate);

    let DOC = template(context);

    _createPdfStream(DOC).then((stream) => {
        _streamToBuffer(stream, async function (err, buffer) {
            if (err) {
                throw new Error(err);
            }
            // let namePDF = "Housing Loan";
            // res.setHeader('Content-disposition', "inline; filename*=UTF-8''" + namePDF);
            // res.setHeader('Content-type', 'application/pdf');
            return storeInDrive = await UploadFileToDrive(buffer, filename, folderName);

        });
    });
    Logger.loggerInfo.addContext('context', 'ApplicationController - GenerateAndStorePdf - ');
    Logger.loggerInfo.info(`responseMesage - ${JSON.stringify(storeInDrive)}`);
    return storeInDrive;
}

const checkForeignerApplication = async (isLoan, isGmi, isSingle, application) => {

    let sendsms;
    let successDriveStore;
    let code;

    //CHECK IF LOAN AND GMI IS EQUAL TO 25K 
    if (isLoan && isGmi) {
        if (isSingle) {
            sendsms = await sendSmsNotification(application.mobile_number, process.env.SMS_DENIED_MSG_2);
            code = 0

            Logger.loggerInfo.addContext('context', 'checkForeignerApplication - SEND MESSAGE');
            Logger.loggerInfo.info(`REASON: Foreigner Single - ${application.applicationId}`);

        } else {

            successDriveStore = GenerateAndStorePdf(application, BpiFolder)
            sendsms = await sendSmsNotification(application.mobile_number, process.env.SMS_SUCCESS_MSG);
            code = 1

            Logger.loggerInfo.addContext('context', 'checkForeignerApplication - FOREIGNER: PROCEED TO BPI FOLDER');
            Logger.loggerInfo.info(`LOAN TYPE: ${application.applicationType} - ${application.applicationId}`);
        }
    }
    //CHECK IF LOAN AND GMI IS NOT EQUAL TO 25K
    else if (isLoan && !isGmi) {

        successDriveStore = GenerateAndStorePdf(application, DeniedFolder)
        sendsms = await sendSmsNotification(application.mobile_number, process.env.SMS_DENIED_MSG_1);
        code = 2

        Logger.loggerInfo.addContext('context', 'checkForeignerApplication - FOREIGNER: PROCEED TO DENIED FOLDER, GMI IS LESS THAN 25K');
        Logger.loggerInfo.info(`LOAN TYPE: ${application.applicationType} - ${application.applicationId}`);
    }
    //CHECK IF NOT LOAN
    else if (!isLoan && isGmi) {

        successDriveStore = GenerateAndStorePdf(application, DeniedFolder2)
        sendsms = await sendSmsNotification(application.mobile_number, process.env.SMS_DENIED_MSG_2);
        code = 0

        Logger.loggerInfo.addContext('context', 'checkForeignerApplication - FOREIGNER: PROCEED TO DENIED FOLDER, NOT CONDO');
        Logger.loggerInfo.info(`LOAN TYPE: ${application.applicationType} - ${application.applicationId}`);
    } else {
        code = 3

        Logger.loggerInfo.addContext('context', 'checkForeignerApplication');
        Logger.loggerInfo.info(` Code: 3 - ${application.applicationId}`);
    }

    return { sendSms: sendsms, successDriveStore: successDriveStore, code: code };
}

const checkFilipinoApplication = async (isLoan, isGmi, application) => {

    let sendsms;
    let successDriveStore;
    let code;

    //CHECK IF LOAN AND GMI IS EQUAL TO 25K 
    if (isLoan && isGmi) {
        successDriveStore = GenerateAndStorePdf(application, BpiFolder)
        sendsms = await sendSmsNotification(application.mobile_number, process.env.SMS_SUCCESS_MSG);
        code = 1

        Logger.loggerInfo.addContext('context', 'checkFilipinoApplication - FILIPINO: PROCEED TO BPI FOLDER');
        Logger.loggerInfo.info(`LOAN TYPE: ${application.applicationType} - ${application.applicationId}`);
    }
    //CHECK IF LOAN AND GMI IS NOT EQUAL TO 25K
    else if (isLoan && !isGmi) {
        successDriveStore = GenerateAndStorePdf(application, DeniedFolder)
        sendsms = await sendSmsNotification(application.mobile_number, process.env.SMS_DENIED_MSG_1);
        code = 2

        Logger.loggerInfo.addContext('context', 'checkFilipinoApplication - FILIPINO: PROCEED TO DENIED FOLDER, GMI IS LESS THAN 25K');
        Logger.loggerInfo.info(`LOAN TYPE: ${application.applicationType} - ${application.applicationId}`);
    }
    //CHECK IF NOT LOAN
    else if (!isLoan && isGmi) {
        successDriveStore = GenerateAndStorePdf(application, MLLoansFolder)
        sendsms = await sendSmsNotification(application.mobile_number, process.env.SMS_SUCCESS_MSG);
        code = 1

        Logger.loggerInfo.addContext('context', 'checkFilipinoApplication - FILIPINO: PROCEED TO BPI FOLDER');
        Logger.loggerInfo.info(`LOAN TYPE: ${application.applicationType} - ${application.applicationId}`);
    } else {

        Logger.loggerInfo.addContext('context', 'checkFilipinoApplication - ');
        Logger.loggerInfo.info(`LOAN TYPE: ${application.applicationType} - ${application.applicationId}`);
        code = 3
    }

    return { sendSms: sendsms, successDriveStore: successDriveStore, code: code };
}

exports.createApplication = async (req, res) => {

    try {
        let data = req.body

        Application.findOne({
            where: {
                id: {
                    [Op.in]: Sequelize.literal(
                        `(SELECT MAX(id) FROM loan_application)`
                    )
                }
            },
            attributes: ['id']
        }).then(getId => {

            let setId;

            if (getId == null) {
                setId = 0
            } else {
                setId = getId.id
            }
            Logger.loggerInfo.addContext('context', 'ApplicationController - createApplication - setId');
            Logger.loggerInfo.info(`${setId}`);
            return setId

        })
            .then(id => {

                let dateInstance = new Date();
                let date = (dateInstance.getFullYear().toString()).substr(-2) + (("0" + (dateInstance.getMonth() + 1)).slice(-2)).toString() + ("0" + dateInstance.getDate()).slice(-2).toString();
                let maxId = (id + 1).toString().padStart(6, 0);

                let appId = `HL-${date}-${maxId}`

                let address = data.houseNo + ' ' + data.barangay + ' ' + data.city + ' ' + data.province + ' ' + data.country

                var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                let appDate = (dateInstance.getFullYear().toString()) + '-' + (("0" + (dateInstance.getMonth() + 1)).toString()) + '-' + dateInstance.getDate().toString();

                function convertDate(date_str) {
                    temp_date = date_str.split("-");
                    console.log(temp_date[2] + " " + months[Number(temp_date[1]) - 1] + " " + temp_date[0]);
                    return temp_date[2] + " " + months[Number(temp_date[1]) - 1] + " " + temp_date[0];
                }

                Logger.loggerInfo.addContext('context', 'ApplicationController - createApplication - convertDate');
                Logger.loggerInfo.info(`${convertDate(appDate)}`);
                return { applicationId: appId, address: address, date: convertDate(appDate) }

            })
            .then(getAppId => {

                let insertLoan = Application.create({

                    applicationId: getAppId.applicationId,
                    applicationType: data.applicationType,
                    date: getAppId.date,
                    citizenship: data.citizenship,
                    firstname: data.firstname,
                    middlename: data.middlename,
                    lastname: data.lastname,
                    civil_status: data.civil_status,
                    birth_date: data.birth_date,
                    name_of_mother: data.name_of_mother,
                    gender: data.gender,
                    gross_monthly_income: data.gross_monthly_income,
                    source_of_funds: data.source_of_funds,
                    address: getAppId.address,
                    length_of_stay: data.length_of_stay,
                    residence_type: data.residence_type,
                    mobile_number: data.mobile_number,
                    email: data.email,
                    confirmEmail: data.confirmEmail,
                    app_status: 'process'

                })
                Logger.loggerInfo.addContext('context', 'ApplicationController - createApplication');
                Logger.loggerInfo.info(` - insert data to the database`);
                return insertLoan

            })
            .then(insertApp => {

                let application = {}
                let appData = insertApp

                application.applicationId = appData.applicationId;
                application.applicationType = appData.applicationType,
                    application.date = appData.date;
                application.citizenship = appData.citizenship;
                application.firstname = appData.firstname;
                application.middlename = appData.middlename;
                application.lastname = appData.lastname;
                application.civil_status = appData.civil_status;
                application.birth_date = appData.birth_date;
                application.name_of_mother = appData.name_of_mother;
                application.gender = appData.gender;
                application.gross_monthly_income = appData.gross_monthly_income;
                application.source_of_funds = appData.source_of_funds;
                application.address = appData.address;
                application.length_of_stay = appData.length_of_stay;
                application.residence_type = appData.residence_type;
                application.mobile_number = appData.mobile_number;
                application.email = appData.email;

                // let sendEmailReq = await SendEmailNotificationRequestor(insertApp.applicationId, insertApp.email, application);
                Logger.loggerInfo.addContext('context', 'ApplicationController - createApplication');
                Logger.loggerInfo.info(` - get data from the database.`);
                return application
            })
            .then(async checkApplication => {

                let gmi = parseFloat(checkApplication.gross_monthly_income.replace(/,/g, ''))

                let acceptedGmi = 25000

                let isGmi;

                let appCheck;
                let isSingle;

                //CHECK IF LOAN
                if (checkApplication.applicationType.toLowerCase() === "condo") {
                    isLoan = true
                } else if (checkApplication.applicationType.toLowerCase() === "house and lot" && checkApplication.citizenship.toLowerCase() === "foreigner") {
                    isLoan = false
                } else if (checkApplication.applicationType.toLowerCase() === "house and lot" && checkApplication.citizenship.toLowerCase() === "filipino") {
                    isLoan = true
                }
                else if (checkApplication.applicationType.toLowerCase() === "refinance") {
                    isLoan = false
                }

                //CHECK IF GMI IS GREATHER THAN OR EQUAL TO 25K
                if (gmi < acceptedGmi) {
                    isGmi = false
                } else if (gmi >= acceptedGmi) {
                    isGmi = true
                }

                if (checkApplication.civil_status.toLowerCase() === 'single') {
                    isSingle = true
                } else {
                    isSingle = false
                }

                //CHECK IF APPLICATION IS DENIED OR PROCEED TO PROCESS
                if (checkApplication.citizenship.toLowerCase() === "foreigner") {
                    appCheck = await checkForeignerApplication(isLoan, isGmi, isSingle, checkApplication);
                } else if (checkApplication.citizenship.toLowerCase() === "filipino") {
                    appCheck = await checkFilipinoApplication(isLoan, isGmi, checkApplication);
                }

                Logger.loggerInfo.addContext('context', 'ApplicationController - checkApplication');
                Logger.loggerInfo.info(` - check application if denied or to be process.`);
                return { appCheck: appCheck };

            })
            .then(appCheck => {
                console.log('STORE TO DRIVE: ', appCheck.appCheck);
                Logger.loggerInfo.addContext('context', 'ApplicationController - send response to the client');
                Logger.loggerInfo.info(`Success - ${JSON.stringify(appCheck.appCheck.successDriveStore)}: ${appCheck.appCheck.code}, ${JSON.stringify(appCheck.appCheck.sendSms)}`);
                res.json({
                    code: appCheck.appCheck.code,
                });
            })
            .catch(error => {
                Logger.loggerError.addContext('context', 'ApplicationController - Service Error');
                Logger.loggerError.error(` - ${error}: code - 3`);
                res.json({
                    code: 3,
                });
            })

    } catch (error) {
        Logger.loggerError.addContext('context', 'ApplicationController - Service Error: ');
        Logger.loggerError.error(`Controller Error - ${error}: code - 3`);
        res.json({
            code: 3,
        });
    }
}

exports.successApplication = async (req, res) => {
    try {
        res.render('successNotification')
    } catch (error) {
        console.log(error);
        Logger.loggerError.addContext('context', 'ApplicationController - Service Error: ');
        Logger.loggerError.error(`successApplication Error - ${error}: code - 3`);
    }
}

exports.errorApplication = async (req, res) => {
    try {
        res.render('errorNotification')
    } catch (error) {
        console.log(error);
        Logger.loggerError.addContext('context', 'ApplicationController - Service Error: ');
        Logger.loggerError.error(`errorApplication Error - ${error}: code - 3`);
    }
}

exports.deniedApplication = async (req, res) => {
    try {
        res.render('deniedNotification')
    } catch (error) {
        console.log(error);
        Logger.loggerError.addContext('context', 'ApplicationController - Service Error: ');
        Logger.loggerError.error(`deniedApplication Error - ${error}: code - 3`);
    }
}
exports.deniedApplication2 = async (req, res) => {
    try {
        res.render('deniedNotification2')
    } catch (error) {
        console.log(error);
        Logger.loggerError.addContext('context', 'ApplicationController - Service Error: ');
        Logger.loggerError.error(`deniedApplication2 Error - ${error}: code - 3`);
    }
}

exports.testing = (req, res) => {
    try {

        let approvedTemplate = fs.readFileSync(path.join(__dirname, '..', 'Views', 'templates', 'applicationPdf.hbs'), 'utf-8');

        let context = {
            data: {
                date: 'April 28, 2023',
                applicationId: 'HL-230428-000008',
                firstname: 'sdfggh',
                middlename: 'fdgg',
                lastname: 'fdg',
                civil_status: 'Annuled',
                birth_date: '1995-06-21',
                name_of_mother: 'fdgf',
                gender: 'Female',
                gross_monthly_income: '1,000.00',
                source_of_funds: 'Commission',
                address: 'gfgfgf gdfg dgdgd gdgdgd fdggd',
                length_of_stay: 'Less than a year',
                residence_type: 'Owned',
                mobile_number: '09071152272',
                email: 'jonalyn.mobilla@gmail.com'
            }
        }
        let template = handlebars.compile(approvedTemplate);

        let DOC = template(context);

        _createPdfStream(DOC).then((stream) => {
            _streamToBuffer(stream, function (err, buffer) {
                if (err) {
                    throw new Error(err);
                }
                let namePDF = "Housing Loan";
                res.setHeader('Content-disposition', "inline; filename*=UTF-8''" + namePDF);
                res.setHeader('Content-type', 'application/pdf');
                // sendEmail({
                //   subject: `Revolving Fund ${controlno} REQUEST APPROVED`,
                //   to: result[0].email,
                //   from: "'Cash Request <vpo-carf@mlhuillier.com>'",
                //   template: "rfApproved",
                //   context: {
                //     data: result[0],
                //   },
                //   attachments: [{
                //     filename: `REVOLVING FUND LIQUIDATION ${controlno}.pdf`,
                //     content: buffer,
                //     contentDisposition: 'application/pdf'
                //   }]
                // });
                return res.send(buffer);
            });
        });

    } catch (error) {
        res.json({ err: error });
    }
}