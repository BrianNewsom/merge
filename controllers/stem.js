var secrets = require('../config/secrets');
var _ = require('lodash');
var async = require('async');
var nodemailer = require('nodemailer');
var passport = require('passport');
var Track = require('../models/Track');
var Stem = require('../models/Stem');
var secrets = require('../config/secrets');
var aws = require('aws-sdk');

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
                    res.redirect('/track/' + req.params.trackid);
                });
            }
        })
    })

}

exports.signS3 = function(req,res){
    console.log(req.query);
    var AWS_ACCESS_KEY= secrets.aws.accessKeyId;
    var AWS_SECRET_KEY= secrets.aws.secretAccessKey;
    var S3_BUCKET='briannewsomsongs';
    aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
    var s3 = new aws.S3();
    var s3_params = {
        Bucket: S3_BUCKET,
        Key: req.query.s3_object_name,
        Expires: 60,
        ContentType: req.query.s3_object_type,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3_params, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            var return_data = {
                signed_request: data,
                url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+req.query.s3_object_name
            };
            res.write(JSON.stringify(return_data));
        }
    })
}
