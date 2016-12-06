var express = require('express');
var config = require('./../config/config');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

passport.use(new LocalStrategy(function(username, password, done) {
    User.getUserByUserName(username, function(err, user){
            if(err)
                throw err;
            if(!user){
                return done(null, false, {message: 'Tên đăng nhập hoặc mật khẩu không đúng'});
            }
    User.comparePassword(password, user.Password, function(err, isMatch){
            if(err)
                throw err;
            if(isMatch){
                if(user.IsOnline === true)
                {
                    return done(null, false, {message: 'Tài khoản đã đăng nhập ở một máy khác.'});
                }
                else
                {
                    return done(null, user);
                }
            } else {
                return done(null, false, {message: 'Tên đăng nhập hoặc mật khẩu không đúng'});
            }
        });
    });
}));

passport.serializeUser(function(user, done)
{
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {

    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

var listUserOnline = [];
mongoose.connect(config.getConnectionString());
var db = mongoose.connection;

module.exports = function(app,io){
   app.get('/login',function(req,res){
        res.render('Login');
    });

    app.get('/register',function(req,res){
        res.render('register');
    });

    app.post('/login',passport.authenticate('local', {successRedirect:'/', failureRedirect:'/login',failureFlash: true}),
    function(req, res) {
        res.redirect('/');
    });


      //Register
    app.post('/register',function(req,res)
    {
        var fullName = req.body.FullName;
        var Address = req.body.Address;
        var email = req.body.Email;
        var userName = req.body.UserName;
        var password = req.body.Password;
        var confirmPassword = req.body.ConfirmPassword;

        //Validator
        req.checkBody('UserName','Tên đăng nhập không được bỏ trống').notEmpty();
        req.checkBody('Password','Mật khẩu không được bỏ trống').notEmpty();
        req.checkBody('ConfirmPassword','Xác nhận mật khẩu không chính xác').equals(req.body.Password);
        req.checkBody('Email','Email không được bỏ trống').isEmail();
        var error = req.validationErrors();
        if(error)
        {
            res.render('register',{errors:error});
        }
        else
        {
            var newUser = new User({
                FullName:fullName,
                Address:Address,
                Password:password,
                UserName:userName,
                Email:email,
                IsOnline:false
            });
            User.CreateUser(newUser,res,req);
        }
    });
    app.post('/login',passport.authenticate('local', {successRedirect:'/', failureRedirect:'/login',failureFlash: true}),
        function(req, res) {
            res.redirect('/');
    });

    app.get('/logout/:userName',function(req,res){
         io.on("connection",function(socket){
            var i = listUserOnline.indexOf(req.params.userName);
            listUserOnline.splice(i, 1);
            io.sockets.emit("LogOut",req.params.userName);
        });
        User.Logout(req.params.userName);
        req.logout();
        req.flash('success_msg','Bạn Đã Đăng Xuất');
        res.redirect('/login');
    });

    app.get('/',ensureAuthentication,function(req,res){
        io.on("connection",function(socket){
            User.UpdateIsOnline(req.user._id);
            socket.UserName = req.user.UserName;
            if(listUserOnline.indexOf(req.user.UserName) < 0)
            {
                 var data = {
                    check : false,
                    user : req.user.UserName
                }
                //listUserOnline.push(req.user.UserName);
                io.sockets.emit("UserLogin",data);
            }
            else
            {
                var data = {
                    check : true,
                    indexUser : req.user.UserName,
                    lst : User.ListUserOnline()
                }
                io.sockets.emit("UserLogin",data);
            }
        });
        res.render('index');
    });

    function ensureAuthentication(req,res,next)
    {
        if(req.isAuthenticated()){
            return next();
        }
        else
        {
            res.redirect('/login');
        }
    }
};
