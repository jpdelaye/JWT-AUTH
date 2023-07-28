const express = require('express')
const app = express()
const port = 3000
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var mysql = require('mysql');
require("dotenv").config();
const con = require("./config/database")
const cookieParser = require('cookie-parser')

app.use(express.urlencoded({extended: false}))
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

 

 
app.get('/', (req, res) => {
  res.setHeader('Content-type', 'text/html')
  res.sendFile( __dirname + "/index.html")
})



app.get('/login', (req, res) => {
  res.setHeader('Content-type', 'text/html')
  res.sendFile( __dirname + "/login.html")
})

app.get('/register', (req, res) => {
  res.setHeader('Content-type', 'text/html')
  res.sendFile( __dirname + "/register.html")
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})




app.post("/auth",  (req, res) => {
     
      // Get user input
      const { username, password } = req.body;
    
      // Validate if user exist in our database
      const user = {username : username}
  
      const accessToken = generateAccessToken(user)
    
      res.header("x-access-token", accessToken)
      res.cookie('accessToken', accessToken);
      res.redirect("/api");
     
      
  });
  
  function generateAccessToken(user){ 
        return jwt.sign({username: user}, process.env.TOKEN_KEY,{expiresIn: "2m"}) 
  }

  function verifyToken(req, res, next){
     
    //const accessToken  = req.body.accessToken || req.query.accessToken || req.params.accessToken || req.headers["x-access-token"];

    const accessToken  = req.cookies.accessToken

      if (!accessToken) {
       return res.status(403).send("A token is required for authentication");
     }
    
      // req.user = decoded;
      jwt.verify(accessToken, process.env.TOKEN_KEY,(err, user) =>{
            if (err){
                return res.status(401).send("Invalid Token");
            }else{
            
                next();
            }
      })  
     
  }



  app.get('/api', verifyToken, (req, res) => {

      res.setHeader('Content-type', 'text/html')
      res.sendFile( __dirname + "/welcome.html")

    
  })



  app.post("/newuser", async (req, res) => {

    // Our register logic starts here
    try {
      // Get user input
      const { email, floatingPassword } = req.body;
  
      // Validate user input
      if (!(email && floatingPassword)) {
        res.status(400).send("All input is required");
      }
  
      // check if user already exist
      // Validate if user exist in our database
      const oldUser =  findOne({ email });
  
      if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }
  
      //Encrypt user password
      encryptedPassword = await bcrypt.hash(floatingPassword, 10);
  
      // Create user in our database
     
      var sql = "INSERT INTO users (id, username,password) VALUES ( null ,'"+email.toLowerCase()+"','"+encryptedPassword+"')";
      con.query(sql, function (err, result) {
        if (err) throw err;
         console.log("user created");
      });

  
      // Create token

      const accessToken = generateAccessToken(email.toLowerCase())
    
      res.header("x-access-token", accessToken)
      res.cookie('accessToken', accessToken);
   
    } catch (err) {
      console.log(err);
    }   
    
    res.redirect("/api");
    // Our register logic ends here
  });


  function findOne(email){
 
    con.query("SELECT * FROM users WHERE username = '"+email+"'", function (err, result) {
      if (err) throw err;

      return result 

    });
  
 
}