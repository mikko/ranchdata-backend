'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();

const start = function(port, routes) {

    server.connection({
        port: port
    });

    routes.forEach(route => {
        server.route(route);
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
