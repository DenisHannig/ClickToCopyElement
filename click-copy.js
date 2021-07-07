/**
 * A simple click to copy element.
 *
 * @link https://github.com/DenisHannig
 * @author Denis Hannig
 * @version 1.0.0
 * @name ClickCopy
 * @since  07-07-2021
 */

/**
 * @private
 * @type {{
       init: ClickCopy.init,
       setupEventListeners: ClickCopy.setupEventListeners,
       mouseHintOnClick: ClickCopy.mouseHintOnClick
    }}
 */
var ClickCopy = {

    /**
     * Initialize one or multiple clickToCopy elements.
     *
     * @param clickToCopyElements { HTMLElement | [HTMLElement] | {} }
     */
    init: function (clickToCopyElements) {
        clickToCopyHelper.each(clickToCopyElements, function (index, element) {
            if (element.childNodes.length === 1 &&
                element.childElementCount === 0) {
                element.setAttribute('style', 'cursor: copy;');
                ClickCopy.setupEventListeners(element);
            } else if (element.childNodes.length > 1 ||
                element.childElementCount > 0) {
                console.error('ERROR\nPlease check the element', element, '\nIt may contain an invalid item. Make sure to only add a string between the <click-copy></click-copy> tags.');
            } else {
                console.error('ERROR\nPlease check the element', element, '\nIt should look like this:\n<click-copy>Your Text Here</click-copy>');
            }
        });
    },

    /**
     * Setup default event listeners.
     *
     * @param clickToCopy { HTMLElement | [HTMLElement] | {} }
     */
    setupEventListeners: function (clickToCopy) {
        clickToCopyHelper.offOn("click", clickToCopy, function (event) {
            event.stopPropagation();
            clickToCopyHelper.copyToClipboard(this.innerText)
            ClickCopy.mouseHintOnClick(event, this);
        });
    },

    /**
     * Show a hint next to the mouse cursor.
     *
     * @param event
     * @param parent
     */
    mouseHintOnClick: function (event, parent) {
        var hintText = parent.getAttribute('hint-text');
        if (hintText === null) return;
        var clickPos = {x: event.clientX + 10 + 'px', y: event.clientY - 6 + 'px'};
        var mouseHintDiv = document.createElement('div');
        mouseHintDiv.classList.add('mouse-hint');
        mouseHintDiv.style.left = clickPos.x;
        mouseHintDiv.style.top = clickPos.y;
        mouseHintDiv.innerHTML = clickToCopyHelper.getMouseHintStyle();

        var mouseHintSpan = document.createElement('span');
        mouseHintDiv.appendChild(mouseHintSpan);
        mouseHintSpan.innerText = hintText;

        document.body.appendChild(mouseHintDiv);

        clickToCopyHelper.fadeIn(mouseHintDiv, 250, function () {
            setTimeout(function () {
                clickToCopyHelper.fadeOut(mouseHintDiv, 500, function () {
                    document.body.removeChild(mouseHintDiv);
                });
            }, 1000);
        });
    },

};

document.addEventListener("DOMContentLoaded", function (event) {
    /**
     * Initial call to setup all <click-copy> tags.
     */
    (function () {
        ClickCopy.init(clickToCopyHelper.findAllClickToCopyElements());
    })();
});

/**
 *
 * @type {{
        isFunction: (function(*)),
        each: _ClickToCopyHelper.each,
        eventsHandler: _ClickToCopyHelper.eventsHandler,
        off: _ClickToCopyHelper.off,
        on: _ClickToCopyHelper.on,
        offOn: _ClickToCopyHelper.offOn,
        fadeOut: _ClickToCopyHelper.fadeOut,
        fadeIn: _ClickToCopyHelper.fadeIn,
        findAllClickToCopyElements: (function(): NodeListOf<HTMLElement>),
        copyToClipboard: _ClickToCopyHelper.copyToClipboard,
        getMouseHintStyle: (function(): string)
    }}
 * @private
 */
