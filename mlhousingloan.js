const express = require('express');

const app = express();

const cors = require('cors');

const process = require('process');
const PORT = process.env.PORT || 8080

const sequelize = require('./config/dbConfig');
const api = require('./Router/api-router');
const web = require('./Router/web-router');

const path = require('path');


app.use(cors({
    // allowedHeaders: true,
    origin: `${process.env.SITE_ORIGIN}`,
}))

app.use(express.urlencoded({
    extended: false
}))

app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', __dirname + '/Views');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/apply-loan', function (req, res) {
    res.render('applicationForm')
})

app.use('/api', api.ROUTER);
app.use('/web', web.ROUTER);


app.listen(PORT, () => {
    console.log(`Server Listening in port: ${PORT}`);
})
