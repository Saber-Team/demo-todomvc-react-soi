/**
 * @provides modux
 * @permanent
 */

(function(global){
    'use strict';
    if (global.require)
        return;


    var toString = Object.prototype.toString
        , hasOwn = Object.prototype.hasOwnProperty;

    function isFunction(fn) {
        return toString.call(fn) === '[object Function]'
    }

    function isArray(arr) {
        return toString.call(arr) === '[object Array]'
    }

// 生成模块id
    function ha(id) {
        return '__mod__' + (id ? id + '__' : '') + j++;
    }

    function pa(o) {
        return o;
    }

    function mergePureObject(src, ex) {
        for (var n in ex) {
            if (src[n] === undefined) {
                src[n] = ex[n];
            } else {
                mergePureObject(src[n], ex[n]);
            }
        }
    }

    function unique(arr) {
        var returnArray = arr;
        var seen = {}
            , cursorInsert = 0
            , cursorRead = 0;

        while (cursorRead < arr.length) {
            var current = arr[cursorRead++];
            var key = 's' + current;
            if (!hasOwn.call(seen, key)) {
                seen[key] = true;
                returnArray[cursorInsert++] = current;
            }
        }
        returnArray.length = cursorInsert;
        return returnArray;
    }

    var c = {}, j = 0;
    var factoriesCount = 0, requireCallCount = 0;

    function require(id) {
        if (global.ErrorUtils && !global.ErrorUtils.inGuard()) {
            return global.ErrorUtils.applyWithGuard(require, null, [id]);
        }

        requireCallCount++;
        var mod = c[id];
        if (!mod) {
            throw 'Requiring unknown module "' + id + '"';
        }

        if (mod.exports !== null) {
            return mod.exports;
        } else {
            var ta = mod.exports = {},
                factory = mod.factory;

            if (isFunction(factory)) {
                var va = mod.dependencies
                    , len = va.length
                    , xa;

                try {
                    var args = [global, require, mod, ta];
                    for (var i = 0; i < len; i++) {
                        var db = va[i];
                        args.push(require.call(null , db));
                    }
                    ++factoriesCount;
                    xa = factory.apply(null, args);
                } catch (err) {
                    mod.hasError = true;
                    mod.exports = null;
                    throw err;
                }

                if (xa) {
                    mod.exports = xa;
                }
            } else {
                mod.exports = factory;
            }

            return mod.exports;
        }
    }

    require.__getTotalFactories = function() {
        return factoriesCount;
    };

    require.__getTotalRequireCalls = function() {
        return requireCallCount;
    };

    function define(id, dependencies, factory) {
        //参数兼容
        if (dependencies === undefined) {
            dependencies = [];
            factory = id;
            id = ha();
        } else if (factory === undefined) {
            factory = dependencies;
            if (isArray(id)) {
                dependencies = id;
                id = ha(dependencies.join(','));
            } else {
                dependencies = [];
            }
        }

        // 不允许重复定义
        var mod = c[id];
        if (mod) {
            throw 'Module with id "' + id + '" has been defined.';
        }

        mod = new Module(id, null, factory, dependencies);
        c[id] = mod;

        return mod.exports;
    }

    define.amd = {};

    global.define = define;
    global.require = require;
    global.__d = function(id, dependencies, factory) {
        var guard = global.TimeSlice && global.TimeSlice.guard || pa;
        guard(function() {
            define(id, dependencies, factory);
        }, 'define ' + id, { root: true })();
    };

    /**
     * @constructor
     */
    function Module(id, exports, factory, dependencies) {
        this.id = id;
        this.exports = exports || null;
        this.factory = factory;
        this.dependencies = dependencies;
        this.hasError = true;
    }


    var $doc = document
        , $head = $doc.head || $doc.getElementsByTagName('head')[0]
        , $base = $doc.getElementsByTagName('base')[0];

    function createScript() {
        var script = $doc.createElement('script');
        script.charset = 'utf-8';
        script.async = 1;
        script.crossorigin = 1;
        return script;
    }

    function links() {
        return $doc.getElementsByTagName('link');
    }

    var engineRe = new RegExp([
        'Trident\/([^ ;]*)',
        'AppleWebKit\/([^ ;]*)',
        'Opera\/([^ ;]*)',
        'rv:([^ ;]*)(.*?)Gecko\/([^ ;]*)',
        'MSIE\s([^ ;]*)',
        'AndroidWebKit\/([^ ;]*)'
    ].join('|'));
    var engine = navigator.userAgent.match(engineRe) || 0;
    var curStyle, curSheet;

// load css through @import directive
// IE < 9, Firefox < 18;
// onload break in webkit
    var useImport = false, useOnload = true;

// trident / msie
    if (engine[1] || engine[7]) {
        useImport = engine[1] < 6 || engine[7] <= 9;
    }
// webkit
    else if (engine[2] || engine[8]) {
        useOnload = false;
    }
// gecko
    else if (engine[4]) {
        useImport = engine[4] < 18
    }

    var ieCnt = 0;
    var ieLoads = [];
    var ieCurCallback;

    function processIeLoad() {
        ieCurCallback();
        var nextLoad = ieLoads.shift();
        if (!nextLoad) {
            ieCurCallback = null;
            return
        }

        ieCurCallback = nextLoad[1];
        createIeLoad(nextLoad[0])
    }

    function createIeLoad(url) {
        curSheet.addImport(url);
        curStyle.onload = processIeLoad;

        ieCnt++;
        if (ieCnt === 31) {
            curStyle = $doc.createElement('style');
            $head.appendChild(curStyle);
            curSheet = curStyle.styleSheet || curStyle.sheet;
            ieCnt = 0
        }
    }

    function importLoad(url, callback) {
        if (!curSheet || !curSheet.addImport) {
            curStyle = $doc.createElement('style');
            $head.appendChild(curStyle);
            curSheet = curStyle.styleSheet || curStyle.sheet;
        }

        if (curSheet && curSheet.addImport) {
            // old IE
            if (ieCurCallback) {
                ieLoads.push([url, callback]);
            } else {
                createIeLoad(url);
                ieCurCallback = callback;
            }
        } else {
            // old Firefox
            curStyle.textContent = '@import "' + url + '";';
            var loadInterval = setInterval(function() {
                try {
                    var tmp = curStyle.sheet.cssRules;
                    clearInterval(loadInterval);
                    callback();
                } catch(e) { }
            }, 10);
        }
    }

    function linkLoad(url, callback) {
        var loop = function() {
            for (var i = 0; i < $doc.styleSheets.length; i++) {
                var sheet = $doc.styleSheets[i];
                if (sheet.href === link.href) {
                    clearTimeout(loadInterval);
                    return callback();
                }
            }
            loadInterval = setTimeout(loop, 10);
        };

        var link = $doc.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        if (useOnload) {
            link.onload = function() {
                link.onload = null;
                // for style dimensions queries, a short delay can still be necessary
                setTimeout(callback, 7);
            };
        } else {
            var loadInterval = setTimeout(loop, 10);
        }
        link.href = url;
        $head.appendChild(link);
    }


// 内部资源表
    var __map__ = {js:{},css:{}};

    var anonymousFactoriesCount = 0;

// 保存正在请求的资源
    var __sending__ = {css:{},js:{}};

// 保存已经加载的css资源
    var __css_loaded__ = {};

// 记录异步模块的依赖关系, 执行后删除
    var anonymous = {};

    function loadCssResource(id, callback) {
        function onLoad() {
            var callbacks = __sending__.css[id];
            delete __sending__.css[id];
            __css_loaded__[id] = true;
            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i]();
            }
        }

        var modInfo = __map__.css[id];
        if (!modInfo) {
            throw 'No css resource: ' + id + ' in resource map.';
        }

        __sending__.css[id] = [callback];
        var load = (useImport ? importLoad : linkLoad);
        load(modInfo.uri, onLoad);
    }

    function loadJsResource(id, callback) {
        function onScriptLoad() {
            if (!script.readyState || /complete/.test(script.readyState)) {
                script.onreadystatschange = script.onload = script.onerror = null;
                script = null;
                var callbacks = __sending__.js[id];
                delete __sending__.js[id];
                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i]();
                }
            }
        }

        var modInfo = __map__.js[id];
        if (!modInfo) {
            throw 'No js resource: ' + id + ' in resource map.';
        }

        __sending__.js[id] = [callback];
        var script = createScript();
        script.onreadystatechange = script.onload = script.onerror = onScriptLoad;

        // old IE(<11) will load javascript file once script.src has been set,
        // script.readyState will become `loaded` when file loaded(but not executed),
        // script.readyState will become `complete` after code evaluated.
        // IE11 removed this feature.
        script.src = modInfo ? modInfo.uri : id;
        if ($base) {
            $head.insertBefore(script, $base);
        } else {
            $head.appendChild(script);
        }
    }

