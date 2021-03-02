var express = require('express');
var router = express.Router();
var passport = require('passport');
var localStrategy = require('passport-local');
var multer = require('multer');
var userModel = require('./users');
const carModel = require('./carSchema');
passport.use(new localStrategy(userModel.authenticate()));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
     var date = new Date();
     var filename = date.getTime() + file.originalname;
     cb(null,filename);
  }
})
 
var upload = multer({ storage: storage , fileFilter:fileFilter});
function fileFilter(req,file,cb){
  if(file.mimetype === 'image/png' || file.mimetype === 'image.jpg' || file.mimetype === 'image.jpeg ' ,cb(null,true));
  else cb(null,false);
}


/* GET home page. */

router.get('/',(req,res) => {
    res.render('index');
});


router.get('/sell/:page',isLoggedIn,function(req,res){
   var perPage = 2 ;
   var page = Math.max(0, req.param('page'));
   carModel.find()
    .limit(perPage)
    .skip(perPage * page)
    .exec(function(err, cars) {
        carModel.count().exec(function(err, count) {
            res.render('sellingapp', {
                cars: cars,
                page: page,
                pages: count / perPage
            })
        })
    })
});

router.post('/uploadit',upload.single('image'),function(req,res){
     userModel.findOne({username:req.session.passport.user})
     .then(function(foundUser){
      foundUser.prflimg = `../images/uploads/${req.file.filename}`;
      foundUser.save()
      res.redirect('/profile');
     })  
});

router.post('/addcar' ,isLoggedIn,upload.single('carimg'), function(req,res){
     userModel.findOne({username:req.session.passport.user})
     .then(function(loggedinUser){
       var carImgaddress = `../images/uploads/${req.file.filename}`;
       carModel.create({
         sellerid:loggedinUser._id,
         carprice:req.body.carprice,
         carname:req.body.carname,
         contact:req.body.contact,
         carimg:carImgaddress
       }).then(function(createdCar){
         loggedinUser.cars.push(createdCar);
         loggedinUser.save().then(function(){
           res.redirect('/profile');
         })
       })
     })
});


router.get('/profile',isLoggedIn,function(req,res){
 userModel.findOne({
   username:req.session.passport.user
 })
 .populate('cars')
 .exec(function(err,foundUser){
   res.render('profile' , foundUser);
 })
 
})



router.post('/login',passport.authenticate('local',{
  successRedirect:'/profile',
  failureRedirect:'/'
}),function(req,res){});


router.post('/reg',function(req,res){
  var userData = new userModel({
    name:req.body.name,
    username:req.body.username,
    email:req.body.email
  })
  userModel.register(userData,req.body.password)
   .then(function(registeredUser){
      passport.authenticate('local')(req,res,function(){
        res.redirect('/profile');
      })
   })
});



router.get('/logout',function(req,res){
  req.logOut();
  res.redirect('/')
});



function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/');
  }
}

module.exports = router;
