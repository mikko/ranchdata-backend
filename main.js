'use strict';

const server = require('./lib/server');
const scheduler = require('./lib/scheduler')
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const routes = require('./lib/routes');

server.start(3000, routes);

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