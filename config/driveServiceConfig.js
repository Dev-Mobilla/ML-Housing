const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const process = require('process');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const authentication = async () => {
    // const auth = await authenticate({
    //     keyfilePath: CREDENTIALS_PATH,
    //     scopes: SCOPES,
    // });
    const auth = new google.auth.GoogleAuth({
        keyFile: "vpo-drive-api-service.json",
        scopes: SCOPES,
    });

    // const client = await auth.getClient();

    const drive = google.drive({ version: 'v3', auth: auth });

    return { drive }
}

module.exports = { authentication };