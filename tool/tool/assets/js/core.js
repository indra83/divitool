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
		return (!id || id < 0);
	}

	,pad:function(str, max) {
	  str = str.toString();
	  return str.length < max ? divi.util.pad("0" + str, max) : str;
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
	
	,isjQEmpty:function(v){
		return v === null || v === undefined || v.length == 0;
	}
	
	,isEmpty : function(v){
	    return v === null || v === undefined || v == "" || v.trim() == "";
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
		var isArray = dataObj.isArray || false;
		var resultData = dataObj.resultData || {}
		var requestType = dataObj.requestType ? dataObj.requestType : "POST";
		var dataType = dataObj.dataType ? dataObj.dataType : "json";
		var context = dataObj.context ? dataObj.context : this;
		var async = dataObj.async ? dataObj.async : false;
		var crossDomain = dataObj.domain ? dataObj.domain : false;
		if(isArray){
			params = {data:JSON.stringify(params)};
		}
		return $.ajax({
			type : requestType,
			async : async,
			data : params,
			context: context,
			url : url,
			dataType : dataType
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
		if(this.isRequired && !divi.util.isjQEmpty(target)){
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




(function(jQuery){
	
	jQuery.hotkeys = {
		version: "0.8",

		specialKeys: {
			8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
			20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
			37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 
			96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
			104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/", 
			112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 
			120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 191: "/", 224: "meta"
		},
	
		shiftNums: {
			"`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", 
			"8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<", 
			".": ">",  "/": "?",  "\\": "|"
		}
	};

	function keyHandler( handleObj ) {
		// Only care when a possible input has been specified
		if ( typeof handleObj.data !== "string" ) {
			return;
		}
		
		var origHandler = handleObj.handler,
			keys = handleObj.data.toLowerCase().split(" "),
			textAcceptingInputTypes = ["text", "password", "number", "email", "url", "range", "date", "month", "week", "time", "datetime", "datetime-local", "search", "color"];
	
		handleObj.handler = function( event ) {
			// Don't fire in text-accepting inputs that we didn't directly bind to
			if ( this !== event.target && (/textarea|select/i.test( event.target.nodeName ) ||
				jQuery.inArray(event.target.type, textAcceptingInputTypes) > -1 ) ) {
				return;
			}
			
			// Keypress represents characters, not special keys
			var special = event.type !== "keypress" && jQuery.hotkeys.specialKeys[ event.which ],
				character = String.fromCharCode( event.which ).toLowerCase(),
				key, modif = "", possible = {};

			// check combinations (alt|ctrl|shift+anything)
			if ( event.altKey && special !== "alt" ) {
				modif += "alt+";
			}

			if ( event.ctrlKey && special !== "ctrl" ) {
				modif += "ctrl+";
			}
			
			// TODO: Need to make sure this works consistently across platforms
			if ( event.metaKey && !event.ctrlKey && special !== "meta" ) {
				modif += "meta+";
			}

			if ( event.shiftKey && special !== "shift" ) {
				modif += "shift+";
			}

			if ( special ) {
				possible[ modif + special ] = true;

			} else {
				possible[ modif + character ] = true;
				possible[ modif + jQuery.hotkeys.shiftNums[ character ] ] = true;

				// "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
				if ( modif === "shift+" ) {
					possible[ jQuery.hotkeys.shiftNums[ character ] ] = true;
				}
			}

			for ( var i = 0, l = keys.length; i < l; i++ ) {
				if ( possible[ keys[i] ] ) {
					return origHandler.apply( this, arguments );
				}
			}
		};
	}

	jQuery.each([ "keydown", "keyup", "keypress" ], function() {
		jQuery.event.special[ this ] = { add: keyHandler };
	});

})( jQuery );


!function(){var q=null;window.PR_SHOULD_USE_CONTINUATION=!0;
(function(){function S(a){function d(e){var b=e.charCodeAt(0);if(b!==92)return b;var a=e.charAt(1);return(b=r[a])?b:"0"<=a&&a<="7"?parseInt(e.substring(1),8):a==="u"||a==="x"?parseInt(e.substring(2),16):e.charCodeAt(1)}function g(e){if(e<32)return(e<16?"\\x0":"\\x")+e.toString(16);e=String.fromCharCode(e);return e==="\\"||e==="-"||e==="]"||e==="^"?"\\"+e:e}function b(e){var b=e.substring(1,e.length-1).match(/\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|\\[0-3][0-7]{0,2}|\\[0-7]{1,2}|\\[\S\s]|[^\\]/g),e=[],a=
b[0]==="^",c=["["];a&&c.push("^");for(var a=a?1:0,f=b.length;a<f;++a){var h=b[a];if(/\\[bdsw]/i.test(h))c.push(h);else{var h=d(h),l;a+2<f&&"-"===b[a+1]?(l=d(b[a+2]),a+=2):l=h;e.push([h,l]);l<65||h>122||(l<65||h>90||e.push([Math.max(65,h)|32,Math.min(l,90)|32]),l<97||h>122||e.push([Math.max(97,h)&-33,Math.min(l,122)&-33]))}}e.sort(function(e,a){return e[0]-a[0]||a[1]-e[1]});b=[];f=[];for(a=0;a<e.length;++a)h=e[a],h[0]<=f[1]+1?f[1]=Math.max(f[1],h[1]):b.push(f=h);for(a=0;a<b.length;++a)h=b[a],c.push(g(h[0])),
h[1]>h[0]&&(h[1]+1>h[0]&&c.push("-"),c.push(g(h[1])));c.push("]");return c.join("")}function s(e){for(var a=e.source.match(/\[(?:[^\\\]]|\\[\S\s])*]|\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|\\\d+|\\[^\dux]|\(\?[!:=]|[()^]|[^()[\\^]+/g),c=a.length,d=[],f=0,h=0;f<c;++f){var l=a[f];l==="("?++h:"\\"===l.charAt(0)&&(l=+l.substring(1))&&(l<=h?d[l]=-1:a[f]=g(l))}for(f=1;f<d.length;++f)-1===d[f]&&(d[f]=++x);for(h=f=0;f<c;++f)l=a[f],l==="("?(++h,d[h]||(a[f]="(?:")):"\\"===l.charAt(0)&&(l=+l.substring(1))&&l<=h&&
(a[f]="\\"+d[l]);for(f=0;f<c;++f)"^"===a[f]&&"^"!==a[f+1]&&(a[f]="");if(e.ignoreCase&&m)for(f=0;f<c;++f)l=a[f],e=l.charAt(0),l.length>=2&&e==="["?a[f]=b(l):e!=="\\"&&(a[f]=l.replace(/[A-Za-z]/g,function(a){a=a.charCodeAt(0);return"["+String.fromCharCode(a&-33,a|32)+"]"}));return a.join("")}for(var x=0,m=!1,j=!1,k=0,c=a.length;k<c;++k){var i=a[k];if(i.ignoreCase)j=!0;else if(/[a-z]/i.test(i.source.replace(/\\u[\da-f]{4}|\\x[\da-f]{2}|\\[^UXux]/gi,""))){m=!0;j=!1;break}}for(var r={b:8,t:9,n:10,v:11,
f:12,r:13},n=[],k=0,c=a.length;k<c;++k){i=a[k];if(i.global||i.multiline)throw Error(""+i);n.push("(?:"+s(i)+")")}return RegExp(n.join("|"),j?"gi":"g")}function T(a,d){function g(a){var c=a.nodeType;if(c==1){if(!b.test(a.className)){for(c=a.firstChild;c;c=c.nextSibling)g(c);c=a.nodeName.toLowerCase();if("br"===c||"li"===c)s[j]="\n",m[j<<1]=x++,m[j++<<1|1]=a}}else if(c==3||c==4)c=a.nodeValue,c.length&&(c=d?c.replace(/\r\n?/g,"\n"):c.replace(/[\t\n\r ]+/g," "),s[j]=c,m[j<<1]=x,x+=c.length,m[j++<<1|1]=
a)}var b=/(?:^|\s)nocode(?:\s|$)/,s=[],x=0,m=[],j=0;g(a);return{a:s.join("").replace(/\n$/,""),d:m}}function H(a,d,g,b){d&&(a={a:d,e:a},g(a),b.push.apply(b,a.g))}function U(a){for(var d=void 0,g=a.firstChild;g;g=g.nextSibling)var b=g.nodeType,d=b===1?d?a:g:b===3?V.test(g.nodeValue)?a:d:d;return d===a?void 0:d}function C(a,d){function g(a){for(var j=a.e,k=[j,"pln"],c=0,i=a.a.match(s)||[],r={},n=0,e=i.length;n<e;++n){var z=i[n],w=r[z],t=void 0,f;if(typeof w==="string")f=!1;else{var h=b[z.charAt(0)];
if(h)t=z.match(h[1]),w=h[0];else{for(f=0;f<x;++f)if(h=d[f],t=z.match(h[1])){w=h[0];break}t||(w="pln")}if((f=w.length>=5&&"lang-"===w.substring(0,5))&&!(t&&typeof t[1]==="string"))f=!1,w="src";f||(r[z]=w)}h=c;c+=z.length;if(f){f=t[1];var l=z.indexOf(f),B=l+f.length;t[2]&&(B=z.length-t[2].length,l=B-f.length);w=w.substring(5);H(j+h,z.substring(0,l),g,k);H(j+h+l,f,I(w,f),k);H(j+h+B,z.substring(B),g,k)}else k.push(j+h,w)}a.g=k}var b={},s;(function(){for(var g=a.concat(d),j=[],k={},c=0,i=g.length;c<i;++c){var r=
g[c],n=r[3];if(n)for(var e=n.length;--e>=0;)b[n.charAt(e)]=r;r=r[1];n=""+r;k.hasOwnProperty(n)||(j.push(r),k[n]=q)}j.push(/[\S\s]/);s=S(j)})();var x=d.length;return g}function v(a){var d=[],g=[];a.tripleQuotedStrings?d.push(["str",/^(?:'''(?:[^'\\]|\\[\S\s]|''?(?=[^']))*(?:'''|$)|"""(?:[^"\\]|\\[\S\s]|""?(?=[^"]))*(?:"""|$)|'(?:[^'\\]|\\[\S\s])*(?:'|$)|"(?:[^"\\]|\\[\S\s])*(?:"|$))/,q,"'\""]):a.multiLineStrings?d.push(["str",/^(?:'(?:[^'\\]|\\[\S\s])*(?:'|$)|"(?:[^"\\]|\\[\S\s])*(?:"|$)|`(?:[^\\`]|\\[\S\s])*(?:`|$))/,
q,"'\"`"]):d.push(["str",/^(?:'(?:[^\n\r'\\]|\\.)*(?:'|$)|"(?:[^\n\r"\\]|\\.)*(?:"|$))/,q,"\"'"]);a.verbatimStrings&&g.push(["str",/^@"(?:[^"]|"")*(?:"|$)/,q]);var b=a.hashComments;b&&(a.cStyleComments?(b>1?d.push(["com",/^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/,q,"#"]):d.push(["com",/^#(?:(?:define|e(?:l|nd)if|else|error|ifn?def|include|line|pragma|undef|warning)\b|[^\n\r]*)/,q,"#"]),g.push(["str",/^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h(?:h|pp|\+\+)?|[a-z]\w*)>/,q])):d.push(["com",
/^#[^\n\r]*/,q,"#"]));a.cStyleComments&&(g.push(["com",/^\/\/[^\n\r]*/,q]),g.push(["com",/^\/\*[\S\s]*?(?:\*\/|$)/,q]));if(b=a.regexLiterals){var s=(b=b>1?"":"\n\r")?".":"[\\S\\s]";g.push(["lang-regex",RegExp("^(?:^^\\.?|[+-]|[!=]=?=?|\\#|%=?|&&?=?|\\(|\\*=?|[+\\-]=|->|\\/=?|::?|<<?=?|>>?>?=?|,|;|\\?|@|\\[|~|{|\\^\\^?=?|\\|\\|?=?|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\\s*("+("/(?=[^/*"+b+"])(?:[^/\\x5B\\x5C"+b+"]|\\x5C"+s+"|\\x5B(?:[^\\x5C\\x5D"+b+"]|\\x5C"+
s+")*(?:\\x5D|$))+/")+")")])}(b=a.types)&&g.push(["typ",b]);b=(""+a.keywords).replace(/^ | $/g,"");b.length&&g.push(["kwd",RegExp("^(?:"+b.replace(/[\s,]+/g,"|")+")\\b"),q]);d.push(["pln",/^\s+/,q," \r\n\t\u00a0"]);b="^.[^\\s\\w.$@'\"`/\\\\]*";a.regexLiterals&&(b+="(?!s*/)");g.push(["lit",/^@[$_a-z][\w$@]*/i,q],["typ",/^(?:[@_]?[A-Z]+[a-z][\w$@]*|\w+_t\b)/,q],["pln",/^[$_a-z][\w$@]*/i,q],["lit",/^(?:0x[\da-f]+|(?:\d(?:_\d+)*\d*(?:\.\d*)?|\.\d\+)(?:e[+-]?\d+)?)[a-z]*/i,q,"0123456789"],["pln",/^\\[\S\s]?/,
q],["pun",RegExp(b),q]);return C(d,g)}function J(a,d,g){function b(a){var c=a.nodeType;if(c==1&&!x.test(a.className))if("br"===a.nodeName)s(a),a.parentNode&&a.parentNode.removeChild(a);else for(a=a.firstChild;a;a=a.nextSibling)b(a);else if((c==3||c==4)&&g){var d=a.nodeValue,i=d.match(m);if(i)c=d.substring(0,i.index),a.nodeValue=c,(d=d.substring(i.index+i[0].length))&&a.parentNode.insertBefore(j.createTextNode(d),a.nextSibling),s(a),c||a.parentNode.removeChild(a)}}function s(a){function b(a,c){var d=
c?a.cloneNode(!1):a,e=a.parentNode;if(e){var e=b(e,1),g=a.nextSibling;e.appendChild(d);for(var i=g;i;i=g)g=i.nextSibling,e.appendChild(i)}return d}for(;!a.nextSibling;)if(a=a.parentNode,!a)return;for(var a=b(a.nextSibling,0),d;(d=a.parentNode)&&d.nodeType===1;)a=d;c.push(a)}for(var x=/(?:^|\s)nocode(?:\s|$)/,m=/\r\n?|\n/,j=a.ownerDocument,k=j.createElement("li");a.firstChild;)k.appendChild(a.firstChild);for(var c=[k],i=0;i<c.length;++i)b(c[i]);d===(d|0)&&c[0].setAttribute("value",d);var r=j.createElement("ol");
r.className="linenums";for(var d=Math.max(0,d-1|0)||0,i=0,n=c.length;i<n;++i)k=c[i],k.className="L"+(i+d)%10,k.firstChild||k.appendChild(j.createTextNode("\u00a0")),r.appendChild(k);a.appendChild(r)}function p(a,d){for(var g=d.length;--g>=0;){var b=d[g];F.hasOwnProperty(b)?D.console&&console.warn("cannot override language handler %s",b):F[b]=a}}function I(a,d){if(!a||!F.hasOwnProperty(a))a=/^\s*</.test(d)?"default-markup":"default-code";return F[a]}function K(a){var d=a.h;try{var g=T(a.c,a.i),b=g.a;
a.a=b;a.d=g.d;a.e=0;I(d,b)(a);var s=/\bMSIE\s(\d+)/.exec(navigator.userAgent),s=s&&+s[1]<=8,d=/\n/g,x=a.a,m=x.length,g=0,j=a.d,k=j.length,b=0,c=a.g,i=c.length,r=0;c[i]=m;var n,e;for(e=n=0;e<i;)c[e]!==c[e+2]?(c[n++]=c[e++],c[n++]=c[e++]):e+=2;i=n;for(e=n=0;e<i;){for(var p=c[e],w=c[e+1],t=e+2;t+2<=i&&c[t+1]===w;)t+=2;c[n++]=p;c[n++]=w;e=t}c.length=n;var f=a.c,h;if(f)h=f.style.display,f.style.display="none";try{for(;b<k;){var l=j[b+2]||m,B=c[r+2]||m,t=Math.min(l,B),A=j[b+1],G;if(A.nodeType!==1&&(G=x.substring(g,
t))){s&&(G=G.replace(d,"\r"));A.nodeValue=G;var L=A.ownerDocument,o=L.createElement("span");o.className=c[r+1];var v=A.parentNode;v.replaceChild(o,A);o.appendChild(A);g<l&&(j[b+1]=A=L.createTextNode(x.substring(t,l)),v.insertBefore(A,o.nextSibling))}g=t;g>=l&&(b+=2);g>=B&&(r+=2)}}finally{if(f)f.style.display=h}}catch(u){D.console&&console.log(u&&u.stack||u)}}var D=window,y=["break,continue,do,else,for,if,return,while"],E=[[y,"auto,case,char,const,default,double,enum,extern,float,goto,inline,int,long,register,short,signed,sizeof,static,struct,switch,typedef,union,unsigned,void,volatile"],
"catch,class,delete,false,import,new,operator,private,protected,public,this,throw,true,try,typeof"],M=[E,"alignof,align_union,asm,axiom,bool,concept,concept_map,const_cast,constexpr,decltype,delegate,dynamic_cast,explicit,export,friend,generic,late_check,mutable,namespace,nullptr,property,reinterpret_cast,static_assert,static_cast,template,typeid,typename,using,virtual,where"],N=[E,"abstract,assert,boolean,byte,extends,final,finally,implements,import,instanceof,interface,null,native,package,strictfp,super,synchronized,throws,transient"],
O=[N,"as,base,by,checked,decimal,delegate,descending,dynamic,event,fixed,foreach,from,group,implicit,in,internal,into,is,let,lock,object,out,override,orderby,params,partial,readonly,ref,sbyte,sealed,stackalloc,string,select,uint,ulong,unchecked,unsafe,ushort,var,virtual,where"],E=[E,"debugger,eval,export,function,get,null,set,undefined,var,with,Infinity,NaN"],P=[y,"and,as,assert,class,def,del,elif,except,exec,finally,from,global,import,in,is,lambda,nonlocal,not,or,pass,print,raise,try,with,yield,False,True,None"],
Q=[y,"alias,and,begin,case,class,def,defined,elsif,end,ensure,false,in,module,next,nil,not,or,redo,rescue,retry,self,super,then,true,undef,unless,until,when,yield,BEGIN,END"],W=[y,"as,assert,const,copy,drop,enum,extern,fail,false,fn,impl,let,log,loop,match,mod,move,mut,priv,pub,pure,ref,self,static,struct,true,trait,type,unsafe,use"],y=[y,"case,done,elif,esac,eval,fi,function,in,local,set,then,until"],R=/^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)\b/,
V=/\S/,X=v({keywords:[M,O,E,"caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END",P,Q,y],hashComments:!0,cStyleComments:!0,multiLineStrings:!0,regexLiterals:!0}),F={};p(X,["default-code"]);p(C([],[["pln",/^[^<?]+/],["dec",/^<!\w[^>]*(?:>|$)/],["com",/^<\!--[\S\s]*?(?:--\>|$)/],["lang-",/^<\?([\S\s]+?)(?:\?>|$)/],["lang-",/^<%([\S\s]+?)(?:%>|$)/],["pun",/^(?:<[%?]|[%?]>)/],["lang-",
/^<xmp\b[^>]*>([\S\s]+?)<\/xmp\b[^>]*>/i],["lang-js",/^<script\b[^>]*>([\S\s]*?)(<\/script\b[^>]*>)/i],["lang-css",/^<style\b[^>]*>([\S\s]*?)(<\/style\b[^>]*>)/i],["lang-in.tag",/^(<\/?[a-z][^<>]*>)/i]]),["default-markup","htm","html","mxml","xhtml","xml","xsl"]);p(C([["pln",/^\s+/,q," \t\r\n"],["atv",/^(?:"[^"]*"?|'[^']*'?)/,q,"\"'"]],[["tag",/^^<\/?[a-z](?:[\w-.:]*\w)?|\/?>$/i],["atn",/^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i],["lang-uq.val",/^=\s*([^\s"'>]*(?:[^\s"'/>]|\/(?=\s)))/],["pun",/^[/<->]+/],
["lang-js",/^on\w+\s*=\s*"([^"]+)"/i],["lang-js",/^on\w+\s*=\s*'([^']+)'/i],["lang-js",/^on\w+\s*=\s*([^\s"'>]+)/i],["lang-css",/^style\s*=\s*"([^"]+)"/i],["lang-css",/^style\s*=\s*'([^']+)'/i],["lang-css",/^style\s*=\s*([^\s"'>]+)/i]]),["in.tag"]);p(C([],[["atv",/^[\S\s]+/]]),["uq.val"]);p(v({keywords:M,hashComments:!0,cStyleComments:!0,types:R}),["c","cc","cpp","cxx","cyc","m"]);p(v({keywords:"null,true,false"}),["json"]);p(v({keywords:O,hashComments:!0,cStyleComments:!0,verbatimStrings:!0,types:R}),
["cs"]);p(v({keywords:N,cStyleComments:!0}),["java"]);p(v({keywords:y,hashComments:!0,multiLineStrings:!0}),["bash","bsh","csh","sh"]);p(v({keywords:P,hashComments:!0,multiLineStrings:!0,tripleQuotedStrings:!0}),["cv","py","python"]);p(v({keywords:"caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END",hashComments:!0,multiLineStrings:!0,regexLiterals:2}),["perl","pl","pm"]);p(v({keywords:Q,
hashComments:!0,multiLineStrings:!0,regexLiterals:!0}),["rb","ruby"]);p(v({keywords:E,cStyleComments:!0,regexLiterals:!0}),["javascript","js"]);p(v({keywords:"all,and,by,catch,class,else,extends,false,finally,for,if,in,is,isnt,loop,new,no,not,null,of,off,on,or,return,super,then,throw,true,try,unless,until,when,while,yes",hashComments:3,cStyleComments:!0,multilineStrings:!0,tripleQuotedStrings:!0,regexLiterals:!0}),["coffee"]);p(v({keywords:W,cStyleComments:!0,multilineStrings:!0}),["rc","rs","rust"]);
p(C([],[["str",/^[\S\s]+/]]),["regex"]);var Y=D.PR={createSimpleLexer:C,registerLangHandler:p,sourceDecorator:v,PR_ATTRIB_NAME:"atn",PR_ATTRIB_VALUE:"atv",PR_COMMENT:"com",PR_DECLARATION:"dec",PR_KEYWORD:"kwd",PR_LITERAL:"lit",PR_NOCODE:"nocode",PR_PLAIN:"pln",PR_PUNCTUATION:"pun",PR_SOURCE:"src",PR_STRING:"str",PR_TAG:"tag",PR_TYPE:"typ",prettyPrintOne:D.prettyPrintOne=function(a,d,g){var b=document.createElement("div");b.innerHTML="<pre>"+a+"</pre>";b=b.firstChild;g&&J(b,g,!0);K({h:d,j:g,c:b,i:1});
return b.innerHTML},prettyPrint:D.prettyPrint=function(a,d){function g(){for(var b=D.PR_SHOULD_USE_CONTINUATION?c.now()+250:Infinity;i<p.length&&c.now()<b;i++){for(var d=p[i],j=h,k=d;k=k.previousSibling;){var m=k.nodeType,o=(m===7||m===8)&&k.nodeValue;if(o?!/^\??prettify\b/.test(o):m!==3||/\S/.test(k.nodeValue))break;if(o){j={};o.replace(/\b(\w+)=([\w%+\-.:]+)/g,function(a,b,c){j[b]=c});break}}k=d.className;if((j!==h||e.test(k))&&!v.test(k)){m=!1;for(o=d.parentNode;o;o=o.parentNode)if(f.test(o.tagName)&&
o.className&&e.test(o.className)){m=!0;break}if(!m){d.className+=" prettyprinted";m=j.lang;if(!m){var m=k.match(n),y;if(!m&&(y=U(d))&&t.test(y.tagName))m=y.className.match(n);m&&(m=m[1])}if(w.test(d.tagName))o=1;else var o=d.currentStyle,u=s.defaultView,o=(o=o?o.whiteSpace:u&&u.getComputedStyle?u.getComputedStyle(d,q).getPropertyValue("white-space"):0)&&"pre"===o.substring(0,3);u=j.linenums;if(!(u=u==="true"||+u))u=(u=k.match(/\blinenums\b(?::(\d+))?/))?u[1]&&u[1].length?+u[1]:!0:!1;u&&J(d,u,o);r=
{h:m,c:d,j:u,i:o};K(r)}}}i<p.length?setTimeout(g,250):"function"===typeof a&&a()}for(var b=d||document.body,s=b.ownerDocument||document,b=[b.getElementsByTagName("pre"),b.getElementsByTagName("code"),b.getElementsByTagName("xmp")],p=[],m=0;m<b.length;++m)for(var j=0,k=b[m].length;j<k;++j)p.push(b[m][j]);var b=q,c=Date;c.now||(c={now:function(){return+new Date}});var i=0,r,n=/\blang(?:uage)?-([\w.]+)(?!\S)/,e=/\bprettyprint\b/,v=/\bprettyprinted\b/,w=/pre|xmp/i,t=/^code$/i,f=/^(?:pre|code|xmp)$/i,
h={};g()}};typeof define==="function"&&define.amd&&define("google-code-prettify",[],function(){return Y})})();}()
