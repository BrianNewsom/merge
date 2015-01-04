var _ = require('lodash');
var async = require('async');
var nodemailer = require('nodemailer');
var passport = require('passport');
var Track = require('../models/Track');
var Stem = require('../models/Stem');
var User = require('../models/User');
var secrets = require('../config/secrets');

function getStems(stems, callback) {

    async.map(stems, function(key, next){
        Stem.findById(key, function(err, result){
            if (err || result == null){
                console.log('not found');
            }else{
                console.log(result);
                next(err,result);
            }
        })
    }, function(err, result){
         if (err){
            console.log(err);
         }else{
            callback(result);
         }
    });
}

/**
 * GET /track/:id
 * Track show page for track corresponding to id.
 */

exports.getTrack = function(req, res) {
  Track.findById(req.params.id , function(err, track){
      if (err || track == null) {
         res.render('track/nonexistent', {
            title: 'Track not found'
         })
      }
      else {
        getStems(track.stems, function(stems){
            res.render('track/view', {
                title: 'View Track',
                track: track,
                stems: stems
            });
        });
      }
  });
};

exports.addTrack = function(req,res){
    res.render('track/create', {
        title: 'Create A Track'
    })
}

/* Create a track with form elements given */

exports.postTrack = function(req,res,next){
    var track = new Track({
        name:req.body.name,
        author: req.user.email
    });
    var user = new User(req.user);
    Track.findOne({'name':req.body.name,'author':req.user.email}, function(err, existingTrack){
        if (existingTrack){
            req.flash('errors', { msg: 'You have already created a track with this name.' });
            return res.redirect('/track');
        }
        track.save(function(err,track){
            if(err) return next(err);
            // Append added track to user's owned tracks
            (user.tracks) ? user.tracks.push(track.id) : user.tracks = [];
            User.findByIdAndUpdate(user.id, {$set : {'tracks' : user.tracks}},function(err,user){
                if (err) return next(err);
                res.redirect('/track/' + String(track.id));
            })
        });
    });
}
