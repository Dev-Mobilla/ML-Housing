const dotenv = require('dotenv').config();
const { authorize, accessDrive } = require('../config/driveConfig');
const fs = require('fs');
const { Readable } = require('stream');
const Logger = require('../logger/logger');
const { authentication } = require('../config/driveServiceConfig')

module.exports = {
    async UploadFileToDrive(pdf, filename, folderName) {
        try {

            let driveFolderId = '';

            if (folderName === process.env.BPI_FOLDERNAME) {

                driveFolderId = process.env.BPI_DRIVEFOLDER_ID

            } else if (folderName === process.env.DENIED_FOLDERNAME) {

                driveFolderId = process.env.DENIED_DRIVEFOLDER_ID_1

            } else if (folderName === process.env.MLLOANS_FOLDERNAME) {

                driveFolderId = process.env.ML_LOANS_DRIVEFOLDER_ID

            }else if (folderName === process.env.DENIED_FOLDERNAME_2) {

                driveFolderId = process.env.DENIED_DRIVEFOLDER_ID_2

            }

            const auth = await authentication()

            const requestBody = {
                name: 'Home Loan - ' + filename,
                fields: 'id',
                parents: [driveFolderId]
            };
            const media = {
                mimeType: 'application/pdf',
                body: Readable.from(pdf),
            };
            
            const file = await auth.drive.files.create({
                requestBody,
                media: media,
            })
            // const file = await drive.files.({
            //     requestBody,
            //     media: media,
            // })
            // res.send(file);
            console.log('UploadFileToDrive', file);
            Logger.loggerInfo.addContext('context', 'DriveController - UploadFileToDrive: ');
            Logger.loggerInfo.info(`Stored in Drive - ${JSON.stringify(file)}: code - 1`);
            return file

        } catch (error) {
            Logger.loggerError.addContext('context', 'DriveController - UploadFileToDrive: ');
            Logger.loggerError.error(`Error - ${error}: - code - 3`);
            return error
        }
    },
    // async UploadFileToDrive(req, res) {
    //     try {

    //         const client = await authorize();

    //         const drive = await accessDrive(client);
    //         // console.log(client);

    //         const requestBody = {
    //             name: 'logoDiamond.png',
    //             fields: 'id',
    //             parents: [process.env.ML_LOANS_DRIVEFOLDER_ID]
    //         };
    //         const media = {
    //             mimeType: 'image/png',
    //             body: fs.createReadStream('Controllers/diamond.png'),
    //         };

    //         const file = await drive.files.create({
    //             requestBody,
    //             media: media,
    //         })
    //         // const file = await drive.files.({
    //         //     requestBody,
    //         //     media: media,
    //         // })
    //         // console.log('File Id:', file);
    //         res.send(file);

    //     } catch (error) {
    //         console.log(error);
    //     }
    // },
    async getFolders(req, res) {
        try {

            const client = await authorize();

            const drive = await accessDrive(client);
            // console.log(client);

            const resp = await drive.files.list({
                pageSize: 10,
                fields: 'nextPageToken, files(id, name)',
            });
            const files = resp.data.files;
            if (files.length === 0) {
                console.log('No files found.');
                return;
            }

            let file = files.map((file) => {
                console.log(`${file.name} (${file.id})`);
                return file
            });
            res.send(file)

        } catch (error) {
            console.log(error);
        }
    }
}
