'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// Load url

// Middleware

    /* -> Cada petición de datos a backend lo conviert a un obj json*/
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


// Cors

// URL
app.get('/testGet', (req, res) => {
    res.status(200).send({message: 'Testing Get on Node Js'});
});
app.post('/testPost', (req, res) => {
    console.log(req.body);
    res.status(200).send({ message: 'Testing Post on Node Js' });
});

module.exports = app;