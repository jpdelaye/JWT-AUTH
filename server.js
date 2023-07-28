const express = require('express')
const app = express()
const port = 3000
//const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cookieParser = require('cookie-parser')

app.use(express.urlencoded({extended: false}))
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
 
app.get('/', (req, res) => {
  res.setHeader('Content-type', 'text/html')
  res.sendFile( __dirname + "/index.html")
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
        return jwt.sign(user, process.env.TOKEN_KEY,{expiresIn: "2m"}) 
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

      res.sendFile( __dirname + "/welcome.html")

    
  })
