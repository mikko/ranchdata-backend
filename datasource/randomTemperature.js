'use strict';

var callback = function() {};

const type = 'randomTemperature';

const initialize = function(cb) {
	console.log(`randomTemperature initialized with ${cb}`);
	callback = cb;
};

const job = function() {
	console.log('randomTemperature job ran');
	callback(type, (18 + (Math.random() * 4)).toFixed(2));
};

module.exports = {
	type: type,
	initialize: initialize,
	scheduleRule: '0 * * * * *',
	job: job
};
