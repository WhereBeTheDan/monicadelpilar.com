var App = (function() {

	var self;


	function refreshAll() {
		App.scrollArticle.refresh(window.innerHeight - App.container.ext.rect().top);

		Object.keys(App.elements).forEach( function(key) {
			App.elements[key].forEach( function(el) {
				el.refresh();
			});
		});

		if (!Simplrz.touch) {
			App.scrollArticle.on(window.innerHeight - App.container.ext.rect().top)
		} else {
			App.scrollArticle.off()
		}
	}

	function init() {
		Timer.global = new Timer(true, true);
		var wipeOut = new Trigger()


		App.elements.sections = [];
		EXT.selectAll('.will-change').forEach( function(el) {
			App.elements.sections.push( new Section( el, { offsetTop: -window.innerHeight * 0.5 } ) )
		});


		App.elements.backgrounds = [];
		EXT.selectAll('.background').forEach( function(el, index) {
			App.elements.backgrounds.push( new Background( el ) )
		});


		App.elements.blocks = [];
		EXT.selectAll('.will-appear').forEach( function(el, index) {
			App.elements.blocks.push( new Item( el ) )
		});


		App.elements.carousels = [];
		EXT.selectAll('.carousel-content').forEach(function(el) {
			App.elements.carousels.push( new Carousel( el ) )
		})


		App.container = EXT.select('#page-container');
		App.header = EXT.select('.site-header');
		App.heroic = EXT.select('.heroic .section-content');
		App.scrollArticle = ScrollPane(App.container, null, function(progress, offset, windowHeight, deltaY) {
			App.header.style.opacity = 1 - (progress * 5);
			App.header.ext.y = progress * -400;
			App.header.ext.transform();

			App.heroic.ext.setY(progress * -500).transform();

			Object.keys(App.elements).forEach( function(key) {
				App.elements[key].forEach( function(el) {
					el.inViewport(offset, windowHeight);
				});
			});
		})


		$('#contact-form').on('submit', function(e) {
			e.preventDefault();

			let form = e.target;

			$.ajax({
			    url: form.action, 
			    method: "POST",
			    data: $(form).serialize(),
			    dataType: "json"
			})
			.done(function(resp, status, jqXHR) {
				console.log(resp, status, jqXHR)
			})
			.fail(function(resp, status, error) {
				console.log(resp, status, error)
			});
		});


		Application.init();
		Application.resize.on(function() {
			refreshAll();
		});
	}

	return {
		globalScroll: 0,
		elements: {},
		getInstance: function() {
			if ( !self ) {
	        	self = init();
	      	}

	      	return self;
		}
	}
})();




$(window).on('load', function() {

	var app = App.getInstance();

	var event;
    if (typeof window.Event == "function") {
        event = new Event('resize');
    } else {
        event = document.createEvent('Event');
        event.initEvent('resize', false, false);
    }
    window.dispatchEvent(event);

    console.log(EXT.select('.wrap'))

    let bgLazyLoad = new LazyLoad({
    	container: EXT.select('.wrap'),
    	threshold: 600,
    	elements_selector: '.background-inner',
    	callback_set: function(el) {
    		el.classList.add('loaded')
    	}
    });

    let lazyLoad = new LazyLoad({
    	container: EXT.select('.wrap'),
    	threshold: 1000,
    	elements_selector: '.lazy'
    });
});


