'use strict'


var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');


var Follow = require('../models/follow');
var User = require('../models/user');

var Message = require('../models/message');


function testGetMessage(req, res) {
    return res.status(200).send({ message: 'Test Get Message' });
}

function testPostMessage(req, res) {
    var params = req.body;
    var messageText = params.message + ' -> Creado a las ' + moment().unix();
    return res.status(200).send({ message: messageText });
}


// Enviar el mensaje
function sendMessage(req, res){

    var params = req.body;
    var message = new Message();

    if (!params.receiver || !params.text ){
        return res.status(500).send({ message: 'Rellene los campos' });
    }

    message.emitter = req.user.id;;
    message.receiver = params.receiver;
    message.text = params.text;

    User.findOne({ '_id': message.receiver}, (err, user) => {

        if (err) return res.status(500).send({ message: 'Error en la petición message.sendMessage' });

        if (!user) return res.status(404).send({ message: 'Usuario receptor no existe' });

        message.created_at = moment().unix();
        message.viewed = false;

        message.save((err, messageStored) => {
            if (err) return res.status(500).send({ message: 'Error en la petición message.sendMessage' });
            if (!messageStored) return res.status(404).send({ message: 'Mensaje incorrecto' });

            return res.status(200).send({ messageStored});

        });
    })

}


// Obtener mensaje
function  getReceiverMessage(req, res) {    
    var userId = req.user.id;

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 3;
    
    Message.find({receiver: userId})
        .populate('emitter', 'name surname _id email nick image')
        .paginate(page, itemsPerPage, (err, messages, total) => {
            if (err) return res.status(500).send({ message: 'Error en la petición message.sengetReceiverMessagedMessage' });

            if (!messages) return res.status(404).send({ message: 'No hay mensajes' });

            res.status(200).send({
                total,
                page: Math.ceil(total/itemsPerPage),
                messages
            });

        });
}


// Obtener mensajes enviados
function getEmitMessage(req, res) {
    var userId = req.user.id;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 3;

    Message.find({ emitter: userId })
        .populate('receiver', 'name surname _id email nick image')
        .paginate(page, itemsPerPage, (err, messages, total) => {
            if (err) return res.status(500).send({ message: 'Error en la petición message.sengetReceiverMessagedMessage' });

            if (!messages) return res.status(404).send({ message: 'No hay mensajes' });

            res.status(200).send({
                total,
                page: Math.ceil(total / itemsPerPage),
                messages
            });

        });
}


// Contar los mensajes sin leer
function getMessageUnviewed(req, res){

    var userId = req.user.id;

    Message
        .count({ receiver: userId, viewed: 'false' })
        .exec((err, count) => {
            if (err) return res.status(500).send({ message: 'Error en la petición message.getMessageUnviewed' });
            return res.status(200).send({count});
    });
}


//Marcar mensajes como leido
function setMessageViewed(req, res){

    var userId = req.user.id;
    var messageId = req.params.id;

    Message
        .findOneAndUpdate({receiver: userId, viewed: 'false', '_id': messageId}, 
            {viewed: 'true'},
            { new: true },
            (err, messageUpdated) => {
                if (err) return res.status(500).send({ message: 'Error en la petición message.setMessageViewed' });
                if (!messageUpdated) return res.status(404).send({ message: 'No hay mensajes' });
                res.status(200).send({messageUpdated });
        });

}



module.exports = {
  testGetMessage,
  testPostMessage,
  sendMessage,
  getReceiverMessage,
  getEmitMessage,
  getMessageUnviewed,
  setMessageViewed
};