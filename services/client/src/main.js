var express = require('express');
var bodyParser = require('body-parser');

(function(){
    'use strict';

    //Configurations for http server
    var httpServerPort = 3000;

    var SERVICE_NAME = process.env.SERVICE_NAME;

    //___________________________________________________________________________________________________
    //===================================================================================================
    function createHttpServer()
    {
        var app = express();
        app.use(bodyParser.json());

        //Enable CORS
        app.all('/*', function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
            res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
            next();
        });


        app.get('/', function (req, res) {
            res.send({ 'service': SERVICE_NAME });
        });

        app.post('/api/message', function (req, res) 
        {
            var data = req.body;
            
            console.log(`Message received: ${data.message}` );

            res.send("Message received");
        });

        app.listen(httpServerPort);
        console.log("App listening on port " + httpServerPort);
    }
    //===================================================================================================
    
    createHttpServer();

})();