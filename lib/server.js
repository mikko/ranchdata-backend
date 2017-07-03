'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('../package');
const CookieAuth = require('hapi-auth-cookie');
const ApikeyAuth = require('./plugins/auth-apikey');
const _ = require('lodash');
const Path = require('path');
const User = require('./models/user');

let serverOptions = {};
if (process.env.NODE_ENV !== 'production') {
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

const swaggerOptions = {
    info: {
        'title': 'Ranchdata API documentation',
        'version': Pack.version,
    }
};

// const socketIO = require('socket.io');

const start = function(port, routes) {

    server.connection({
        port: port
    });

    server.register([
        Inert,
        Vision,
        {
            'register': HapiSwagger,
            'options': swaggerOptions
        }], () => {});

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
    server.register(CookieAuth, function () {

        server.register(ApikeyAuth, apikeyErr => {
            if (apikeyErr) {
                console.log(apikeyErr);
            }

            const validate = (request, token, cb) => {
                User.getUserIdByApiKey(token)
                    .then(userId => {
                        cb(null, true, {userId});
                    })
                    .catch(err => {
                        cb(err, false);
                    });
            };

            server.auth.strategy('apikey', 'queryToken', {validate});

            const pwd = _.range(50).map(() => (Math.random() * 10).toFixed(0)).join('');

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
