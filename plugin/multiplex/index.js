var http        = require('http');
var express		= require('express');
var fs			= require('fs');
var io			= require('socket.io');
var crypto		= require('crypto');
var app       	= express();
var cookieParser = require('cookie-parser');
var QuestionManager = require('../polls/questionManager');
var SpreadSheetManager = require('../polls/spreadSheetManager');
require('dotenv').load();
var userResponses = {};
var lastStates = {};
var pollResults = {};
var examConfig = JSON.parse(fs.readFileSync('../../examConfig.json', 'utf8'));
console.log
var spreadSheetManager = new SpreadSheetManager(process.env.GOOGLE_CREDENTIALS_PATH, process.env.SPREADSHEET_ID);
var questionManager =  new QuestionManager(examConfig);
// need cookieParser middleware before we can do anything with cookies
app.use(cookieParser());

// set a cookie
app.use(function (req, res, next) {
  // check if client sent cookie
  var cookie = req.cookies.uuid;
  if (cookie === undefined)
  {
    // no: set a new cookie
    var randomNumber=Math.random().toString();
    randomNumber=randomNumber.substring(2,randomNumber.length);
    res.cookie('uuid',randomNumber, { maxAge: 1000 * 60 * 60 * 24 * 331, httpOnly: false });
  } 
  next(); // <-- important!
});

var staticDir 	= express.static;
var server    	= http.createServer(app);

io = io(server);

var opts = {
	port: process.env.PORT || 1948,
	baseDir : __dirname + '/../../'
};

io.on( 'connection', function( socket ) {

	for(var socketId in lastStates){
		socket.emit(socketId, lastStates[socketId]);
	}
	socket.on('multiplex-statechanged', function(data) {
		if (typeof data.secret == 'undefined' || data.secret == null || data.secret === '') return;
		if (createHash(data.secret) === data.socketId) {
			data.secret = null;
			lastStates[data.socketId] = data;
			socket.broadcast.emit(data.socketId, data);
		};
	});
	socket.on('pollResponse', function(data){
		if(data.uuid){
			userResponses[data.uuid] = userResponses[data.uuid] || {};
			if(!userResponses[data.uuid][data.id]){
				userResponses[data.uuid][data.id] = data;
				try{
					data.responseValue = questionManager.getQuestionValue(data);
				}catch(e){
					data.responseValue = "ERROR";
				}
				
				spreadSheetManager.addUserValue(data.uuid, data.id, data.responseValue);
				fs.appendFileSync(process.env.RESULTS_PATH, JSON.stringify({
					id:data.id,
					uuid: data.uuid,
					responseValue:data.responseValue
				})+ "\n");
				if(pollResults[data.id]){
					pollResults[data.id].responseValue += data.responseValue;
					pollResults[data.id].numResponses++;
				}else{
					pollResults[data.id] = {};
					pollResults[data.id].responseValue = data.responseValue;
					pollResults[data.id].numResponses = 1;
				}
				socket.broadcast.emit('pollResults', pollResults);
				socket.emit('pollResults', pollResults);
				console.log('INSERT DATA:' + JSON.stringify(data));

			}else{
				console.log('QUESTION ALREADY ANSWER');
			}
		}
	});
});

[ 'css', 'js', 'plugin', 'lib', 'res' ].forEach(function(dir) {
	app.use('/' + dir, staticDir(opts.baseDir + dir));
});

app.get("/", function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});

	var stream = fs.createReadStream(opts.baseDir + '/index.html');
	stream.on('error', function( error ) {
		res.write('<style>body{font-family: sans-serif;}</style><h2>reveal.js multiplex server.</h2><a href="/token">Generate token</a>');
		res.end();
	});
	stream.on('readable', function() {
		stream.pipe(res);
	});
});

app.get("/token", function(req,res) {
	var ts = new Date().getTime();
	var rand = Math.floor(Math.random()*9999999);
	var secret = ts.toString() + rand.toString();
	res.send({secret: secret, socketId: createHash(secret)});
});

var createHash = function(secret) {
	var cipher = crypto.createCipher('blowfish', secret);
	return(cipher.final('hex'));
};

// Actually listen
server.listen( opts.port || null );

var brown = '\033[33m',
	green = '\033[32m',
	reset = '\033[0m';

console.log( brown + "reveal.js:" + reset + " Multiplex running on port " + green + opts.port + reset );