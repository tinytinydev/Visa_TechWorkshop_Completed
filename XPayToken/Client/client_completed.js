//HINT: https://developer.visa.com/pages/working-with-visa-apis/x-pay-token 
//Reading this documentation will greatly help you in solving this!
//Only modify codes from Line 20 to Line 22

/** DO NOT CHANGE THIS START*/
//LIBRARY IMPORTS
const fs = require("fs");
const https = require("https");
const crypto = require('crypto');  

//CONSTANTS FOR X-PAY-TOKEN
const timestamp = Math.floor(Date.UTC(2021,9,3) / 1000); 
const resourcePath = "/payment/push"
const postBody = {from:"bankA",to:"bankB"};
const queryParams = "apikey=VmlzYUBTbXVUZWNoU2VyaWVzMjAyMQ==";
const sharedSecret = "TechSeries@Smu";
/** DO NOT CHANGE THIS END */

/** Modify START */
var preHashString = timestamp + resourcePath + queryParams + JSON.stringify(postBody);  //Concatenate all the required fields togethers
var hashString = crypto.createHmac('SHA256', sharedSecret).update(preHashString).digest('hex');   //Using crypto library to generate a SHA256 HMAC value  
var xPayToken = 'xv2:' + timestamp + ':' + hashString ;
/** Modify END */

//DO NOT MODIFY CODES BELOW FROM HERE ONWARDSS
const server_addr = "server.visa.io";
const port = 3001;

const req = https.request(
  {
    host: server_addr,
    port: port,
    path: resourcePath + "?" + queryParams,
    data: JSON.stringify(postBody),
    method: "POST",
    ca: [
        fs.readFileSync(`./certs/server-ca-crt.pem`) //Server Certification Authority
    ],
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(JSON.stringify(postBody)),
      "X-PAY-TOKEN": xPayToken
    }
  },
  function(response) {

    console.log("Generated Pre Hash Message: " + preHashString);
    console.log("Generated X-Pay-Token: " + xPayToken);

    if (response.statusCode !== 200) {
        console.log(`XPayToken Authentication Failed! Please try again`);
        console.log();

        let body = ''
        response.on('data',function(chunk){
          body += chunk;
        });
        response.on('end',()=>{
          console.log(body);
          console.log();
        })

        return;
    } 
    {
        console.log();
        console.log("===== XPayToken Authentication Success ! =====");
        console.log("Response Status Code: ", response.statusCode);
        console.log(
            "Server Host Name: " + response.socket.getPeerCertificate().subject.CN
        );
    }


  }
);

req.on("socket", function(socket) {
  socket.on("secureConnect", function() {
    if (socket.authorized === false) {
      console.log(`SOCKET AUTH FAILED ${socket.authorizationError}`);
    }
    console.log("");
  });
});

req.on("error", function(err) {
  console.log(`TLS Socket ERROR (${err})`);
  req.end();
  return;
});

req.write(JSON.stringify(postBody));