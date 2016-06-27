'use strict';

const request = require('request');
const tempSensor = require('./temperatureSensorMock');
const system = require('./systemConfig');

const updateInterval = 1000;

const logValue = (sensorID, value) => {
    console.log(`Sensor ${sensorID} value ${value}`);
    request.post({
            uri: 'http://localhost:3000/measurement',
            body: JSON.stringify({
                sensorID: sensorID,
                value: value,
                apiKey: 'BADA55'
            })
        });
};

system.sensors.forEach(sensor => {
    request.post({
            uri: 'http://localhost:3000/sensor',
            body: JSON.stringify({
                name: 'NIMI',
                type: sensor.type,
                apiKey: 'TIS-517'
            })
        }, (err, res, body) => {
            console.log('Registered sensor', sensor.name);
            if (err === null ) {
                let sensorID = parseInt(body);
                tempSensor.start(logValue.bind(null, sensorID), updateInterval);
            }
        });
});
