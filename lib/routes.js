'use strict';

const sensorController = require('./controllers/sensorController');
const User = require('./models/user');

const Boom = require('boom');

const apiPrefix = 'api/v1';

const routes = [
    {
        method: 'GET',
        path: `/${apiPrefix}/userDetails`,
        config: {
            auth: {
                mode: 'try',
                strategy: 'session'
            },
            plugins: {
                'hapi-auth-cookie': {
                    redirectTo: false
                }
            },
            handler: function (request, reply) {
                if (request.auth.isAuthenticated) {
                    // session data available
                    var session = request.auth.credentials;
                    return reply(session);
                }
                reply({});
            }
        }
    },
    {
        method: 'POST',
        path: `/${apiPrefix}/login`,
        config: {
            handler: function (request, reply) {
                var username = request.payload.username;
                var password = request.payload.password;


                User.getUserIdByUsernameAndPassword(username, password)
                    .then(userId => {
                        if (userId === undefined) {
                            return reply(Boom.unauthorized('invalid credentials'));
                        }
                        console.log(username, 'logged in', userId);

                        // check if user exists in DB
                        // compare passwords

                        // if everything went smooth, set the cookie with "user" specific data
                        request.cookieAuth.set({userId: userId});



                        reply.redirect('/');
                    })
                    .catch(err => {
                        console.log(err);
                        return reply(Boom.unauthorized('invalid credentials'));
                    });
            }
        }
    },
    {
        method: 'GET',
        path: `/${apiPrefix}/logout`,
        config: {
            auth: 'session',
            handler: function (request, reply) {
                // clear the session data
                console.log('User logged out');
                request.cookieAuth.clear();
                reply.redirect('/');
            }
        }
    },
    {
        method: 'GET',
        path: `/${apiPrefix}/measurements`,
        config: {
            handler: (req, reply) => {
                reply([1,2,3]);
            }
        }
    },
    {
        method: 'POST',
        path: `/${apiPrefix}/measurement`,
        config: {
            handler: (req, reply) => {
                console.log('Measurement got');
                console.dir(req.payload);
                let payload = req.payload;
                sensorController.writeMeasurement(payload.sensorID, payload.type, payload.value);
                reply();
            }
        }
    },
    {
        method: 'GET',
        path: `/${apiPrefix}/apikeyTest`,
        config: {
            auth: 'apikey',
            handler: (req, reply) => {
                reply(JSON.stringify(req.auth.credentials, null, 2));
            }
        }
    },
    {
        method: 'POST',
        path: `/${apiPrefix}/sensor`,
        config: {
            handler: (req, reply) => {
                console.log('Adding new sensor');
                let payload = req.payload;
                let sensorName = payload.name;
                let sensorType = payload.type;
                reply(sensorController.registerSensor(sensorType, sensorName));
            }
        }
    }
];

module.exports = routes;
