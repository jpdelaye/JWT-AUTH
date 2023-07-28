const express = require('express')
const app = express()
const port = 3000
//const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

app.use(express.urlencoded({extended: false}))
app.use(express.json({ limit: "50mb" }));

app.get('/', (req, res) => {
  res.send(`
<form class="form-horizontal" method="POST" action="/auth">
<fieldset>

<!-- Form Name -->
<legend>auth</legend>

<!-- Text input-->
<div class="form-group">
  <label class="col-md-4 control-label" for="USER">USER</label>  
  <div class="col-md-4">
  <input id="username" name="username" type="text" placeholder="" class="form-control input-md">
    
  </div>
</div>

<!-- Button -->
<div class="form-group">
  <label class="col-md-4 control-label" for="submit"></label>
  <div class="col-md-4">
    <input   type="submit" class="btn btn-primary" value="enviar"> 
  </div>
</div>

</fieldset>
</form>

  `)
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
       
      res.header("x-access-token", accessToken).json({ message: "usuario auth", token : accessToken})
      //res.status(200).json(user);
       //res.status(400).send("Invalid Credentials");
       //console.log(JSON.stringify(req.headers))
  });
  
  function generateAccessToken(user){ 
        return jwt.sign(user, process.env.TOKEN_KEY,{expiresIn: "2m"}) 
  
  }

  function verifyToken(req, res, next){
     
    const accessToken  = req.body.accessToken || req.query.accessToken || req.params.accessToken || req.headers["x-access-token"];


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
    res.send('welcome');
  })