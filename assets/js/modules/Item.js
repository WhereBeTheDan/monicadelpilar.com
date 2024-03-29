function Item(_el, options = {}) {
	/*
		Private methods
	*/
	var self = {};
	var el = _el;
	var parent = el.parentNode;
	var offsetTop = options.offsetTop || 0, 
		offsetBottom = options.offsetBottom || 0;

	var height,
		parentHeight,
		pageOffset;

	function cumulativeOffset() {
		var xPos = 0;
		var yPos = 0;
		var _el = el;

		while (_el) {
			if (_el.tagName == "BODY") {
			  var xScroll = _el.scrollLeft || document.documentElement.scrollLeft;
			  var yScroll = _el.scrollTop || document.documentElement.scrollTop;

			  xPos += (_el.offsetLeft - xScroll + _el.clientLeft);
			  yPos += (_el.offsetTop - yScroll + _el.clientTop);
			} else {
			  xPos += (_el.offsetLeft - _el.scrollLeft + _el.clientLeft);
			  yPos += (_el.offsetTop - _el.scrollTop + _el.clientTop);
			}

			_el = _el.offsetParent;
		}

		return {
			x: xPos,
			y: yPos
		};
	}

	function refresh(h, th) {
		windowHeight = h || window.innerHeight;
		height = el.ext.height();
		pageOffset = cumulativeOffset();
	}

	function inViewport(scroll, windowHeight) {
		let inView = !( ( pageOffset.y + offsetTop > scroll + windowHeight ) 
			// || ( pageOffset.y + height + offsetBottom < scroll ) 
			);
		if ( !inView ) {
			if ( el.classList.contains('is-up') ) {
		    	el.classList.remove( 'is-up' );
		    }
		} else if ( !el.classList.contains('is-up') ) {
		    el.classList.add( 'is-up' );
		}
	}



	/*
		Public methods
	*/
	self.enabled = false;

	self.inViewport = inViewport;
	self.refresh = refresh;
	
	refresh();

	return self;
}