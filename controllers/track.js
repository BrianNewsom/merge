var _ = require('lodash');
var async = require('async');
var nodemailer = require('nodemailer');
var passport = require('passport');
var Track = require('../models/Track');
var Stem = require('../models/Stem');
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

exports.postTrack = function(req,res){
    res.render('track/create', {
        title: 'Create A Track'
    })
}
