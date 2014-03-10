(function(){

    // Default methods

    function DefaultEqualityComparer(a, b) {
        return a === b || a.valueOf() === b.valueOf();
    };

    function DefaultSortComparer(a, b) {
        if (a === b) return 0;
        if (a == null) return -1;
        if (b == null) return 1;
        if (typeof a == "string") return a.toString().localeCompare(b.toString());
        return a.valueOf() - b.valueOf();
    };

    function DefaultPredicate() {
        return true;
    };

    function DefaultSelector(t) {
        return t;
    };

    // Selectors

    Array.prototype.select = Array.prototype.map || function (selector, context) {
        context = context || window;
        var arr = [];
        var l = this.length;
        for (var i = 0; i < l; i++)
            arr.push(selector.call(context, this[i], i, this));
        return arr;
    };

    Array.prototype.selectMany = function (selector, resSelector) {
        resSelector = resSelector || function (i, res) { return res; };
        return this.aggregate(function (a, b) {
            return a.concat(selector(b).select(function (res) { return resSelector(b, res) }));
        }, []);
    };

    Array.prototype.take = function (c) {
        return this.slice(0, c);
    };

    Array.prototype.skip = Array.prototype.slice;

    Array.prototype.first = function (predicate, def) {
        var l = this.length;
        if (!predicate) return l ? this[0] : def == null ? null : def;
        for (var i = 0; i < l; i++)
            if (predicate(this[i], i, this))
                return this[i];

        return def == null ? null : def;
    };

    Array.prototype.last = function (predicate, def) {
        var l = this.length;
        if (!predicate) return l ? this[l - 1] : def == null ? null : def;
        while (l-- > 0)
            if (predicate(this[l], l, this))
                return this[l];

        return def == null ? null : def;
    };

    Array.prototype.union = function (arr) {
        return this.concat(arr).distinct();
    };

    Array.prototype.intersect = function (arr, comparer) {
        comparer = comparer || DefaultEqualityComparer;
        return this.distinct(comparer).where(function (t) {
            return arr.contains(t, comparer);
        });
    };

    Array.prototype.except = function (arr, comparer) {
        if (!(arr instanceof Array)) arr = [arr];
        comparer = comparer || DefaultEqualityComparer;
        var l = this.length;
        var res = [];
        for (var i = 0; i < l; i++) {
            var k = arr.length;
            var t = false;
            while (k-- > 0) {
                if (comparer(this[i], arr[k]) === true) {
                    t = true;
                    break;
                }
            }
            if (!t) res.push(this[i]);
        }
        return res;
    };

    Array.prototype.distinct = function (comparer) {
        var arr = [];
        var l = this.length;
        for (var i = 0; i < l; i++) {
            if (!arr.contains(this[i], comparer))
                arr.push(this[i]);
        }
        return arr;
    };

    Array.prototype.zip = function (arr, selector) {
        return this
            .take(Math.min(this.length, arr.length))
            .select(function (t, i) {
                return selector(t, arr[i]);
            });
    };

    Array.prototype.indexOf = Array.prototype.indexOf || function (o, index) {
        var l = this.length;
        for (var i = Math.max(Math.min(index, l), 0) || 0; i < l; i++)
            if (this[i] === o) return i;
        return -1;
    };

    Array.prototype.lastIndexOf = Array.prototype.lastIndexOf || function (o, index) {
        var l = Math.max(Math.min(index || this.length, this.length), 0);
        while (l-- > 0)
            if (this[l] === o) return l;
        return -1;
    };

    Array.prototype.remove = function (item) {
        var i = this.indexOf(item);
        if (i != -1)
            this.splice(i, 1);
    };

    Array.prototype.removeAll = function (predicate) {
        var item;
        var i = 0;
        while ((item = this.first(predicate)) != null) {
            i++;
            this.remove(item);
        }

        return i;
    };

    Array.prototype.orderBy = function (selector, comparer) {
        comparer = comparer || DefaultSortComparer;
        var arr = this.slice(0);
        var fn = function (a, b) {
            return comparer(selector(a), selector(b));
        };

        arr.thenBy = function (selector, comparer) {
            comparer = comparer || DefaultSortComparer;
            return arr.orderBy(DefaultSelector, function (a, b) {
                var res = fn(a, b);
                return res === 0 ? comparer(selector(a), selector(b)) : res;
            });
        };

        arr.thenByDescending = function (selector, comparer) {
            comparer = comparer || DefaultSortComparer;
            return arr.orderBy(DefaultSelector, function (a, b) {
                var res = fn(a, b);
                return res === 0 ? -comparer(selector(a), selector(b)) : res;
            });
        };

        return arr.sort(fn);
    };

    Array.prototype.orderByDescending = function (selector, comparer) {
        comparer = comparer || DefaultSortComparer;
        return this.orderBy(selector, function (a, b) { return -comparer(a, b) });
    };

    Array.prototype.innerJoin = function (arr, outer, inner, result, comparer) {
        comparer = comparer || DefaultEqualityComparer;
        var res = [];

        this.forEach(function (t) {
            arr.where(function (u) {
                return comparer(outer(t), inner(u));
            })
            .forEach(function (u) {
                res.push(result(t, u));
            });
        });

        return res;
    };

    Array.prototype.groupJoin = function (arr, outer, inner, result, comparer) {
        comparer = comparer || DefaultEqualityComparer;
        return this
            .select(function (t) {
                var key = outer(t);
                return {
                    outer: t,
                    inner: arr.where(function (u) { return comparer(key, inner(u)); }),
                    key: key
                };
            })
            .select(function (t) {
                t.inner.key = t.key;
                return result(t.outer, t.inner);
            });
    };

    Array.prototype.groupBy = function (selector, comparer) {
        var grp = [];
        var l = this.length;
        comparer = comparer || DefaultEqualityComparer;
        selector = selector || DefaultSelector;

        for (var i = 0; i < l; i++) {
            var k = selector(this[i]);
            var g = grp.first(function (u) { return comparer(u.key, k); });

            if (!g) {
                g = [];
                g.key = k;
                grp.push(g);
            }

            g.push(this[i]);
        }
        return grp;
    };

    Array.prototype.toDictionary = function (keySelector, valueSelector) {
        var o = {};
        var l = this.length;
        while (l-- > 0) {
            var key = keySelector(this[l]);
            if (key == null || key == "") continue;
            o[key] = valueSelector(this[l]);
        }
        return o;
    };
    
    Array.prototype.toMap = function (keySelector, valueSelector, meyKeys, mergeColumns, keyColumn) {
        var o = {};
        var l = this.length;
        while (l-- > 0) {
            var key = keySelector(this[l]);
            if (key == null || key == "") continue;            
            if(meyKeys && mergeColumns) {
            	if(meyKeys.contains(key)){
            		var value = valueSelector(this[l]);
            		var keyValue = value[keyColumn[key]];
            		if(!o[key]){
            			o[key] = {};
            		}
            		if(!o[key][keyValue]){
                    	o[key][keyValue] = {};
                    }
            		
            		for(p in value){
            			if(mergeColumns.contains(p)){
            				if(!o[key][keyValue][p]){
            					o[key][keyValue][p] = [];
            				}
            				o[key][keyValue][p].push(value[p]);
            				
            			} else {
            				o[key][keyValue][p] = value[p];
            			}
            		}
            	} else {
            		if(!o[key]){
                    	o[key] = [];
                    }
            		o[key].push( valueSelector(this[l]) );
            	}
            } else {
            	if(!o[key]){
                	o[key] = [];
                }
            	o[key].push( valueSelector(this[l]) );
            }
        }
        return o;
    };


    // Aggregates

    Array.prototype.aggregate = Array.prototype.reduce || function (func, seed) {
        var arr = this.slice(0);
        var l = this.length;
        if (seed == null) seed = arr.shift();

        for (var i = 0; i < l; i++)
            seed = func(seed, arr[i], i, this);

        return seed;
    };

    Array.prototype.min = function (s) {
        s = s || DefaultSelector;
        var l = this.length;
        var min = s(this[0]);
        while (l-- > 0)
            if (s(this[l]) < min) min = s(this[l]);
        return min;
    };

    Array.prototype.max = function (s) {
        s = s || DefaultSelector;
        var l = this.length;
        var max = s(this[0]);
        while (l-- > 0)
            if (s(this[l]) > max) max = s(this[l]);
        return max;
    };

    Array.prototype.sum = function (s) {
        s = s || DefaultSelector;
        var l = this.length;
        var sum = 0;
        while (l-- > 0) sum += s(this[l]);
        return sum;
    };

    // Predicates

    Array.prototype.where = Array.prototype.filter || function (predicate, context) {
        context = context || window;
        var arr = [];
        var l = this.length;
        for (var i = 0; i < l; i++)
            if (predicate.call(context, this[i], i, this) === true) arr.push(this[i]);
        return arr;
    };

    Array.prototype.any = function (predicate, context) {
        context = context || window;
        var f = this.some || function (p, c) {
            var l = this.length;
            if (!p) return l > 0;
            while (l-- > 0)
                if (p.call(c, this[l], l, this) === true) return true;
            return false;
        };
        return f.apply(this, [predicate, context]);
    };

    Array.prototype.all = function (predicate, context) {
        context = context || window;
        predicate = predicate || DefaultPredicate;
        var f = this.every || function (p, c) {
            return this.length == this.where(p, c).length;
        };
        return f.apply(this, [predicate, context]);
    };

    Array.prototype.takeWhile = function (predicate) {
        predicate = predicate || DefaultPredicate;
        var l = this.length;
        var arr = [];
        for (var i = 0; i < l && predicate(this[i], i) === true ; i++)
            arr.push(this[i]);

        return arr;
    };

    Array.prototype.skipWhile = function (predicate) {
        predicate = predicate || DefaultPredicate;
        var l = this.length;
        var i = 0;
        for (i = 0; i < l; i++)
            if (predicate(this[i], i) === false) break;

        return this.skip(i);
    };

    Array.prototype.contains = function (o, comparer) {
        comparer = comparer || DefaultEqualityComparer;
        var l = this.length;
        while (l-- > 0)
            if (comparer(this[l], o) === true) return true;
        return false;
    };

    // Iterations

    Array.prototype.forEach = Array.prototype.forEach || function (callback, context) {
        context = context || window;
        var l = this.length;
        for (var i = 0; i < l; i++)
            callback.call(context, this[i], i, this);
    };

    Array.prototype.defaultIfEmpty = function (val) {
        return this.length == 0 ? [val == null ? null : val] : this;
    };

    Array.range = function (start, count) {
        var arr = [];
        while (count-- > 0) {
            arr.push(start++);
        }
        return arr;
    };

})();

