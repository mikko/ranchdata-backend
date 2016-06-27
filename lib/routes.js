'use strict';

const sensorController = require('./controllers/sensorController');

const routes = [
        {
            method: 'GET',
            path: '/',
            handler: (req, reply) => {
                reply('<h1>KUKKUU!</h1>');
            }
        },
        {
            method: 'POST',
            path: '/measurement',
            handler: (req, reply) => {
                console.log('Measurement got');
                console.dir(req.payload);
                let payload = req.payload;
                sensorController.writeMeasurement(payload.sensorID, payload.type, payload.value);
                reply();
            }
        },
        {
            method: 'POST',
            path: '/sensor',
            handler: (req, reply) => {
                console.log('Adding new sensor');
                let payload = req.payload;
                let sensorName = payload.name;
                let sensorType = payload.type;
                reply(sensorController.registerSensor(sensorType, sensorName));
            }
        }
    ];

module.exports = routes;
