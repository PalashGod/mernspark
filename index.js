var express = require('express');  
var app = express();  
var bodyParser = require('body-parser'); 
const {MongoClient} = require('mongodb');
var urlencodedParser = bodyParser.urlencoded({ extended: false }) 


const uri = "mongodb+srv://Demo:Demopass@cluster0.pdzgr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
 
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
    	console.log("Found");
    } else {
        console.log("Not Found");
    }
  } 

catch(err) {
  console.log("Not Found");
} 

  finally {
    await client.close();
  }
}

signin("palash.emperor7@gmail.com","passwrd").catch(console.dir);
//signup("Palash","palash.emperor7@gmail.com","password").catch(console.dir);

app.get('/', function (req, res) {  
   res.sendFile( __dirname + "/" + "index.html" );  
})

app.post('/process_post', urlencodedParser, function (req, res) {  
   response = {  
       name:req.body._name,  
       email:req.body._email,
       password:req.body._password   
   };  
signup(req.body._name,req.body._email,req.body._password).catch(console.dir);
   console.log(response);  
   res.end(JSON.stringify(response));  
}) 


app.post('/process_post_login', urlencodedParser, function (req, res) {  
   response = {  
       email:req.body.email_,
       password:req.body.password_   
   };  
   console.log(response);  
   signin(req.body.email_,req.body.password_).catch(console.dir);
   res.end(JSON.stringify(response));  
}) 


const port = process.env.PORT || 3000;
var server = app.listen(port, function () {  
  var host = server.address().address  
  var port = server.address().port  
  console.log("Example app listening at http://%s:%s", host, port || process.env.PORT)  
})  