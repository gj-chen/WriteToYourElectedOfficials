var civicInformationAPIKey = 'AIzaSyA7RIql1Et5R8mpe8AnPYm7dP_uz0plHrA'; 

var express = require('express'); 
	http = require('http'); 
	https = require('https'); 
	path = require('path'); 
	url = require('url');
	bodyParser = require('body-parser'); 
	request = require('request'); 
	rp = require('request-promise'); 
	cheerio = require('cheerio'); 
	XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest; 

var app = express(); 

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

var router = express.Router(); 

http.createServer(app).listen(process.env.PORT || 8080); 

router.use(function(req, res, next){
	console.log(req.method, req.url); 
	next(); 
});


router.get('/', function(req, res, next){
	res.sendFile(path.join(__dirname + '/index.html')); 
});

router.get('/sendParametersFromClient', function(req, res, next){
	//get parameters from client 
	var name = req.param('name'); 
	var address1 = req.param('address1'); 
	var address2 = req.param('address2');
	var city = req.param('city');
	var state = req.param('state'); 
	var zipcode = req.param('zipcode');

	var parameters = parseParameters(name, address1, address2, city, state, zipcode); 
	var baseURI = createGoogleApiGETURI(parameters)
	console.log(baseURI); 
 
	getCallToGoogleApi(baseURI, function(response){
		//check if response.statusCode == 200 or == 404 
		if(response.statusCode == 200){
			//parse and send to Lob Api 
			parseJSONResponse(response); 
		}else if(response.statusCode == 404){
			var noAddressFound = "No information for this address"; 
			res.send(noAddressFound); 
		}
	});
}); 

function parseJSONResponse(response){

}

function parseParameters(name, address1, address2, city, state, zipcode){
	var address1Tokens, address2Tokens, cityTokens, stateTokens, zipcodeTokens; 
	var parameterTokens = []; 

	if(address1.includes(' ')){
		address1Tokens = address1.split(' '); 
		for(i = 0; i < address1Tokens.length; i++){
			parameterTokens.push(address1Tokens[i]); 
		}
	}else{
		parameterTokens.push(address1);  
	}

	if(address2.includes(' ')){
		address2Tokens = address2.split(' '); 
		for(i = 0; i < address2Tokens.length; i++){
			parameterTokens.push(address2Tokens[i]); 
		}
	}else{
		if(address2)
		parameterTokens.push(address2);  
	}

	if(city.includes(' ')){
		cityTokens = city.split(' '); 
		for(i = 0; i < cityTokens.length; i++){
			parameterTokens.push(cityTokens[i]); 
		}
	}else{
		parameterTokens.push(city);  
	}

	if(state.includes(' ')){
		stateTokens = state.split(' '); 
		for(i = 0; i < stateTokens.length; i++){
			parameterTokens.push(stateTokens[i]); 
		}
	}else{
		parameterTokens.push(state);  
	}

	if(zipcode.includes(' ')){
		zipcodeTokens = zipcode.split(' '); 
		for(i = 0; i < zipcodeTokens.length; i++){
			parameterTokens.push(zipcodeTokens[i]); 
		}
	}else{
		parameterTokens.push(zipcode);  
	} 

	return parameterTokens; 
}

function createGoogleApiGETURI(parameters){
	var baseURI = "https://www.googleapis.com/civicinfo/v2/representatives?address="; 
	for(i = 0; i < parameters.length; i++){
		if(i != parameters.length - 1){
			//Format:
			//GET https://www.googleapis.com/civicinfo/v2/representatives?address=317+hart+senate+office+building+washington+dc&key={YOUR_API_KEY}
			baseURI = baseURI + parameters[i] + "+"
		}else{
			//last variable in parameter 
			baseURI = baseURI + parameters[parameters.length-1] + "&key=" + civicInformationAPIKey; 
		}
	}

	return baseURI; 
}

/*function get(url){
	return rp(url).then(function(response){
		return response; 
	}); 
}

function getCallToGoogleApi(baseURI){
	get(baseURI).then(function(response){
		console.log(response); 
		//parse to check if there is error 

	}); 
}*/

function getCallToGoogleApi(baseURI, callback){
	request({
		url: baseURI
	}, function(error, response, body){
		if(!error){
			callback(response); 
		}else{
			console.log('Error was found'); 
		}
	}); 
}

//app.get 
app.get('/', router);
app.get('/sendParametersFromClient', router); 