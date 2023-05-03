const Application = require('../Models/Applications');
const { Op, Sequelize } = require('sequelize');

const { SendEmailNotificationRequestor, SendEmailNotificationSender } = require('./EmailNotificationController');

const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { _createPdfStream, _streamToBuffer } = require('../Utils/generatePdf');

exports.createApplication = async (req, res) => {

    try {
        // res.send({
        //     code: 1,
        //     messageHeader: 'Application sent', 
        //     messageBody: 'HL-20232704-00001', 
        //     messageSub: 'Please check your email. Thank you'
        // }).status(200)

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

            return setId

        }).then(id => {

            let dateInstance = new Date();
            let date = (dateInstance.getFullYear().toString()).substr(-2) + (("0" + (dateInstance.getMonth() + 1)).slice(-2)).toString() + ("0" + dateInstance.getDate()).slice(-2).toString();
            let maxId = (id + 1).toString().padStart(6, 0);

            let appId = `HL-${date}-${maxId}`

            let address = data.houseNo + ' ' + data.barangay + ' ' + data.city + ' ' + data.province + ' ' + data.country

            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            let appDate = (dateInstance.getFullYear().toString()) + '-' + (("0" + (dateInstance.getMonth() + 1)).toString())  + '-' + dateInstance.getDate().toString();

            function convertDate(date_str) {
                temp_date = date_str.split("-");
                console.log(temp_date[2] + " " + months[Number(temp_date[1]) - 1] + " " + temp_date[0]);
                return temp_date[2] + " " + months[Number(temp_date[1]) - 1] + " " + temp_date[0];
            }

            return { applicationId: appId, address: address, date: convertDate(appDate) }

        }).then(getAppId => {

            let insertLoan = Application.create({

                applicationId: getAppId.applicationId,
                applicationType: data.applicationType,
                date: getAppId.date,
                resident: data.resident,
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
                confirmEmail: data.confirmEmail

            })

            return insertLoan

        })
            .then(async insertApp => {

                let application = {}
                let appData = insertApp

                application.applicationId = appData.applicationId;
                application.applicationType = appData.applicationType,
                application.date = appData.date;
                application.resident = appData.resident;
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

                let sendEmailReq = await SendEmailNotificationRequestor(insertApp.applicationId, insertApp.email, application);

                return { sendEmailReq: sendEmailReq, application: application }
            })
            .then(async sendEmail => {

                let appData = sendEmail.application

                let sendEmailSender;

                let approvedTemplate = fs.readFileSync(path.join(__dirname, '..', 'Views', 'templates', 'applicationPdf.hbs'), 'utf-8');

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
                        
                        return sendEmailSender = await SendEmailNotificationSender(appData, buffer);
        
                    });
                });
                return { sendEmailSender: sendEmailSender, application: appData }


            }).then(success => {
                // console.log(success);

                let application = success.application

                res.json({
                    code: 1,
                    messageHeader: 'Application sent',
                    messageBody: application.applicationId,
                    messageSub: 'Please check your email. Thank you'
                });
                // res.render('success_notification', { messageHeader: 'Application sent', messageBody: insertApp.applicationId , messageSub: 'Please check your email. Thank you' })
            })
            .catch(error => {
                console.log('Sequelize Err:', error);
                res.json({ error: error })
            })

    } catch (error) {
        console.log('ERR', error);
    }
}

exports.successApplication = async (req, res) => {
    try {

        let appId = {
            "appId": req.params.appId
        }
        let json_string = JSON.stringify(appId);
        res.cookie(process.env.COOKIE_NAME, json_string, {
            // path: process.env.COOKIE_PATH,
            path: '/',
            domain: process.env.COOKIE_DOMAIN,
            httpOnly: false,
            secure: false,
            sameSite: process.env.COOKIE_SAMESITE,
            maxAge: process.env.COOKIE_MAXAGE,
        })

        res.render('successNotification')
    } catch (error) {
        console.log(error);
    }
}
exports.errorApplication = async (req, res) => {
    try {
        res.render('errorNotification')
    } catch (error) {
        console.log(error);
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