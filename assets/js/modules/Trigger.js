


var Trigger = function() {

	var t = {};

	var listeners = [];
	var lock = false;

	var lateTriggers = [];
	var lateRemovals = [];

	/**
	 *	@method on
	 *	@memberof Trigger.prototype
	 *	@param {Function} callback - the function used as callback for the listener
	 *	@param {Object=} context - the context in which to invoke the function
	 *	@description Adds a listener to this trigger
	 */
	t.on = function (callback, context) {
		callback.context = context;
		listeners.push(callback);
	};

	/**
	 *	@method off
	 *	@memberof Trigger.prototype
	 *	@param {Function} callback - the function used as callback for the listener. 
	 *	Needs to be the same function as passed to the <code>on()</code> when it was being registered.
	 *	@description Removes a listener from this trigger. 
	 *	<p>If the passed callback is not a listener of this trigger, 
	 *	this function will not throw any warnings, it will just return. 
	 *	<p>If this function is called from within a function that is a listener for that trigger, 
	 *	the callback will not be removed until all other listeners are called.
	 */
	t.off = function (callback) {
		var i = listeners.indexOf(callback);

		if(i == -1) return;

		if(lock) {
			lateRemovals.push({ callback: callback });
			return;
		}

		listeners.splice(i, 1);
	};

	/**
	 *	@method trigger
	 *	@memberof Trigger.prototype
	 *	@param {Object=} data - An object specifying the events parameters. All listeners will receive this object as argument.
	 *	@description Fires this trigger passing data as srgument to all listeners.
	 *	<p>If this function is called from within a function that is a listener for that trigger, 
	 *	the trigger will not be fired until all other listeners 
	 *	are called for the previous one.
	 */
	t.trigger = function (data) {

		if(lock) {
			lateTriggers.push({ data: data });
			return;
		}

		lock = true;

		var i = 0, nl = listeners.length;
		while(i < nl) {
			var f = listeners[i];
			f.call(f.context, data);
			i++;
		}
		
		lock = false;

		var d;
		while(d = lateTriggers.shift()) t.trigger(d.data);
		while(d = lateRemovals.shift()) t.off(d.callback);
	};

	return t;
};

