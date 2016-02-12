// Bouncing elements according to scroll position
/**
 *  Assigns className to given elements, according to window scroll position.
 * @param elements - single DOM object, or array of DOM objects
 * @param options - bounceClass - class to be bound to elements,
 *                  bottomCorrection - value to be added to current viewport, to cancel bouncing
 *                  limits - array of y coordinates at which bouncing should occur
 * @constructor
 */
(function () {
    "use strict";
    var default_options = {
        bounceClass     : 'bounce',
        bottomCorrection: 0,
        direction: 'down',
        elements: null,
        limits          : {
            top       : null,
            topReverse: null,
            bottom    : null
        }
    };

    function Bouncer(options) {
        if(this instanceof Bouncer) {
            this.options = options || {};
            if (typeof elements !== 'string' && !(elements instanceof Array)) {
                throw new TypeError('Wrong elements given: ' + elements);
            }
            // TODO now in options
            this.direction = 'down';
            // TODO make this private
            this.posTopCache = window.pageYOffset;
            // TODO now in options
            this.el = elements;
            // TODO get rid of that
            this.customOptions = options;
        } else {
            return new Bouncer(options);
        }
    }

    Bouncer.prototype.bounce = function () {
        this._setDimensions();
        this._init();
    };

    Bouncer.prototype._init = function () {
        this._setElements();
        this._setOptions();
        this._setLimits();
        window.addEventListener('scroll', this._toggleElem.bind(this));
    };

    Bouncer.prototype._setDimensions = function() {
        this.dimensions = {
            totalHeight  : Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight
            ),
            currentHeight: document.documentElement.clientHeight
        };
    };

    /**
     * Detaches scrolling event.
     */
    Bouncer.prototype.unbind = function () {
        window.removeEventListener('scroll', this._toggleElem.bind(this));
    };

    /**
     *  Accessor for document elements, to be processed.
     * @private
     */
    Bouncer.prototype._setElements = function () {
        if (typeof this.el === 'string') {
            this.el = document.querySelector(this.el);
        }
        if (this.el instanceof Array) {
            this.el = this.el.map(function (element) {
                return typeof element === 'string'
                    ? document.querySelector(element)
                    : null;
            });
        }
    };

    /**
     * Mixing users options with default ones.
     * @private
     */
    Bouncer.prototype._setOptions = function () {
        try {
            if($) {
                $.extend(true, this.options, this.customOptions);
            }
            if(typeof Object.assign === 'function') {
                this.options = Object.assign({}, default_options, this.options);
            }
        } catch (e) {

        }
    };

    /**
     * Accesor for instance options.limits property.
     * @private
     */
    Bouncer.prototype._setLimits = function () {
        this.options.limits.top = this.options.limits.top || this.dimensions.currentHeight;
        this.options.limits.topReverse = this.options.limits.topReverse || this.dimensions.currentHeight / 2;
        this.options.limits.bottom = isNaN(this.options.limits.bottom)
            ? this.dimensions.totalHeight : this.options.limits.bottom;
    };

    /**
     * Caches top window position.
     * @param posTop
     * @private
     */
    Bouncer.prototype._cachePosTop = function (posTop) {
        if (this.posTopCache !== posTop) {
            this.posTopCache = posTop;
        }
    };

    /**
     * Sets direction property and caches the posTop property.
     * @param posTop
     * @private
     */
    Bouncer.prototype._setDirection = function (posTop) {
        this.direction = posTop > this.posTopCache ? 'down' : 'up';
    };

    /**
     * Switches class on instance element(s).
     */
    Bouncer.prototype._toggleElem = function () {
        var posTop = window.pageYOffset, _this = this;
        _this._setDirection(posTop);
        _this._cachePosTop(posTop);
        if (_this.el instanceof Array) {
            _this.el.forEach(function (elem) {
                _this._addElemClass(elem, _this, posTop);
            });
        } else {
            _this._addElemClass(_this.el, _this, posTop);
        }
    };

    /**
     * Adding class helper
     * @param elem - element to apply class name to
     * @param self - instance object link
     * @param posTop - document current position from top.
     */
    Bouncer.prototype._addElemClass = function (elem, self, posTop) {
        var bottomPoint = posTop + self.dimensions.currentHeight + self.options.bottomCorrection;
        if (!$(elem).hasClass(self.options.bounceClass) && posTop >= self.options.limits.top) {
            $(elem).addClass(self.options.bounceClass);
        }
        if (
            (self.direction === 'up' && posTop <= self.options.limits.topReverse)
            ||
            (self.options.limits.bottom > 0 && self.direction === 'down' && bottomPoint >= self.options.limits.bottom)
        ) {
            $(elem).removeClass(self.options.bounceClass);
        }
    };
});