(function(){    
    String.prototype.replaceAllChars = function(parameters, replaceChar) {
    	var source = this.toString();
    	replaceChar = replaceChar || '';
    	var chars = parameters.split('');
    	for (var i = 0; i < chars.length; i++){
    		source = source.replaceAll(chars[i], replaceChar);
    	}
    	return source;
    };
})();



divi = {
    
};
(function(){
    $.extend(divi, {
        extend : function(){
            var io = function(o){
                for(var m in o){
                    this[m] = o[m];
                } 
            };
            var oc = Object.prototype.constructor;

            return function(sb, sp, overrides){
                if(typeof sp == 'object'){
                    overrides = sp;
                    sp = sb;
                    sb = overrides.constructor != oc ? overrides.constructor : function(){sp.apply(this, arguments);};
                }
                var F = function(){},
                    sbp,
                    spp = sp.prototype;

                F.prototype = spp;
                sbp = sb.prototype = new F();
                sbp.constructor=sb;
                sb.superclass=spp;
                if(spp.constructor == oc){
                    spp.constructor=sp;
                }
                sb.override = function(o){
                    divi.override(sb, o);
                };
                sbp.superclass = sbp.supr = (function(){
                    return spp;
                });
                sbp.override = io;
                divi.override(sb, overrides);
                sb.extend = function(o){return divi.extend(sb, o);};
                return sb;
            };
        }(),

        override : function(origclass, overrides){
            if(overrides){
                var p = origclass.prototype;
                $.extend(p, overrides);
                if(overrides.hasOwnProperty('toString')){
                    p.toString = overrides.toString;
                }
            }
        },
		
        namespace : function(){
            var o, d;
            $.each(arguments, function(v,nm) {
                d = nm.split(".");
                o = window[d[0]] = window[d[0]] || {};
                $.each(d.slice(1), function(v2,ts){
					o = o[ts] = o[ts] || {};
                });
            });
            return o;
        }
	});
})();