var _ClickToCopyHelper = new function () {
    return {
        /**
         * Check whether a given 'object' is a Function or not.
         *
         * @param obj { * }
         * @return { boolean }
         */
        isFunction: function (obj) {
            return (obj && typeof obj === 'function')
        },
        /**
         * Loop through a given list of Elements.
         * A callback Function will be called which has an index and
         * a single Element as parameters.
         *
         * @param elems { [HTMLElement|*] }
         * @param callback { Function }
         */
        each: function (elems, callback) {
            if (elems && clickToCopyHelper.isFunction(callback)) {
                for (var index = 0; index < elems.length; index++) {
                    callback(index, elems[index]);
                }
            }
        },
        /**
         * Helper function for setting and removing Event Listeners.
         *
         * @param method { * }
         * @param events { string }
         * @param elems { [HTMLElement] }
         * @param listener { function }
         */
        eventsHandler: function (method, events, elems, listener) {
            if (elems && !Array.isArray(elems) && !NodeList.prototype.isPrototypeOf(elems)) {
                var array = [];
                array.push(elems);
                elems = array;
            }
            var allEvents = events.split(' ');
            clickToCopyHelper.each(allEvents, function (index, singleEvent) {
                clickToCopyHelper.each(elems, function (index, el) {
                    if (method === "addEventListener") {
                        if (el.attachEvent) {
                            el['e' + singleEvent + listener] = listener;
                            el[singleEvent + listener] = function () {
                                el['e' + singleEvent + listener](window.event);
                            }
                            el.attachEvent('on' + singleEvent, el[singleEvent + listener]);
                        } else {
                            el.addEventListener(singleEvent, listener, false);
                        }
                    } else if (method === "removeEventListener") {
                        if (el.detachEvent) {
                            el['e' + singleEvent + listener] = listener;
                            el[singleEvent + listener] = function () {
                                el['e' + singleEvent + listener](window.event);
                            }
                            el.attachEvent('on' + singleEvent, el[singleEvent + listener]);
                        } else {
                            el.removeEventListener(singleEvent, listener, false);
                        }
                    }
                });
            });
        },
        /**
         * Remove an Event Listener for a given Element.
         *
         * @param events { string }
         * @param elem { HTMLElement | [HTMLElement] }
         * @param listener { function }
         */
        off: function (events, elem, listener) {
            this.eventsHandler("removeEventListener", events, elem, listener);
        },
        /**
         * Set an Event Listener for a given Element.
         *
         * @param events { string }
         * @param elem { HTMLElement | [HTMLElement] }
         * @param listener { function }
         */
        on: function (events, elem, listener) {
            this.eventsHandler("addEventListener", events, elem, listener);
        },
        /**
         * Reset an Event Listener for a given Element.
         *
         * @param events { string }
         * @param elem { HTMLElement | [HTMLElement] }
         * @param listener { function }
         */
        offOn: function (events, elem, listener) {
            this.off(events, elem, listener)
            this.on(events, elem, listener)
        },
        /**
         * Fade Out a given Element.
         *
         * @param elem { HTMLElement | [HTMLElement] }
         * @param time { Number }
         * @param promise { function }
         */
        fadeOut: function (elem, time, promise) {
            elem.style.opacity = 1;

            var last = +new Date();
            var tick = function () {
                elem.style.opacity = +elem.style.opacity - (new Date() - last) / time;
                last = +new Date();

                if (+elem.style.opacity > 0) {
                    (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
                } else {
                    elem.style.opacity = 0;
                    if (clickToCopyHelper.isFunction(promise)) {
                        promise();
                    }
                }
            };

            tick();
        },
        /**
         * Fade In a given Element.
         *
         * @param elem { HTMLElement | [HTMLElement] }
         * @param time { Number }
         * @param promise { function }
         */
        fadeIn: function (elem, time, promise) {
            elem.style.opacity = 0;
            elem.style.display = 'block';

            var last = +new Date();
            var tick = function () {
                elem.style.opacity = +elem.style.opacity + (new Date() - last) / time;
                last = +new Date();

                if (+elem.style.opacity < 1) {
                    (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
                } else {
                    elem.style.opacity = 1;
                    if (clickToCopyHelper.isFunction(promise)) {
                        promise();
                    }
                }
            };

            tick();
        },
        /**
         * Find all ClickToCopy Elements in the document.
         *
         * @returns { NodeListOf<HTMLElement> | [HTMLElement] }
         */
        findAllClickToCopyElements: function () {
            return document.querySelectorAll("click-copy");
        },
        /**
         * Copy a given Text to the Clipboard.
         *
         * @param text { string }
         */
        copyToClipboard: function (text) {
            var tempElem = document.createElement('textarea');
            tempElem.style.position = 'absolute';
            tempElem.style.top = '-99999px';
            tempElem.style.left = '-99999px';
            tempElem.value = text;
            document.body.appendChild(tempElem);
            tempElem.select();
            document.execCommand("copy");
            document.body.removeChild(tempElem);
        },
        /**
         * Predefined style for a Mouse Hint Element.
         *
         * @return { string }
         */
        getMouseHintStyle: function () {
            return '' +
                '<style>' +
                '.mouse-hint {' +
                '   background-color: #ffffff;' +
                '   border: 1px solid #454545;' +
                '   border-radius: 1px;' +
                '   box-shadow: 0 0 8px 0 #00000050;' +
                '   color: #454545;' +
                '   display: none;' +
                '   padding: 0 4px;' +
                '   pointer-events: none;' +
                '   position: absolute;' +
                '   z-index: 1000;' +
                '}' +
                '</style>'
        }
    };
};
var clickToCopyHelper = _ClickToCopyHelper;
