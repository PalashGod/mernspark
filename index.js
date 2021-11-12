var express = require('express');  
var app = express();  
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser'); 
const {MongoClient} = require('mongodb');

const cookieParser = require("cookie-parser");
const sessions = require('express-session');
var session;
var urlencodedParser = bodyParser.urlencoded({ extended: false }) 
app.set('views', './views'); 
// Set EJS as templating engine
app.set('view engine', 'ejs');

const uri = "mongodb+srv://Demo:Demopass@cluster0.pdzgr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const onefrthDay = 1000 * 60*60*6;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: onefrthDay },
    resave: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie parser middleware
app.use(cookieParser());

function email(c,m){
  var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '21051070@kiit.ac.in',
    pass: "N]2`Eb@{"
  }
});

var mailOptions = {
  from: '21051070@kiit.ac.in',
  to: m,
  subject: 'Sending Email using Node.js',
  html: c
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
}

function getRandomString(length) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for ( var i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}
 
const client = new MongoClient(uri);


app.get('/',(req,res) => {
    session=req.session;
    console.log(session.userid);
    if(session.userid){
        res.render('dashboard', {name:session.username});
    }else{
      res.sendFile( __dirname + "/" + "index.html" );  
    }
});

app.post('/signup', urlencodedParser, async function (req, res) {  
  try {
    var code = getRandomString(6);
    await client.connect();
    const database = client.db("sample_mern");
    const haiku = database.collection("haiku");
     const {_name, _email, _password} = req.body;
     const query = { email:_email};
     if (!(_name && _email && _password)) {
      res.status(400).send("All input is required");
    } 
    const options = {
      projection: { _id: 0, name: 1, email: 1 ,pass:1},
    };
    const oldUser = await haiku.findOne(query, options);
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }
    const doc = {
      name: _name,
      email: _email,
      pass: _password,
      activation:0,
      activation_pass:code,
    }
    const result = await haiku.insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
    await email('<a href="https://mypalash.herokuapp.com/activation/'+_name+'/'+_email+'/signup/'+code+'" target="_blank" rel="noopener noreferrer">CLICK ME TO ACTIVATE YOUR ACCOUNT!</a>',_email);
    res.render('account_activation', {name:_name,email:_email});
    } catch (err) {
    console.log(err);
  }
  finally {
     client.close();
  }

}) 


app.get('/activation/:userId/:userEmail/signup/:code',async function (req, res) {
try {
    await client.connect();
    const database = client.db("sample_mern");
    const haiku = database.collection("haiku");
    const query = {email:req.params['userEmail']};
    const options = {
      projection: { _id: 1, name: 1, email: 1 ,pass:1,activation:1,
      activation_pass:1},
    };
    const oldUser = await haiku.findOne(query, options);
    if (oldUser) {
      
      if (req.params['code']==oldUser.activation_pass) {

          var myquery = {email:req.params['userEmail']};
          var newvalues = { $set: {activation:1} };
          await haiku.updateOne(myquery, newvalues);
         return res.render('congrats');
      } else {
        return res.send("Invalid Link");
      }
    }
   else{
    return res.send("Invalid Link");
   }   } catch (err) {
    console.log(err);
  }
  finally {
     client.close();
  }
})




app.post('/login', urlencodedParser, async function (req, res) {  
   try {
    await client.connect();
    const database = client.db("sample_mern");
    const haiku = database.collection("haiku");
     const {email_, password_} = req.body;
     console.log(email_+password_);
     const query = {email:email_};
     if (!(email_ && password_)) {
      res.status(400).send("All input is required");
    } 
     const options = {
      projection: { _id: 1, name: 1, email: 1 ,pass:1,activation:1,
      activation_pass:1},
    };
    const oldUser = await haiku.findOne(query, options);
    if (oldUser&&oldUser.activation==1) {
      if (oldUser.email==email_&&oldUser.pass==password_){
        session=req.session;
        session.userid=email_;
        session.username=oldUser.name;
        console.log(req.session);
        res.redirect('/');
      }
      else{
        res.send("Email or Password wrong!");
      }
    }
    else{
      res.send("Please Register");
    }
    
    } catch (err) {
    console.log(err);
  }
  finally {
     client.close();
  } 
}) 




app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});

const port = process.env.PORT || 8000;
var server = app.listen(port, function () {  
  var host = server.address().address  
  var port = server.address().port  
  console.log("Example app listening at http://%s:%s", host, port || process.env.PORT)  
})  