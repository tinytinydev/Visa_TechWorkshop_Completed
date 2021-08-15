//Run this file to test

const fs = require("fs");
const https = require("https");
const message = {from:"bankA",to:"bankB"};

const server_addr = "server.visa.io";
const port = 3001;

var username = 'testUser';
var password = 'Visa@SmuTechSeries2021';
var auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

const req = https.request(
  {
    host: server_addr,
    port: port,
    path: "/payment/push",
    data: JSON.stringify(message),
    method: "POST",
    ca: [
        fs.readFileSync(`./certs/server-ca-crt.pem`) //Server Certification Authority
    ],
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(JSON.stringify(message)),
      "Authorization": auth
    }
  },
  function(response) {

    if (response.statusCode !== 200) {
        console.log(`Basic Authentication Failed! Please try again`);
        console.log();
        return;
    } 
    {
        console.log();
        console.log("===== Basic Authentication Success ! =====");
        console.log("Response Status Code: ", response.statusCode);
        console.log(
            "Server Host Name: " + response.socket.getPeerCertificate().subject.CN
        );
    }

    let body = ''
    response.on('data',function(chunk){
      body += chunk;
    });
    response.on('end',()=>{
      console.log(body);
      console.log();
    })
  }
);



//DO NOT MODIFY CODES BELOW
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

req.write(JSON.stringify(message));