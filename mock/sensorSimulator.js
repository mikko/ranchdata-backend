const http = require('http');
const querystring = require('querystring');

const apiToken = '?token=00000000-0000-0000-0000-000000000000';

const tick = 5000; // in ms
const initialValue = 0;
const simpleCounter = prevValue => prevValue + 1;
const randomisedCounter = prevValue => prevValue + Math.random();
const binaryValue = () => Math.random() < 0.5 ? 0 : 1;

const sensorNames = {
    'counter': {
        runner: simpleCounter,
    },
    'random': {
        runner: randomisedCounter,
    },
    'bin': {
        runner: binaryValue,
    },
};

const run = (sensor, runner, value) => {
    const newValue = runner(value);
    console.log(`New value for ${sensor} ${newValue}`);

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: `/api/v1/measurement${apiToken}`,
        method: 'POST',
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);

        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });

    req.on('error', (e) => {
        console.log(`problem sending sensor data: ${e.message}`);
    });


    // write data to request body
    const postData = JSON.stringify({
        'sensor': sensor,
        'value': newValue,
    });

    req.write(postData);
    req.end();

    setTimeout(run.bind(null, sensor, runner, newValue), tick);
};

Object.keys(sensorNames).forEach((sensor, value) => run(sensor, sensorNames[sensor].runner, initialValue));
