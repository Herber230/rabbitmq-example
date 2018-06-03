#!/usr/bin/env node
var amqp = require('amqplib/callback_api');

(function(){
    'use strict';

    //Configurations for broker 
    var brokerHost = 'broker';
    var timeToRetryBroker = 2000;
    var queue = 'mainQueue';

    //___________________________________________________________________________________________________
    //===================================================================================================

    function connectToBroker ()
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
                    
                    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
                    ch.consume(queue, function(msg) {
                        console.log(" [x] Received %s", msg.content.toString());

                        var messageData = JSON.parse(msg.content);
                        sendMessageToClient(messageData.destination, messageData.message);

                    }, {noAck: true});
                }
                else
                    setTimeout( ()=>{ channelCreation(connection) }, timeToRetryBroker);
            });
        };

        connect();
    }

    //===================================================================================================
    
    
    //___________________________________________________________________________________________________
    //===================================================================================================

    function sendMessageToClient(client, message)
    {
        var http = require("http");
        
        var options = {
            hostname: client,
            port: 3000,
            path: '/api/message',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        var req = http.request(options, function(res) 
        {
            // console.log('Status: ' + res.statusCode);
            // console.log('Headers: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (body) {
                // console.log('Body: ' + body);
            });
        });
        
        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
        
        // write data to request body
        req.write('{"message": "' + message + '"}');
        req.end();
    }

    //===================================================================================================
    
    connectToBroker();

})();