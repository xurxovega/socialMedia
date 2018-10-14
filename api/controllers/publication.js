'use strict'

var Publication = require ('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');



function testGetPublication(req, res) {
    return res.status(200).send({message: 'Test Get Publication'});
}

function testPostPublication(req, res) {
    var params = req.body;
    var messageText = params.message + ' -> Creado a las ' + moment().unix();
    return res.status(200).send({ message: messageText });
}


// Guardar publicación
function savePublication(req, res){

    var userId = req.user.id;
    var params = req.body;

    var publication = new Publication();

    if(!params.text) return res.status(200).send({message: 'Parametros incorrectos'});

    publication.text = params.text;
    publication.file = null;
    publication.user = userId;
    publication.create_at = moment().unix();

    publication.save((err, pubStored) => {
        if (err) return res.status(500).send({message: 'Error al guardar la publicación'});
        if (!pubStored) return res.status(404).send({ message: 'Publicación errónea' });

        return  res.status(200).send({message: 'Publicación guardada con éxito', 
                                      publication: pubStored});
    });

}


// Listar publicacion de usuaruios que yo sigo
function getPublications(req, res){

    var userId = req.user.id;
    var page = 1;
    var itemsPerPage = 3;
    var userFollowing = [];

    if (req.params.page) {
        page = req.params.page;
    }

    Follow
        .find({user: userId})
        .populate('followed')
        .exec((err, follows)=>{
            follows.forEach(follow => {
                userFollowing.push(follow.followed);
            });
        });

    if (userFollowing){
        Publication
            .find({ user: { '$in': userFollowing } })
            .sort('-created_at')// con el menos se ordena a la inversa
            .populate('user')
            .paginate(page, itemsPerPage, (err, publications, total) => {
                if (err) return res.status(500).send({ message: 'Error al buscar publicaciones' });
                if (!publications) return res.status(404).send({ message: 'No hay publicaciones' });

                return res.status(200).send({
                    total,
                    pages: Math.ceil(total / itemsPerPage),
                    page: page,
                    publications
                });

            });
    }

    /*Publication
        .find({user: userId})
        .sort('created_at')
        .paginate(page, itemsPerPage, (err, publications, total) => { 
            if (err) return res.status(500).send({ message: 'Error al buscar publicaciones' });
            if (!publications) return res.status(404).send({ message: 'No hay publicaciones' });

            return res.status(200).send({
                pages: Math.ceil(total/itemsPerPage),
                itemsPerPage,
                publications
            });

        });
    */
    //return res.status(500).send({ message: 'Error al buscar publicaciones' });
}

module.exports = {
  testGetPublication,
  testPostPublication,
  savePublication,
  getPublications
};