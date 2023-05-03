const express = require('express');
const { createApplication } = require('../Controllers/ApplicationController');

const ROUTER = express.Router();

ROUTER.post('/apply-loan', createApplication);

exports.ROUTER = ROUTER;