'use strict';

const Joi = require('joi');
const sensorController = require('./controllers/sensorController');
const User = require('./models/user');
const Sensor = require('./models/sensor');
const Measurement = require('./models/measurement');
const Journal = require('./models/journal');
const View= require('./models/view');

const Boom = require('boom');

const apiPrefix = 'api/v1';

const apikeyValidation = otherParams => Object.assign(otherParams || {}, {
    apikey: Joi
        .string()
        .required()
});

const optionalApikey = otherParams => Object.assign(otherParams || {}, {
    apikey: Joi
        .string()
});

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
                            console.log('User details', userDetails);
                            reply({
                                username: userDetails.username,
                                apiKey: userDetails.api_key
                            });
                        })
                        .catch(() => {
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

                        // if everything went smooth, set the cookie with 'user' specific data
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
                        // if everything went smooth, set the cookie with 'user' specific data
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
        path: `/${apiPrefix}/sensor/{sensorSerial}/latest`,
        config: {
            auth: {
                strategies: ['session',  'apikey']
            },
            handler: (request, reply) => {
                return Measurement.getLatestMeasurement(request.auth.credentials.userId, request.params.sensorSerial)
                    .then(measurement => {
                        reply(measurement);
                    })
                    .catch(err => {
                        reply(err);
                    });
            },
            description: 'Get measurement',
            notes: 'Returns the latest measurement value for a sensor',
            tags: ['api'],
            validate: {
                query: optionalApikey(),
                params: {
                    sensorSerial : Joi.string()
                        .required()
                        .description('sensor serial'),
                }
            }
        }
    },
    {
        method: 'GET',
        path: `/${apiPrefix}/sensor/{sensorSerial}/series`,
        config: {
            auth: {
                strategies: ['session',  'apikey']
            },
            handler: (request, reply) => {
                const queryParams = request.query;
                const rangeStart = queryParams.start;
                const rangeEnd = queryParams.end;

                return Measurement.getMeasurementsForRange(request.auth.credentials.userId,
                    request.params.sensorSerial,
                    rangeStart,
                    rangeEnd)
                    .then(measurements => {
                        reply(measurements);
                    })
                    .catch(err => {
                        reply(err);
                    });
            },
            validate: {
                query: optionalApikey({
                    start: Joi.string()
                        .isoDate()
                        .required()
                        .description('range start'),
                    end: Joi.string()
                        .isoDate()
                        .required().description('range end')
                }),
                params: {
                    sensorSerial : Joi.string()
                        .required()
                        .description('sensor serial'),
                },
                failAction: (req, repl, source, err) => {
                    console.log(err);
                }
            }
        }
    },
    {
        method: 'POST',
        path: `/${apiPrefix}/sensor/{sensorSerial}/measurement`,
        config: {
            auth: 'apikey',
            handler: (request, reply) => {
                console.log(`Got measurement from user ${request.auth.credentials.userId}`);
                console.dir(request.payload);
                const payload = request.payload;
                const value = payload.value;
                const timestamp = payload.timestamp;
                sensorController.writeMeasurement(request.auth.credentials.userId,
                    request.params.sensorSerial,
                    value,
                    timestamp)
                    .then(measurementId => reply(measurementId))
                    .catch(err => reply(err));
            },
            validate: {
                query: apikeyValidation(),
                payload: {
                    value: Joi.number().required(),
                    timestamp: Joi.string()
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
            },
            validate: {
                query: apikeyValidation()
            }
        }
    },
    {
        method: 'GET',
        path: `/${apiPrefix}/sensors`,
        config: {
            auth: {
                strategies: ['session',  'apikey']
            },
            handler: (request, reply) => {
                console.log(`User ${request.auth.credentials.userId} asked for a list of sensors`);
                return Sensor.getSensorsByUser(request.auth.credentials.userId)
                    .then(sensors => {
                        reply(sensors);
                    })
                    .catch(err => {
                        reply(err);
                    });
            },
            description: 'Get sensors',
            notes: 'Returns a list of sensors for user',
            tags: ['api'],
            validate: {
                query: optionalApikey()
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
    },
    {
        method: 'GET',
        path: `/${apiPrefix}/journalentries/relevant/{entryCount}`,
        config: {
            auth: 'session',
            handler: (request, reply) => {
                return Journal.getRelevantEntries(request.auth.credentials.userId, request.params.entryCount)
                    .then(entries => {
                        reply(entries);
                    })
                    .catch(err => {
                        reply(err);
                    });
            }
        }
    },
    {
        method: 'POST',
        path: `/${apiPrefix}/journalentry`,
        config: {
            auth: 'session',
            handler: (request, reply) => {
                console.log(`Adding new journal entry for user ${request.auth.credentials.userId}`);
                const payload = request.payload;
                const userId = request.auth.credentials.userId;
                Journal.createEntry(userId, payload.type, payload.message, payload.timestamp, payload.sensorId);
                reply();
            },
            validate: {
                payload: {
                    type: Joi.string().required(),
                    message: Joi.string().required(),
                    timestamp: Joi.string().required(),
                    sensorId: Joi.number(),
                }
            }
        }
    },
    {
        method: 'POST',
        path: `/${apiPrefix}/chore`,
        config: {
            auth: 'session',
            handler: (request, reply) => {
                const payload = request.payload;
                const userId = request.auth.credentials.userId;
                console.log(`Adding new journal entry for user ${request.auth.credentials.userId}`);
                console.log(JSON.stringify(payload, null, 2));
                reply();
            },
            validate: {
                payload: {
                    message: Joi.string().required(),
                    timestamp: Joi.string().required(),
                    recurrence: Joi.string().required(),
                    interval: Joi.number(),
                    sensorId: Joi.number(),
                }
            }
        }
    },
    {
        method: 'GET',
        path: `/${apiPrefix}/journalentries`,
        config: {
            auth: 'session',
            handler: (request, reply) => {
                const userId = request.auth.credentials.userId;
                const query = request.query;
                const sensorId = query.sensorId;
                const rangeBegin = decodeURIComponent(query.from);
                // TODO: Custom validation here?
                const rangeEnd = decodeURIComponent(query.to);
                if (sensorId === undefined) {
                    return Journal.getEntriesForRange(userId, rangeBegin, rangeEnd)
                        .then(entries => {
                            reply(entries);
                        })
                        .catch(() => {
                            // TODO: logging
                            reply([]);
                        });
                } else {
                    return Journal.getEntriesForSensorAndRange(userId, sensorId, rangeBegin, rangeEnd)
                        .then(entries => {
                            reply(entries);
                        })
                        .catch(() => {
                            // TODO: logging
                            reply([]);
                        });
                }
            },
            validate: {
                query: {
                    from: Joi.string(),
                    to: Joi.string(),
                    sensorId: Joi.number(),
                }
            }
        }
    },
    {
        method: 'GET',
        path: `/${apiPrefix}/views`,
        config: {
            auth: 'session',
            handler: (request, reply) => {
                const userId = request.auth.credentials.userId;
                return View.getView(userId)
                    .then(entries => {
                        reply(entries);
                    })
                    .catch(() => {
                        // TODO: logging
                        reply([]);
                    });
            },
        }
    },
    {
        method: 'POST',
        path: `/${apiPrefix}/view`,
        config: {
            auth: 'session',
            handler: (request, reply) => {
                console.log(`Adding new view for user ${request.auth.credentials.userId}`);
                const payload = request.payload;
                const userId = request.auth.credentials.userId;
                View.createOrUpdateView(userId, payload.title, payload.viewData);
                reply();
            },
            validate: {
                payload: {
                    title: Joi.string().required(),
                    viewData: Joi.object().required(),
                }
            }
        }
    },
];

module.exports = routes;