(function(){
	divi.base = function(){
		
	};
	
	divi.cache = function(){
	};
	
	divi.domBase = function(){
	};
	
	divi.eventBase = function(){
		
	};
	
	divi.actionType = function(){
	};
	
	divi.pluginBase = function(){
			
	};
	
	divi.componentBase = function(config){
	    config = config || {};    
	    this.initialConfig = config;
	    $.extend(this, config);
	    this.init();
	};	
	
})();


$.extend(divi.actionType, {
	retrieve:'RETRIEVE',
	update:'UPDATE',
	insert:'INSERT',
	deleted:'DELETE',
	save:'SAVE',
	submit:'SUBMIT'
});

$.extend(divi.pluginBase, {
	initialize:function(cfg){
		
	}
});

$.extend(divi.domBase,{
	elems:{},
	prefix:'ad_',
	jSel:'jSel',
	sel:'sel',
    scope:'scope',
    ignore:['attachLis','tag','scope','listeners','prefix'],
	add:function(key,elem,jqElem,scope){
		if(elem && key){
			var cElem = {};
			cElem[this.jSel] = jqElem;
			cElem[this.sel] = elem;
			cElem[this.scope] = scope;
			this.elems[key] = cElem;	
		}
	}
	,create:function(options,parent){
		var options = options || {};
		var elementTag = options.tag;
		var scope = options.scope || this;
		var attachLis = options.attachLis || false;
		var refId;
		var t,jQt;
		if(elementTag){
			t = document.createElement(elementTag);
			if(t){
				jQt = $(t);
				refId = this.getRandomId(options);
				this.attachAttrs(jQt,options);
				this.add(refId,t,jQt,scope);
				if(attachLis){
					divi.eventBase.addListeners($.extend(options,{ref:refId}));
				}
				this.append(parent, t);
			}
		}
		return {id:refId,dom:t};
	}
	
	,attachAttrs:function(elem,attrs){
		if(elem && !$.isEmptyObject(attrs)){
			var eachAttr;
			for(var key in attrs){
				if(attrs.hasOwnProperty(key) &&  !this.ignore.contains(key)){
					eachAttr = attrs[key];
					if(key && eachAttr){
						if(key == 'value'){
							divi.domBase.setValue(attrs, elem, eachAttr);
						}else{
							if(elem instanceof jQuery){
								elem.attr(key,eachAttr);
							}else{
								elem.setAttribute(key,eachAttr);
							}
							
						}
					}
				}
			}
		}
	}
	
	,setValue:function(options,elem,value){
		options = options || this;
		elem = elem || this;
		if(options){
			if(elem instanceof jQuery && !$.isEmptyObject(options) ){
				if(options.tag == 'input'){
					elem.val(value);
				}else{
					elem.prepend(value);
				}
			}else{
				if(options.tag == 'input'){
					elem.value = value;
				}else{
					elem.innerHTML  = value;
				}
			}
			
		}
	}
	
	,append:function(parent,child,isPrepend){
		if(parent && child){
			if(parent instanceof jQuery){
				if(isPrepend){
					parent.before(child);
				}else{
					parent.append(child);
				}
			}else{
				if(isPrepend){
					parent.insertBefore(child,parent.firstChild);
				}else{
					parent.appendChild(child);
				}
			}
		}
	}
	
	,getRandomId : function(options){
		var prefix = options.prefix || "";
		var newPref = this.prefix+prefix;
		return newPref+Math.floor((Math.random()*10000)+1);
	}
	
	,fetchsel:function(ref){
		var elem = this.elems[ref];
		return elem[this.sel];
	}
	
	,fetchJSel:function(ref){
		var elem = this.elems[ref];
		return elem[this.jSel];
	}
	
	,fetchCmp:function(ref){
		var elem = this.elems[ref];
		if(!elem){
			elem = {};
		}
		return elem;
	}
	
	,destroy:function(ref){
		var elem  = this.fetchJSel(ref);
		if(elem){
			delete this.elems[ref];
			elem.remove();
		}
	}
	
	,destroyAll:function(ref){
		this.elems = {};
	}
});

