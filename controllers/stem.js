var _ = require('lodash');
var async = require('async');
var nodemailer = require('nodemailer');
var passport = require('passport');
var Track = require('../models/Track');
var Stem = require('../models/Stem');
var secrets = require('../config/secrets');

exports.addStem = function(req,res){
    res.render('stem/create', {
        title: 'Create A Stem'
    })
}

/* Create a track with form elements given */

exports.postStem = function(req,res,next){
    res.render('stem/create', {
        title: 'Create A Stem'
    })
}
