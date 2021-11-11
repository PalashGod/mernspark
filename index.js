var express = require('express');  
var app = express();  
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser'); 
const {MongoClient} = require('mongodb');
var urlencodedParser = bodyParser.urlencoded({ extended: false }) 
app.set('views', './views'); 
// Set EJS as templating engine
app.set('view engine', 'ejs');

const uri = "mongodb+srv://Demo:Demopass@cluster0.pdzgr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";


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
async function signup(a,b,c) {
  try {
    await client.connect();
    const database = client.db("sample_mern");
    const haiku = database.collection("haiku");

    const doc = {
      name: a,
      email: b,
      pass: c,
    }
    const result = await haiku.insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);

  } finally {
    await client.close();
  }
}


async function signin(a,b) {
  try {
    await client.connect();
    const database = client.db("sample_mern");
    const haiku = database.collection("haiku");
    const query = { email:a,pass:b};
    const options = {
      projection: { _id: 0, name: 1, email: 1 ,pass:1},
    };
    const info = await haiku.findOne(query, options);
    if (info.email==a&info.pass==b) {

      return("Found");
    } else {

        return("Not Found");
    }
  } 

catch(err) {
  return("Not Found");
} 

  finally {
    await client.close();
  }
}

//signin("palash.emperor7@gmail.com","paswrd").catch(console.dir);
//

app.get('/', function (req, res) {  
   res.sendFile( __dirname + "/" + "index.html" );  
})

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
    await email('<a href="google.com/activation/'+_name+'/'+_email+'/signup/'+code+'">CLICK ME TO ACTIVATE YOUR ACCOUNT!</a>',_email);
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

        return res.send("Account Activated");
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




app.post('/process_post_login', urlencodedParser, function (req, res) {  
   response = {  
       email:req.body.email_,
       password:req.body.password_   
   };  
     
   //signin(req.body.email_,req.body.password_).catch(console.dir);
   console.log(signin(req.body.email_,req.body.password_));
   res.send('<p>some html</p>');
   //res.end(JSON.stringify(response));  
}) 


const port = process.env.PORT || 8000;
var server = app.listen(port, function () {  
  var host = server.address().address  
  var port = server.address().port  
  console.log("Example app listening at http://%s:%s", host, port || process.env.PORT)  
})  