$.extend(divi.eventBase,{
	listeners : {},
	params:{},
	
	document:undefined,
	addListeners : function(options){
		options = options || {};
		var listeners = options.listeners || {};
		var ref = options.ref || {};
		if(ref){
			this.attachDefaultListeners(options);
			this.attachOtherListeners(options);
		}
	}
	
	,attachFieldListeners:function(){
		var eachlistener,eachKey,eachLnFn;
		for(var i=0;this.listeners &&  i< this.listeners.length; i++){
			eachlistener = this.listeners[i];
			if(eachlistener){
				for(eachKey in eachlistener){
					eachLnFn = eachlistener[eachKey];
					var selector = this.tag+"[refid='"+this.refId+"']";
					$(document).on(eachKey, selector,this,$.proxy(function (d,b,f,g) {eachLnFn.call(this,d,eachKey,f,g);},this.scope));
				}
			}
		}
	}
	
	,attachOtherListeners:function(options){
		var ref = options.ref || {};
		var listeners = options.listeners;
		var currListElem = this.listeners[ref],toAddListeners;
		if(listeners && currListElem){
			 for(var evtName in listeners){
				 if(listeners.hasOwnProperty(evtName)){
					 toAddListeners =  listeners[evtName];
					 if(toAddListeners && currListElem[evtName]){
						 currListElem[evtName] = currListElem[evtName].concat(toAddListeners);
					 }
				 }
			 }
		}
	}
	
	,attachBaseListener:function(options,evtName){
		var ref = options.ref || {};
		if(!$.isEmptyObject(ref)){
			var selector = options.tag+"[id='"+ref+"']";
			$(document).on(evtName, selector,{scope:options.scope,evtBase:this},this.baseListener);
		}
	}
	
	,baseListener:function(event,b,f,g){
		event.stopImmediatePropagation();
		var target = divi.util.getTarget(event);
		var type = divi.util.getEvtType(event);
		var data = event.data;
		if(data){
			var scope = data.scope;
			var jTarget = $(target);
			var val = jTarget.val();
			var evtBase = data.evtBase;
			if($.isFunction(scope.validateField)){
				scope.validateField(event,val,jTarget);
			}
			var listeners = evtBase.listeners[this.id];
			if(listeners && listeners[type]){
				var eachListener;
				var evtListeners = listeners[type];
				for(var key in evtListeners){
					 if(evtListeners.hasOwnProperty(key)){
						 eachListener =  evtListeners[key];
						 if(eachListener){
							 scope = scope || this;
							 eachListener.apply(scope,[event,val,jTarget]);
						 }
					 }
				 }
			}
			//divi.eventBase.checkEnterPress.apply(scope,[event,val,jTarget]);
		}
	 }
	
	,checkEnterPress:function(event,val,jTarget){
		var evtType = divi.util.getEvtType(event);
		if(event && evtType == "keypress" && event.keyCode == 13){
			var form = this.scope;
			form.submitForm.apply(form,[]);
			
		}
	}
	
	,attachDefaultListeners:function(options){
		var scope = options.scope;
		var ref = options.ref || {};
		var toAddListener,avlListeners = options.events || scope.events;
		var totListeners = {};
		if(avlListeners){
			 for(var eachkey in avlListeners){
				 if(avlListeners.hasOwnProperty(eachkey)){
					 toAddListener =  avlListeners[eachkey];
					 if(toAddListener){
						 totListeners[toAddListener] = [];
						 this.attachBaseListener(options, toAddListener);
					 }
				 }
			 }
		}
		this.listeners[ref] = totListeners;
	}
	
	,destroyAll:function(ref){
		this.listeners = {};
	}
});

$.extend(divi.cache, {
	 data:{},
	 remove: function (url) {
	        delete this.data[url];
    },
    exist: function (url) {
        return this.data.hasOwnProperty(url) && this.data[url] !== null;
    },
    get: function (url) {
        console.log('Getting in cache for url' + url);
        return this.data[url];
    },
    set: function (url, cachedData) {
    	this.remove(url);
    	this.data[url] = cachedData;
    }
});


divi.util = {
	isEmptyId:function(id){
		return (!id && id < 0);
	}

	,fetchValue:function(json,key,prefix){
		var value;
		if(prefix){
			key = prefix+key;
		}
		if(json){
			value = json[key];
		}
		return value;
	}
	
	,isEmptyObject:function(values){
		var isEmpty = true;
		if(values){
			for(var key in values){
				if(values.hasOwnProperty(key)){
					if(values[key]){isEmpty = false;break;}
				}
			}
		}
		return isEmpty;
	}
	
	,isEmpty : function(v){
	    return v === null || v === undefined || v == "";
	}

	,callSections:function(multiForm,sections,callBack,options){
		if(sections && callBack && multiForm){
			var eachSection,form;
			options = options || {};
			options.scope = this;
			for(var each in sections){
				if(sections.hasOwnProperty(each)){
					eachSection = sections[each];
					if(eachSection){
						form = multiForm.getSectionForm(eachSection);
						if(form && form[callBack]){
							form[callBack].apply(form,options);
						}
					}
				}
			}
		}
	}
	
	,appendElem:function(ref,attache){
		if(ref){
			var elem = divi.domBase.fetchJSel(ref);
			if(elem){
				elem.append(attache);
			}
		}
	}
	
	,retrieveCellData:function(elem,cell){
		var cellValue;
		if(elem){
			cellValue = elem.parent()[0].cells[cell].innerHTML;
		}
		return cellValue;
	}
	
	,nameSplit:function(name){
		var fname='',lname='';
		if(name){
			var split = name.split(' ');
			fname = split[0];
			lname = split[1];
		}
		return {firstName:fname,lastName:lname};
	}
	
	,getTarget:function(event){
		var target = null;
		if(event){
			target = event.srcElement ? event.srcElement : event.target;
		}
		return target;
	}
	
	,getEvtType:function(event){
		var evtType = null;
		if(event){
			evtType = event.type ? event.type : '';
		}
		return evtType;
	}
};

