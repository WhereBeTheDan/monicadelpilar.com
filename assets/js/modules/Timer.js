
var Timer = function(autostart, autoupdate) {

	var that = this;

	// If frame is longer than 250ms (4 FPS) it will skip it.
	// TODO: what is the logic behind this?
	var MAX_FRAME_TIME = 250;

	var paused = false;

	this.time = 0;
	this.frame = 0;
	this.deltatime = 0;

	var startTime, elapsedTime = 0;

	var tasks = [];

	var trackTask = function(e, i) {
		if(e._time < that.time) {
			if(e._repeat != 0) {
				e.callback(e._time);

				var it = e._interval;
				if(it instanceof Array) e._time += it[0] + Math.random() * (it[1] - it[0]);
				else e._time += it;

				e._repeat--;
			} else {
				setTimeout(that.off, 0, e); // <- is it good enough?
			}
		}
	};

	var run = function() {
		requestAnimationFrame(run);
		that.update();
	}

	/**
	 *	@method pause
	 *	@memberof Timer.prototype
	 *	@description Pauses/resumes the execution of the timer.
	 *	@param {Boolean} p - true to pause, false to resume
	 *	@return {Timer} self, for chaining.
	 */
	this.pause = function(p) {
		paused = p;
		return this;
	}

	/**
	 *	@method paused
	 *	@memberof Timer.prototype
	 *	@description Returns true is timer is paused, false otherwise.
	 */
	this.paused = function() {
		return paused;
	}

	/**
	 *	@method start
	 *	@memberof Timer.prototype
	 *	@description Start the timer manually.
	 *	<p>If autostart was set to false or omitted in the constructor, this function needs to be invoked.	
	 */
	this.start = function() {
		startTime = new Date().getTime(), 
		elapsedTime = 0, 
		that.frame = 0;
		that.time = 0;

		if(autoupdate) run();

		return that;
	}

	/**
	 *	@method update
	 *	@memberof Timer.prototype
	 *	@description Updates the timer.
	 *
	 *	<p>If autoupdate was set to false or omitted in the constructor, 
	 *	this function need to be invoked in a requestAnimationFrame loop or a similar interval.
	 */
	this.update = function() {
		var t = new Date().getTime() - startTime;
		var d = t - elapsedTime;
		elapsedTime = t;

		if(d < MAX_FRAME_TIME && !paused) {
			that.time += d;
			that.frame++;
			that.deltatime = d;
		}

		tasks.forEach(trackTask);
		return that.time;
	}

	/**
	 *	@method onAt
	 *	@memberof Timer.prototype
	 *	@description Executes callback after a delay. All time values in milliseconds.
	 *
	 *	@param {Number} time - when to start (i.e. delay counted from 'now' i.e from when this method is called)
	 *	@param {Function} callback - the callback to be invoked
	 *
	 *	@returns {Object} - an special object that can be used to remove the task later.
	 */
	this.onAt = function(_time, callback) {
		var so = {
			callback: callback,
			_time: that.time + _time,
			_repeat: 1
		};

		tasks.push(so);
		return so;
	}

	/**
	 *	@method onEvery
	 *	@memberof Timer.prototype
	 *	@description Invokes the callback repeatedly overtime. All time values in ms.
	 * 	
	 *	@param {Number} interval - how often to invoked the function. It can be an array of two elements specyfing a min/max range
	 *	@param {Number} time - when to start (i.e. delay, counted from 'now' i.e from when this method is called)
	 *	@param {Number} callback - the callback to be invoked
	 *	@param {Number} repeat - how many times to repeat. If ommited or -1 will repeat infinitely
	 *				0 will never invoke the function (in fact it won't even be added)
	 *
	 *	@returns {Object} an object that can be later used to remove the task.
	 */
	this.onEvery = function(_interval, _time, callback, _repeat) {

		if(_repeat === 0) return;
		
		var so = {
			callback: callback,
			_time: that.time + _time,
			_interval: _interval,
			_repeat: _repeat || -1

		};

		tasks.push(so);
		return so;
	}

	/**
	 *	@method off
	 *	@memberof Timer.prototype
	 *	@description Remove a scheduled task.
	 *
	 *	@param {Object} so - Object referencing the callback. 
	 *	<p>DO NOT PASS the original callback to this function (you'll get a warning if you do).
	 *	Instead you need to pass the object returned from onAt or onEvery. 
	 */
	this.off = function(so) {

		if(so instanceof Function) {
			var m = 'You are probably using the callback directly to remove it.\n';
			m += 'You should use the object returned from onAt or onEvery instead.';
			console.warn(m);
			console.warn(so);
			return;
		}

		if(so == null) {
			return;
		}

		var i = tasks.indexOf(so);
		if(i > -1) {
			tasks.splice(i, 1);
			return true;
		} else {
			return false;
		}
	}

	/**
	 *	@method clearTasks
	 *	@memberof Timer.prototype
	 *	@description Remove all tasks scheduled using onAt or onEvery
	 */
	this.clearTasks = function() {
		tasks.length = 0;
	}

	if(autostart) {
		that.start();
	}
}

