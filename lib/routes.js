'use strict';

const sensorController = require('./controllers/sensorController');

const apiPrefix = "api"

const routes = [
    {
        method: 'GET',
        path: '/private-route',
        config: {
            auth: 'session',
            plugins: {
                'hapi-auth-cookie': {
                    redirectTo: false
                }
            },
            handler: function (request, reply) {
                reply('Yeah! This message is only available for authenticated users!')
            }
        }
    },
    {
        method: 'GET',
        path: '/userDetails',
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
                    var session = request.auth.credentials
                    return reply(session);
                }
                reply({});
            }
        }
    },
    {
        method: 'GET',
        path: '/public-route',
        config: {
            handler: function (request, reply) {
                reply(`
                            <form action="login" method="post">
                                <input name="username" type="text">
                                <input name="password" type="password">
                                <input type="submit" value="LOGIN" >
                            </form>
                        `)
            }
        }
    },
    {
        method: 'POST',
        path: '/login',
        config: {
            handler: function (request, reply) {
                console.log("IN LOGIN HANDLER");
                var username = request.payload.username;
                var password = request.payload.password;

                console.log(username, password);

                // check if user exists in DB
                // compare passwords

                // if everything went smooth, set the cookie with "user" specific data
                const userId = 1;
                request.cookieAuth.set({userId: userId});

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