divi.core = {
    failure:"Failure",
    controllerBaseUrl:"",
    sitename : '',
	siteExtension : '.jsp',
	serverExtension : '.jshx',
	ajax : function(dataObj) {
		var url = dataObj.url ;
		var params = dataObj.data;
		var isArray = $.isArray(params);
		if (params == null) {
			params = {};
		}
		var resultData = dataObj.resultData || {}
		var localCache = divi.cache;
		var cache = dataObj.hasOwnProperty('cache') ? dataObj.cache : false; //leave the behaviour to jquery
		var requestType = dataObj.requestType ? dataObj.requestType : "POST";
		var dataType = dataObj.dataType ? dataObj.dataType : "json";
		var context = dataObj.context ? dataObj.context : this;
		var async = dataObj.async ? dataObj.async : false;
		var crossDomain = dataObj.domain ? dataObj.domain : false;
		var successCallBack = dataObj.succCall;
		var failureCallBack = dataObj.failCall;
		if(isArray){
			params = {data:$.toJSON(params)};
		}
		$.ajax({
			type : requestType,
			async : async,
			data : params,
			context: context,
			url : url,
			dataType : dataType,
			beforeSend: function () {
                if (cache && localCache.exist(url)) {
                	var content = localCache.get(url);
                	if(content){
                		divi.core.ajaxCallback.call(this,content,resultData,successCallBack,dataType);
                		return false;
                	}else{
                		return true;
                	}
                }
                return true;
            },
            complete: function (r,textStatus) {
            	var responseText = r.responseText;
            	if (cache && !localCache.exist(url)) {
            		var content = divi.core.removeScripts(responseText,dataType);
            		localCache.set(url,content);
                }
            	if(textStatus == 'error' || textStatus == 'abort' || textStatus == 'parsererror'){
            		if(failureCallBack){
            			failureCallBack.call(this,r);
            		}
            	}else{
            		divi.core.ajaxCallback.call(this,r.responseText,resultData,successCallBack,dataType);
            	}
            }
		});
	}
	
	,setSessionVariables:function(params){
		return params;
	}
	,ajaxCallback:function(r,addtionalData,callback,dataType){
    	var jsonObject = r;
    	if(dataType == "json"){
    		jsonObject = jQuery.parseJSON(r);
    	}
    	if(jsonObject.hasOwnProperty(divi.core.failure)){
    		divi.core.loadAuthorization();
    	}else{
    		callback.call(this,jsonObject,addtionalData);
    	}
	}
	
	,removeScripts:function(content,dataType){
		var cleanedScript = content;
		if(dataType == "html"){
			if(content){
				cleanedScript = content.replace(/<script.*?>[\s\S]*?<\/script>/ig, "");
			}
		}
		return cleanedScript;
	},

	getParams : function() {
		var idx = document.URL.indexOf('?');
		var params = {};
		if (idx != -1) {
			var pairs = document.URL.substring(idx + 1, document.URL.length)
					.split('&');
			for ( var i = 0; i < pairs.length; i++) {
				nameVal = pairs[i].split('=');
				params[nameVal[0]] = nameVal[1];
			}
		}
		return params;
	}
	
	,prepareUrl:function(prefix,url){
		var imageUrl;
		if(prefix){
			url = prefix+'/'+url;
		}
		return url;
	}
	
	,prepareControllerUrl:function(url,currPage){
		if(!currPage){
			currPage = window.location.href;
		}
		if(currPage){
			url = divi.core.controllerBaseUrl+url;
		}
		return url;
	}
	
	,stripUrl:function(url){
		if(!url){
			url = window.location.href;
		}
		var index = url.indexOf(divi.currentCity);
		if(index != -1){
			index += divi.currentCity.length+1;
		}
		return index;
	}
	
	,getLastParams : function() {
		var idx = document.URL.indexOf('/');
		var params = {};
		if (idx != -1) {
			var pairs = document.URL.substring(idx + 1, document.URL.length).split('/');		
			params["lastelement"] = pairs[ pairs.length-1];
		}
		return params;
	}
	
	,alert:function(options){
		var text = (options && options.text) ? options.text : undefined;
		var actioncall = (options && options.action) ? options.action : function(){};
		if(text){
			$.confirm({
				'title'		: options.header,
				'message'	: text,
				'buttons'	: {
					'OK'	: {
						'class'	: 'info',
						'action': actioncall
					}
				}
			});
		}
	}
};

