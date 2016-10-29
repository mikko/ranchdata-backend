'use strict';


const Sensor = require('../models/sensor');









var db = {
	saveMeasurement: (sensor, measurement) => {
		this.measurements.push({sensor, measurement})
	},
	addSensor: (type, name) => {
		let newSensor = {
			type,
			name,
			id: this.sensors.length
		};
		this.sensors.push(newSensor);
	},
	measurements: [],
	sensors: []
}

//const persistence = require('../persistence');

const saveData = function(sensor, type, value) {
    console.log(`Saving data for ${type} sensor ${sensor}: ${value}`);
    //persistence.saveMeasurement(sensor, value);
};


module.exports = {
	registerSensor: function(type, name) {
		return persistence.addSensor(type, name);
	},
	writeMeasurement: function(sensor, type, value) {
		//saveData(sensor, type, value);
	}
};
