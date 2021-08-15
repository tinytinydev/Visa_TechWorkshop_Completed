//Hands on Exercise is adapted from https://www.matteomattei.com/client-and-server-ssl-mutual-authentication-with-nodejs/ 

const fs = require("fs");
const https = require("https");

var express = require('express')
var app = express()
const server_addr = "server.visa.io";

app.use(express.json());

const options = {
  key: fs.readFileSync(`./certs/server-key.pem`),
  cert: fs.readFileSync(`./certs/server-crt.pem`),
  ca: [
    fs.readFileSync(`./certs/client-ca-crt.pem`)
  ],
  requestCert: true,
  rejectUnauthorized: true
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
    let from = req.body.from;
    let to = req.body.to;
    let amount = req.body.amount;
    console.log();
    console.log("===== Mututal Authentication Success ! =====");
    console.log();
    res.send({"status":"Push Payment from " + from + " to "+ to + " Success!"})
});