divi.namespace("divi.plugin");
divi.namespace("divi.form");
divi.extend(divi.componentBase,divi.base, {
	 css:''
	,baseCss:''
	,defaultCss:''
	,html:''
	,name:''
	,id:''
	,init:function(cfg){
		$.extend(this, cfg);
	}

	,destroy:function(cfg){
		
	}
	
	,initiliazePlugins:function(){
    	if(this.plugins){
	        if($.isArray(this.plugins)){
	            for(var i = 0, len = this.plugins.length; i < len; i++){
	                this.plugins[i] = this.initialize(this.plugins[i]);
	            }
	        }
	    }
    }
	
	,getCss:function(){
		var css = this.defaultCss;
		if(this.css){
			css += " "+this.css;
		}
		if(this.baseCss){
			css += " "+this.baseCss;
		}
		return css;
	}
});


divi.crossPageBase = divi.extend(divi.componentBase, {
	data:'',
	fields:[],
	tables:[],
	sections:{},
	init:function(){
        divi.crossPageBase.superclass.init.call(this);
    }
	
	,getFieldConfig:function(){
		var fieldConfig = {}, tables = this.tables || [];
		var scope = this;
		$.each(tables, function(index, tableName) {
			var dataObj = divi.app[tableName] ? divi.app[tableName] : scope;
			if(dataObj) {
				var tableFieldCfgs = dataObj.fieldconfig ? dataObj.fieldconfig() : {};
				$.each(tableFieldCfgs, function(index, tableFieldCfg) {
					fieldConfig[tableFieldCfg.name] = tableFieldCfg;
				});
			}
		});
		return fieldConfig;
	}

	,getFieldDetails:function(){
		var fieldConfig = this.getFieldConfig(), sections = this.sections;
		var scope = this;
		var sectionData = $.extend(true,{}, this.sections);
		$.each(sectionData, function(key, sectionConfig) {
			var configs = [];
			var sectionFields = sectionConfig.inc || [];
			sectionFields = sectionFields.concat(scope.getIncFieldNames(sectionConfig.incAll));
			$.each(sectionFields, function(index, fieldName){
				configs.push(fieldConfig[fieldName]);
			});
			configs = configs.concat(this.fields);
			sectionConfig["fields"] = configs;
			delete sectionConfig.incAll;
		});
		return sectionData;
	},
	
	getIncFieldNames: function(incTables){
		
		var incFields = [];
		var scope = this;
		if(incTables && incTables.length > 0) {
			$.each(incTables, function(index, incTable) {
				var dataObj = divi.app[incTable] ? divi.app[incTable] : scope;
				if(dataObj) {					
					var fields = dataObj.fieldconfig() || [];
					var table = dataObj.table;
					$.each(fields, function(index, field){
						incFields.push(field.name );
					});
				}
			});
		}
		return incFields;
	}
});



divi.pageBase = divi.extend(divi.crossPageBase, {
	table:'',
	section:'',
	init:function(){
		$.extend(this,{tables:[],sections:{}});
    	this.tables.push(this.table);
    	this.sections[this.section] = {'incAll':[this.table]};
        divi.pageBase.superclass.init.call(this);
    }	
});

divi.component = divi.extend(divi.componentBase, {
	 tag:''
	,height:''
	,width:''
	,listeners:{}
	,init:function(){
		divi.component.superclass.init.call(this);
	}

	,getStyle:function(){
		var style = "";
		if(this.width){
			style += "width:"+this.width+";";
		}
		if(this.height){
			style += "height:"+this.height+";";
		}
		if(style){
			style = " style='"+style+"' ";
		}
		return style;
	}
	
	,appendDraw:function(tag){
		tag += this.getStyle();
		return tag;
	}
	
});


divi.panelBase  = divi.extend(divi.component, {
	title:''
	,init:function(){
		divi.panelBase.superclass.init.call(this);
	}
	,collapsible:false
	,bottomContent:null
	,topContent:null
	,minWidth:100
	,getTag:function(str){
		var name="class", value="";
		var tag={};
		if(str && str.indexOf("#") != -1){
			name = "id";
			value = str.replace('#', '');
		}
		else if(str && str.indexOf(".") != -1){
			value = str.replace('.', '');
		}
		tag={name:name,value:value};
		return tag;
	}
	
,wrapElement:function(options){
		var t = new Array();;
		var isArray = $.isArray(options);
		if(!isArray){
			options = [options];
		}
		var length = options.length;
		for(var i = 0; i<length; i++){
			t.push(document.createElement(options[i].tag));
			if(options[i].attribs){
				this.setElAttribs(t[i], options[i].attribs);
		}
			if(options[i].innerText){
				t[i].innerText = options[i].innerText;
		}
			if(options[i].width){
				t[i].width=options[i].width;
		}
			if(options[i].tag == "button"){
			var overrideClick = false;
			var btnID = undefined;
				for(var key in options[i].attribs){
					if(options[i].attribs.hasOwnProperty(key)){
						eachAttr = options[i].attribs[key];
					if(eachAttr.value.indexOf("btn-") > -1){
						overrideClick = true;
					}
					if(eachAttr.name.indexOf("refID") > -1){
						btnID = eachAttr.value;
					}
				}
			}
			if(overrideClick){
				$(document).on("click", "button[refID='"+btnID+"']",btnID, this.onButtonClick);
			}
		}
			if(options[i].childs){
			var parentScope = this;
				options[i].childs.forEach(function(child){
					t[i].appendChild(parentScope.wrapElement(child));
			});
			}
		}
		return isArray ? t : t[0];
	}
	,setElAttribs:function(el, attribs){
		var value;
		for(var key in attribs){
			if(attribs.hasOwnProperty(key)){
				value = attribs[key];
				el.setAttribute(value.name, value.value);
			}
		}
	}
});

