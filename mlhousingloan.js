const express = require('express');

const app = express();

const cors = require('cors');

const PORT = process.env.PORT || 8080

const sequelize = require('./config/dbConfig');
const api = require('./Router/api-router');
const web  = require('./Router/web-router');

const path = require('path');

app.use(cors({
    // allowedHeaders: true,
//     origin: 'http://127.0.0.1:27142',
}))

app.use(express.urlencoded({
    extended: false
}))

app.use(express.json());

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/apply-loan', function(req, res) {
    res.render('applicationForm')
    // res.sendFile( path.resolve('Views/applicationForm.ejs') );
})

app.use('/api', api.ROUTER);
app.use('/web', web.ROUTER);


app.listen(PORT, () => {
    console.log(`Server Listening in port: ${PORT}`);
})
