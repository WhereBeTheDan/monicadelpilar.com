App = {
	globalScroll: 0,
	elements: {},
}

Timer.global = new Timer(true, true);
var wipeOut = new Trigger()

var sections = EXT.selectAll('.will-change');
App.elements.sections = [];
sections.forEach( function(el) {
	App.elements.sections.push(new Section({ el: el, offsetTop: -window.innerHeight * 0.5 }));
});


var backgrounds = EXT.selectAll('.background');
App.elements.backgrounds = [];
backgrounds.forEach( function(el, index) {
	App.elements.backgrounds.push(new Background({ el: el }));
});


var blocks = EXT.selectAll('.will-appear');
App.elements.blocks = [];
blocks.forEach( function(el, index) {
	App.elements.blocks.push(new Item({ el: el }));
});


function refreshAll() {
	App.scrollArticle.refresh(window.innerHeight - container.ext.rect().top);

	Object.keys(App.elements).forEach( function(key) {
		App.elements[key].forEach( function(el) {
			el.refresh();
		});
	});
}


EXT.selectAll('.carousel-content').forEach(function(el) {
	var sliderOpts = {
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
	sliderOpts.slideWidth = Math.round(el.ext.select('.carousel-wrap').getBoundingClientRect().width / sliderOpts.maxSlides);
	slider = jQuery(el).find('.carousel').bxSlider(sliderOpts);
})


var container = EXT.select('#page-container');
var header = EXT.select('.site-header');
var heroic = EXT.select('.heroic .section-content');
App.scrollArticle = ScrollPane(container, null, function(progress, offset, windowHeight, deltaY) {
	header.style.opacity = 1 - (progress * 5);
	header.ext.y = progress * -50;
	header.ext.transform();

	heroic.ext.setY(progress * -500).transform();

	Object.keys(App.elements).forEach( function(key) {
		App.elements[key].forEach( function(el) {
			el.inViewport(offset, windowHeight);
		});
	});
})


App.scrollArticle.on(window.innerHeight - container.ext.rect().top)

$(window).on('load', function() {
	var event;
    if (typeof window.Event == "function") { // jshint ignore:line
        event = new Event('resize');
    } else {
        event = document.createEvent('Event');
        event.initEvent('resize', false, false);
    }
    window.dispatchEvent(event);
});

Application.init();
Application.resize.on(function() {
	refreshAll();
});
