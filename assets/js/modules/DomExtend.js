
var DomExtend = (function() {

	var that = {};

	/**
	 *	@method create
	 *	@memberof DomExtend
	 *	@static
	 *	@param {string} tag - the name of the tag to create
	 *	@description Created a HTMLElement of type defined by the tag. It first calls <code>document.createElement(tag)</code> 
	 *	and the extends this element with DomExtend functionality.
	 */
	that.create = function(tag) {
		var e = document.createElement(tag);
		that.extend(e);
		return e;
	};

	/**
	 *	The equivalent of <code>document.querySelector</code>. It extends the object
	 *	with DomExtend functionality before returning the result.
	 *
	 *	@method select
	 *	@memberof DomExtend
	 *	@static
	 *	@param {string} sel - the CSS selector to query
	 *	@param {HTMLElement=} element - the HTML element to query on, defaults to document 
	 */
	that.select = function(sel, element) {
		var e = (element || document).querySelector(sel);
		if(e && !e.ext) that.extend(e);
		return e;
	};

	that.selectAll = function(sel, element) {
		var es = (element || document).querySelectorAll(sel);
		var nes = es.length, r = [];
		for(var i = 0; i < nes; i++) {
			var e = es[i]
			if(!e.ext) e = that.extend(e);
			r.push(e);
		}
		return r;
	};

	that.extend = function(element) {

		if(element.ext) return element;

		var ext = {};

		ext.create = function(tag) {
			return that.create(tag);
		};

		ext.select = function(sel) {
			return that.select(sel, element);
		};

		ext.selectAll = function(sel) {
			return that.selectAll(sel, element);
		};

		ext.detach = function() {
			var p = element.parentNode;
			if(!p) return;
			p.removeChild(element);
		};

		ext.attachTo = function(parent) {
			if(element.parentNode == parent) return;
			else parent.appendChild(element);
		}

		// Add State related functions (see State.js for details)
		if(window.ExtState) ExtState(ext, element);

		// Add Transform related functions (see Transform.js for details)
		if(window.ExtTransform) ExtTransform(ext, element);

		// Add Transition related functions (see Transition.js for details)
		if(window.ExtTransition) ExtTransition(ext, element); 

		// Add Animation related functions (see Transition.js for details)
		if(window.ExtAnimation) ExtAnimation(ext, element, that); 

		ext.element = element;
		element.ext = ext;
		return element;
	};

	that.extend(document);
	window.EXT = that;

	return that;

})();
