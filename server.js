var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var UserController = require('./controllers/user');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//Set Static Folder
app.use(express.static('./public'));
app.set('views','./views');
app.engine('handlebars',exphbs({defaultLayout:'layout'}));
app.set('view engine','handlebars');

//BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser('bahdbdgahadg'));

//Express Session
app.use(session({
    secret:'secret',
    saveUninitialized:true,
    resave:true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//Connect Flash Middleware
app.use(flash());

//Global Vars Middleware
app.use(function(req,res,next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

require('./routes/routes.js')(app,io);

//Set Up Controllers
UserController(app,io);

server.listen(process.env.PORT || 3000,function(){
  console.log("Server Start");
});

io.on("connection",function(socket){
    socket.on("Client_SendMessage",function(data){
      io.sockets.emit("Server_RepplyMessage",{UserName:socket.UserName,Message:data.Message});
    });
});