divi.baseField  = divi.extend(divi.panelBase, {
	 collapsible:false
	,defaultCss:'formfield'
	,isChanged:false
	,events:['mousedown','change','focusout']
	,defaults:{tag:"input",type: 'text',attachLis:true}
	,tabIndex:-1
	,inputDivdflts:{tag:"div",'class':"input-control text"}
	,datarole: 'input-control'
	,lbldfts:{tag:"label","class":"labelStyle",attachLis:false}
	,btndfts:{tag:"button",type:"button"}
	,unitsdfts:{tag:'div',"class":'units'}
	,isIdentity:false
	,elemId:undefined
	,applyFormat:false
	,labeldiv:'labeldiv'
	,parentDiv:'parentDiv'
	,inputdom:'inputdom'
	,lblWidth:undefined
	,buttondom:'buttondom'
	,inputDiv:'inputDiv'
	,unitsdom:'unitsdom'
	,clrBtn:'btn-clear'
	,clrBtnText:'btn-clear'
	,revealBtn:'btn-reveal'
	,isReadOnly:false
	,defaultValue:''
	,isRequired:false
	,value:undefined
	,parent:undefined
	,desc:''
	,isValid:true
	,units:undefined
	,hidden:false
	,larger:false
	,isEncrypt:false
	,listeners:{}
	,dom:undefined
	,doms:{}
	,refId:undefined
	,scope:undefined
	,placeholder:''
		
	,isEmpty:function(val){
		var isEmpty = false;
		if(divi.util.isEmpty(val)){
			isEmpty = true;
		}
		return isEmpty;
	}
		
	,init:function(){
		$.extend(this,{doms:{},refId:undefined,dom:undefined});
		divi.baseField.superclass.init.call(this);
		this.draw({});
	}
	
	,hide:function(){
		this.hidden = true;
		this.isRequiredBackUp = this.isRequired;
		this.isRequired = false;
		var parentDom = divi.domBase.fetchJSel(this.elemId);
		if(parentDom){
			parentDom.addClass('hidden');
		}
	}
	
	,show:function(){
		this.hidden = false;
		this.isRequired = this.isRequiredBackUp;
		delete this.isRequiredBackUp;
		var parentDom = divi.domBase.fetchJSel(this.elemId);
		if(parentDom){
			parentDom.removeClass('hidden');
		}
	}
		
	,draw:function(options,parent){
		var parDom,labeldiv,lblDfts,text,inputDiv,dflts;
		var attribs = [];
		
		var mainDiv = divi.domBase.create({tag:'div'},parent);
		if(mainDiv && mainDiv.dom){
			this.dom = parDom = mainDiv.dom;
			this.elemId = mainDiv.id;
			parDom.setAttribute('class',this.defaultCss+this.checkHidden()+this.addLarger());
			var labelDom = this.createLabel(options,parDom);
			var inputDiv = this.createInputDiv(options,parDom);
			this.createField(options,inputDiv);
			this.setProperties(options);
		}
	}
	
	,createLabel:function(options,parent){
		var text =  this.desc;
		text += this.isRequired ? "<font color='#FF0000'>*</font> : " : " : ";
		var dflts = $.extend({},this.lbldfts,{value:text});
		var labeldiv = divi.domBase.create(dflts,parent);
		if(this.lblWidth){
			labeldiv.dom.style.width = this.lblWidth+'px';
		}
		this.doms[this.labeldiv] = labeldiv;
		return labeldiv.dom;
	}
	
	,createInputDiv:function(options,parent){
		var dflts = $.extend({},this.inputDivdflts,{'data-role':this.datarole,scope:this});
		var dflts = this.dflsOverlay(dflts);
		var inputDiv = divi.domBase.create(dflts,parent);
		if(this.width){
			labeldiv.dom.style.width = this.width+'px';
		}
		this.doms[this.inputDiv] = inputDiv;
		return inputDiv.dom;
	}
	
	,dflsOverlay:function(dflts){
		return dflts;
	}
	
	,createField:function(options,parent){
		var dflts,inputdom,buttonDiv,unitsDiv;
		dflts = $.extend({},this.defaults,{disabled:this.isReadOnly,scope:this,listeners:this.listeners,tabIndex:this.tabIndex});
		inputdom = divi.domBase.create(dflts,parent);
		this.doms[this.inputdom] = inputdom;
		
		this.createBtnCfg(options,parent);
		
		dflts = $.extend({},this.unitsdfts,{value:this.units,scope:this});
		unitsDiv = divi.domBase.create(dflts,parent);
		this.doms[this.unitsdom] = unitsDiv;
	}
	
	,createBtnCfg:function(options,parDom){
		var dflts,buttonDiv,unitsDiv;
		dflts = $.extend({},this.btndfts,{scope:this,'class':this.clrBtn});
		buttonDiv = divi.domBase.create(dflts,parDom);
		this.doms[this.buttondom] = buttonDiv
	}
	
	,setProperties:function(options){
		var input = this.doms[this.inputdom];
		var label = this.doms[this.labeldiv];
		if(input && label){
			input.dom.setAttribute('id',input.id);
			input.dom.setAttribute('name',this.name);
			label.dom.setAttribute('for',input.id);
		}
	}

	,checkHidden:function(){
		var cls = '';
		if(this.hidden){
			cls += ' hidden';
		}
		return cls;
	}
	,addLarger:function(){
		var cls = '';
		if(this.larger){
			cls += ' larger';
		}
		return cls;
	}
	
	,setReadOnly:function(){
		var name = this.name;
		var tag = this.tag;
		var value;
		var field = this.retrieveJInputDom();		
		if(field){
			this.setReadOnlyCss(field);
			var units = field.parent().children('div.units');
			if(units){
				units.hide();
				if(units[0] && units[0].innerText){
					value = this.value ? (this.value+units[0].innerText) : '';
					field.val(value);
				}
			}
		}
	}
	
	,setEditable:function(){
		var name = this.name;
		var tag = this.tag;
		var value;
		var field = this.retrieveJInputDom();		
		if(field){
			//var placeHolder = field.attr('placeholder1');
			//field.attr('placeholder',placeHolder);
			//field.attr('placeholder1',"");
			//field.disabled = false;
			this.setEditableCss(field);
			var units = field.parent().children('div.units');
			if(units){
				units.show();
				value = this.value || '';
				field.val(value);
			}
		}
	}
	
	,setReadOnlyCss:function(field){
		if(field){
			field.attr('disabled',true);
			field.addClass("readonly");
		}
	}
		
	,setEditableCss:function(field){
		if(field){
			field.attr('disabled',false);
			field.removeClass("readonly");
		}
	}
	
	,getValue:function(){
		var val = this.value;
		if(this.isEmpty(val)){
			val = this.defaultValue;
		}
		if(val && typeof val === 'string'){
			val = val.trim();
			this.value = val;
		}
		return val;
	}
	
	,retrieveInputDom:function(){
		var cmp;
		var refDom = this.doms[this.inputdom];
		if(refDom){
			cmp = divi.domBase.fetchsel(refDom.id); 
		}
		return cmp;
	}
	
	,retrieveJInputDom:function(){
		var cmp;
		var refDom = this.doms[this.inputdom];
		if(refDom){
			cmp = divi.domBase.fetchJSel(refDom.id); 
		}
		return cmp;
	}
	
	,setValue:function(value,supress){
		this.value = value;
		var cmp = this.retrieveInputDom();		
		if(cmp){
			/*if(type== "combofield" || type== "multicombofield"){
				$('select[name='+name+']').val(value).trigger('chosen:updated');
			}
			else if(type=="datefield"){
				if(value != null){
					if(	value && value.length >0){
						value = $.convertStringToDate(new Date(value));
						//field.val(value);
					}
				}
			}
			else{*/
				divi.domBase.setValue(this.defaults,cmp,this.value);
				if(!supress){
					target = this.retrieveJInputDom();
					this.checkValid(target,value);
				}		
			//}
		}
				
	}
	
	,clearBtn:function(event,targetVal,target){
		var className = event.relatedTarget ? event.relatedTarget.className : '';
		var value = targetVal;
		if(className && className.indexOf(this.clrBtn) != -1){
			value = '';
		}
		return value;
	}
	
	,checkFormat:function(value){
		return true;
	}
	
	,validateField:function(event,targetVal,target){
		targetVal = this.clearBtn(event,targetVal,target);
		return this.setValue(targetVal);
	}
	
	,markInvalid:function(target){
		target = target || this;
		target.addClass('error');
		this.isValid = false;
	}
	
	,checkValid:function(target,value){
		target = target || this.retrieveJInputDom();
	    this.resetField(target);	    
		if(this.isRequired && !divi.util.isEmpty(target)){
			if(divi.util.isEmpty(this.value) ||  !this.checkFormat(this.value)){
				this.markInvalid(target);
			}
		}
		return this.isValid;
	}

	,resetField:function(target){
		if(target){
			target.removeClass('error');
		}
		this.isValid = true;
	}
});

