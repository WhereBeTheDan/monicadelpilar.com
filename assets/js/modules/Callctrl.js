var Callctrl = {
	/**
	 * Once (call a function once)
	 * @example once.trigger(); once.reset();
	 * @param {function} callback The callback
	 * @config {boolean} bool Boolean to control actions
	 * @return {object} Returns a object to trigger callback
	 */
	once: function once(callback){
		var bool = false;
		return {
			trigger:function(){
				if (bool) {
					return;
				}
				bool = true;
				callback();
			},
			reset:function(){
				bool = false;
			}	
		};
	},

	/**
	 * Shift (callbackA can only be called once, until callbackB has been called)
	 * @example shift.alpha(); shift.beta();
	 * @param {function} callbackA The callback
	 * @param {function} callbackB The callback
	 * @config {boolean} bool Boolean to control actions
	 * @return {object} Returns a object to trigger callbacks
	 */
	shift: function shift(_callbackA, _callbackB){
		var bool = false;
		var callbackA = _callbackA || function(){};
		var callbackB = _callbackB || function(){};
		return {
			alpha:function() {
				if (bool) {
					return;
				}
				bool = true;
				callbackA();
			},
			beta:function() {
				if (!bool) {
					return;
				}
				bool = false;
				callbackB();
			}
		};
	},

	/**
	 * Toggle (toggle between callbackA and callbackB)
	 * @example toggle.trigger(); toggle.reset();
	 * @param {function} callbackA The callback
	 * @param {function} callbackB The callback
	 * @config {boolean} bool Boolean to control actions
	 * @return {object} Returns a object to trigger callbacks
	 */
	toggle: function toggle(callbackA, callbackB){
		var bool = true;
		return {
			trigger: function() {
				if (bool) {
		 			callbackA();
		 		} else {
		 			callbackB();
		 		}
	 			bool = !bool;
			},
			reset:function(){
				bool = true;	
			}
		};
	}
};