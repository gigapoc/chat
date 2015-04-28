/** NODE.JS REQUIREMENTS **/

// Create Express app
var express = require('express');
var app = express();

// Get the http server created by Express
var http = require('http').createServer(app);
// Load socket.io
var io = require('socket.io')(http);

/****/


/** SERVER CONFIGURATION **/

// Serve / 
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

// Serve static pages from the html directory
app.use('/', express.static(__dirname + '/'));
app.use('/libs', express.static(__dirname + '/libs'));

var clientsConnected = 0;
// var messages = [];
var clients = { "127.0.0.1" : "Bruno",
                "129.175.5.39" : "Bruno",
                "129.175.5.34" : "Mattias",
		"129.175.30.73" : "Marie" };

// Listen to socket connections
io.on('connection', function(client) {
    clientsConnected++;

    var address = client.handshake.address;
    if(clients[address] === undefined) {
        console.log("Unknown user : " + address);
    }
    
    // warn other users of a new connection
    client.broadcast.emit("connection", { clientsConnected : clientsConnected, name : clients[address] });
    
    // update clients connected number
    client.emit("update", { clientsConnected : clientsConnected, name : clients[address] });
    
    // called when the client leaves the page
    client.on("disconnection", function(name) {
        clientsConnected--;
        client.broadcast.emit("disconnection", { name: name, clientsConnected: clientsConnected });
    });
    
    // send chat message
    client.on('message', function(data) {
        // console.log(data);
        // messages[messages.length] = data.from + " : " + data.msg;
        var date = new Date();
        data["date"] = date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear() + " " + date.getHours() + "h" + date.getMinutes();
        client.broadcast.emit("message", data);
    });
});


io.on('disconnection', function() {
    // should delete all created files
});

// Start the server (NOTE: user http.listen, NOT app.listen!!)
var server = http.listen(8080, function () {
    console.log('Server listening at http://localhost:%s', server.address().port);
});

/****/



/** FUNCTIONS DECLARATIONS **/
