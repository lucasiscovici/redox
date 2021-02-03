'use strict';

exports.__esModule = true;
exports.setState = exports.createSelector = exports.createObserver = exports.createContext = void 0;

// From fast-memoize
//  See: https://github.com/caiogondim/fast-memoize.js/blob/master/src/index.js
function isPrimitive(value) {
    return (
        value == null || typeof value === 'number' || typeof value === 'boolean' // string is an unsafe primitive for our needs
        //  see test for 'single argument type detection'
        // || typeof value === 'string'
    );
}

var _UNDEFINED_ = Symbol('undefined');

var defaultSerialize = function defaultSerialize(args) {
    if (args.length === 0) {
        return _UNDEFINED_;
    }

    if (args.length === 1 && isPrimitive(args[0])) {
        return ''.concat(args[0]);
    }

    var key = JSON.stringify(args);

    if (key.length >= 1024) {
        console.warn(
            'Passing large objects as arguments to selectors might impact memory usage. Arguments:',
            args,
        );
    }

    return key;
};

var getObserverKey = function getObserverKey(id, arg) {
    if (arg === undefined) {
        return ''.concat(id);
    }

    if (isPrimitive(arg)) {
        return ''.concat(id, ':').concat(arg);
    }

    return ''.concat(id, ':').concat(JSON.stringify(arg));
}; // Also from fast-memoize

class DefaultCache {
    constructor() {
        this.cache = Object.create(null);
    } // has(key) {
    //     return (key in this.cache);
    // }

    get(key) {
        return this.cache[key];
    }

    set(key, value) {
        this.cache[key] = value;
    }

    clear() {
        this.cache = Object.create(null);
    }
}

class Computation {
    constructor() {
        this.observersList = []; // list of observers, used for fast iteration

        this.observersIdx = {}; // index by key, used to merge with other computation objects
    }

    addObserver(observer) {
        var key = getObserverKey(observer.id, observer.arg);
        this.observersIdx[key] = observer;
        this.observersList = Object.values(this.observersIdx);
    }

    mergeObservers(other) {
        // Fast merge using the indexes
        Object.assign(this.observersIdx, other.observersIdx); // Regenerate the iteration list

        this.observersList = Object.values(this.observersIdx);
    }

    dependenciesChanged(state) {
        for (var i = 0, l = this.observersList.length; i < l; ++i) {
            var observer = this.observersList[i];
            var newResult =
                observer.arg === undefined
                    ? observer.resultFunc(state)
                    : observer.resultFunc(state, observer.arg);

            if (!observer.isEqual(newResult, observer.result)) {
                return true;
            }
        }

        return false;
    } // For testing

    getObserversIds() {
        return Object.keys(this.observersIdx);
    }
}

var createDefaultCache = function createDefaultCache() {
    return new DefaultCache();
};

var defaultEquals = function defaultEquals(a, b) {
    return a === b;
};

class Observer {
    constructor(id, resultFunc, isEqual, ctx) {
        this.id = ''.concat(id); // ensure string so that Computation can index by Id

        this.resultFunc = resultFunc;
        this.isEqual = isEqual;
        this.ctx = ctx;
    }

    invoke() {
        if (arguments.length > 1) {
            throw new Error(
                'Observer methods cannot be invoked with more than one argument',
            );
        }

        var arg = arguments.length ? arguments[0] : undefined;
        var result =
            arg !== undefined
                ? this.resultFunc(this.ctx.state, arg)
                : this.resultFunc(this.ctx.state); // Create a link between this observer and
        //  the selectors calling it.

        for (var i = 0, l = Context.callStack.length; i < l; ++i) {
            Context.callStack[i].addObserver({
                id: this.id,
                isEqual: this.isEqual,
                resultFunc: this.resultFunc,
                arg,
                result,
            });
        }

        return result;
    }

    getProxy() {
        var _this = this;

        var proxy = this.invoke.bind(this);
        proxy.id = this.id;

        proxy.key = function (arg) {
            return getObserverKey(_this.id, arg);
        };

        return proxy;
    }
}

class Selector {
    constructor(computeFunc, cache, serialize, ctx) {
        this.recomputations = 0;
        this.computeFunc = computeFunc.bind(ctx);
        this.cache = cache;
        this.serialize = serialize;
        this.ctx = ctx;
    }

    mock() {
        var cacheKey = this.serialize(arguments);
        var computation = new Computation(cacheKey);
        this.cache.set(cacheKey, computation);
        return {
            result(res) {
                computation.result = res;
            },
        };
    }

    clearCache() {
        this.cache.clear();
    }

    invoke() {
        var cacheKey = this.serialize(arguments);
        var computation = this.cache.get(cacheKey);

        if (
            !computation ||
            computation.dependenciesChanged(this.ctx.state) // dependencies didn't change
        ) {
            // if dependencies changed it means that the observed state changed
            //  therefore we should invalidate the cache
            if (computation) {
                this.cache.clear();
            } // always create a new computation before we recompute the result
            //  so that we can untrack previous dependencies.

            computation = new Computation(cacheKey); // Compute new result

            Context.callStack.push(computation);

            try {
                computation.result = this.computeFunc.apply(this.ctx, [
                    this.ctx.state,
                    ...arguments,
                ]);
            } finally {
                Context.callStack.pop();
            } // Store new computation in the cache

            this.cache.set(cacheKey, computation);
            ++this.recomputations;
        } // Share observer dependencies with the parent selectors.

        for (var i = 0, l = Context.callStack.length; i < l; ++i) {
            Context.callStack[i].mergeObservers(computation);
        }

        return computation.result;
    }

    dependencies() {
        var cacheKey = this.serialize(arguments);
        var computation = this.cache.get(cacheKey);
        return computation ? computation.getObserversIds() : [];
    }

    getProxy(context) {
        var _this2 = this;

        var proxy = this.invoke.bind(this);
        proxy.dependencies = this.dependencies.bind(this);
        proxy.mock = this.mock.bind(this);
        proxy.clearCache = this.clearCache.bind(this);

        proxy.recomputations = function () {
            return _this2.recomputations;
        };

        proxy.withState = function (state) {
            context.state = state;
            return proxy;
        };

        return proxy;
    }
}

class Context {
    constructor(initialState) {
        this.state = initialState;
    }

    createObserver(resultFunc) {
        var options =
            arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : {};

        if (resultFunc.length > 2) {
            throw new Error(
                'Observer methods cannot receive more than two arguments',
            );
        }

        var id = ++Context.numObservers; // const name = options.name || `observer-${id}`;

        var isEqual = options.isEqual || defaultEquals;
        var observer = new Observer(id, resultFunc, isEqual, this);
        return observer.getProxy(this);
    }

    createSelector(computeFunc) {
        var options =
            arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : {};
        var cache = options.cache || createDefaultCache();
        var serialize = options.serialize || defaultSerialize;
        var selector = new Selector(computeFunc, cache, serialize, this);
        return selector.getProxy(this);
    }

    getProxy() {
        var _this3 = this;

        return {
            createObserver: this.createObserver.bind(this),
            createSelector: this.createSelector.bind(this),
            setState: function setState(newState) {
                return (_this3.state = newState);
            },
        };
    }
}

Context.callStack = [];
Context.numObservers = 0;

var createContext = function createContext(initialState) {
    var context = new Context(initialState);
    return context.getProxy();
};

exports.createContext = createContext;
var context = createContext();
var createObserver = context.createObserver;
exports.createObserver = createObserver;
var createSelector = context.createSelector;
exports.createSelector = createSelector;
var setState = context.setState;
exports.setState = setState;
