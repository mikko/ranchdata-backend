'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const CookieAuth = require('hapi-auth-cookie');
const _ = require('lodash');
const Path = require('path');

let serverOptions = {};
if (true) {
    const frontendPath = Path.join(__dirname, '..', 'node_modules', 'ranchdata-frontend');
    serverOptions = {
        connections: {
            routes: {
                files: {
                    relativeTo: frontendPath
                }
            }
        }
    };
}

const server = new Hapi.Server(serverOptions);


// const socketIO = require('socket.io');

const start = function(port, routes) {

    server.connection({
        port: port
    });

    server.register(Inert, () => {});

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: '.',
                redirectToSlash: true,
                index: true
            }
        }
    });

    // register plugins to server instance
    server.register(CookieAuth, function (err) {

        const pwd = _.range(50).map(i => (Math.random() * 10).toFixed(0)).join("");
        console.log("Cookie password", pwd);

        const cookieOptions = {
            password: pwd,
            cookie: 'ranchsid',
            isSecure: false
        };

        server.auth.strategy('session', 'cookie', cookieOptions);

        routes.forEach(route => {
            server.route(route);
        });

        server.start(err => {
            if (err) {
                throw err;
            }
            console.log('Server running', server.info.uri);
        });
    });
};

/*
const startSocket = function() {
    const io = socketIO(server.listener);
    io.on('connection', socket => {
        console.log('Socket connection initiated');
        socket.emit('HELO');
    });
};
*/
module.exports = {
    start
};
