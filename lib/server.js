'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();

const start = function(port) {

    server.connection({
        port: port
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (req, reply) => {
            reply('<h1>KUKKUU!</h1>');
        }
    });

    server.start((err) => {
        if (err) {
            throw err;
        }
        console.log('Server running', server.info.uri);
    });
};

module.exports = {
    start: start
};
