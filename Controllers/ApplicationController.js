// const Application = require('../Models/Applications');
const ApplicationList = require('../Models/ApplicationList.Model');
const { Op, Sequelize } = require('sequelize');

const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const Logger = require('../logger/logger');
const { _createPdfStream, _streamToBuffer } = require('../Utils/generatePdf');
const { sendSmsNotification } = require('./SmsController');
const { checkFilipinoApplication, checkForeignerApplication, GenerateAndStorePdf } = require('./RegularFunctionsController');
const { GetApplicationType, InsertLoanApplication, GetLoanProvider } = require('./DBTransactionController');
const generateJsPDF = require('../Utils/generateJsPDF');

const { UploadFileToDrive } = require('./DriveController');


exports.createApplication = async (req, res) => {

    try {
        let data = req.body

        let AppId;

        ApplicationList.findOne({
            where: {
                id: {
                    [Op.in]: Sequelize.literal(
                        `(SELECT MAX(id) FROM application_list)`
                    )
                },
            },
            attributes: ['id']
        })
            //GET MAX ID
            .then(getId => {

                let setId;

                if (getId == null) {
                    setId = 0
                } else {
                    setId = getId.id
                }
                Logger.loggerInfo.addContext('context', 'ApplicationController - createApplication - setId');
                Logger.loggerInfo.info(`Current Max ID: ${setId}`);
                return setId

            })
            //GET APPLICATION TYPE
            .then(async (id) => {

                AppId = id;

                let applicationTypeCode = "";

                if (data.applicationType === "condo") {
                    applicationTypeCode = "CONDO_LOAN"
                } else if (data.applicationType === "houseandlot") {
                    applicationTypeCode = "HOUSE_AND_LOT"
                } else if (data.applicationType === "refinance") {
                    applicationTypeCode = "REFINANCE"
                }

                // let Get_ApplicationType = await GetApplicationType(applicationTypeCode);

                // if (Get_ApplicationType !== null) {
                //     return Get_ApplicationType 
                // }
                // throw new Error(`message: Failed to submit application, ${JSON.stringify(Get_ApplicationType)}`);
                return applicationTypeCode


            })
            //GET LOAN PROVIDER
            .then(async checkApplication => {

                let gmi = parseFloat(data.grossMonthlyIncome.replace(/,/g, ''))

                let acceptedGmi = 25000

                let isGmi;

                let appCheck;
                let isSingle;

                //CHECK IF LOAN
                if (data.applicationType.toLowerCase() === "condo") {
                    isLoan = true
                }
                else if (data.applicationType.toLowerCase() === "houseandlot" && data.citizenship.toLowerCase() === "foreigner") {
                    isLoan = false
                }
                else if (data.applicationType.toLowerCase() === "houseandlot" && data.citizenship.toLowerCase() === "filipino") {
                    isLoan = true
                }
                else if (data.applicationType.toLowerCase() === "refinance") {
                    isLoan = false
                }

                //CHECK IF GMI IS GREATHER THAN OR EQUAL TO 25K
                if (gmi < acceptedGmi) {
                    isGmi = false
                } else if (gmi >= acceptedGmi) {
                    isGmi = true
                }

                if (data.civilStatus.toLowerCase() === 'single') {
                    isSingle = true
                } else {
                    isSingle = false
                }

                //CHECK IF APPLICATION IS DENIED OR PROCEED TO PROCESS
                if (data.citizenship.toLowerCase() === "foreigner") {
                    appCheck = await checkForeignerApplication(isLoan, isGmi, isSingle);

                } else if (data.citizenship.toLowerCase() === "filipino") {
                    appCheck = await checkFilipinoApplication(isLoan, isGmi);
                }


                if (appCheck.Loan_Provider !== null && appCheck.Sms_Message !== null) {
                    return { appCheck: appCheck, applicationType: checkApplication }
                }
                Logger.loggerInfo.addContext('context', 'ApplicationController - checkApplication');
                Logger.loggerInfo.info(` - check application if denied or to be process.`);
                throw new Error('Failed to Submit Application: Null');

            })
            // ORGANIZE DATE, APPLICATION REFERENCE, AND ADDRESS
            .then(organizeData => {

                let dateInstance = new Date();
                let date = (dateInstance.getFullYear().toString()).substr(-2) + (("0" + (dateInstance.getMonth() + 1)).slice(-2)).toString() + ("0" + dateInstance.getDate()).slice(-2).toString();
                let maxId = (AppId + 1).toString().padStart(6, 0);

                let appId = `HL-${date}-${maxId}`

                let address = data.houseNo + ' ' + data.barangay + ' ' + data.city + ' ' + data.province + ' ' + data.country

                var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                let appDate = (dateInstance.getFullYear().toString()) + '-' + (("0" + (dateInstance.getMonth() + 1)).toString()) + '-' + dateInstance.getDate().toString();

                function convertDate(date_str) {
                    temp_date = date_str.split("-");
                    console.log(temp_date[2] + " " + months[Number(temp_date[1]) - 1] + " " + temp_date[0]);
                    return months[Number(temp_date[1]) - 1] + " " + temp_date[2] + " " + temp_date[0];
                }

                Logger.loggerInfo.addContext('context', 'ApplicationController - createApplication - convertDate');
                Logger.loggerInfo.info(`${convertDate(appDate)}`);
                return { applicationId: appId, address: address, date: convertDate(appDate), organizeData }

            }).then(async getData => {
                let sms_message = getData.organizeData.appCheck.Sms_Message.message;
                let folderName = getData.organizeData.appCheck.driveFolderName;
                let code = getData.organizeData.appCheck.code;

                let application = {}
                let loanProviderCode = getData.organizeData.appCheck.Loan_Provider;
                let applicationTypeCode = getData.organizeData.applicationType;
                let applicationStatus = getData.organizeData.appCheck.appStatus;

                application.application_reference = getData.applicationId;
                application.application_Type = applicationTypeCode,
                    application.date = getData.date;
                application.loan_provider = loanProviderCode;
                application.firstname = data.firstname;
                application.lastname = data.lastname;
                application.suffix = data.suffix;
                application.birth_date = data.birthDate;
                application.gender = data.gender;
                application.citizenship = data.citizenship;
                application.civil_status = data.civilStatus;
                application.address = getData.address;
                application.mobile_number = data.mobileNumber;
                application.email = data.email;
                application.source_of_funds = data.sourceOfFunds;
                application.gross_monthly_income = data.grossMonthlyIncome;
                application.mother_maiden_name = data.motherMaidenName;
                application.residence_type = data.residencType;
                application.length_of_stay = data.lengthOfStay;
                application.application_status = applicationStatus;

                let insertLoan = await InsertLoanApplication(application);

                let getApplicationType = await GetApplicationType(insertLoan.application_type);
                let getLoanProvider = await GetLoanProvider(insertLoan.loan_provider);

                if (getApplicationType !== null && getLoanProvider !== null && insertLoan !== null) {

                    Logger.loggerInfo.addContext('context', 'ApplicationController - createApplication - insertData, getApplicationType, getLoanProvider');
                    Logger.loggerInfo.info(`SUCCESS: ${JSON.stringify(insertLoan.application_reference)}, ${JSON.stringify(getApplicationType.label)}, ${JSON.stringify(getLoanProvider.provider_name)}`);

                    return {
                        applicationData: insertLoan,
                        applicationType: getApplicationType.label,
                        loanProvider: getLoanProvider.provider_name,
                        sms_message: sms_message,
                        drive_folder: folderName,
                        code: code
                    }
                }
                Logger.loggerInfo.addContext('context', 'ApplicationController - createApplication - insertData, getApplicationType, getLoanProvider');
                Logger.loggerInfo.info(`ERROR: ${JSON.stringify(insertLoan.application_reference)}, ${JSON.stringify(getApplicationType.label)}, ${JSON.stringify(getLoanProvider.provider_name)}`);

                throw new Error(`message: Failed to submit application, INSERT APPLICATION: ${JSON.stringify(insertLoan)}, GET APP TYPE: ${JSON.stringify(getApplicationType)}, GET LOAN PROVIDER: ${JSON.stringify(GetLoanProvider)}`)

            }).then(async loanInserted => {

                let mobile_no = loanInserted.applicationData.mobile_number;
                let message = loanInserted.sms_message;
                let pdfData = loanInserted.applicationData.dataValues;
                let folderName = loanInserted.drive_folder

                pdfData.application_type = loanInserted.applicationType;
                pdfData.loan_provider = loanInserted.loanProvider;

                let storeToDrive = GenerateAndStorePdf(pdfData, folderName);
                let sms_notification = await sendSmsNotification(mobile_no, message);

                Logger.loggerInfo.addContext('context', 'ApplicationController - createApplication - GeneratePdf and SendSMS');
                Logger.loggerInfo.info(` - ${JSON.stringify(storeToDrive)}, ${JSON.stringify(sms_notification)}`);
                return { storeToDrive, sms_notification, code: loanInserted.code }

            }).then(success => {
                console.log(success);
                Logger.loggerInfo.addContext('context', 'ApplicationController - createApplication - send response to the client');
                Logger.loggerInfo.info(`SUCCESS - DRIVE: ${JSON.stringify(success.storeToDrive)}, SMS: ${JSON.stringify(success.sms_notification)}`);
                // res.json(success)
                res.json({
                    code: success.code,
                });

            })
            .catch(error => {
                console.log(error);
                Logger.loggerError.addContext('context', 'ApplicationController - Service Error');
                Logger.loggerError.error(` - ${JSON.stringify(error)}: code - 3`);
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

exports.testing_1 = (req, res) => {
    try {

        let approvedTemplate = fs.readFileSync(path.join(__dirname, '..', 'Views', 'templates', 'applicationPdf.hbs'), 'utf-8');

        let context = {
            data: {
                application_date: 'April 28, 2023',
                application_reference: 'HL-230428-000008',
                application_type: "Refinancing my property",
                loan_provider: "ML LOANS",
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
},
exports.testing = async (req, res) => {

    try {

        let approvedTemplate = fs.readFileSync(path.join(__dirname, '..', 'Views', 'templates', 'applicationPdf.hbs'), 'utf-8');

        let context = {
            data: {
                application_date: 'April 28, 2023',
                application_reference: 'HL-230428-000008',
                application_type: "Refinancing my property",
                loan_provider: "ML LOANS",
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

        // console.log(typeof(DOC));

        let pdf = await generateJsPDF.htmlToPdf(DOC)
        console.log('pdf', pdf);

        // let gen = Readable.from(pdf)

        let gen = await UploadFileToDrive(pdf, "sample", "BPI");
        console.log(gen);

        res.send(gen)

        // _streamToBuffer(stream, function (err, buffer) {
        //     if (err) {
        //         throw new Error(err);
        //     }
        //     let namePDF = "Housing Loan";
        //     res.setHeader('Content-disposition', "inline; filename*=UTF-8''" + namePDF);
        //     res.setHeader('Content-type', 'application/pdf');
        //     return res.send(buffer);
        // });


        // _createPdfStream(DOC).then((stream) => {
        //     _streamToBuffer(stream, function (err, buffer) {
        //         if (err) {
        //             throw new Error(err);
        //         }
        //         let namePDF = "Housing Loan";
        //         res.setHeader('Content-disposition', "inline; filename*=UTF-8''" + namePDF);
        //         res.setHeader('Content-type', 'application/pdf');
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
        //         return res.send(buffer);
        //     });
        // });

    } catch (error) {
        console.log(error);
        res.json({ err: error });
    }
}