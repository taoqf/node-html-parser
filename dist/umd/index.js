var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "he"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var he_1 = require("he");
    var NodeType;
    (function (NodeType) {
        NodeType[NodeType["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
        NodeType[NodeType["TEXT_NODE"] = 3] = "TEXT_NODE";
    })(NodeType = exports.NodeType || (exports.NodeType = {}));
    /**
     * Node Class as base class for TextNode and HTMLElement.
     */
    var Node = /** @class */ (function () {
        function Node() {
            this.childNodes = [];
        }
        return Node;
    }());
    exports.Node = Node;
    /**
     * TextNode to contain a text element in DOM tree.
     * @param {string} value [description]
     */
    var TextNode = /** @class */ (function (_super) {
        __extends(TextNode, _super);
        function TextNode(value) {
            var _this = _super.call(this) || this;
            /**
             * Node Type declaration.
             * @type {Number}
             */
            _this.nodeType = NodeType.TEXT_NODE;
            _this.rawText = value;
            return _this;
        }
        Object.defineProperty(TextNode.prototype, "text", {
            /**
             * Get unescaped text value of current node and its children.
             * @return {string} text content
             */
            get: function () {
                return he_1.decode(this.rawText);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextNode.prototype, "isWhitespace", {
            /**
             * Detect if the node contains only white space.
             * @return {bool}
             */
            get: function () {
                return /^(\s|&nbsp;)*$/.test(this.rawText);
            },
            enumerable: true,
            configurable: true
        });
        TextNode.prototype.toString = function () {
            return this.text;
        };
        return TextNode;
    }(Node));
    exports.TextNode = TextNode;
    var kBlockElements = {
        div: true,
        p: true,
        // ul: true,
        // ol: true,
        li: true,
        // table: true,
        // tr: true,
        td: true,
        section: true,
        br: true
    };
    function arr_back(arr) {
        return arr[arr.length - 1];
    }
    /**
     * HTMLElement, which contains a set of children.
     *
     * Note: this is a minimalist implementation, no complete tree
     *   structure provided (no parentNode, nextSibling,
     *   previousSibling etc).
     * @class HTMLElement
     * @extends {Node}
     */
    var HTMLElement = /** @class */ (function (_super) {
        __extends(HTMLElement, _super);
        /**
         * Creates an instance of HTMLElement.
         * @param keyAttrs	id and class attribute
         * @param [rawAttrs]	attributes in string
         *
         * @memberof HTMLElement
         */
        function HTMLElement(tagName, keyAttrs, rawAttrs, parentNode) {
            if (rawAttrs === void 0) { rawAttrs = ''; }
            if (parentNode === void 0) { parentNode = null; }
            var _this = _super.call(this) || this;
            _this.tagName = tagName;
            _this.rawAttrs = rawAttrs;
            _this.parentNode = parentNode;
            _this.classNames = [];
            /**
             * Node Type declaration.
             */
            _this.nodeType = NodeType.ELEMENT_NODE;
            _this.rawAttrs = rawAttrs || '';
            _this.parentNode = parentNode || null;
            _this.childNodes = [];
            if (keyAttrs.id) {
                _this.id = keyAttrs.id;
            }
            if (keyAttrs.class) {
                _this.classNames = keyAttrs.class.split(/\s+/);
            }
            return _this;
        }
        /**
         * Remove Child element from childNodes array
         * @param {HTMLElement} node     node to remove
         */
        HTMLElement.prototype.removeChild = function (node) {
            this.childNodes = this.childNodes.filter(function (child) {
                return (child !== node);
            });
        };
        /**
         * Exchanges given child with new child
         * @param {HTMLElement} oldNode     node to exchange
         * @param {HTMLElement} newNode     new node
         */
        HTMLElement.prototype.exchangeChild = function (oldNode, newNode) {
            var idx = -1;
            for (var i = 0; i < this.childNodes.length; i++) {
                if (this.childNodes[i] === oldNode) {
                    idx = i;
                    break;
                }
            }
            this.childNodes[idx] = newNode;
        };
        Object.defineProperty(HTMLElement.prototype, "rawText", {
            /**
             * Get escpaed (as-it) text value of current node and its children.
             * @return {string} text content
             */
            get: function () {
                var res = '';
                for (var i = 0; i < this.childNodes.length; i++)
                    res += this.childNodes[i].rawText;
                return res;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HTMLElement.prototype, "text", {
            /**
             * Get unescaped text value of current node and its children.
             * @return {string} text content
             */
            get: function () {
                return he_1.decode(this.rawText);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HTMLElement.prototype, "structuredText", {
            /**
             * Get structured Text (with '\n' etc.)
             * @return {string} structured text
             */
            get: function () {
                var currentBlock = [];
                var blocks = [currentBlock];
                function dfs(node) {
                    if (node.nodeType === NodeType.ELEMENT_NODE) {
                        if (kBlockElements[node.tagName]) {
                            if (currentBlock.length > 0) {
                                blocks.push(currentBlock = []);
                            }
                            node.childNodes.forEach(dfs);
                            if (currentBlock.length > 0) {
                                blocks.push(currentBlock = []);
                            }
                        }
                        else {
                            node.childNodes.forEach(dfs);
                        }
                    }
                    else if (node.nodeType === NodeType.TEXT_NODE) {
                        if (node.isWhitespace) {
                            // Whitespace node, postponed output
                            currentBlock.prependWhitespace = true;
                        }
                        else {
                            var text = node.text;
                            if (currentBlock.prependWhitespace) {
                                text = ' ' + text;
                                currentBlock.prependWhitespace = false;
                            }
                            currentBlock.push(text);
                        }
                    }
                }
                dfs(this);
                return blocks
                    .map(function (block) {
                    // Normalize each line's whitespace
                    return block.join('').trim().replace(/\s{2,}/g, ' ');
                })
                    .join('\n').replace(/\s+$/, ''); // trimRight;
            },
            enumerable: true,
            configurable: true
        });
        HTMLElement.prototype.toString = function () {
            var tag = this.tagName;
            if (tag) {
                var is_un_closed = /^meta$/i.test(tag);
                var is_self_closed = /^(img|br|hr|area|base|input|doctype|link)$/i.test(tag);
                var attrs = this.rawAttrs ? ' ' + this.rawAttrs : '';
                if (is_un_closed) {
                    return "<" + tag + attrs + ">";
                }
                else if (is_self_closed) {
                    return "<" + tag + attrs + " />";
                }
                else {
                    return "<" + tag + attrs + ">" + this.innerHTML + "</" + tag + ">";
                }
            }
            else {
                return this.innerHTML;
            }
        };
        Object.defineProperty(HTMLElement.prototype, "innerHTML", {
            get: function () {
                return this.childNodes.map(function (child) {
                    return child.toString();
                }).join('');
            },
            enumerable: true,
            configurable: true
        });
        HTMLElement.prototype.set_content = function (content) {
            if (content instanceof Node) {
                content = [content];
            }
            else if (typeof content == 'string') {
                var r = parse(content);
                content = r.childNodes.length ? r.childNodes : [new TextNode(content)];
            }
            this.childNodes = content;
        };
        Object.defineProperty(HTMLElement.prototype, "outerHTML", {
            get: function () {
                return this.toString();
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Trim element from right (in block) after seeing pattern in a TextNode.
         * @param  {RegExp} pattern pattern to find
         * @return {HTMLElement}    reference to current node
         */
        HTMLElement.prototype.trimRight = function (pattern) {
            for (var i = 0; i < this.childNodes.length; i++) {
                var childNode = this.childNodes[i];
                if (childNode.nodeType === NodeType.ELEMENT_NODE) {
                    childNode.trimRight(pattern);
                }
                else {
                    var index = childNode.rawText.search(pattern);
                    if (index > -1) {
                        childNode.rawText = childNode.rawText.substr(0, index);
                        // trim all following nodes.
                        this.childNodes.length = i + 1;
                    }
                }
            }
            return this;
        };
        Object.defineProperty(HTMLElement.prototype, "structure", {
            /**
             * Get DOM structure
             * @return {string} strucutre
             */
            get: function () {
                var res = [];
                var indention = 0;
                function write(str) {
                    res.push('  '.repeat(indention) + str);
                }
                function dfs(node) {
                    var idStr = node.id ? ('#' + node.id) : '';
                    var classStr = node.classNames.length ? ('.' + node.classNames.join('.')) : '';
                    write(node.tagName + idStr + classStr);
                    indention++;
                    for (var i = 0; i < node.childNodes.length; i++) {
                        var childNode = node.childNodes[i];
                        if (childNode.nodeType === NodeType.ELEMENT_NODE) {
                            dfs(childNode);
                        }
                        else if (childNode.nodeType === NodeType.TEXT_NODE) {
                            if (!childNode.isWhitespace)
                                write('#text');
                        }
                    }
                    indention--;
                }
                dfs(this);
                return res.join('\n');
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Remove whitespaces in this sub tree.
         * @return {HTMLElement} pointer to this
         */
        HTMLElement.prototype.removeWhitespace = function () {
            var o = 0;
            for (var i = 0; i < this.childNodes.length; i++) {
                var node = this.childNodes[i];
                if (node.nodeType === NodeType.TEXT_NODE) {
                    if (node.isWhitespace)
                        continue;
                    node.rawText = node.rawText.trim();
                }
                else if (node.nodeType === NodeType.ELEMENT_NODE) {
                    node.removeWhitespace();
                }
                this.childNodes[o++] = node;
            }
            this.childNodes.length = o;
            return this;
        };
        /**
         * Query CSS selector to find matching nodes.
         * @param  {string}         selector Simplified CSS selector
         * @param  {Matcher}        selector A Matcher instance
         * @return {HTMLElement[]}  matching elements
         */
        HTMLElement.prototype.querySelectorAll = function (selector) {
            var matcher;
            if (selector instanceof Matcher) {
                matcher = selector;
                matcher.reset();
            }
            else {
                matcher = new Matcher(selector);
            }
            var res = [];
            var stack = [];
            for (var i = 0; i < this.childNodes.length; i++) {
                stack.push([this.childNodes[i], 0, false]);
                while (stack.length) {
                    var state = arr_back(stack);
                    var el = state[0];
                    if (state[1] === 0) {
                        // Seen for first time.
                        if (el.nodeType !== NodeType.ELEMENT_NODE) {
                            stack.pop();
                            continue;
                        }
                        if (state[2] = matcher.advance(el)) {
                            if (matcher.matched) {
                                res.push(el);
                                // no need to go further.
                                matcher.rewind();
                                stack.pop();
                                continue;
                            }
                        }
                    }
                    if (state[1] < el.childNodes.length) {
                        stack.push([el.childNodes[state[1]++], 0, false]);
                    }
                    else {
                        if (state[2])
                            matcher.rewind();
                        stack.pop();
                    }
                }
            }
            return res;
        };
        /**
         * Query CSS Selector to find matching node.
         * @param  {string}         selector Simplified CSS selector
         * @param  {Matcher}        selector A Matcher instance
         * @return {HTMLElement}    matching node
         */
        HTMLElement.prototype.querySelector = function (selector) {
            var matcher;
            if (selector instanceof Matcher) {
                matcher = selector;
                matcher.reset();
            }
            else {
                matcher = new Matcher(selector);
            }
            var stack = [];
            for (var i = 0; i < this.childNodes.length; i++) {
                stack.push([this.childNodes[i], 0, false]);
                while (stack.length) {
                    var state = arr_back(stack);
                    var el = state[0];
                    if (state[1] === 0) {
                        // Seen for first time.
                        if (el.nodeType !== NodeType.ELEMENT_NODE) {
                            stack.pop();
                            continue;
                        }
                        if (state[2] = matcher.advance(el)) {
                            if (matcher.matched) {
                                return el;
                            }
                        }
                    }
                    if (state[1] < el.childNodes.length) {
                        stack.push([el.childNodes[state[1]++], 0, false]);
                    }
                    else {
                        if (state[2])
                            matcher.rewind();
                        stack.pop();
                    }
                }
            }
            return null;
        };
        /**
         * Append a child node to childNodes
         * @param  {Node} node node to append
         * @return {Node}      node appended
         */
        HTMLElement.prototype.appendChild = function (node) {
            // node.parentNode = this;
            this.childNodes.push(node);
            if (node instanceof HTMLElement) {
                node.parentNode = this;
            }
            return node;
        };
        Object.defineProperty(HTMLElement.prototype, "firstChild", {
            /**
             * Get first child node
             * @return {Node} first child node
             */
            get: function () {
                return this.childNodes[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HTMLElement.prototype, "lastChild", {
            /**
             * Get last child node
             * @return {Node} last child node
             */
            get: function () {
                return arr_back(this.childNodes);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HTMLElement.prototype, "attributes", {
            /**
             * Get attributes
             * @return {Object} parsed and unescaped attributes
             */
            get: function () {
                if (this._attrs)
                    return this._attrs;
                this._attrs = {};
                var attrs = this.rawAttributes;
                for (var key in attrs) {
                    this._attrs[key] = he_1.decode(attrs[key]);
                }
                return this._attrs;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HTMLElement.prototype, "rawAttributes", {
            /**
             * Get escaped (as-it) attributes
             * @return {Object} parsed attributes
             */
            get: function () {
                if (this._rawAttrs)
                    return this._rawAttrs;
                var attrs = {};
                if (this.rawAttrs) {
                    var re = /\b([a-z][a-z0-9\-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/ig;
                    var match = void 0;
                    while (match = re.exec(this.rawAttrs)) {
                        attrs[match[1]] = match[2] || match[3] || match[4] || "";
                    }
                }
                this._rawAttrs = attrs;
                return attrs;
            },
            enumerable: true,
            configurable: true
        });
        return HTMLElement;
    }(Node));
    exports.HTMLElement = HTMLElement;
    /**
     * Cache to store generated match functions
     * @type {Object}
     */
    var pMatchFunctionCache = {};
    /**
     * Function cache
     */
    var functionCache = {
        "f145": function (el, tagName, classes, attr_key, value) {
            "use strict";
            tagName = tagName || "";
            classes = classes || [];
            attr_key = attr_key || "";
            value = value || "";
            if (el.id != tagName.substr(1))
                return false;
            for (var cls = classes, i = 0; i < cls.length; i++)
                if (el.classNames.indexOf(cls[i]) === -1)
                    return false;
            return true;
        },
        "f45": function (el, tagName, classes, attr_key, value) {
            "use strict";
            tagName = tagName || "";
            classes = classes || [];
            attr_key = attr_key || "";
            value = value || "";
            for (var cls = classes, i = 0; i < cls.length; i++)
                if (el.classNames.indexOf(cls[i]) === -1)
                    return false;
            return true;
        },
        "f15": function (el, tagName, classes, attr_key, value) {
            "use strict";
            tagName = tagName || "";
            classes = classes || [];
            attr_key = attr_key || "";
            value = value || "";
            if (el.id != tagName.substr(1))
                return false;
            return true;
        },
        "f1": function (el, tagName, classes, attr_key, value) {
            "use strict";
            tagName = tagName || "";
            classes = classes || [];
            attr_key = attr_key || "";
            value = value || "";
            if (el.id != tagName.substr(1))
                return false;
        },
        "f5": function (el, tagName, classes, attr_key, value) {
            "use strict";
            el = el || {};
            tagName = tagName || "";
            classes = classes || [];
            attr_key = attr_key || "";
            value = value || "";
            return true;
        },
        "f245": function (el, tagName, classes, attr_key, value) {
            "use strict";
            tagName = tagName || "";
            classes = classes || [];
            attr_key = attr_key || "";
            value = value || "";
            var attrs = el.attributes;
            for (var key in attrs) {
                var val = attrs[key];
                if (key == attr_key && val == value) {
                    return true;
                }
            }
            return false;
            // for (let cls = classes, i = 0; i < cls.length; i++) {if (el.classNames.indexOf(cls[i]) === -1){ return false;}}
            // return true;
        },
        "f25": function (el, tagName, classes, attr_key, value) {
            "use strict";
            tagName = tagName || "";
            classes = classes || [];
            attr_key = attr_key || "";
            value = value || "";
            var attrs = el.attributes;
            for (var key in attrs) {
                var val = attrs[key];
                if (key == attr_key && val == value) {
                    return true;
                }
            }
            return false;
            //return true;
        },
        "f2": function (el, tagName, classes, attr_key, value) {
            "use strict";
            tagName = tagName || "";
            classes = classes || [];
            attr_key = attr_key || "";
            value = value || "";
            var attrs = el.attributes;
            for (var key in attrs) {
                var val = attrs[key];
                if (key == attr_key && val == value) {
                    return true;
                }
            }
            return false;
        },
        "f345": function (el, tagName, classes, attr_key, value) {
            "use strict";
            tagName = tagName || "";
            classes = classes || [];
            attr_key = attr_key || "";
            value = value || "";
            if (el.tagName != tagName)
                return false;
            for (var cls = classes, i = 0; i < cls.length; i++)
                if (el.classNames.indexOf(cls[i]) === -1)
                    return false;
            return true;
        },
        "f35": function (el, tagName, classes, attr_key, value) {
            "use strict";
            tagName = tagName || "";
            classes = classes || [];
            attr_key = attr_key || "";
            value = value || "";
            if (el.tagName != tagName)
                return false;
            return true;
        },
        "f3": function (el, tagName, classes, attr_key, value) {
            "use strict";
            tagName = tagName || "";
            classes = classes || [];
            attr_key = attr_key || "";
            value = value || "";
            if (el.tagName != tagName)
                return false;
        }
    };
    /**
     * Matcher class to make CSS match
     *
     * @class Matcher
     */
    var Matcher = /** @class */ (function () {
        /**
         * Creates an instance of Matcher.
         * @param {string} selector
         *
         * @memberof Matcher
         */
        function Matcher(selector) {
            this.nextMatch = 0;
            functionCache["f5"] = functionCache["f5"];
            this.matchers = selector.split(' ').map(function (matcher) {
                if (pMatchFunctionCache[matcher])
                    return pMatchFunctionCache[matcher];
                var parts = matcher.split('.');
                var tagName = parts[0];
                var classes = parts.slice(1).sort();
                var source = '"use strict";';
                var function_name = 'f';
                var attr_key = "";
                var value = "";
                if (tagName && tagName != '*') {
                    var matcher_1;
                    if (tagName[0] == '#') {
                        source += 'if (el.id != ' + JSON.stringify(tagName.substr(1)) + ') return false;'; //1
                        function_name += '1';
                    }
                    else if (matcher_1 = tagName.match(/^\[\s*(\S+)\s*(=|!=)\s*((((["'])([^\6]*)\6))|(\S*?))\]\s*/)) {
                        attr_key = matcher_1[1];
                        var method = matcher_1[2];
                        if (method !== '=' && method !== '!=') {
                            throw new Error('Selector not supported, Expect [key${op}value].op must be =,!=');
                        }
                        if (method === '=') {
                            method = '==';
                        }
                        value = matcher_1[7] || matcher_1[8];
                        source += "let attrs = el.attributes;for (let key in attrs){const val = attrs[key]; if (key == \"" + attr_key + "\" && val == \"" + value + "\"){return true;}} return false;"; //2
                        function_name += '2';
                    }
                    else {
                        source += 'if (el.tagName != ' + JSON.stringify(tagName) + ') return false;'; //3
                        function_name += '3';
                    }
                }
                if (classes.length > 0) {
                    source += 'for (let cls = ' + JSON.stringify(classes) + ', i = 0; i < cls.length; i++) if (el.classNames.indexOf(cls[i]) === -1) return false;'; //4
                    function_name += '4';
                }
                source += 'return true;'; //5
                function_name += '5';
                var obj = {
                    func: functionCache[function_name],
                    tagName: tagName || "",
                    classes: classes || "",
                    attr_key: attr_key || "",
                    value: value || ""
                };
                source = source || "";
                return pMatchFunctionCache[matcher] = obj;
            });
        }
        /**
         * Trying to advance match pointer
         * @param  {HTMLElement} el element to make the match
         * @return {bool}           true when pointer advanced.
         */
        Matcher.prototype.advance = function (el) {
            if (this.nextMatch < this.matchers.length &&
                this.matchers[this.nextMatch].func(el, this.matchers[this.nextMatch].tagName, this.matchers[this.nextMatch].classes, this.matchers[this.nextMatch].attr_key, this.matchers[this.nextMatch].value)) {
                this.nextMatch++;
                return true;
            }
            return false;
        };
        /**
         * Rewind the match pointer
         */
        Matcher.prototype.rewind = function () {
            this.nextMatch--;
        };
        Object.defineProperty(Matcher.prototype, "matched", {
            /**
             * Trying to determine if match made.
             * @return {bool} true when the match is made
             */
            get: function () {
                return this.nextMatch == this.matchers.length;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Rest match pointer.
         * @return {[type]} [description]
         */
        Matcher.prototype.reset = function () {
            this.nextMatch = 0;
        };
        /**
         * flush cache to free memory
         */
        Matcher.prototype.flushCache = function () {
            pMatchFunctionCache = {};
        };
        return Matcher;
    }());
    exports.Matcher = Matcher;
    // https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
    var kMarkupPattern = /<!--[^]*?(?=-->)-->|<(\/?)([a-z][-.0-9_a-z]*)\s*([^>]*?)(\/?)>/ig;
    var kAttributePattern = /(^|\s)(id|class)\s*=\s*("([^"]+)"|'([^']+)'|(\S+))/ig;
    var kSelfClosingElements = {
        area: true,
        base: true,
        br: true,
        col: true,
        hr: true,
        img: true,
        input: true,
        link: true,
        meta: true,
        source: true
    };
    var kElementsClosedByOpening = {
        li: { li: true },
        p: { p: true, div: true },
        b: { div: true },
        td: { td: true, th: true },
        th: { td: true, th: true },
        h1: { h1: true },
        h2: { h2: true },
        h3: { h3: true },
        h4: { h4: true },
        h5: { h5: true },
        h6: { h6: true }
    };
    var kElementsClosedByClosing = {
        li: { ul: true, ol: true },
        a: { div: true },
        b: { div: true },
        i: { div: true },
        p: { div: true },
        td: { tr: true, table: true },
        th: { tr: true, table: true }
    };
    var kBlockTextElements = {
        script: true,
        noscript: true,
        style: true,
        pre: true
    };
    /**
     * Parses HTML and returns a root element
     * Parse a chuck of HTML source.
     * @param  {string} data      html
     * @return {HTMLElement}      root element
     */
    function parse(data, options) {
        var root = new HTMLElement(null, {});
        var currentParent = root;
        var stack = [root];
        var lastTextPos = -1;
        options = options || {};
        var match;
        while (match = kMarkupPattern.exec(data)) {
            if (lastTextPos > -1) {
                if (lastTextPos + match[0].length < kMarkupPattern.lastIndex) {
                    // if has content
                    var text = data.substring(lastTextPos, kMarkupPattern.lastIndex - match[0].length);
                    currentParent.appendChild(new TextNode(text));
                }
            }
            lastTextPos = kMarkupPattern.lastIndex;
            if (match[0][1] == '!') {
                // this is a comment
                continue;
            }
            if (options.lowerCaseTagName)
                match[2] = match[2].toLowerCase();
            if (!match[1]) {
                // not </ tags
                var attrs = {};
                for (var attMatch = void 0; attMatch = kAttributePattern.exec(match[3]);) {
                    attrs[attMatch[2]] = attMatch[4] || attMatch[5] || attMatch[6];
                }
                if (!match[4] && kElementsClosedByOpening[currentParent.tagName]) {
                    if (kElementsClosedByOpening[currentParent.tagName][match[2]]) {
                        stack.pop();
                        currentParent = arr_back(stack);
                    }
                }
                currentParent = currentParent.appendChild(new HTMLElement(match[2], attrs, match[3]));
                stack.push(currentParent);
                if (kBlockTextElements[match[2]]) {
                    // a little test to find next </script> or </style> ...
                    var closeMarkup = '</' + match[2] + '>';
                    var index = data.indexOf(closeMarkup, kMarkupPattern.lastIndex);
                    if (options[match[2]]) {
                        var text = void 0;
                        if (index == -1) {
                            // there is no matching ending for the text element.
                            text = data.substr(kMarkupPattern.lastIndex);
                        }
                        else {
                            text = data.substring(kMarkupPattern.lastIndex, index);
                        }
                        if (text.length > 0) {
                            currentParent.appendChild(new TextNode(text));
                        }
                    }
                    if (index == -1) {
                        lastTextPos = kMarkupPattern.lastIndex = data.length + 1;
                    }
                    else {
                        lastTextPos = kMarkupPattern.lastIndex = index + closeMarkup.length;
                        match[1] = 'true';
                    }
                }
            }
            if (match[1] || match[4] ||
                kSelfClosingElements[match[2]]) {
                // </ or /> or <br> etc.
                while (true) {
                    if (currentParent.tagName == match[2]) {
                        stack.pop();
                        currentParent = arr_back(stack);
                        break;
                    }
                    else {
                        // Trying to close current tag, and move on
                        if (kElementsClosedByClosing[currentParent.tagName]) {
                            if (kElementsClosedByClosing[currentParent.tagName][match[2]]) {
                                stack.pop();
                                currentParent = arr_back(stack);
                                continue;
                            }
                        }
                        // Use aggressive strategy to handle unmatching markups.
                        break;
                    }
                }
            }
        }
        var valid = !!(stack.length === 1);
        if (!options.noFix) {
            var response = root;
            response.valid = valid;
            var _loop_1 = function () {
                // Handle each error elements.
                var last = stack.pop();
                var oneBefore = arr_back(stack);
                if (last.parentNode && last.parentNode.parentNode) {
                    if (last.parentNode === oneBefore && last.tagName === oneBefore.tagName) {
                        // Pair error case <h3> <h3> handle : Fixes to <h3> </h3>
                        oneBefore.removeChild(last);
                        last.childNodes.forEach(function (child) {
                            oneBefore.parentNode.appendChild(child);
                        });
                        stack.pop();
                    }
                    else {
                        // Single error  <div> <h3> </div> handle: Just removes <h3>
                        oneBefore.removeChild(last);
                        last.childNodes.forEach(function (child) {
                            oneBefore.appendChild(child);
                        });
                    }
                }
                else {
                    // If it's final element just skip.
                }
            };
            while (stack.length > 1) {
                _loop_1();
            }
            response.childNodes.forEach(function (node) {
                if (node instanceof HTMLElement) {
                    node.parentNode = null;
                }
            });
            return response;
        }
        else {
            var response = new TextNode(data);
            response.valid = valid;
            return response;
        }
    }
    exports.parse = parse;
});
