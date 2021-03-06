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
                next(err,result.toJSON());
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

exports.getTrack = function(req, res, next){
    getInfo(req,res,next,null);
}

function getInfo(req,res,next,cb){
    Track.findById(req.params.id, function(err, track){
        if (err || track == null){
            return null;
        }
        else {
            getStems(track.stems, function(stems){
                var trackInfo = {
                    title: 'View Track',
                    track: track,
                    stems: stems
                };
                // See if callback exists
                if (!cb){
                    res.send(trackInfo);
                } else{
                    cb(trackInfo);
                }
            })
        }
    })
}

exports.viewTrack = function(req, res, next) {
    getInfo(req, res, next, function(trackInfo){
        res.render('track/view', trackInfo);
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

exports.addRep = function(req,res,next){
    Track.findById(req.params.id, function(err, track){
        if (err || track == null) console.log(err);
        else{
            if (_.contains(req.user.reps,req.params.id)){
                // User has already repped
                // TODO: Handle this - undo star or give flash warning or something
                req.flash('errors', { msg: 'You have already starred this track!'});
                res.redirect('/track/' + req.params.id);
            } else{
                // Otherwise add to users repped and add rep to track
                req.user.reps.push(req.params.id);
                User.findByIdAndUpdate(req.user.id, {$set : {'reps' : req.user.reps}}, function(err, user){
                    if (err) return next(err);
                    track.addRep(function(){res.redirect('/track/' + req.params.id);});
                })
            }
        }
    })
}

exports.topTracks = function(req,res,next){
    var NUM_TRACKS=20;

    Track.getTop(NUM_TRACKS, function(tracks){
        res.render('track/top', {
            title: 'Top Tracks',
            tracks: tracks
        })
    })
}

exports.fork = function(req, res,next){
    var trackid = req.params.id;
    Track.findById(trackid, function(err, oldTrack){
        // Cannot fork own track.
        if (req.user.email == oldTrack.author){
            req.flash('errors', { msg: 'You cannot fork your own track!'});
            res.redirect('/track/' + oldTrack.id);;
        } else{
            // TODO: Don't allow multiple forks by same user
            // Create identical track owned by current user
            var newTrack = new Track(oldTrack.toJSON());
            // Set as forkOf oldTrack
            newTrack.forkOf = trackid;
            newTrack.author = req.user.email;
            newTrack.rep = 0;
            newTrack.save(function(err, track){
                if (err) return next(err)
                else{
                    // Add newTrack to users track
                    var tracks = req.user.tracks;
                    tracks.push(track.id);
                    User.findByIdAndUpdate(req.user.id, {$set : {'stems' : tracks }}, function(err, user){
                        if (err) return next(err);
                        else{
                            res.redirect('/track/' + track.id);
                        }
                    });
                }
            })
        }
    })
}

exports.removeStem = function(req, res, next){
    var trackid = req.params.trackid;
    var stemid = req.params.stemid;

    Track.findById(trackid, function(err, track){
        // Validate
        if (req.user.email == track.author){
            var len = track.stems.length;
            for(var i = 0 ; i < len ; i++) {
                if(track.stems[i] === stemid) {
                    track.stems.splice(i, 1);
                }
            }
            track.save(function(err, track){
                if (err) return next(err);
                else{
                    res.redirect('/track/' + trackid)
                }
            });
        } else{
            req.flash('errors', { msg: "You cannot delete from someone else's track!"});
            res.redirect('/track/' + trackid)
        }
    });

}
