//Hands on Exercise is adapted from https://www.matteomattei.com/client-and-server-ssl-mutual-authentication-with-nodejs/ 

const fs = require("fs");
const https = require("https");
const message = {from:"bankA",to:"bankB"};

const server_addr = "server.visa.io";
const port = 3001;

const req = https.request(
  {
    host: server_addr,
    port: port,
    secureProtocol: "TLSv1_2_method",
    //Modify START
    //Configure your certificate options here
    /**
     * Hint: You will need a Private Key, Public Key (Cert) and Server's Certification Authority Cert to send the request
     * You can also test with the unauthorized certs to make sure an unauthorized client is not able to access the server
     * Possible fields in RequestOptions: http://definitelytyped.org/docs/node--node-0.8.8/interfaces/https.requestoptions.html
     **/
    //Modify END
    key: fs.readFileSync(`./certs/client-key.pem`), //You will want to put client's secret key here (Private)
    cert: fs.readFileSync(`./certs/client-crt.pem`), //This area is for Client Cert (Public)
    ca: [
      fs.readFileSync(`./certs/server-ca-crt.pem`) //Server Certification Authority
    ],
    //Modify END
    path: "/payment/push",
    data: JSON.stringify(message),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(JSON.stringify(message))
    }
  },
  function(response) {
    console.log();
    console.log("===== Mututal Authentication Success ! =====");
    console.log("Response Status Code: ", response.statusCode);
    console.log(
      "Server Host Name: " + response.socket.getPeerCertificate().subject.CN
    );
    if (response.statusCode !== 200) {
      console.log(`Wrong status code`);
      return;
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