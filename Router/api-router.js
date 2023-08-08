const express = require('express');
const { createApplication } = require('../Controllers/ApplicationController');
const { UploadFileToDrive, getFolders } = require('../Controllers/DriveController');
const { sendSmsNotificationApi } = require('../Controllers/SmsController');
const axios = require('axios');

const ROUTER = express.Router();

ROUTER.post('/apply-loan', createApplication);
ROUTER.post('/post-to-drive', UploadFileToDrive);
ROUTER.get('/get-drive', getFolders);
ROUTER.post('/send-sms', sendSmsNotificationApi);

exports.ROUTER = ROUTER;