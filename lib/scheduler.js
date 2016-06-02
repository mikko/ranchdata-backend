'use strict';

const scheduler = require('node-schedule');

/*
    Schedules stuff based on CRON syntax

    *    *    *    *    *    *
    ┬    ┬    ┬    ┬    ┬    ┬
    │    │    │    │    │    |
    │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
    │    │    │    │    └───── month (1 - 12)
    │    │    │    └────────── day of month (1 - 31)
    │    │    └─────────────── hour (0 - 23)
    │    └──────────────────── minute (0 - 59)
    └───────────────────────── second (0 - 59, OPTIONAL)
*/

const startJob = function(rule, job) {
    console.log(`Scheduling job ${job} for ${rule}`);
    scheduler.scheduleJob(rule, job);
};

module.exports = {
    startJob: startJob
};
