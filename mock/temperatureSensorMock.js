var currentValue = 20;

module.exports = {
	start: (cb, interval) => {
		setInterval(() => {
			currentValue += (Math.random() - 0.5) * 0.1;
			cb(currentValue.toFixed(2));
		}, interval);
	}
};
