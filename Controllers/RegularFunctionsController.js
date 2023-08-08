const { GetSmsMessage } = require('./DBTransactionController');
const { UploadFileToDrive } = require('../Controllers/DriveController');
const Logger = require('../logger/logger');

const { _createPdfStream, _streamToBuffer } = require('../Utils/generatePdf');

const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const BpiFolder = 'BPI'
const DeniedFolder = 'DENIED < 25K'
const DeniedFolder2 = 'DENIED FOREIGNER'
const MLLoansFolder = 'ML LOANS'


const checkForeignerApplication = async (isLoan, isGmi, isSingle) => {

    let getLoanProvider;
    let getSmsMessage;
    let appStatus;
    let driveFolderName;
    let code;

    //CHECK IF LOAN AND GMI IS EQUAL TO 25K BPI
    if (isLoan && isGmi) {
        if (isSingle) {

            // getLoanProvider = await GetLoanProvider(process.env.PROVIDER_CODE_DENIED);
            getLoanProvider = process.env.PROVIDER_CODE_DENIED
            getSmsMessage = await GetSmsMessage(process.env.SMS_CODE_1);
            appStatus = "DENIED"
            driveFolderName = DeniedFolder2
            code = 0

            Logger.loggerInfo.addContext('context', 'checkForeignerApplication - GET SMS MESSAGE');
            Logger.loggerInfo.info(`REASON: Foreigner Single - ${JSON.stringify(getSmsMessage)}`);

        } else {

            // getLoanProvider = await GetLoanProvider(process.env.PROVIDER_CODE_BPI);
            getLoanProvider = process.env.PROVIDER_CODE_BPI
            getSmsMessage = await GetSmsMessage(process.env.SMS_CODE_4);
            appStatus = "PROCESS BPI"
            driveFolderName = BpiFolder
            code = 1

            Logger.loggerInfo.addContext('context', 'checkForeignerApplication - GET SMS MESSAGE & GET LOAN PROVIDER');
            Logger.loggerInfo.info(`FOREIGNER - PROCESS BPI getSmsMessage - ${JSON.stringify(getSmsMessage)}, getLoanProvider - ${JSON.stringify(getLoanProvider)}`);
        }
    }
    //CHECK IF LOAN AND GMI IS NOT EQUAL TO 25K
    else if (isLoan && !isGmi) {

        // getLoanProvider = await GetLoanProvider(process.env.PROVIDER_CODE_DENIED);
        getLoanProvider = process.env.PROVIDER_CODE_DENIED
        getSmsMessage = await GetSmsMessage(process.env.SMS_CODE_2);
        appStatus = "DENIED"
        driveFolderName = DeniedFolder
        code = 2

        Logger.loggerInfo.addContext('context', 'checkForeignerApplication - GET SMS MESSAGE & GET LOAN PROVIDER');
        Logger.loggerInfo.info(`FOREIGNER - DENIED < 25K: getSmsMessage - ${JSON.stringify(getSmsMessage)}, getLoanProvider - ${JSON.stringify(getLoanProvider)}`);
    }
    //CHECK IF NOT LOAN
    else if (!isLoan && isGmi) {

        // getLoanProvider = await GetLoanProvider(process.env.PROVIDER_CODE_DENIED);
        getLoanProvider = process.env.PROVIDER_CODE_DENIED
        getSmsMessage = await GetSmsMessage(process.env.SMS_CODE_1);
        appStatus = "DENIED"
        driveFolderName = DeniedFolder2
        code = 0

        Logger.loggerInfo.addContext('context', 'checkForeignerApplication - GET SMS MESSAGE & GET LOAN PROVIDER');
        Logger.loggerInfo.info(`FOREIGNER - DENIED NOT LOAN: getSmsMessage - ${JSON.stringify(getSmsMessage)}, getLoanProvider - ${JSON.stringify(getLoanProvider)}`);

    }
    else if (!isLoan && !isGmi) {

        // getLoanProvider = await GetLoanProvider(process.env.PROVIDER_CODE_DENIED);
        getLoanProvider = process.env.PROVIDER_CODE_DENIED
        getSmsMessage = await GetSmsMessage(process.env.SMS_CODE_1);
        appStatus = "DENIED"
        driveFolderName = DeniedFolder2
        code = 0

        Logger.loggerInfo.addContext('context', 'checkForeignerApplication - GET SMS MESSAGE & GET LOAN PROVIDER');
        Logger.loggerInfo.info(`FOREIGNER - DENIED NOT LOAN: getSmsMessage - ${JSON.stringify(getSmsMessage)}, getLoanProvider - ${JSON.stringify(getLoanProvider)}`);
    }
    else {

        getLoanProvider = null;
        getSmsMessage = null;
        appStatus = "DENIED"
        driveFolderName = null
        code = 3

        Logger.loggerInfo.addContext('context', 'checkForeignerApplication - GET SMS MESSAGE & GET LOAN PROVIDER');
        Logger.loggerInfo.info(`FOREIGNER : getSmsMessage - ${JSON.stringify(getSmsMessage)}, getLoanProvider - ${JSON.stringify(getLoanProvider)}`);
    }

    return { Loan_Provider: getLoanProvider, Sms_Message: getSmsMessage, appStatus: appStatus, driveFolderName: driveFolderName, code: code }

    // return { sendSms: sendsms, successDriveStore: successDriveStore, code: code };
}

