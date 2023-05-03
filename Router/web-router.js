const express = require('express');
const { successApplication, testing, errorApplication } = require('../Controllers/ApplicationController');

const ROUTER = express.Router();

ROUTER.get('/success', successApplication);
ROUTER.get('/error', errorApplication);
ROUTER.get('/pdf', testing);

exports.ROUTER = ROUTER;