// id全部是js资源, 不允许require.async加载css资源
    function buildDependencyGraph(ids, resourceType) {
        var len = ids.length;
        var jss = [];
        var csss = [];
        var modInfo;

        if (resourceType === 'js') {
            jss = ids;
        } else {
            csss = ids;
        }

        for (var i = 0; i < len; i++) {
            var modId = ids[i];
            if (resourceType === 'js') {
                modInfo = __map__.js[modId];
            } else if (resourceType === 'css') {
                modInfo = __map__.css[modId];
            }

            var deps = modInfo.deps || [];
            var css = modInfo.css || [];
            var list = buildDependencyGraph(deps, 'js');
            jss = jss.concat(list[0]);
            csss = csss.concat(buildDependencyGraph(css, 'css')[1]);
        }

        return [jss, csss];
    }

    function fireRegisterCallback(mod) {
        var args = []
            , dependencies = mod.dependencies
            , len = dependencies[0].length;
        for (var i = 0; i < len; i++) {
            var d = dependencies[0][i];
            args.push(require.call(null , d));
        }
        ++anonymousFactoriesCount;
        mod.factory.apply(null, args);
    }

    require.async = function(dependencies, factory) {
        if (!isArray(dependencies)) {
            throw 'require.async first parameter must be an Array';
        }

        if (!isFunction(factory)) {
            throw 'require.async second parameter must be a function';
        }

        function onLoad() {
            mod.refcount--;
            if (mod.refcount === 0) {
                fireRegisterCallback(mod);
                delete anonymous[mod.id];
                mod = null;
            }
        }

        var lists = buildDependencyGraph(dependencies, 'js')
            , js = unique(lists[0])
            , css = unique(lists[1])
            , i;

        var mid = ha();
        var mod = anonymous[mid] = {
            id: mid,
            dependencies: lists,
            factory: factory,
            refcount: js.length + css.length
        };

        for (i = 0; i < js.length; i++) {
            // 请求中
            if (__sending__.js[js[i]]) {
                __sending__.js[js[i]].push(onLoad);
                continue;
            }
            // 已加载
            if (c[js[i]]) {
                mod.refcount--;
                continue;
            }
            loadJsResource(js[i], onLoad);
        }

        for (i = 0; i < css.length; i++) {
            // 请求中
            if (__sending__.css[css[i]]) {
                __sending__.js[css[i]].push(onLoad);
                continue;
            }
            // 已加载
            if (__css_loaded__[css[i]]) {
                mod.refcount--;
                continue;
            }
            loadCssResource(css[i], onLoad);
        }

        if (mod.refcount === 0) {
            fireRegisterCallback(mod);
        }
    };

    require.setResourceMap = function(map) {
        mergePureObject(__map__, map);
    };

    require.getResourceMap = function() {
        return __map__;
    };

    require.__getTotalAnonymousFactories = function() {
        return anonymousFactoriesCount;
    };

    function retrieveLinkMap() {
        var externalLinks = links()
            , hash
            , link;
        var len = externalLinks.length;
        for (var i = 0; i < len; i++) {
            link = externalLinks[i];
            hash = link.dataset ?
                link.dataset.moduxHash :
                link.getAttribute('data-modux-hash');
            __css_loaded__[hash] = true;
        }
    }

    retrieveLinkMap();

})(this)