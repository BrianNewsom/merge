var _ = require('lodash');
var async = require('async');
var nodemailer = require('nodemailer');
var passport = require('passport');
var Track = require('../models/Track');
var Stem = require('../models/Stem');
var User = require('../models/User');
var secrets = require('../config/secrets');
 /*
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
    Track.getTop(5, function(tracks){
        User.getTop(5, function(users){
            res.render('home', {
                title: 'Home',
                tracks: tracks,
                users: users
            });
        })
    });
};
