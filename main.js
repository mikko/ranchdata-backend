'use strict';

const server = require('./lib/server');
const _ = require('lodash');
const scheduler = require('./lib/scheduler');
const choreScheduler = require('./lib/jobs/choreScheduler');

const routes = require('./lib/routes');

server.start(3000, routes);

scheduler.startJob('0 * * * *', choreScheduler);

// server.startSocket();

/*
// Testing websockets
const WebSockerServer = require('ws').Server;
const ws = new WebSockerServer({port: 7000});

ws.on('connection', socket => {
    socket.on('message', msg => {
        console.log(`Socket message received ${msg}`);
    });

    let updater = setInterval(() => {
        var updatedData = _.range(Math.floor(Math.random() * 5)).map(i => {
            return {
                id: i,
                data: (18 + Math.random() * 4).toFixed(2)
            };
        });
        socket.send(JSON.stringify({
            updatedData
        }));
    }, 1000);

    socket.on('close', () => clearInterval(updater));
})
*/