const checkFilipinoApplication = async (isLoan, isGmi) => {

    let getLoanProvider;
    let getSmsMessage;
    let appStatus;
    let driveFolderName;

    //CHECK IF LOAN AND GMI IS EQUAL TO 25K 
    if (isLoan && isGmi) {

        getLoanProvider = process.env.PROVIDER_CODE_BPI
        // getLoanProvider = await GetLoanProvider(process.env.PROVIDER_CODE_BPI);
        getSmsMessage = await GetSmsMessage(process.env.SMS_CODE_4);
        appStatus = "PROCESS BPI"
        driveFolderName = BpiFolder
        code = 1

        Logger.loggerInfo.addContext('context', 'checkFilipinoApplication - GET SMS MESSAGE & GET LOAN PROVIDER');
        Logger.loggerInfo.info(`FILIPINO - PROCESS BPI getSmsMessage - ${JSON.stringify(getSmsMessage)}, getLoanProvider - ${JSON.stringify(getLoanProvider)}`);
    }
    //CHECK IF LOAN AND GMI IS NOT EQUAL TO 25K
    else if (isLoan && !isGmi) {

        getLoanProvider = process.env.PROVIDER_CODE_DENIED

        // getLoanProvider = await GetLoanProvider(process.env.PROVIDER_CODE_BPI);
        
        getSmsMessage = await GetSmsMessage(process.env.SMS_CODE_2);
        appStatus = "DENIED"
        driveFolderName = DeniedFolder
        code = 2

        Logger.loggerInfo.addContext('context', 'checkFilipinoApplication - GET SMS MESSAGE & GET LOAN PROVIDER');
        Logger.loggerInfo.info(`FILIPINO - DENIED < 25K: getSmsMessage - ${JSON.stringify(getSmsMessage)}, getLoanProvider - ${JSON.stringify(getLoanProvider)}`);
    }
    
    //CHECK IF NOT LOAN
    else if (!isLoan && isGmi) {

        getLoanProvider = process.env.PROVIDER_CODE_ML
        // getLoanProvider = await GetLoanProvider(process.env.PROVIDER_CODE_DENIED);
        getSmsMessage = await GetSmsMessage(process.env.SMS_CODE_3);
        appStatus = "PROCESS ML"
        driveFolderName = MLLoansFolder
        code = 1

        Logger.loggerInfo.addContext('context', 'checkFilipinoApplication - GET SMS MESSAGE & GET LOAN PROVIDER');
        Logger.loggerInfo.info(`FILIPINO - DENIED NOT LOAN: getSmsMessage - ${JSON.stringify(getSmsMessage)}, getLoanProvider - ${JSON.stringify(getLoanProvider)}`);

    } else if (!isLoan && !isGmi) {

        getLoanProvider = process.env.PROVIDER_CODE_ML
        // getLoanProvider = await GetLoanProvider(process.env.PROVIDER_CODE_DENIED);
        getSmsMessage = await GetSmsMessage(process.env.SMS_CODE_3);
        appStatus = "PROCESS ML"
        driveFolderName = MLLoansFolder
        code = 1

        Logger.loggerInfo.addContext('context', 'checkFilipinoApplication - GET SMS MESSAGE & GET LOAN PROVIDER');
        Logger.loggerInfo.info(`FILIPINO - DENIED NOT LOAN: getSmsMessage - ${JSON.stringify(getSmsMessage)}, getLoanProvider - ${JSON.stringify(getLoanProvider)}`);
    }
    else {

        getLoanProvider = null;
        getSmsMessage = null;
        appStatus = "DENIED"
        driveFolderName = null
        code = 3

        Logger.loggerInfo.addContext('context', 'checkFilipinoApplication - GET SMS MESSAGE & GET LOAN PROVIDER');
        Logger.loggerInfo.info(`FILIPINO : getSmsMessage - ${JSON.stringify(getSmsMessage)}, getLoanProvider - ${JSON.stringify(getLoanProvider)}`);
    }

    return { Loan_Provider: getLoanProvider, Sms_Message: getSmsMessage, appStatus: appStatus, driveFolderName: driveFolderName, code: code }

}

const GenerateAndStorePdf = async (appData, folderName) => {

    try {
        console.log(appData);

        let storeInDrive;
        let approvedTemplate = fs.readFileSync(path.join(__dirname, '..', 'Views', 'templates', 'applicationPdf.hbs'), 'utf-8');
        let filename = appData.application_reference;

        let context = {
            data: appData
        }
        let template = handlebars.compile(approvedTemplate);

        let DOC = template(context);

        _createPdfStream(DOC).then(async (stream) => {
            storeInDrive = await UploadFileToDrive(stream, filename, folderName);

        }).catch(err => {
            return err
        });
        Logger.loggerInfo.addContext('context', 'RegularFunctionsController - GenerateAndStorePdf - ');
        Logger.loggerInfo.info(`responseMesage - ${JSON.stringify(storeInDrive)}`);
        return storeInDrive;
    } catch (error) {
        Logger.loggerInfo.addContext('context', 'RegularFunctionsController - GenerateAndStorePdf - ');
        Logger.loggerInfo.info(`responseMesage - ERROR: ${JSON.stringify(error)}`);
        return error
    }
}

module.exports = {
    checkFilipinoApplication,
    checkForeignerApplication,
    GenerateAndStorePdf
}