String.prototype.replaceAll = function( token, newToken, ignoreCase ) {
    var _token;
    var str = this + "";
    var i = -1;

    if ( typeof token === "string" ) {

        if ( ignoreCase ) {

            _token = token.toLowerCase();

            while( (
                i = str.toLowerCase().indexOf(
                    token, i >= 0 ? i + newToken.length : 0
                ) ) !== -1
            ) {
                str = str.substring( 0, i ) +
                    newToken +
                    str.substring( i + token.length );
            }

        } else {
            return this.split( token ).join( newToken );
        }

    }
    return str;
};
$.widget("custom.catcomplete", $.ui.autocomplete, {
    _renderMenu: function (ul, items) {
        var that = this,
            currentCategory = "";
        $.each(items, function (index, item) {
            if (item.category != currentCategory) {
                ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                currentCategory = item.category;
            }
            that._renderItemData(ul, item);
        });
    }
});

/** 
 * Implement deep object extension  
 * by replacing the line 599 of jQuery-1.2.3.js 
 * (commented out in this function) 
 */ 
jQuery.extend_deep = function() { 
    var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options; 
 
    if ( target.constructor == Boolean ) { 
        deep = target; 
        target = arguments[1] || {}; 
        i = 2; 
    } 
 
    if ( typeof target != "object" && typeof target != "function" ) 
        target = {}; 
 
    if ( length == 1 ) { 
        target = this; 
        i = 0; 
    } 
 
    for ( ; i < length; i++ ) 
        if ( (options = arguments[ i ]) != null ) 
            for ( var name in options ) { 
                if ( target === options[ name ] ) 
                    continue; 
 
                if ( deep && options[ name ] && typeof options[ name ] == "object" && target[ name ] && !options[ name ].nodeType ) 
//                    target[ name ] = jQuery.extend( target[ name ], options[ name ] ); 
                    target[ name ] = jQuery.extend_deep( true, target[ name ], options[ name ] ); 
 
                else if ( options[ name ] != undefined ) 
                    target[ name ] = options[ name ]; 
 
            } 
 
    return target; 
};