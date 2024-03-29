
var Simplrz = (function() {

	var s = {}, classes = ['js']; // Add 'js' class by default (bc if this code runs, JS is enabled, right?)

	var check = function(feature, test) {
		var result = test();
		s[feature] = (result) ? true : false;
		classes.push( (result) ? feature : "no-" + feature );

		document.documentElement.setAttribute("class", classes.join(" "));
	}

	/**
	 *	@member pixelRatio
	 *	@memberof Simplrz
	 *	@description Same vallue as <code>window.devicePixelRatio</code>
	 */
	s.pixelRatio = window.devicePixelRatio || 1;

	var prefix = (function () {

		var styles = "", pre = "", dom = "";

		if(window.getComputedStyle) {
			styles = window.getComputedStyle(document.documentElement, '');
			pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1];
			dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
		}

		return {
			dom: dom,
			lowercase: pre,
			css: '-' + pre + '-',
			js: (pre == "") ? "" : pre[0].toUpperCase() + pre.substr(1)
		};
	})();

	/**
	 *	@member prefix
	 *	@memberof Simplrz
	 *	@description whar is the browser vendor prefix (-ms, -webkit, -moz...)
	 *
	 *	@returns {Object} contins several versions of the prefix, see example below.
	 *
	 *	@example
{
	dom: "Webkit",
	lowercase: "webkit,
	css: "-webkit-",
	js: "Webkit"
}
	 */
	s["prefix"] = prefix;
	classes.push(prefix.lowercase);

	s.prefixedProp = function(prop) {
		switch(prefix.lowercase) {
			case "webkit": return "webkit" + prop.charAt(0).toUpperCase() + prop.slice(1);
			case "ms": return "-ms-" + prop;
			case "moz": return "Moz" + prop.charAt(0).toUpperCase() + prop.slice(1);
			default: return prefix.css + prop;
		}
	} 

	// -- BROWSER HACKS BEGIN -- 
	// These properties are for browser specific hack (yes, they are sometimes necessary)
	var ie = (function(){
	    var v = 3, div = document.createElement('div'), all = div.getElementsByTagName('i');
	    while (
	        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
	        all[0]
	    ) {
	    	// console.log(div.innerHTML);
	    }
	    return v > 4 ? v : null;
	})();

	// IE 10 doesn't use conditional comments anymore
	if(ie == null) {
		var p = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		var ua = navigator.userAgent;
		var m = ua.match(p);
		ie = (m && m.length > 1) ? parseInt(m[1]) : null;
	}

	/**
	 *	@member {Boolean} ie
	 *	@memberof Simplrz
	 *	@description false if browser is not IE, otherwise the version number (8, 9, 10...)
	 */
	s.ie = ie || false;
	classes.push((ie) ? "ie-" + ie : "no-ie");

	/**
	 *	@member {Boolean} firefox
	 *	@memberof Simplrz
	 *	@description True if the device is an iPad.
	 */
	s.firefox = prefix.lowercase == "moz";
	classes.push(s.firefox ? "firefox" : "no-firefox");

	/**
	 *	@member {Boolean} safariDesktop
	 *	@memberof Simplrz
	 *	@description True if the the browser is a Safari on desktop Mac.
	 */
	s.safariDesktop = navigator.userAgent.match(/Safari/) && !navigator.userAgent.match(/Chrome/) && !('ontouchstart' in document);
	classes.push(s.safariDesktop ? "safari-desktop" : "no-safari-desktop");

	// s.ipad7 = navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i) || false;
	// classes.push(s.ipad7 ? "ipad7" : "no-ipad7");

	/**
	 *	@member {Boolean} iOS
	 *	@memberof Simplrz
	 *	@description True if the device runs on iOS.
	 */
	s.iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
	classes.push(s.iOS ? "ios" : "no-ios");

	/**
	 *	@member {Boolean} iPad
	 *	@memberof Simplrz
	 *	@description True if the device is an iPad.
	 */
	s.iPad = (navigator.platform == 'iPad');
	classes.push(s.iPad ? "ipad" : "no-ipad");

	// -- BROWSER HACKS END -- 



	/**
	 *	@member {Boolean} css3d
	 *	@memberof Simplrz
	 *	@description True if CSS 3d transforms are supported.
	 */
	check("css3d", function() {

		if(prefix.lowercase == 'webkit' || prefix.lowercase == 'moz') return true;

		if(prefix.lowercase == 'ms') {
			var div = document.createElement("div");
			div.style[prefix.css + "transform"] = 'translateZ(0px)';
			var cs = getComputedStyle(div);
			var a = cs.getPropertyValue(prefix.css + "transform");
			return a && a != '' && a != 'none';
		}

		return false;
	});

	/**
	 *	@member {Boolean} csstransitions
	 *	@memberof Simplrz
	 *	@description True if CSS Transitions are supported.
	 */
	check("csstransitions", function() { return !ie || ie >= 10; });

	/**
	 *	@member {Boolean} cssanimations
	 *	@memberof Simplrz
	 *	@description True if CSS Animations are supported.
	 */
	check("cssanimations", function() { return !ie || ie >= 10; });

	/**
	 *	@member {Boolean} css2d
	 *	@memberof Simplrz
	 *	@description True if CSS 2d transforms are supported.
	 */
	check("css2d", function() { return !ie || ie >= 9; });

	/**
	 *	@member {Boolean} touch
	 *	@memberof Simplrz
	 *	@description True if touch events are supported.
	 *	<p>Experimental: some laptop PCs runnig Windows have a touch screen. 
	 *	Chrome on such PCs will report true for the 'ontouchstart' event, 
	 *	however the touch events are not supported well in such case. So this test
	 *	will report `false` if we are on Win32 platform, even if touch screen is detected. 
	 */
	check("touch", function() {
		return 'ontouchstart' in document && navigator.platform != 'Win32';
	});

	/**
	 *	@member {Boolean} pointer
	 *	@memberof Simplrz
	 *	@description True if pointer API (sort of like touch but different spec, used mostly by MS) is supported.
	 */
	check("pointer", function() {
		return (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 1);
	});

	/**
	 *	@member {Boolean} canvas
	 *	@memberof Simplrz
	 *	@description True if canvas 2d API is supported.
	 */
	check("canvas", function() {
		try { 
			var canvas = document.createElement('canvas'); 
			return canvas.getContext('2d');
		} catch(e) { 
			return false; 
		}
	});

	/**
	 *	@member {Boolean} history
	 *	@memberof Simplrz
	 *	@description True if the history API is supported.
	 */
	check("history", function() {
		return !!(window.history && history.pushState);
	});

	/**
	 *	@member {Boolean} webrtc
	 *	@memberof Simplrz
	 *	@description True if webrtc is supported.
	 */
	check("webrtc", function() {
		return ('getUserMedia' in navigator || 'webkitGetUserMedia' in navigator);
	});

	/**
	 *	@member {Boolean} webgl
	 *	@memberof Simplrz
	 *	@description True if webgl is supported.
	 */
	check("webgl", function() {
		try { 
			var canvas = document.createElement('canvas'); 
			return !!window.WebGLRenderingContext && 
				(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
		} catch(e) { 
			return false; 
		} 
	});

	// Flash is dead anyway!
	// check("flash", function() {
	// 	return !!(
	// 		navigator.mimeTypes["application/x-shockwave-flash"] || 
	// 		window.ActiveXObject && new ActiveXObject('ShockwaveFlash.ShockwaveFlash')
	// 	);
	// });

	/**
	 *	@member {Array} classes
	 *	@memberof Simplrz
	 *	@description An array containing all the classes that have been added to the <html> element.
	 */
	s.classes = classes;

	return s;
})();

