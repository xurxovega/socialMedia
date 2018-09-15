'use strict'

var User = require('../models/user');


function testGet (req, res) {
    res.status(200).send({ message: 'Testing Get on Node Js' });
};

function testPost (req, res) {
    console.log(req.body);
    res.status(200).send({ message: 'Testing Post on Node Js' });
};

module.exports = {
    testGet,
    testPost
};