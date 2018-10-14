'use strict'

// En index  establecemos la conexión y servidor DB.

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;
var urlDB = 'mongodb://localhost:27017/socialmedia2'

mongoose.Promise = global.Promise;
// Conexión a base de datos 
/*
mongoose.connect(urlDB, { useNewUrlParser: true })
        .then(() => {console.log('Connect to DB SocialMedia 2 succesfully!')})
        .catch( err => {'Error connect to DB'}) ;
*/
mongoose.connect(urlDB, { useNewUrlParser: true })
    .then(() => { 
        console.log('Connect to DB SocialMedia2 succesfully!') 
        app.listen(port, ()=> {
            console.log('Server running on http://localhost:3800');
        });          
    })
    .catch(err => { 'Error connect to DB' });