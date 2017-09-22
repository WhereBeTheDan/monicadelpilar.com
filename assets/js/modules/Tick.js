function Tick(_opts) {
    /**
     * @define {object} Collection of public methods.
     */
    var self = {};

    /**
     * @define {object} options for the constructor 
     */
    var opts = _opts || {};

    /**
     * @define {array} Collection of function that should be called on every RAF
     */
    var collection = [];

    /**
     * @define {function} requestAnimationFrame variable
     */
    var raf;

    /**
     * @define {number} Holds the current time every tick
     */
    var now;

    /**
     * @define {number} Holds the last time of every tick
     */
    var then = Date.now();

    /**
     * @define {number} Holds the difference bwteen now and then
     */
    var delta;

    /**
     * @define {number} Frames pr second (defaults to 60fps)
     */
    var fps = opts.fps || 60;

    /**
     * @define {boolean} Should stop when collection is empty
     */
    var autoPlayStop = opts.autoPlayStop || false;

    /**
     * @define {number} Converting fps to miliseconds
     */
    var interval = 1000/fps;

    /**
     * @define {boolean} Control is the loop should run
     */
    var isStopped = false;



    /** Update run all the callbacks stored in collection */
    function update() {
        for (var i = 0; i < collection.length; i++) {
            collection[i]();
        }
    }

    /**
     * Renders update function at fps giving above
     * @param {type} varname description
     * @config {number} now Set the current time
     * @config {number} delta Calculates the difference between now and then
     */
    function render() {
        if ( isStopped ) {
            return;
        }

        now = Date.now();
        delta = now - then;
        /**
         * If the difference between now and then is bigger than fps (miliseconds) draw collection.
         */
        if ( delta >= interval ) {
            /** calculates new then time */
            then = now - (delta % interval);
            /** run updates */
            update();
        }

        /** Runs requestAnimationFrame for continues loop */
        raf = requestAnimationFrame( render );
    }

    /** Stars the render loop */
    function start() {
        isStopped = false;
        render();
    }

    /**
     * @define {object} Create a once callback
     */
    var startOnce = Callctrl.once(function(){
        start();
    });

    /** Stops the render loop */
    function stop() {
        isStopped = true;
        if ( raf ) {
            cancelAnimationFrame( raf );
        }
        startOnce.reset();
    }

    /** Checks if Tick should stop or start if collection is empty */
    function shouldPlayOrPause() {
        if ( autoPlayStop ) {
            if ( collection.length ) {
                start();
            } else { 
                stop();
            }
        } else {
            startOnce.trigger();
        }
    }

    /** Adds new callback, but checks if its already added */
    function add(callback) {
        var index = collection.indexOf(callback);
        if (index === -1){
            collection.push(callback);
            shouldPlayOrPause();
        }
    }

    /** Removes callback if its in the collection array */
    function remove(callback) {
        var index = collection.indexOf(callback);
        if (index !== -1){
            collection.splice(index, 1);
            shouldPlayOrPause();
        }
    }

    /**
     * Public methos
     * @public {function}
     */
    self.add = add;
    self.remove = remove;
    self.start = start;
    self.stop = stop;

    /**
     * @return {object} Returns public methods
     */
    return self;
}