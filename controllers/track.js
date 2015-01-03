var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');
var Track = require('../models/Track');
var Stem = require('../models/Stem');
var secrets = require('../config/secrets');

function getStems(stems, callback) {
    for(var i=0 ; i < stems.length ; i++){
        Stem.findById(stems[i], function(err, stem){
            if (err || stem == null){
                console.log('Stem not found');
            } else {
                callback(stem)
            }
        })
    }
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
        getStems(track.stems, function(stem){
            res.render('track/view', {
                title: 'View Track',
                track: track,
                stem: stem
            });
        });
      }
  });
};




