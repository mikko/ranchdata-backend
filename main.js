'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();


server.connection({ port: 3000 });

server.route({
    method: 'GET',
    path: '/',
    handler: (req, reply) => {
        reply('<h1>KUKKUU!</h1>');
    }
})

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running', server.info.uri);
});
