var amqp = require('amqplib/callback_api');
var express = require('express');
var bodyParser = require('body-parser');

(function(){
    'use strict';

    //Configurations for broker 
    var brokerHost = 'broker';
    var timeToRetryBroker = 2000;
    var queue = 'mainQueue';

    //Configurations for http server
    var httpServerPort = 3000;

    //Main Scope Variables
    var sendMessage;

    //___________________________________________________________________________________________________
    //===================================================================================================
    function connectToBrocker()
    {
        function connect ( )
        {
            amqp.connect('amqp://' + brokerHost, function(err, conn) 
            { 
                if (!err)
                {
                    console.log('Broker connection established');
                    channelCreation( conn )
                }
                else
                    setTimeout( ()=> { console.log('Retrying connect...'); connect(); }, timeToRetryBroker )
            });
        };
            

        function channelCreation (connection)
        {
            connection.createChannel(function(err, ch) 
            {
                if (!err)
                {
                    console.log('Chanel created');
                    ch.assertQueue(queue, {durable: false});

                    sendMessage = (msg) => {
                        ch.sendToQueue(queue, new Buffer(JSON.stringify(msg)));
                        console.log(" [x] Sent %s", JSON.stringify(msg));
                    };                    
                }    
                else
                    setTimeout( ()=> { channelCreation(connection) }, timeToRetryBroker );
            });
        };

        connect();
    }
    //===================================================================================================
    

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
            res.send({ 'service': 'api-producer' });
        });

        app.post('/api/send-message', function (req, res) 
        {
            var data = req.body;
            var responseAlreadyMade = false;

            var sendResponse = (messageResponse) => {
                responseAlreadyMade = true;
                res.send({ 'message': messageResponse });
            };

            if ( data instanceof Array)
            {
                if (data.length > 0)
                {
                    for (var m of data)
                    {
                        sendMessage({
                            'destination': m.destination,
                            'message': m.message
                        });
                    }
                
                    sendResponse('Many messages sent');
                }
            }
            else
            {
                sendMessage({
                    'destination': data.destination,
                    'message': data.message
                });

                sendResponse('One message sent');
            }
        
            if (!responseAlreadyMade)
                sendResponse('No message sent');
        });

        app.listen(httpServerPort);
        console.log("App listening on port " + httpServerPort);
    }
    //===================================================================================================
    

    connectToBrocker();
    createHttpServer();

})();