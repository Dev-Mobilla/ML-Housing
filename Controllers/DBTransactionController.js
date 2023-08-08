const ApplicationList = require("../Models/ApplicationList.Model");
const ApplicationType = require("../Models/ApplicationType.Model");
const LoanProvider = require("../Models/LoanProvider.Model");
const SmsMessageList = require("../Models/SmsMessageList.Model");

module.exports = {
    
    async GetLoanProvider(providerCode){
        
        let getLoanProvider = await LoanProvider.findOne({
            where: {
                provider_code: providerCode
            }
        })

        return getLoanProvider;

    },
    async GetSmsMessage(smsCode){
        
        let getSmsMessage = await SmsMessageList.findOne({
            where: {
                sms_code: smsCode
            }
        })

        return getSmsMessage;

    },
    async GetApplicationType(applicationTypeCode){
        
        let getApplicationType = await ApplicationType.findOne({
            where: {
                application_type_code: applicationTypeCode
            }
        })

        return getApplicationType;

    },
    async InsertLoanApplication(data){
        
        let getApplicationType = await ApplicationList.create({
            application_reference: data.application_reference,
            application_type: data.application_Type,
            application_date: data.date,
            loan_provider: data.loan_provider,
            firstname: data.firstname,
            lastname: data.lastname,
            suffix: data.suffix,
            birth_date: data.birth_date,
            gender: data.gender,
            citizenship: data.citizenship,
            civil_status: data.civil_status,
            address: data.address,
            mobile_number: data.mobile_number,
            email_address: data.email,
            source_of_funds: data.source_of_funds,
            gross_monthly_income: data.gross_monthly_income,
            mother_maiden_name: data.mother_maiden_name,
            residence_type: data.residence_type,
            length_of_stay: data.length_of_stay,
            application_status: data.application_status,
        })

        return getApplicationType;

    }
}