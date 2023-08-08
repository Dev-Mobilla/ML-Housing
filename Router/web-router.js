const express = require('express');
const { successApplication, testing, errorApplication, deniedApplication, deniedApplication2, testing_1 } = require('../Controllers/ApplicationController');

const ROUTER = express.Router();

ROUTER.get('/success', successApplication);
ROUTER.get('/error', errorApplication);
ROUTER.get('/denied-income', deniedApplication);
ROUTER.get('/denied-status', deniedApplication2);
ROUTER.get('/pdf', testing);
ROUTER.get('/pdf-2', testing_1);

exports.ROUTER = ROUTER;