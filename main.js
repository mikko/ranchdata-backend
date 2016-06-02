'use strict';

const server = require('./lib/server');
const scheduler = require('./lib/scheduler')
const fs = require('fs');
const path = require('path');

const dataSourcePath = './datasource';

const saveData = function(type, value) {
    console.log(`Saving data for ${type}, ${value}`);
};

fs.readdirSync(dataSourcePath).forEach(function(file) {
  let dataSource = require(`${dataSourcePath}/${file}`);
  dataSource.initialize(saveData);
  scheduler.startJob(dataSource.scheduleRule, dataSource.job)
});


server.start(3000);
