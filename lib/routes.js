'use strict';

const Joi = require('joi');
const sensorController = require('./controllers/sensorController');
const User = require('./models/user');
const Sensor = require('./models/sensor');
const Measurement = require('./models/measurement');

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
                    return User.getUserDetails(request.auth.credentials.userId)
                        .then(userDetails => {
                            console.log("User details", userDetails);
                            reply({
                                username: userDetails.username,
                                apiKey: userDetails.api_key
                            });
                        })
                        .catch(err => {
                            reply({});
                        });
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
                const username = request.payload.username;
                const password = request.payload.password;

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



                        reply();
                    })
                    .catch(err => {
                        console.log(err);
                        return reply(Boom.unauthorized('invalid credentials'));
                    });
            }
        }
    },
    {
        method: 'POST',
        path: `/${apiPrefix}/register`,
        config: {
            handler: function (request, reply) {
                const username = request.payload.username;
                const password = request.payload.password;

                User.createUser(username, password)
                    .then(userId => {
                        if (userId === undefined) {
                            return reply(Boom.badImplementation('Wat'));
                        }
                        console.log(username, 'registered', userId);
                        // if everything went smooth, set the cookie with "user" specific data
                        request.cookieAuth.set({userId: userId});
                        reply.redirect('/');
                    })
                    .catch(err => {
                        console.log(err);
                        return reply(Boom.badImplementation('No idea what happened'));
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
        path: `/${apiPrefix}/measurements/latest/{sensorId}`,
        config: {
            auth: 'session',
            handler: (request, reply) => {
                return Measurement.getLatestMeasurement(request.auth.credentials.userId, request.params.sensorId)
                    .then(measurement => {
                        reply(measurement);
                    })
                    .catch(err => {
                        reply(err);
                    });
            }
        }
    },
    {
        method: 'POST',
        path: `/${apiPrefix}/measurement`,
        config: {
            auth: 'apikey',
            handler: (request, reply) => {
                console.log(`Got measurement from user ${request.auth.credentials.userId}`);
                console.dir(request.payload);
                let payload = request.payload;
                sensorController.writeMeasurement(request.auth.credentials.userId, payload.sensor, payload.value);
                reply();
            },
            validate: {
                payload: {
                    sensor: Joi.string().required(),
                    value: Joi.number().required()
                }
            }


        }
    },
    {
        method: 'GET',
        path: `/${apiPrefix}/apikeyTest`,
        config: {
            auth: 'apikey',
            handler: (request, reply) => {
                reply(JSON.stringify(request.auth.credentials, null, 2));
            }
        }
    },
    {
        method: 'GET',
        path: `/${apiPrefix}/sensors`,
        config: {
            auth: 'session',
            handler: (request, reply) => {
                console.log(`User ${request.auth.credentials.userId} asked for a list of sensors`);
                return Sensor.getSensorsByUser(request.auth.credentials.userId)
                    .then(sensors => {
                        reply(sensors);
                    })
                    .catch(err => {
                        reply(err);
                    });
            }
        }
    },
    {
        method: 'POST',
        path: `/${apiPrefix}/sensor`,
        config: {
            handler: (request, reply) => {
                console.log('Adding new sensor');
                let payload = request.payload;
                let sensorName = payload.name;
                let sensorType = payload.type;
                reply(sensorController.registerSensor(sensorType, sensorName));
            }
        }
    }
];

module.exports = routes;
