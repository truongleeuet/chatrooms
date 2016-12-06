var express = require('express');
var config = require('./../config/config')
var mongo = require('mongodb');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./../models/user');

module.exports = function (app,io)
{
    //Xem tường người dùng
    app.get('/viewprofile/:id',function(req,res){
        User.GetByID(req.params.id,res,req);
    });
}
