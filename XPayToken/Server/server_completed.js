const fs = require("fs");
const https = require("https");
const crypto = require('crypto');  

var express = require('express');
const { json } = require("body-parser");
var app = express()
const server_addr = "server.visa.io";

const sharedSecret = "TechSeries@Smu";
const acceptedApiKey = "VmlzYUBTbXVUZWNoU2VyaWVzMjAyMQ==" //This should be unique to the user's account/identity. This is const for simulation purpose.


app.use(express.json());

const options = {
  key: fs.readFileSync(`./certs/server-key.pem`),
  cert: fs.readFileSync(`./certs/server-crt.pem`)
};

https
  .createServer(options,app)
  .listen(3001,()=>{
    console.log(`Example app listening at https://${server_addr}:3001`)
  });

app.get('/hello', function (req, res) {
    res.writeHead(200);
    res.end("hello world\n");
});

app.post('/payment/push', function (req, res) {

    if(req.headers["x-pay-token"] != null){
      
      /** MODIFY START */
      let apiKey = req.query.apikey
      let xPayToken = req.headers["x-pay-token"]
      let timeStamp = xPayToken.split(":")[1]
      let sharedMessage = xPayToken.split(":")[2] //OBTAIN the hashed message in the X-PAY-TOKEN
      /** MODIFY END */

      /**Generate Expected Hashed Message START**/
      let queryStr = "apikey=" + acceptedApiKey;
      var preHashString = timeStamp + "/payment/push" + queryStr + JSON.stringify(req.body);
      var expectedMessage = crypto.createHmac('SHA256', sharedSecret).update(preHashString).digest('hex');
      /**Generate Expected Hashed Message END**/

      console.log();
      console.log("Expected from Client: " + expectedMessage);
      console.log("Received from Client: " + sharedMessage);
      console.log();

      if(expectedMessage == sharedMessage && apiKey == acceptedApiKey){
        console.log();
        console.log("===== XPayToken Authentication Success ! =====");
        console.log();

        let from = req.body.from;
        let to = req.body.to;
        let amount = req.body.amount;
        res.send({"status":"Push Payment from " + from + " to "+ to + " Success!"})
      }

      else{
        console.log();
        console.log("XPayToken Authentication failed. Please try again.");
        console.log();

        res.status(400);
        res.send({status:"unauthorized", message: "Invalid X-PAY-TOKEN"})
      } 
    }else{
        console.log();
        console.log("XPayToken Authentication failed. Please try again.");
        console.log();

        res.status(400);
        res.send({status:"unauthorized", message: "X-PAY-TOKEN not found on request header"})
    }


});
