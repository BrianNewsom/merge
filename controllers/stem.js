var _ = require('lodash');
var async = require('async');
var nodemailer = require('nodemailer');
var passport = require('passport');
var Track = require('../models/Track');
var Stem = require('../models/Stem');
var secrets = require('../config/secrets');

/* Render view for stem creation page */

exports.addStem = function(req,res){
    res.render('stem/create', {
        title: 'Create A Stem',
        trackid: req.params.trackid
    })
}

/* Create a stem with form elements given */

exports.postStem = function(req,res,next){
    var stem = new Stem({
        name: req.body.name,
        author: req.user.email
    })

    // Save and add stem to track
    stem.save(function(err,stem){
        if (err) return next(err);
        // Now add stem to track
        Track.findById(req.params.trackid, function (err,track){
            if (err || track == null){
                console.log(err);
            } else{
                track.addStem(stem.id, function(track){
                    res.redirect('/track/' + String(track.id));
                });
            }
        })
    })

}
