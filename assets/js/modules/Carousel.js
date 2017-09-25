function Carousel(_el, options = {}) {

    // Private properties
    var self = {};

    var el = _el;
    var children = el.children;
    var slider;

    var defaults = options.defaults || {
        pager: false,
        auto: false,
        autoStart: false,
        minSlides: 1,
        maxSlides: 3,
        moveSlides: 1,
        slideWidth: null,
        infiniteLoop: false,
        nextText: '',
        prevText: '',
        prevSelector: jQuery(el).find('.carousel-prev'),
        nextSelector: jQuery(el).find('.carousel-next'),
    };

    var sliderOpts;


    function updateViewDimensions() {
        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            s = w.pageYOffset || e.scrollTop || d.body.scrollTop,
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight || e.clientHeight || g.clientHeight;
        return { width: x, height: y, scrollTop: s };
    }


    function adjustBounds() {
        if ( updateViewDimensions().width < 768 ) {
            sliderOpts.maxSlides = 1;
            sliderOpts.pagerType = 'short';
        } else {
            sliderOpts.maxSlides = defaults.maxSlides;
            sliderOpts.pagerType = 'full';
        }
        sliderOpts.slideWidth = el.ext.select('.carousel-wrap').getBoundingClientRect().width / sliderOpts.maxSlides;
        
        // jQuery(el).closest('.bx-wrapper').css('max-width', jQuery(el).closest('.carousel-block').width());
    }


    function inViewport(scroll, windowHeight) {

    }


    function refresh() {
        if ( slider ) {
            adjustBounds();
            slider.reloadSlider(sliderOpts);
        }
    }


    function enable() {
    	if (!self.enabled) {
    		self.enabled = true;

            sliderOpts = jQuery.extend({}, defaults, el.dataset);
            sliderOpts.slideWidth = Math.round(el.ext.select('.carousel-wrap').getBoundingClientRect().width / sliderOpts.maxSlides);

            slider = jQuery(el).find('.carousel').bxSlider(sliderOpts);

            window.addEventListener('resize', refresh);
    	}
    }


    function disable() {
    	if (self.enabled) {
    		self.enabled = false;

    		slider.destroySlider();
    		slider = null;

            window.removeEventListener('resize', refresh);
    	}
    }


    enable();

    return {
        enabled: false,
        inViewport: inViewport,
        refresh: refresh,
        enable: enable,
        disable: disable,
    }
}