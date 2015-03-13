#!/usr/bin/env node

var path            = require("path"),
	juicer          = require('juicer'),
	config          = require( path.join(__dirname,"./config.json") ),
	fs              = require("fs"),
	WebSocketServer = require('ws').Server,
	express         = require("express"),
	color           = require("colorful"),
	ip              = require("./util/ip"),
	qrcode          = require('qrcode-terminal');

var appListenPort = config.DEFAULT_PORT,
	wsPort        = config.DEFAULT_WEBSOCKET_PORT;

var app, wss;

//web server
app = express(),
app.set('view options', {pretty: false});
app.set('view engine', 'html');
app.set('views', path.join(__dirname,'/web/views'));
app.engine('html', function(path, options, fn){
    fs.readFile(path, 'utf8', function(err, str){
        if (err) return fn(err);
        str = juicer(str, options);
        fn(null, str);
    });
});

app.get("/",function(req,res){
	res.render("index.html",{ wsPort : wsPort });
});

app.use(express.static(path.join(__dirname,'/web/static')));
app.listen(appListenPort);


//web socket
wss = new WebSocketServer({ port: wsPort });
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client){
    	try{
	    	client.send(data);
    	}catch(e){
    		console.log("[reflector] fail to forward data");
    	}
	});
};

var myIpAddress = ip.address("private","ipv4"),
	serverUrl   = "http://" + myIpAddress + ":" + appListenPort;


//print tip and qr
var tipText = "";
tipText += "[reflector] http service started at port " + appListenPort + "\n";
tipText += "[reflector] web interface : " + serverUrl + "\n";

if(ip.isLoopback(myIpAddress)){
	tipText += "[reflector] this may be a loopback address which couldn't be visited on other devices. Try to find out the right one by your own";
}

qrcode.generate(serverUrl, function (qrcode) {
    console.log(qrcode);
    console.log(color.green(tipText));
});


//deal new data
function dealNewStdData(data){
	//print to stdout
	process.stdout.write(data);

	//forward to http server
	wss && wss.broadcast(data);
}


//forward std input
process.stdin.setEncoding('utf8');
process.stdin.on('readable', function() {
	var chunk = process.stdin.read();
	if (chunk !== null) {
		dealNewStdData(chunk);
	}
});

process.stdin.on('end', function() {
	process.stdout.write('end');
	process.exit();
});