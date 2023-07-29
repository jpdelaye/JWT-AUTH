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




app.post("/auth", async (req, res) => {
     
  try {
    // Get user input
    const { email, password } = req.body;


    // Validate user input
    if (!(email && password)) {
      return  res.status(400).send("All input is required");
    }
   
   
    let user = await findOne(email)
   

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
     

      const accessToken = generateAccessToken(user)
    
      res.header("x-access-token", accessToken)
      res.cookie('accessToken', accessToken);
      res.redirect("/api");
   
    }else{     
      return res.status(400).send("Invalid Credentials");
    }
    } catch (err) {
      console.log(err);
    }

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


