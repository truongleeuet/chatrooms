var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = mongoose.Schema({
    FullName:String,
    Address:String,
    UserName:String,
    Password:String,
    Email:String,
    IsOnline:Boolean

});

var User = mongoose.model('User',UserSchema);
module.exports = User;

module.exports.createUser = function(user,callBack){
    bcrypt.genSalt(10,function(err,salt){
        bcrypt.hash(user.Password,salt,function(err,hash){
            user.Password = hash;
            user.save(callBack);
        });
    });
}

module.exports.getUserByUserName = function(userName,callBack){
    var query = {UserName:userName};
    User.findOne(query,callBack);
}



module.exports.getUserById = function(id,callBack){
    User.findById(id,callBack);
}

module.exports.comparePassword = function(candidatePasswprd,hash,callBack)
{
    bcrypt.compare(candidatePasswprd,hash,function(err,isMatch){
        if(err)
            throw err;
        callBack(null,isMatch);    
    });
}


module.exports.ListUserOnline = function(){
    var lst = [];
    User.find({IsOnline:true},function(err,users){
        if(err)
        {
            return lst;
        }
        else
        {
            for (var item in users) {
                lst.push(item.UserName);
            }
            return lst;
        }
    });
}

module.exports.Logout = function(userName){
    User.findOne({UserName:userName},function(err,user){
        if(!err)
        {
            var query = {IsOnline : true};
            if(user.IsOnline === true)
            {
                query.IsOnline = false;
            }
            else
            {
                query.IsOnline = true;
            }
            User.update({_id:user._id},query,function(err,userRe){
                if(err)
                {
                    throw err;
                }
            });
        }
    });
}

module.exports.UpdateIsOnline = function(id)
{
    User.findById(id,function(err,result){
        if(err)
        {
            throw err;
        }
        else
        {
            var query = {IsOnline : true};
            if(result.IsOnline === true)
            {
                query.IsOnline = false;
            }
            else
            {
                query.IsOnline = true;
            }
            User.update({_id:result._id},query,function(err,userRe){
                if(err)
                {
                    throw err;
                }
            });
        }
    });
};

module.exports.GetByID = function(id,res,req)
{
    User.findById(id,function(err,result)
    {
        if(err)
        {
            throw err;
        }
        else
        {
            console.log(result);
            if(result.UserName === req.user.UserName)
            {
                res.render("profile",{profile:result});
            }
            else
            {
                 res.render("viewProfile",{profile:result});
            }
        }
    });
}

module.exports.CreateUser = function(newUser,res,req){
   User.findOne({UserName:newUser.UserName},function(err,result){
        if(!err && result === null){
            User.findOne({Email:newUser.Email},function(err,re){
                if(!err && re === null){
                   User.createUser(newUser,function(err,resultUser){
                       if(err)
                       {
                           throw err;
                       }
                       else
                       {
                            req.flash('success_msg','Chúc mừng, bạn đã đăng kí thành công.');
                            res.redirect('/login');
                       }
                   });
                }
                else
                {
                    req.flash('error_msg','Địa chỉ email đã được sử dụng.');
                    res.redirect("/register");
                }
            });
        }
        else
        {   
           req.flash('error_msg','Tên đăng nhập đã tồn tại.');
           res.redirect("/register");
        }
    });
};