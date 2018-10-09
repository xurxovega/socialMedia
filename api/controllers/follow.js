'use stric'

var Follow = require('../models/follow');
var fs = require('fs');
var path = require('path');
var mongoosePagination = require('mongoose-pagination');


function testGetFollow(req, res){
    return res.status(200).send({message:'Test de Follow'})
}

// Seguir usuarios
function saveFollow(req, res){

    var params = req.body;

    var follow = new Follow();

    follow.user = req.user.id;
    follow.followed = params.followed;

    follow.save((err, followStored) => {
        if (err) return res.status(500).send({ message: 'Error en follow (follow.saveFollow)' });

        if (!followStored) return res.status(404).send({ message: 'El follow no se ha guardado (follow.saveFollow)' });

        return res.status(200).send({ follow: followStored });
    });
}


// Dejar de seguir usuario
function deleteFollow(req, res) {

    userId = req.user.id;
    followId = req.params.id;

    Follow.findOneAndRemove({ user: userId, followed: followId},
         (err, followDeleted) => {
            if (err) return res.status(500).send({ message: 'Error en follow (follow.deleteFollow)' });
            if (!followDeleted) return res.status(404).send({ message: 'El follow no se ha borrado (follow.deleteFollow)' });
            return res.status(200).send({ message: 'Follow borrado' });
        }
    );

}


// Lista usuarios que seguimos
function getFollowUsers(req, res){
    var userId = req.user.id;
    var page = 1;
    var itemsPerPage = 2;
    
    if(req.params.id && req.params.page){
        userId = req.params.id;
    }

    if(req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;
    }

    Follow.find({user: userId})
        .populate({path: 'followed'})
        .paginate(page, itemsPerPage, (err, follows, total) => {
            if (err) return res.status(500).send({ message: 'Error en getFollowUsers' });

            if (!follows) return res.status(404).send({ message: 'No hay follows' });

            return res.status(200).send({total: total, 
                                         pages: Math.ceil(total/itemsPerPage),
                                         follows: follows})
        });

}

module.exports = {
  testGetFollow,
  saveFollow,
  deleteFollow,
getFollowUsers
};