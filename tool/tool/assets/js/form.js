
(function( jQuery, undefined ){
	var oldManip = jQuery.fn.domManip, tmplItmAtt = "_tmplitem", htmlExpr = /^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! /,
		newTmplItems = {}, wrappedItems = {}, appendToTmplItems, topTmplItem = { key: 0, data: {} }, itemKey = 0, cloneIndex = 0, stack = [];

	function newTmplItem( options, parentItem, fn, data ) {
		// Returns a template item data structure for a new rendered instance of a template (a 'template item').
		// The content field is a hierarchical array of strings and nested items (to be
		// removed and replaced by nodes field of dom elements, once inserted in DOM).
		var newItem = {
			data: data || (data === 0 || data === false) ? data : (parentItem ? parentItem.data : {}),
			_wrap: parentItem ? parentItem._wrap : null,
			tmpl: null,
			parent: parentItem || null,
			nodes: [],
			calls: tiCalls,
			nest: tiNest,
			wrap: tiWrap,
			html: tiHtml,
			update: tiUpdate
		};
		if ( options ) {
			jQuery.extend( newItem, options, { nodes: [], parent: parentItem });
		}
		if ( fn ) {
			// Build the hierarchical content to be used during insertion into DOM
			newItem.tmpl = fn;
			newItem._ctnt = newItem._ctnt || newItem.tmpl( jQuery, newItem );
			newItem.key = ++itemKey;
			// Keep track of new template item, until it is stored as jQuery Data on DOM element
			(stack.length ? wrappedItems : newTmplItems)[itemKey] = newItem;
		}
		return newItem;
	}

	// Override appendTo etc., in order to provide support for targeting multiple elements. (This code would disappear if integrated in jquery core).
	jQuery.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var ret = [], insert = jQuery( selector ), elems, i, l, tmplItems,
				parent = this.length === 1 && this[0].parentNode;

			appendToTmplItems = newTmplItems || {};
			if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
				insert[ original ]( this[0] );
				ret = this;
			} else {
				for ( i = 0, l = insert.length; i < l; i++ ) {
					cloneIndex = i;
					elems = (i > 0 ? this.clone(true) : this).get();
					jQuery( insert[i] )[ original ]( elems );
					ret = ret.concat( elems );
				}
				cloneIndex = 0;
				ret = this.pushStack( ret, name, insert.selector );
			}
			tmplItems = appendToTmplItems;
			appendToTmplItems = null;
			jQuery.tmpl.complete( tmplItems );
			return ret;
		};
	});

	jQuery.fn.extend({
		// Use first wrapped element as template markup.
		// Return wrapped set of template items, obtained by rendering template against data.
		tmpl: function( data, options, parentItem ) {
			return jQuery.tmpl( this[0], data, options, parentItem );
		},

		// Find which rendered template item the first wrapped DOM element belongs to
		tmplItem: function() {
			return jQuery.tmplItem( this[0] );
		},

		// Consider the first wrapped element as a template declaration, and get the compiled template or store it as a named template.
		template: function( name ) {
			return jQuery.template( name, this[0] );
		},

		domManip: function( args, table, callback, options ) {
			if ( args[0] && jQuery.isArray( args[0] )) {
				var dmArgs = jQuery.makeArray( arguments ), elems = args[0], elemsLength = elems.length, i = 0, tmplItem;
				while ( i < elemsLength && !(tmplItem = jQuery.data( elems[i++], "tmplItem" ))) {}
				if ( tmplItem && cloneIndex ) {
					dmArgs[2] = function( fragClone ) {
						// Handler called by oldManip when rendered template has been inserted into DOM.
						jQuery.tmpl.afterManip( this, fragClone, callback );
					};
				}
				oldManip.apply( this, dmArgs );
			} else {
				oldManip.apply( this, arguments );
			}
			cloneIndex = 0;
			if ( !appendToTmplItems ) {
				jQuery.tmpl.complete( newTmplItems );
			}
			return this;
		}
	});

	jQuery.extend({
		// Return wrapped set of template items, obtained by rendering template against data.
		tmpl: function( tmpl, data, options, parentItem ) {
			var ret, topLevel = !parentItem;
			if ( topLevel ) {
				// This is a top-level tmpl call (not from a nested template using {{tmpl}})
				parentItem = topTmplItem;
				tmpl = jQuery.template[tmpl] || jQuery.template( null, tmpl );
				wrappedItems = {}; // Any wrapped items will be rebuilt, since this is top level
			} else if ( !tmpl ) {
				// The template item is already associated with DOM - this is a refresh.
				// Re-evaluate rendered template for the parentItem
				tmpl = parentItem.tmpl;
				newTmplItems[parentItem.key] = parentItem;
				parentItem.nodes = [];
				if ( parentItem.wrapped ) {
					updateWrapped( parentItem, parentItem.wrapped );
				}
				// Rebuild, without creating a new template item
				return jQuery( build( parentItem, null, parentItem.tmpl( jQuery, parentItem ) ));
			}
			if ( !tmpl ) {
				return []; // Could throw...
			}
			if ( typeof data === "function" ) {
				data = data.call( parentItem || {} );
			}
			if ( options && options.wrapped ) {
				updateWrapped( options, options.wrapped );
			}
			ret = jQuery.isArray( data ) ?
				jQuery.map( data, function( dataItem ) {
					return dataItem ? newTmplItem( options, parentItem, tmpl, dataItem ) : null;
				}) :
				[ newTmplItem( options, parentItem, tmpl, data ) ];
			return topLevel ? jQuery( build( parentItem, null, ret ) ) : ret;
		},

		// Return rendered template item for an element.
		tmplItem: function( elem ) {
			var tmplItem;
			if ( elem instanceof jQuery ) {
				elem = elem[0];
			}
			while ( elem && elem.nodeType === 1 && !(tmplItem = jQuery.data( elem, "tmplItem" )) && (elem = elem.parentNode) ) {}
			return tmplItem || topTmplItem;
		},

		// Set:
		// Use $.template( name, tmpl ) to cache a named template,
		// where tmpl is a template string, a script element or a jQuery instance wrapping a script element, etc.
		// Use $( "selector" ).template( name ) to provide access by name to a script block template declaration.

		// Get:
		// Use $.template( name ) to access a cached template.
		// Also $( selectorToScriptBlock ).template(), or $.template( null, templateString )
		// will return the compiled template, without adding a name reference.
		// If templateString includes at least one HTML tag, $.template( templateString ) is equivalent
		// to $.template( null, templateString )
		template: function( name, tmpl ) {
			if (tmpl) {
				// Compile template and associate with name
				if ( typeof tmpl === "string" ) {
					// This is an HTML string being passed directly in.
					tmpl = buildTmplFn( tmpl );
				} else if ( tmpl instanceof jQuery ) {
					tmpl = tmpl[0] || {};
				}
				if ( tmpl.nodeType ) {
					// If this is a template block, use cached copy, or generate tmpl function and cache.
					tmpl = jQuery.data( tmpl, "tmpl" ) || jQuery.data( tmpl, "tmpl", buildTmplFn( tmpl.innerHTML ));
					// Issue: In IE, if the container element is not a script block, the innerHTML will remove quotes from attribute values whenever the value does not include white space.
					// This means that foo="${x}" will not work if the value of x includes white space: foo="${x}" -> foo=value of x.
					// To correct this, include space in tag: foo="${ x }" -> foo="value of x"
				}
				return typeof name === "string" ? (jQuery.template[name] = tmpl) : tmpl;
			}
			// Return named compiled template
			return name ? (typeof name !== "string" ? jQuery.template( null, name ):
				(jQuery.template[name] ||
					// If not in map, and not containing at least on HTML tag, treat as a selector.
					// (If integrated with core, use quickExpr.exec)
					jQuery.template( null, htmlExpr.test( name ) ? name : jQuery( name )))) : null;
		},

		encode: function( text ) {
			// Do HTML encoding replacing < > & and ' and " by corresponding entities.
			return ("" + text).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;");
		}
	});

	jQuery.extend( jQuery.tmpl, {
		tag: {
			"tmpl": {
				_default: { $2: "null" },
				open: "if($notnull_1){__=__.concat($item.nest($1,$2));}"
				// tmpl target parameter can be of type function, so use $1, not $1a (so not auto detection of functions)
				// This means that {{tmpl foo}} treats foo as a template (which IS a function).
				// Explicit parens can be used if foo is a function that returns a template: {{tmpl foo()}}.
			},
			"wrap": {
				_default: { $2: "null" },
				open: "$item.calls(__,$1,$2);__=[];",
				close: "call=$item.calls();__=call._.concat($item.wrap(call,__));"
			},
			"each": {
				_default: { $2: "$index, $value" },
				open: "if($notnull_1){$.each($1a,function($2){with(this){",
				close: "}});}"
			},
			"if": {
				open: "if(($notnull_1) && $1a){",
				close: "}"
			},
			"else": {
				_default: { $1: "true" },
				open: "}else if(($notnull_1) && $1a){"
			},
			"html": {
				// Unecoded expression evaluation.
				open: "if($notnull_1){__.push($1a);}"
			},
			"=": {
				// Encoded expression evaluation. Abbreviated form is ${}.
				_default: { $1: "$data" },
				open: "if($notnull_1){__.push($.encode($1a));}"
			},
			"!": {
				// Comment tag. Skipped by parser
				open: ""
			}
		},

		// This stub can be overridden, e.g. in jquery.tmplPlus for providing rendered events
		complete: function( items ) {
			newTmplItems = {};
		},

		// Call this from code which overrides domManip, or equivalent
		// Manage cloning/storing template items etc.
		afterManip: function afterManip( elem, fragClone, callback ) {
			// Provides cloned fragment ready for fixup prior to and after insertion into DOM
			var content = fragClone.nodeType === 11 ?
				jQuery.makeArray(fragClone.childNodes) :
				fragClone.nodeType === 1 ? [fragClone] : [];

			// Return fragment to original caller (e.g. append) for DOM insertion
			callback.call( elem, fragClone );

			// Fragment has been inserted:- Add inserted nodes to tmplItem data structure. Replace inserted element annotations by jQuery.data.
			storeTmplItems( content );
			cloneIndex++;
		}
	});

	//========================== Private helper functions, used by code above ==========================

	function build( tmplItem, nested, content ) {
		// Convert hierarchical content into flat string array
		// and finally return array of fragments ready for DOM insertion
		var frag, ret = content ? jQuery.map( content, function( item ) {
			return (typeof item === "string") ?
				// Insert template item annotations, to be converted to jQuery.data( "tmplItem" ) when elems are inserted into DOM.
				(tmplItem.key ? item.replace( /(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g, "$1 " + tmplItmAtt + "=\"" + tmplItem.key + "\" $2" ) : item) :
				// This is a child template item. Build nested template.
				build( item, tmplItem, item._ctnt );
		}) :
		// If content is not defined, insert tmplItem directly. Not a template item. May be a string, or a string array, e.g. from {{html $item.html()}}.
		tmplItem;
		if ( nested ) {
			return ret;
		}

		// top-level template
		ret = ret.join("");

		// Support templates which have initial or final text nodes, or consist only of text
		// Also support HTML entities within the HTML markup.
		ret.replace( /^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/, function( all, before, middle, after) {
			frag = jQuery( middle ).get();

			storeTmplItems( frag );
			if ( before ) {
				frag = unencode( before ).concat(frag);
			}
			if ( after ) {
				frag = frag.concat(unencode( after ));
			}
		});
		return frag ? frag : unencode( ret );
	}

	function unencode( text ) {
		// Use createElement, since createTextNode will not render HTML entities correctly
		var el = document.createElement( "div" );
		el.innerHTML = text;
		return jQuery.makeArray(el.childNodes);
	}

	// Generate a reusable function that will serve to render a template against data
	function buildTmplFn( markup ) {
		return new Function("jQuery","$item",
			// Use the variable __ to hold a string array while building the compiled template. (See https://github.com/jquery/jquery-tmpl/issues#issue/10).
			"var $=jQuery,call,__=[],$data=$item.data;" +

			// Introduce the data as local variables using with(){}
			"with($data){__.push('" +

			// Convert the template into pure JavaScript
			jQuery.trim(markup)
				.replace( /([\\'])/g, "\\$1" )
				.replace( /[\r\t\n]/g, " " )
				.replace( /\$\{([^\}]*)\}/g, "{{= $1}}" )
				.replace( /\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g,
				function( all, slash, type, fnargs, target, parens, args ) {
					var tag = jQuery.tmpl.tag[ type ], def, expr, exprAutoFnDetect;
					if ( !tag ) {
						throw "Unknown template tag: " + type;
					}
					def = tag._default || [];
					if ( parens && !/\w$/.test(target)) {
						target += parens;
						parens = "";
					}
					if ( target ) {
						target = unescape( target );
						args = args ? ("," + unescape( args ) + ")") : (parens ? ")" : "");
						// Support for target being things like a.toLowerCase();
						// In that case don't call with template item as 'this' pointer. Just evaluate...
						expr = parens ? (target.indexOf(".") > -1 ? target + unescape( parens ) : ("(" + target + ").call($item" + args)) : target;
						exprAutoFnDetect = parens ? expr : "(typeof(" + target + ")==='function'?(" + target + ").call($item):(" + target + "))";
					} else {
						exprAutoFnDetect = expr = def.$1 || "null";
					}
					fnargs = unescape( fnargs );
					return "');" +
						tag[ slash ? "close" : "open" ]
							.split( "$notnull_1" ).join( target ? "typeof(" + target + ")!=='undefined' && (" + target + ")!=null" : "true" )
							.split( "$1a" ).join( exprAutoFnDetect )
							.split( "$1" ).join( expr )
							.split( "$2" ).join( fnargs || def.$2 || "" ) +
						"__.push('";
				}) +
			"');}return __;"
		);
	}
	function updateWrapped( options, wrapped ) {
		// Build the wrapped content.
		options._wrap = build( options, true,
			// Suport imperative scenario in which options.wrapped can be set to a selector or an HTML string.
			jQuery.isArray( wrapped ) ? wrapped : [htmlExpr.test( wrapped ) ? wrapped : jQuery( wrapped ).html()]
		).join("");
	}

	function unescape( args ) {
		return args ? args.replace( /\\'/g, "'").replace(/\\\\/g, "\\" ) : null;
	}
	function outerHtml( elem ) {
		var div = document.createElement("div");
		div.appendChild( elem.cloneNode(true) );
		return div.innerHTML;
	}

	// Store template items in jQuery.data(), ensuring a unique tmplItem data data structure for each rendered template instance.
	function storeTmplItems( content ) {
		var keySuffix = "_" + cloneIndex, elem, elems, newClonedItems = {}, i, l, m;
		for ( i = 0, l = content.length; i < l; i++ ) {
			if ( (elem = content[i]).nodeType !== 1 ) {
				continue;
			}
			elems = elem.getElementsByTagName("*");
			for ( m = elems.length - 1; m >= 0; m-- ) {
				processItemKey( elems[m] );
			}
			processItemKey( elem );
		}
		function processItemKey( el ) {
			var pntKey, pntNode = el, pntItem, tmplItem, key;
			// Ensure that each rendered template inserted into the DOM has its own template item,
			if ( (key = el.getAttribute( tmplItmAtt ))) {
				while ( pntNode.parentNode && (pntNode = pntNode.parentNode).nodeType === 1 && !(pntKey = pntNode.getAttribute( tmplItmAtt ))) { }
				if ( pntKey !== key ) {
					// The next ancestor with a _tmplitem expando is on a different key than this one.
					// So this is a top-level element within this template item
					// Set pntNode to the key of the parentNode, or to 0 if pntNode.parentNode is null, or pntNode is a fragment.
					pntNode = pntNode.parentNode ? (pntNode.nodeType === 11 ? 0 : (pntNode.getAttribute( tmplItmAtt ) || 0)) : 0;
					if ( !(tmplItem = newTmplItems[key]) ) {
						// The item is for wrapped content, and was copied from the temporary parent wrappedItem.
						tmplItem = wrappedItems[key];
						tmplItem = newTmplItem( tmplItem, newTmplItems[pntNode]||wrappedItems[pntNode] );
						tmplItem.key = ++itemKey;
						newTmplItems[itemKey] = tmplItem;
					}
					if ( cloneIndex ) {
						cloneTmplItem( key );
					}
				}
				el.removeAttribute( tmplItmAtt );
			} else if ( cloneIndex && (tmplItem = jQuery.data( el, "tmplItem" )) ) {
				// This was a rendered element, cloned during append or appendTo etc.
				// TmplItem stored in jQuery data has already been cloned in cloneCopyEvent. We must replace it with a fresh cloned tmplItem.
				cloneTmplItem( tmplItem.key );
				newTmplItems[tmplItem.key] = tmplItem;
				pntNode = jQuery.data( el.parentNode, "tmplItem" );
				pntNode = pntNode ? pntNode.key : 0;
			}
			if ( tmplItem ) {
				pntItem = tmplItem;
				// Find the template item of the parent element.
				// (Using !=, not !==, since pntItem.key is number, and pntNode may be a string)
				while ( pntItem && pntItem.key != pntNode ) {
					// Add this element as a top-level node for this rendered template item, as well as for any
					// ancestor items between this item and the item of its parent element
					pntItem.nodes.push( el );
					pntItem = pntItem.parent;
				}
				// Delete content built during rendering - reduce API surface area and memory use, and avoid exposing of stale data after rendering...
				delete tmplItem._ctnt;
				delete tmplItem._wrap;
				// Store template item as jQuery data on the element
				jQuery.data( el, "tmplItem", tmplItem );
			}
			function cloneTmplItem( key ) {
				key = key + keySuffix;
				tmplItem = newClonedItems[key] =
					(newClonedItems[key] || newTmplItem( tmplItem, newTmplItems[tmplItem.parent.key + keySuffix] || tmplItem.parent ));
			}
		}
	}

	//---- Helper functions for template item ----

	function tiCalls( content, tmpl, data, options ) {
		if ( !content ) {
			return stack.pop();
		}
		stack.push({ _: content, tmpl: tmpl, item:this, data: data, options: options });
	}

	function tiNest( tmpl, data, options ) {
		// nested template, using {{tmpl}} tag
		return jQuery.tmpl( jQuery.template( tmpl ), data, options, this );
	}

	function tiWrap( call, wrapped ) {
		// nested template, using {{wrap}} tag
		var options = call.options || {};
		options.wrapped = wrapped;
		// Apply the template, which may incorporate wrapped content,
		return jQuery.tmpl( jQuery.template( call.tmpl ), call.data, options, call.item );
	}

	function tiHtml( filter, textOnly ) {
		var wrapped = this._wrap;
		return jQuery.map(
			jQuery( jQuery.isArray( wrapped ) ? wrapped.join("") : wrapped ).filter( filter || "*" ),
			function(e) {
				return textOnly ?
					e.innerText || e.textContent :
					e.outerHTML || outerHtml(e);
			});
	}

	function tiUpdate() {
		var coll = this.nodes;
		jQuery.tmpl( null, null, null, this).insertBefore( coll[0] );
		jQuery( coll ).remove();
	}
})( jQuery );


/**
 * Copyright (c)2005-2009 Matt Kruse (javascripttoolbox.com)
 * 
 * Dual licensed under the MIT and GPL licenses. 
 * This basically means you can use this code however you want for
 * free, but don't claim to have written it yourself!
 * Donations always accepted: http://www.JavascriptToolbox.com/donate/
 * 
 * Please do not link to the .js files on javascripttoolbox.com from
 * your site. Copy the files locally to your server instead.
 * 
 */
/**
 * jquery.contextmenu.js
 * jQuery Plugin for Context Menus
 * http://www.JavascriptToolbox.com/lib/contextmenu/
 *
 * Copyright (c) 2008 Matt Kruse (javascripttoolbox.com)
 * Dual licensed under the MIT and GPL licenses. 
 *
 * @version 1.1
 * @history 1.1 2010-01-25 Fixed a problem with 1.4 which caused undesired show/hide animations
 * @history 1.0 2008-10-20 Initial Release
 * @todo slideUp doesn't work in IE - because of iframe?
 * @todo Hide all other menus when contextmenu is shown?
 * @todo More themes
 * @todo Nested context menus
 */
;(function($){
	$.contextMenu = {
		shadow:true,
		shadowOffset:0,
		shadowOffsetX:5,
		shadowOffsetY:5,
		shadowWidthAdjust:-3,
		shadowHeightAdjust:-3,
		shadowOpacity:.2,
		shadowClass:'context-menu-shadow',
		shadowColor:'black',

		offsetX:0,
		offsetY:0,
		appendTo:'body',
		direction:'down',
		constrainToScreen:true,
				
		showTransition:'show',
		hideTransition:'hide',
		showSpeed:null,
		hideSpeed:null,
		showCallback:null,
		hideCallback:null,
		
		className:'context-menu',
		itemClassName:'context-menu-item',
		itemHoverClassName:'context-menu-item-hover',
		disabledItemClassName:'context-menu-item-disabled',
		disabledItemHoverClassName:'context-menu-item-disabled-hover',
		separatorClassName:'context-menu-separator',
		innerDivClassName:'context-menu-item-inner',
		themePrefix:'context-menu-theme-',
		theme:'default',

		separator:'context-menu-separator', // A specific key to identify a separator
		target:null, // The target of the context click, to be populated when triggered
		menu:null, // The jQuery object containing the HTML object that is the menu itself
		shadowObj:null, // Shadow object
		bgiframe:null, // The iframe object for IE6
		shown:false, // Currently being shown?
		useIframe:/*@cc_on @*//*@if (@_win32) true, @else @*/false,/*@end @*/ // This is a better check than looking at userAgent!
		
		// Create the menu instance
		create: function(menu,opts) {
			var cmenu = $.extend({},this,opts); // Clone all default properties to created object
			
			// If a selector has been passed in, then use that as the menu
			if (typeof menu=="string") {
				cmenu.menu = $(menu);
			} 
			// If a function has been passed in, call it each time the menu is shown to create the menu
			else if (typeof menu=="function") {
				cmenu.menuFunction = menu;
			}
			// Otherwise parse the Array passed in
			else {
				cmenu.menu = cmenu.createMenu(menu,cmenu);
			}
			if (cmenu.menu) {
				cmenu.menu.css({display:'none'});
				$(cmenu.appendTo).append(cmenu.menu);
			}
			
			// Create the shadow object if shadow is enabled
			if (cmenu.shadow) {
				cmenu.createShadow(cmenu); // Extracted to method for extensibility
				if (cmenu.shadowOffset) { cmenu.shadowOffsetX = cmenu.shadowOffsetY = cmenu.shadowOffset; }
			}
			$('body').bind('contextmenu',function(){cmenu.hide();}); // If right-clicked somewhere else in the document, hide this menu
			return cmenu;
		},
		
		// Create an iframe object to go behind the menu
		createIframe: function() {
		    return $('<iframe frameborder="0" tabindex="-1" src="javascript:false" style="display:block;position:absolute;z-index:-1;filter:Alpha(Opacity=0);"/>');
		},
		
		// Accept an Array representing a menu structure and turn it into HTML
		createMenu: function(menu,cmenu) {
			var className = cmenu.className;
			$.each(cmenu.theme.split(","),function(i,n){className+=' '+cmenu.themePrefix+n});
			var $t = $('<table cellspacing=0 cellpadding=0></table>').click(function(){cmenu.hide(); return false;}); // We wrap a table around it so width can be flexible
			var $tr = $('<tr></tr>');
			var $td = $('<td></td>');
			var $div = $('<div class="'+className+'"></div>');
			
			// Each menu item is specified as either:
			//     title:function
			// or  title: { property:value ... }
			for (var i=0; i<menu.length; i++) {
				var m = menu[i];
				if (m==$.contextMenu.separator) {
					$div.append(cmenu.createSeparator());
				}
				else {
					for (var opt in menu[i]) {
						$div.append(cmenu.createMenuItem(opt,menu[i][opt])); // Extracted to method for extensibility
					}
				}
			}
			if ( cmenu.useIframe ) {
				$td.append(cmenu.createIframe());
			}
			$t.append($tr.append($td.append($div)))
			return $t;
		},
		
		// Create an individual menu item
		createMenuItem: function(label,obj) {
			var cmenu = this;
			if (typeof obj=="function") { obj={onclick:obj}; } // If passed a simple function, turn it into a property of an object
			// Default properties, extended in case properties are passed
			var o = $.extend({
				onclick:function() { },
				className:'',
				hoverClassName:cmenu.itemHoverClassName,
				icon:'',
				disabled:false,
				title:'',
				hoverItem:cmenu.hoverItem,
				hoverItemOut:cmenu.hoverItemOut
			},obj);
			// If an icon is specified, hard-code the background-image style. Themes that don't show images should take this into account in their CSS
			var iconStyle = (o.icon)?'background-image:url('+o.icon+');':'';
			var $div = $('<div class="'+cmenu.itemClassName+' '+o.className+((o.disabled)?' '+cmenu.disabledItemClassName:'')+'" title="'+o.title+'"></div>')
							// If the item is disabled, don't do anything when it is clicked
							.click(function(e){if(cmenu.isItemDisabled(this)){return false;}else{return o.onclick.call(cmenu.target,this,cmenu,e)}})
							// Change the class of the item when hovered over
							.hover( function(){ o.hoverItem.call(this,(cmenu.isItemDisabled(this))?cmenu.disabledItemHoverClassName:o.hoverClassName); }
									,function(){ o.hoverItemOut.call(this,(cmenu.isItemDisabled(this))?cmenu.disabledItemHoverClassName:o.hoverClassName); }
							);
			var $idiv = $('<div class="'+cmenu.innerDivClassName+'" style="'+iconStyle+'">'+label+'</div>');
			$div.append($idiv);
			return $div;
		},
		
		// Create a separator row
		createSeparator: function() {
			return $('<div class="'+this.separatorClassName+'"></div>');
		},
		
		// Determine if an individual item is currently disabled. This is called each time the item is hovered or clicked because the disabled status may change at any time
		isItemDisabled: function(item) { return $(item).is('.'+this.disabledItemClassName); },
		
		// Functions to fire on hover. Extracted to methods for extensibility
		hoverItem: function(c) { $(this).addClass(c); },
		hoverItemOut: function(c) { $(this).removeClass(c); },
		
		// Create the shadow object
		createShadow: function(cmenu) {
			cmenu.shadowObj = $('<div class="'+cmenu.shadowClass+'"></div>').css( {display:'none',position:"absolute", zIndex:9998, opacity:cmenu.shadowOpacity, backgroundColor:cmenu.shadowColor } );
			$(cmenu.appendTo).append(cmenu.shadowObj);
		},
		
		// Display the shadow object, given the position of the menu itself
		showShadow: function(x,y,e) {
			var cmenu = this;
			if (cmenu.shadow) {
				cmenu.shadowObj.css( {
					width:(cmenu.menu.width()+cmenu.shadowWidthAdjust)+"px", 
					height:(cmenu.menu.height()+cmenu.shadowHeightAdjust)+"px", 
					top:(y+cmenu.shadowOffsetY)+"px", 
					left:(x+cmenu.shadowOffsetX)+"px"
				}).addClass(cmenu.shadowClass)[cmenu.showTransition](cmenu.showSpeed);
			}
		},
		
		// A hook to call before the menu is shown, in case special processing needs to be done.
		// Return false to cancel the default show operation
		beforeShow: function() { return true; },
		
		// Show the context menu
		show: function(t,e) {
			var cmenu=this, x=e.pageX, y=e.pageY;
			cmenu.target = t; // Preserve the object that triggered this context menu so menu item click methods can see it
			if (cmenu.beforeShow()!==false) {
				// If the menu content is a function, call it to populate the menu each time it is displayed
				if (cmenu.menuFunction) {
					if (cmenu.menu) { $(cmenu.menu).remove(); }
					cmenu.menu = cmenu.createMenu(cmenu.menuFunction(cmenu,t),cmenu);
					cmenu.menu.css({display:'none'});
					$(cmenu.appendTo).append(cmenu.menu);
				}
				var $c = cmenu.menu;
				x+=cmenu.offsetX; y+=cmenu.offsetY;
				var pos = cmenu.getPosition(x,y,cmenu,e); // Extracted to method for extensibility
				cmenu.showShadow(pos.x,pos.y,e);
				// Resize the iframe if needed
				if (cmenu.useIframe) {
					$c.find('iframe').css({width:$c.width()+cmenu.shadowOffsetX+cmenu.shadowWidthAdjust,height:$c.height()+cmenu.shadowOffsetY+cmenu.shadowHeightAdjust});
				}
				$c.css( {top:pos.y+"px", left:pos.x+"px", position:"absolute",zIndex:9999} )[cmenu.showTransition](cmenu.showSpeed,((cmenu.showCallback)?function(){cmenu.showCallback.call(cmenu);}:null));
				cmenu.shown=true;
				$(document).one('click',null,function(){cmenu.hide()}); // Handle a single click to the document to hide the menu
			}
		},
		
		// Find the position where the menu should appear, given an x,y of the click event
		getPosition: function(clickX,clickY,cmenu,e) {
			var x = clickX+cmenu.offsetX;
			var y = clickY+cmenu.offsetY
			var h = $(cmenu.menu).height();
			var w = $(cmenu.menu).width();
			var dir = cmenu.direction;
			if (cmenu.constrainToScreen) {
				var $w = $(window);
				var wh = $w.height();
				var ww = $w.width();
				if (dir=="down" && (y+h-$w.scrollTop() > wh)) { dir = "up"; }
				var maxRight = x+w-$w.scrollLeft();
				if (maxRight > ww) { x -= (maxRight-ww); }
			}
			if (dir=="up") { y -= h; }
			return {'x':x,'y':y};
		},
		
		// Hide the menu, of course
		hide: function() {
			var cmenu=this;
			if (cmenu.shown) {
				if (cmenu.iframe) { $(cmenu.iframe).hide(); }
				if (cmenu.menu) { cmenu.menu[cmenu.hideTransition](cmenu.hideSpeed,((cmenu.hideCallback)?function(){cmenu.hideCallback.call(cmenu);}:null)); }
				if (cmenu.shadow) { cmenu.shadowObj[cmenu.hideTransition](cmenu.hideSpeed); }
			}
			cmenu.shown = false;
		}
	};
	
	// This actually adds the .contextMenu() function to the jQuery namespace
	$.fn.contextMenu = function(menu,options) {
		var cmenu = $.contextMenu.create(menu,options);
		return this.each(function(){
			$(this).bind('contextmenu',function(e){cmenu.show(this,e);return false;});
		});
	};
})(jQuery);


(function($) {
	$.prepareCombo = function(o) {
				if (o === null) {
					return 'null';
				}
				var data = o.data;
				var dataElement = o.tag;
				var emptyOption = o.emptyOption ?  o.emptyOption : true;
				var valueField = o.valueField ?  o.valueField : "description";
				var keyField = o.keyField ?  o.keyField : "id";
				var defaultText = o.defaultText ? o.defaultText : 'Select a value';
				var listener = o.listener ? o.listener : 'listener';
				var name = o.name ?  o.name : "";
				var rendered = o.rendered ?  o.rendered : false;
				var minWidth = o.minWidth ? o.minWidth : '180';
				var isMultiple = o.isMultiple ? o.isMultiple : false;
				var isRequired = o.isRequired ? o.isRequired : false;
				var required="";
				if(isRequired){
					required = "isRequired";
				}
				if(dataElement == null){
					return null;
				}
				
				var prepareCombo = '<select data-placeholder="'+defaultText+'" class="chosen-select '+listener+' '+required+'" style="min-width:'+minWidth+'px" tabindex="2" name="'+name+'">';
				if(emptyOption){
					prepareCombo += '<option value=""></option>';
				}
				 
				if (typeof data === 'object') {
					for (k in data) {
						if(data.hasOwnProperty(k)){
							prepareCombo += '<option value="'+data[k][keyField]+'">'+data[k][valueField]+'</option>';
						}
					}
				}
				prepareCombo += '</select>';	
				$("."+dataElement).empty().append(prepareCombo);
				
				if(isMultiple){
					$('.'+listener).attr("multiple",true)
				}
				$('.chosen-select').chosen({allow_single_deselect: true });
				$.orderInSequence();
			};
			
			
			
			$.fn.loadComboData = function(o) {
				if (o === null) {
					return 'null';
				}
				var data = o.data;
				var valueField = o.valueField ? o.valueField : "description";
				var keyField = o.keyField ? o.keyField : "id";
				var existingopt=$(this.selector + " option");
				if (existingopt.length > 1) {
					$.each(existingopt,function(i) {
						$(existingopt).remove();
					});
					$(this).trigger("chosen:updated");
				}				
				var comboOptions = '<option value=""></option>';
				if (typeof data === 'object') {
					for (k in data) {
						if(data.hasOwnProperty(k)){
							if(data[k][valueField]){
							comboOptions += '<option value="' + data[k][keyField] + '">'
								+ data[k][valueField] + '</option>';
							}							
						}
					}
				}
				$(this).append(comboOptions);
				$(this).trigger("chosen:updated");
			};
			
			$.fn.onSelect = function(o) {
				if (o === null) {
					return 'null';
				}
				//var tag = o.tag ? o.tag : "";
				var activeListener = o.activeListener ? o.activeListener : "";
				var filterListener = o.filterListener ? o.filterListener : "";
				var callBack = o.callBack ? o.callBack : callback = function(){};			
	           
				$(this).on('change', '.'+activeListener, function(event, params) {
					var selectedtext = $('.'+activeListener+ ' option:selected').text();
					o['text'] = selectedtext;
					o.callBack.call(this, params.selected, o);					
				});
			};
			
			$.fn.onComboChange = function(o) {
				if (o === null) {
					return 'null';
				}
				//var tag = o.tag ? o.tag : "";
				var filterListener = o.filterListener ? o.filterListener : "";
				var callBack = o.callBack ? o.callBack : callback = function(){};
				var parentScope = o.scope ? o.scope : this;
				var scope = this;
				$(this.parent()).on('change', scope.selector, function(event, params) {
					var selectedtext = $(scope.selector+' option:selected').text();
					o['text'] = selectedtext;
					o.callBack.call(parentScope, params.selected,o);					
				});
			};
}(jQuery));


// Tab indexing for tab out
$.orderInSequence = function(o){
	  if (o === null || o==undefined) {
			o = {};
}
	  var tabindex = 1;
	  $('input,select,textarea').each(function() {
	     if (this.type != "hidden") {
	       var $input = $(this);
	       $input.attr("tabindex", tabindex);
	       tabindex++;
	     }
	  });
	  return;
};

divi.formPanel = divi.extend(divi.panelBase,{
    tag: "form",
    formId:"",
    sections:{},
    appendToElement:null,
    action:"",
    fieldCount:-1,
    isNew:false,
    fieldcmps:{},
    comboData:{},
    dom:undefined,
    fields:{},
    tableProps:{},
    formDom:undefined,
    buttons:[],
    combos:[],
    contentCls:'formContent',
    comboData:[],
    defaults:{tag:'form','class':'diviForm'},
    showBorder:false,
    tText:'',
    submitCls:'',
    toggle:false,
    rendered:false,
    topbar:true,
    method : 'POST',
    postUrl:'',
    elements:{},
    elementsMap:{},
    hidden:false,
    fieldsInRow:3,
    clearButton:true,
    submitButton:true,
    returnButton:false,
    returnBtnCall:undefined,
    customButtonListener:undefined,
    isFileUpload:false,
    fileFields:[],
	isMultipleForm:false,
	scope:undefined,
	sectionName:"",
	isCollapsable:true,
    submitOptions:{},
    actionProps:{},
    editMode:false,
    readOnly:false,
    imgRowSpan:4,
    encType:'application/x-www-form-urlencoded',
    dependencies:{},
    actionType:divi.actionType.retrieve,
    ignoreSuccess:false,
    largerForm:true
    	
    ,init:function(cfg){
    	$.extend(this, cfg);
    	this.fieldCount = 0;
    	this.initialize();
    	divi.formPanel.superclass.init.call(this);
    	this.initForm();
		this.createForm(this.appendToElement);
	}
    
    ,initialize:function(){
    	this.elementsMap = {};
    }

    ,initForm:function(){
    	var table = this.data;
    	var tableDet = divi.app[table];
    	var sections;
    	if(tableDet){
    		sections = tableDet.getFieldDetails();
    	}
    	this.sections = sections;
    	this.initSections(sections);
    }
    
    ,initSections:function(sections){
    	var fields = [],eachSection;
    	for(var eachSec in sections){
    		if(sections.hasOwnProperty(eachSec)){
    			eachSection =  sections[eachSec];
    			$.extend(eachSection,{keys:[],doms:{}})
    			this.createFieldmap(eachSection,eachSection.fields);
    			delete eachSection.fields;
    			delete eachSection.inc;
    		}
    	}
    }
    
    ,fieldLoop:function(fields,callBack,section){
    	var eachField;
    	var map = {};
    	for(var key in fields){
    		if(fields.hasOwnProperty(key)){
    			eachField = fields[key];   			
    			if(eachField){
    				if(this.largerForm){
    					$.extend(eachField,{larger:true});
    				}
    				callBack.apply(this,[section,fields,eachField]);
    			}
    		}
    	}
    }
    
    ,createFieldmap:function(section,fields){
    	this.tmpMap = {};
    	this.fieldLoop(fields,this.fieldMapCallBack,section);
    	this.fieldMap = this.tmpMap;
    	delete this.tmpMap;
    	return this.fieldMap;
    }
    
    ,fieldMapCallBack:function(section,fields,eachField){
    	this.tmpMap[eachField['name']] = eachField;
    	if(section){
    		section['keys'].push(eachField['name']);
    		this.prepareFieldCB(eachField);
    	}
    }
    
    ,reset:function(options){
    	var options = options ||{};
    	var form = options.form || this;
    	for(var key in form.elementsMap){
    		if(form.elementsMap.hasOwnProperty(key)){
    			eachField = form.elementsMap[key];
    			if(eachField){
    				eachField.setValue("",true);
    				eachField.resetField();
				}
			}
		}
    	$('div.mandatory').addClass('hidden');
    }
    
    ,setValue:function(fieldName,value){
    	var field = this.elementsMap[fieldName] || this.elementsMap[fieldName.toLowerCase()];
    	if(field){
    		field.setValue(value);
    	}
	}
    
    ,setValues:function(data){
    	var values = {},eachField;
    	for(var key in data){
    		if(data.hasOwnProperty(key)){
    			if(this.elementsMap[key] && this.elementsMap[key].isEncrypt){
    				data[key] = $.base64.encode(data[key]);
				}
    			this.setValue(key, data[key]);
    		}
    	}
	}
    
    
    ,getValues:function(options){
		var form = options.form || this;
    	var values = {},filterValues={},eachField,value;
    	form.files = [];
    	for(var key in form.elementsMap){
    		if(form.elementsMap.hasOwnProperty(key)){
    			eachField = form.elementsMap[key];
    			if(eachField){
    					value = eachField.getValue();
    					if(eachField.isFileField){
    						form.files = form.files.concat(eachField.files);
    					}
	    				if(eachField.isEncrypt){
	    					value = $.base64.encode(value);
    				}
    				values[eachField.name] = value;
    			}
    		}
    	}
    	return values;
	}
    
    ,formatValues:function(data,prefix){
    	var form = options.form || this;
    	var values = {},filterValues={},eachField,value,keyName;
    	if(data){
    		for(var key in form.elementsMap){
        		if(form.elementsMap.hasOwnProperty(key)){
        			eachField = form.elementsMap[key];
        			if(eachField){
        				keyName = prefix ? prefix+eachField.name : eachField.name;
        				if(eachField.where){
        					filterValues[eachField.name] = data[keyName];
        				}else{
        					values[eachField.name] = data[keyName];
        				}
        			}
        		}
        	}	
    	}
    	
    	return {filters:filterValues,values:values};
    }
    
    ,prepareFieldCB:function(eachField){
    	if(eachField){
    		this.elementsMap[eachField.name] = this.hookFields(eachField);
    	}
    }
    
    ,getFormButtons:function(parent){
		rowElem = this.createRow(parent, {}, {});
    	
    	this.createButtons([{tag:'readOnly','defaultCss':'formfield mandatory hidden',value:'Please fill in Mandatory fields*'}],parent);//create the mandatory text.
    	var fromButton = divi.domBase.create({tag:'div'});
    	if(fromButton){
    		this.formButtonDom = fromButton.dom;
    		if(this.formButtonDom){
    			this.formButtonDom.setAttribute('class','formbuttons');
    		}
    		if(this.submitButton){
    			this.fieldCount++;
	       		 var buttons = [{tag:'button',value:'Submit',tabIndex:this.fieldCount,css:this.submitCls+" submit",hidden:!this.editMode,listeners:{'click':[this.submitForm]},local:'submitBtn'}];
	       		 this.createButtons(buttons,this.formButtonDom);
	       	 }
    		if(this.returnButton){
    			this.fieldCount++;
    			 var buttons = [{tag:'button',value:'Back',tabIndex:this.fieldCount,css:this.submitCls+" return",listeners:{'click':[this.returnForm]},local:'returnBtn'}];
	       		 this.createButtons(buttons,this.formButtonDom);
    		}
    		if(this.buttons){
    			 var buttons = [];
    	    	for(i = 0, len = this.buttons.length; i < len; i++){
    	    		 var config = this.buttons[i];
    	    		 this.fieldCount++;
    	    		 buttons.push({tag:'button',value:config.text,tabIndex:this.fieldCount,css:this.submitCls+config.text,listeners:{'click':[config.listener]},local:config.text+'Btn'});
    			}  
	       		 this.createButtons(buttons,this.formButtonDom);
    		}
    		if(rowElem.td){
    			divi.domBase.append(rowElem.td,this.formButtonDom);
    		}
    	}
      return buttons;
    }
    
    ,createButtons:function(btnCfg,parent){
    	var eachBtnCfg,elem,checkElem;
    	if(btnCfg ){
			 for(var key in btnCfg){
				 if(btnCfg.hasOwnProperty(key)){
					 eachBtnCfg =  btnCfg[key];
					 if(eachBtnCfg.tag){
						 checkElem = divi.form[eachBtnCfg.tag] ? divi.form[eachBtnCfg.tag] : divi[eachBtnCfg.tag];
				    	if(checkElem){
				    		$.extend(eachBtnCfg,{scope:this});
				    		var local = eachBtnCfg.local;
				    		delete eachBtnCfg.local;
				    		elem = new checkElem(eachBtnCfg);
				    		if(local){
				    			this[local] = elem.dom;
				    		}
				    		if(parent){
				    			divi.domBase.append(parent,elem.dom);
				    		}
				    	}
					 }
				 }
			 }
		}
    }
    
    ,toggleForm:function(event,val){
    	var form;
    	if(this instanceof divi.formPanel){
    		form = this;
    	}
    	if(!form && this.scope && this.scope instanceof divi.formPanel){
    		form = this.scope;
    	}
		if(form ){
			form.editMode = !form.editMode;
			if(form.editMode){
				form.setEditable({form:form});
				form.enableButton(form.submitBtn,true);
				form.setFocus();
			}else{
				form.setReadOnly({form:form});
				form.enableButton(form.submitBtn,false);
			}
		}
    }
    
    ,customButtonListeners: function(callback){
    	var scope = this.scope;
    	if(callback){
			callback.call(scope.scope);
		}	

    }
    
    ,hideField:function(field){
    	if(field){
    		var fieldVal = this.elementsMap[field];
    		fieldVal.hide();
    	}
    }
    
    ,enableButton:function(button,toShow){
    	if(button){
    		var jButton = $(button);
			if(toShow){
				jButton.removeClass('hidden');
        	}else{
        		jButton.addClass('hidden');
        	}
    	}
    	
    }
    
    ,submitForm:function(options){
    	$('.load').show();
    	var form;
    	if(this instanceof divi.formPanel){
    		form = this;
    	}
    	if(!form && this.scope && this.scope instanceof divi.formPanel){
    		form = this.scope;
    	}
		if(form){
			form.scope.submitForm();
		}
    }
    
    ,setFieldReadOnly:function(fieldName,alwaysReadOnly){
    	var form = this;
    	var eachField;
    	if(fieldName && form.elementsMap.hasOwnProperty(fieldName)){
			eachField = form.elementsMap[fieldName];
			if(eachField){
				eachField.setReadOnly();
				if(alwaysReadOnly){
					eachField.isReadOnly = true;
				}
			}
		}
    }
    
    ,setReadOnlysection:function(section){
    	if(section){
    		for(var key in section.keys){
    			if(section.keys.hasOwnProperty(key)){
    				this.setFieldReadOnly(section.keys[key],true);
    			}
    		}
    	}
    }
    
    ,setSectionsReadOnly:function(){
    	var form = this;
    	if(form.sections){
    		for(var key in form.sections){
    			if(form.sections.hasOwnProperty(key)){
    				if(form.sections[key].readOnly){
    					this.setReadOnlysection(form.sections[key]);
    				}
    			}
    		}
    	}
    }
  
    ,setReadOnly:function(options){
    	var options = options || {};
		var form = options.form || this;
		var eachField;
    	for(var key in form.elementsMap){
    		this.setFieldReadOnly(key);
		}
    }
   
    
    ,setEditable:function(options){
		var options = options || {};
		var form = options.form || this;
		var eachField;
		var editable = form.hasOwnProperty('readOnly') ? !form.readOnly : true;
		if(editable){
			for(var key in form.elementsMap){
	    		if(form.elementsMap.hasOwnProperty(key)){
	    			eachField = form.elementsMap[key];
		    		if(eachField && !eachField.isReadOnly){
		    			eachField.setEditable();
		    		 }
	    		}
			}
		}
	}
    
    ,S4:function() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}

	,guid:function() {
		return (this.S4() + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4()+ this.S4() + this.S4());
	}
    
    ,hookFields:function(eachField){
    	var type = eachField.type;
    	var elem;
    	var checkElem = divi.form[type];
    	if(checkElem){
    		$.extend(eachField,{scope:this});
    		if(!this.hidden){
    			this.fieldCount++;
    			$.extend(eachField,{tabIndex:this.fieldCount});
    		}	
    		if(eachField.isIdentity){
    			var splts = this.splitName(eachField.name);
    			$.extend(eachField,{hidden:true});
    			if(!this.tableProps[splts.table]){
    				this.tableProps[splts.table] = [];
    			}
    			if(!this.tableProps[splts.table]['identityCols']){
    				this.tableProps[splts.table]['identityCols'] = [];
    			}
    			this.tableProps[splts.table]['identityCols'].push(eachField.name);
    		}
    		if(type == "combofield"){
    			eachField.origListener = eachField.listener;
    			eachField.listener += this.guid();
    		}
    		if(type == "imagefield" || type == "videofield" || type == "imagefield"  || type == "file"){
    			this.isFileUpload = true;
    			this.fileFields.push(elem);
    		}
    		elem = new checkElem(eachField);
    	}
		
    	return elem;
    }
    
	,constructSection:function(eachsection,parent){
		var eachField;
		if(!parent){
			return;
		}
    	for(var key in eachsection.keys){
    		if(eachsection.keys.hasOwnProperty(key)){
    			eachField = this.elementsMap[eachsection.keys[key]];
    				divi.domBase.append(parent,eachField.dom);
    		}
    	}
	}
	
	,formHide:function(options){
		var options = options || {};
		var form = options.form || this;
		form.hidden = true;
		var e = form.formId ? "#" + form.formId : undefined;
        if (e) {
            var b = $(e);
            if (b) {
               b.hide();
            }
        }
	}
	
	,validateForm:function(options){
		var options = options || {};
		var form = options.form || this;
		var eachField,isValid= true,isRequiredEntered = true, fieldRefID='';
		for(var key in form.elementsMap){
    		if(this.elementsMap.hasOwnProperty(key)){
    			eachField = form.elementsMap[key];
    			if(eachField.isRequired){
    				isValid = isValid*eachField.checkValid();
				}
			}
		}
		if(isValid){
			$('div.mandatory').addClass('hidden');
		}else{
			$('div.mandatory').removeClass('hidden');
		}
    	return isValid;
	}
	
	
	,createRow:function(appendTo,trops,tdOps,isPrepend){
		var row,cell;
		if(appendTo){
			row = document.createElement('tr');
			var jRow = $(row);
			divi.domBase.attachAttrs(jRow,trops);
			
			cell = document.createElement("td"); 
			var jCell = $(cell);
			divi.domBase.attachAttrs(jCell,tdOps);
			divi.domBase.append(row,cell);
			divi.domBase.append(appendTo,row,isPrepend);
			
		}
		return {td:cell,tr:row};
	}
	
	,getSectionText:function(){
		return this.tText;
	}
	
	,getToggleText:function(parent){
		 var buttons = [{tag:'button',defaultCss:'place-right',baseCss:'imgButton',value:'<img class="toggle"/>',hidden:this.editMode,listeners:{'click':[this.toggleForm]}}];
   		 this.createButtons(buttons,parent);
	}
	
	,createSections:function(parent){
		parent = parent || this.formdom.dom;
		var contentCls = this.contentCls;
		var tdCls = ''; 
		var sections = this.sections;
		if(sections){
			var sectionsCount = sections.count;
			var rowElem,tdelem,eachSection,secCount = 0;
			
			for(var eachSec in sections){
	    		if(sections.hasOwnProperty(eachSec)){
	    			eachSection =  sections[eachSec];
	    			if(eachSection.hide){
	    				contentCls += " hidden";
	    				tdCls = 'hidden';
	    			}
	    			
	    			if(eachSection.name){
	    				rowElem = this.createRow(parent, {}, {'class':tdCls});
	    				var section = '<div class="sectionname">'+eachSection.name+'</div>';
	    				divi.domBase.attachAttrs(rowElem.td,{value:section});
	    				eachSection.doms.header = rowElem.td;
	    			}
	    			
	    			
    				rowElem = this.createRow(parent, {}, {'class':contentCls});
    				this.constructSection(eachSection,rowElem.td);
    				eachSection.doms.content = rowElem.td;
	    			secCount++;
	    		}
	    	}
		}
	}
	
	,createForm:function(appendToTag){
		var tableClass = this.hidden ? 'tableDiv hidden' : 'tableDiv';
		/*if(this.topbar){
			tableClass += " border"
		}*/
		$.extend(this, divi.domBase.create({tag:'table',"class":tableClass,scope:this}));
		var jtableElem = divi.domBase.fetchJSel(this.id);
		
		if(this.fileUpload){
    		this.encType = 'multipart/form-data';
    	}
		
		
		var dflts = $.extend('',this.defaults,{"name":this.name,"id":this.formId,"class":this.getCss(),"action":this.action,"method":this.method,"enctype":this.encType,"style":this.getStyle(),scope:this});
		this.formdom = divi.domBase.create(dflts,this.dom);
		
		if(this.topbar){
			rowElem = this.createRow(jtableElem, {}, {});
			var section = '<div class="sectionname">'+this.getSectionText()+'</div>';
			divi.domBase.attachAttrs(rowElem.td,{value:section});
		}
		this.createSections(jtableElem);
		this.getFormButtons(jtableElem);
		if(this.showBorder){
			$(jtableElem).find('tbody').addClass('border');
		}
		this.createToggle(jtableElem);
    	this.appendFormTo(appendToTag);
    	
	}
	
	,createToggle:function(jtableElem){
		jtableElem = jtableElem || divi.domBase.fetchJSel(this.id);
		if(this.toggle){
			var cls = '.'+this.contentCls;
			var appendElem = jtableElem.find(cls).parent();
			var rowElem = this.createRow(appendElem, {}, {},true);
			this.getToggleText(rowElem.td);
		}
	}
	
	,getElementDimens:function(toAttachElem){
		var width,height;
		if(toAttachElem.width()){
			width = toAttachElem.width();
		}else{
			width = toAttachElem.parent().width();
		}
		
		if(toAttachElem.height()){
			height = toAttachElem.height();
		}else{
			height = toAttachElem.parent().height();
		}
		return {height:height,width:width};
	}

	,appendFormTo:function(appendTo){
		if(appendTo != null){
			$(appendTo).append(this.dom);
			this.setSectionsReadOnly();
			this.setFocus();
			//if(!this.rendered){
				this.afterFormRender();
			//}
		}
	}
	
	,setFocus:function(){
		var form = this;
		var elements = form.elementsMap || {};
		var eachField;
		for(var key in elements){
    		if(elements.hasOwnProperty(key) && elements[key] && !elements[key].hidden){
    			var inputDom = elements[key].doms['inputdom'];
    			if(inputDom){
    				inputDom.dom.focus();
    				break;
    			}
			}
		}
	}
	
	,afterFormRender: function(){
		var eachField, scope=this;
    	var elements = this.elementsMap || {}, params=[];
    	$.each(elements, function(key, element) {
    		var comboData = scope.comboData;
    		if(element && element.type == "combofield") {
    			var handler = element.listener ? element.origListener : element.name;
    			$.prepareCombo({defaultText : 'Select a Value',tag : element.listener+'DD',data:comboData[element.name],name : element.name,listener:element.listener, minWidth:"176",rendered:this.scope.rendered});
    		}
    		else if(element && element.type=="datefield"){
				  $("."+element.name+'_date').customDatePicker({format:"yyyy-mm-dd"});
		  }
    	});
    	this.rendered = true;
	}
	
    ,draw:function(appendToTag){
    	this.appendToElement = appendToTag;
    	this.appendFormTo(appendToTag);
    }
});  

pageUnloaded = function(){
	divi.eventBase.destroyAll();
	divi.domBase.destroyAll();
};

window.addEventListener("unload", pageUnloaded, false);

divi.namespace("divi.form");
divi.form.textfield  = divi.extend(divi.baseField, {
	init:function(){
		divi.form.textfield.superclass.init.call(this);
	}
});

divi.form.readOnly  = divi.extend(divi.baseField, {
	defaults:{tag:"span",attachLis:true},
	init:function(cfg){
		divi.baseField.superclass.init.call(this);
	}
	
	,draw:function(options){
		var result = this.html;
		var parDom,labeldiv,lblDfts,text,inputDiv,dflts;
		var attribs = [];
		
		var parentDiv = divi.domBase.create({tag:'div'});
		if(parentDiv && parentDiv.dom){
			this.dom = parDom = parentDiv.dom;
			parDom.setAttribute('class',this.defaultCss+this.checkHidden());

			dflts = $.extend({},this.defaults,{scope:this,value:this.value,tabIndex:this.tabIndex});
			buttonDiv = divi.domBase.create(dflts,this.dom);
			this.doms[this.buttondom] = buttonDiv
		}
	}
});

divi.form.emailfield  = divi.extend(divi.form.textfield, {
	defaults:{tag:"input",type: 'email',attachLis:true},
	format : "email",
	applyFormat:true,
	init:function(cfg){
		$.extend(this,cfg);
		divi.form.emailfield.superclass.init.call(this);
	}	
	
	,checkFormat:function(val){
		var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	   return regex.test(val);
	}
});


divi.form.datefield  = divi.extend(divi.baseField, {
	datarole: 'datepicker',
	clrBtn:'btn-date',
	init:function(){
		divi.form.datefield.superclass.init.call(this);
	}

	,dflsOverlay:function(dflts){
		$.extend(dflts,{'data-effect':'slide | fade | none',"data-type":'date'});
		return dflts;
	}
	
	,setReadOnlyCss:function(field){
		if(field){
			divi.form.textfield.prototype.setReadOnlyCss.call(this,field);
			if(field.next().hasClass('btn-date')){
				field.next().hide();
			}
		}
	}
	
	,setEditableCss:function(field){
		if(field){
			divi.form.textfield.prototype.setEditableCss.call(this,field);
			if(field.next().hasClass('btn-date')){
				field.next().show();
			}
		}
	}
	,setValue: function(value){
		var dateValue = value;
		if(dateValue && dateValue!=""){
			dateValue = new Date(value).format("yyyy-mm-dd");
		}
		divi.form.datefield.superclass.setValue.call(this,dateValue);
	}
//	,clearBtn:function(event,targetVal,target){
//		
//	}
	,setProperties: function(options){
		divi.form.datefield.superclass.setProperties.call(this);
		this.doms.inputDiv.dom.classList.add(this.name+'_date');
		this.doms.inputdom.dom.setAttribute('fieldtype','datefield');
	}
});


divi.form.passwordfield  = divi.extend(divi.baseField, {
	defaults:{tag:"input",type: 'password',attachLis:true},
	clrBtn:'btn-reveal',
	isEncrypt:true,
	init:function(){
		divi.form.passwordfield.superclass.init.call(this);
	}
	
	,clearBtn:function(event,targetVal,target){
		var className = event.relatedTarget ? event.relatedTarget.className : '';
		var value = targetVal;
		if(className && className.indexOf(this.revealBtn) != -1){
			var cmp = divi.domBase.fetchJSel(this.doms[this.inputdom].id);
			var type = divi.util.getEvtType(event);
			if(cmp && type == "click"){
				cmp.attr('type','text');
			}else if(cmp && (type == "mouseup" || type == "mouseleave" )){
				cmp.attr('type','password');
			}
		}
		return value;
	}
	
});

divi.form.bool  = divi.extend(divi.baseField, {
	values:{'true':'1','false':'0'},
	datarole:'checkbox',
	lblWidth:'250',
	spanDiv:'spandiv',
	events:['change','keypress'],
	defaults:{tag:"input",type: 'checkbox',attachLis:true},
	spnDefaults:{tag:"span",'class': 'check',attachLis:false},
	inputDivdflts:{tag:"div",'class':"input-control checkbox"},
	init:function(cfg){
		$.extend(this,cfg);
		divi.form.bool.superclass.init.call(this);
	}
	
	,getValue:function(){
		var cmp = this.retrieveJInputDom();		
		if(cmp){
			this.value = cmp.prop('checked');
		}
		return this.value;
	}
	
	,setValue:function(value,supress){
		this.value = value;
		var cmp = this.retrieveJInputDom();		
		if(cmp){
			cmp.prop('checked',(value == "true"));
		}
	}
	
	,createField:function(options,parDom){
		var dflts,inputdom,buttonDiv;
		var inputdivdom = this.doms[this.inputDiv].dom;
		//input input
		dflts = $.extend({},this.defaults,{disabled:this.isReadOnly,scope:this,tabIndex:this.tabIndex});
		inputdom = divi.domBase.create(dflts,inputdivdom);
		this.doms[this.inputdom] = inputdom;
		
		//span
		dflts = $.extend({},this.spnDefaults,{scope:this});
		spanDiv = divi.domBase.create(dflts,inputdivdom);
		this.doms[this.buttondom] = spanDiv;
	}
	
	,createInputDiv:function(){
		var inputdivdom = this.doms[this.labeldiv].dom;
		
		var dflts = $.extend({},this.inputDivdflts,{'data-role':this.datarole,scope:this});
		var inputDiv = divi.domBase.create(dflts,inputdivdom);
		this.doms[this.inputDiv] = inputDiv;
	}
	
	,validateField:function(event,targetVal,jtarget){
		var target = divi.util.getTarget(event);
		this.value = target.checked;
	}
});
 
divi.form.numberfield  = divi.extend(divi.form.textfield, {
	defaults:{tag:"input",type: 'text',attachLis:true},
	events:['mousedown','change','focusout','keypress'],
	applyFormat:true,
	defaultValue:'',
	specialKeys:undefined,
	init:function(cfg){
		$.extend(this,cfg);
		if(this.name && (this.name.indexOf('_id') != -1 || this.name.indexOf('_ID') != -1)){
			this.defaultValue = -1;
		}
		this.specialKeys = new Array();
		this.specialKeys.push(8);
		divi.form.numberfield.superclass.init.call(this);
	}
	
	,validateField:function(event,targetVal,target){
		if(event.type == "keypress"){
			if(!this.checkNumeric(event)){
				event.preventDefault();
			}	
		}else{
			divi.baseField.prototype.validateField.call(this,event,targetVal,target);
		}
	}
	
    ,checkNumeric:function(e) {
        var keyCode = e.which ? e.which : e.keyCode
        var ret = ((keyCode >= 48 && keyCode <= 57) || this.specialKeys.indexOf(keyCode) != -1);
        return ret;
    }
});

divi.form.phoneNumField  = divi.extend(divi.form.textfield, {
	 format : "phoneNumField",
	 init:function(cfg){
		 divi.form.phoneNumField.superclass.init.call(this);
	 }

	,checkValid:function(target,value){
		var phoneFormat = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;
		this.resetField(target);
		if(value && !phoneFormat.test(value)){
			this.markInvalid(target);
		}
		return this.isValid;
	} 
});



divi.form.textarea  = divi.extend(divi.baseField, {
	defaults:{tag:"textarea",type: 'textarea',attachLis:true},
	rows:5,
	cols:90,
	init:function(cfg){
		$.extend(this,cfg);
		if(this.rows){
			$.extend(this.defaults,{rows:this.rows});
		}if(this.cols){
			$.extend(this.defaults,{cols:this.cols});
		}
		$.extend(this.defaults,{tabIndex:this.tabIndex});
		divi.form.textarea.superclass.init.call(this);
	}
	
});

divi.form.combofield  = divi.extend(divi.baseField, {
	defaults:{tag:"div"},
	unitsdfts:{tag:'div',"class":'form_combovalue'},
	format : "combo",
	fieldType:'combofield',
	isFormField:true,
	init:function(cfg){
		$.extend(this,cfg);
		this.baseCss = this.listener+'DD';
		divi.form.combofield.superclass.init.call(this);
	}
	
	,setReadOnlyCss:function(field){
		var name = this.name, dflts,spanDiv;;
		if(field){
			$('select[name='+name+'].chosen-select').attr('disabled', true).trigger("chosen:updated");
				if($('select[name='+name+']').next().hasClass('chosen-container')){
					$('select[name='+name+']').next().css("display","none");
			}
			var text = $('select[name='+name+'].chosen-select option:selected').text();
			this.doms.unitsdom.dom.innerText=text;
			this.doms.unitsdom.dom.classList.add('combo_value');
		}
	}
	
	,setEditableCss:function(field){
		var name = this.name;
		if(field){
			$('select[name='+name+'].chosen-select').attr('disabled', false).trigger("chosen:updated");
				if($('select[name='+name+']').next().hasClass('chosen-container')){
					$('select[name='+name+']').next().css("display","inline-block");
			}
			this.doms.unitsdom.dom.innerText="";
			this.doms.unitsdom.dom.classList.remove('combo_value');
		}
	}
	,setProperties: function(options){
		divi.form.combofield.superclass.setProperties.call(this);
		var input = this.doms[this.inputdom];
		if(input){
			input.dom.setAttribute('class',this.listener+'DD combofield');
		}
	}
	,setValue:function(value, supress){
		this.value = value;
		var cmp = this.retrieveInputDom();		
		if(cmp){
			$(cmp).val(value).trigger('chosen:updated');
			if(!supress){
				target = this.retrieveJInputDom();
				this.checkValid(target,value);
			}
		}
	}
	,retrieveInputDom:function(){
		var cmp;
		var refDom = this.doms[this.inputdom];
		if(refDom){
			cmp = divi.domBase.fetchsel(refDom.id); 
		}
		if(cmp.hasChildNodes("select")){
			cmp = cmp.firstChild || cmp;
		}
		return cmp;
	}
	,createBtnCfg: function(options,parDom){
	}
	,checkValid:function(target,value){
		target = this.retrieveInputDom();
		if(this.isRequired && !divi.util.isjQEmpty(target)){
			if(divi.util.isEmpty(target.value)){
				this.isValid = false;
			}else{
				this.isValid = true;
			}
		}
		return this.isValid;
	} 
	,getValue: function(){
		var val ='';
		var inuptDom = this.retrieveInputDom();
		if(inuptDom){
			val = inuptDom.value;
		}
		return val;
	}
});


divi.form.multicombofield  = divi.extend(divi.baseField, {
	format : "combo",
	fieldType:'multicombofield',
	isFormField:true,
	init:function(cfg){
		$.extend(this,cfg);
		this.baseCss = this.name+'DD';
		divi.form.combofield.superclass.init.call(this);
	}

	,configureFieldElement:function(options){
		var inputTxt = {};
		var fieldName;
		if(options != null && options.attribs != null){
			var fields=options.attribs;
			fields.forEach(function(eachItem){
					if(eachItem.name == "name"){
						fieldName=eachItem.value;
					}
				});
		}
		var inputCfg = {tag:'span',attribs:[{name:"id",value:fieldName+"comboField"}]};
		inputTxt.inputCfg = inputCfg;
		options.cls = fieldName+"select";
		options.role = "input-control";
		inputTxt.divAttribs = this._createDivCtrlAttrib(options);
		return inputTxt;
	}

	,setReadOnlyCss:function(field){
		var name = this.name;
		if(field){
			$('select[name='+name+'].chosen-select').attr('disabled', true).trigger("chosen:updated");
				if($('select[name='+name+']').next().hasClass('chosen-container')){
					$('select[name='+name+']').next().css("display","none");
			}
			field.attr('disabled',true);
			field.addClass("readonly");
			var text = $('select[name='+name+'].chosen-select option:selected').text();
			var comboInput = $("#"+name+"comboField");
			comboInput.text(text);
		}
	}
	
	,setEditableCss:function(field){
		var name = this.name;
		if(field){
			$('select[name='+name+'].chosen-select').attr('disabled', false).trigger("chosen:updated");
				if($('select[name='+name+']').next().hasClass('chosen-container')){
					$('select[name='+name+']').next().css("display","inline-block");
			}
			field.attr('disabled',false);
			field.removeClass("readonly");
			var comboInput = $("#"+name+"comboField");
			comboInput.text("");
		}
	}
});

divi.form.formlabel  = divi.extend(divi.baseField, {
	tag:'label',
	isFormField:true,
	init:function(cfg){
		$.extend(this,cfg);
		divi.form.formlabel.superclass.init.call(this);
	}
});



divi.form.file = divi.extend(divi.baseField, {
	events:['change'],
	files:[],
	validTypes:[],
	defaults:{tag:"input",type: 'file',attachLis:true},
	inputDivdflts:{tag:"div","class":"input-control file"},
	lbldfts:{tag:"label","class":"labelStyle",attachLis:false},
	spnDefaults:{tag:"span","class": 'bg-darkCobalt fg-white upload'},
	spanText:'Upload a File',
	outputDvDflts:{tag:"div","class":"fileUploadbox"},
	innerDvDflts:{tag:"div","class":"fileUpload file"},
	innerDiv:'innerDiv',
	isFileField:true,
	init:function(cfg){
		$.extend(this,cfg);
		divi.form.file.superclass.init.call(this);
	}
	
	,setEditable:function(){
		var name = this.name;
		var tag = this.tag;
		var value;
		var field = this.retrieveJInputDom();		
		if(field){
			this.setEditableCss(field);
		}
	}
	
	,draw:function(options,parent){
		var parDom,labeldiv,lblDfts,text,inputDiv,dflts;
		var attribs = [];
		
		var mainDiv = divi.domBase.create({tag:'div'},parent);
		if(mainDiv && mainDiv.dom){
			this.dom = parDom = mainDiv.dom;
			this.elemId = mainDiv.id;
			parDom.setAttribute("class",this.defaultCss+this.checkHidden()+this.addLarger());
			var labelDom = this.createLabel(options,parDom);
			var inputDiv = this.createInputDiv(options,parDom);
			this.createField(options,inputDiv);
			this.setProperties(options);
		}
	}
	
	,setValue:function(value){
		this.value = value;
	}
	
	,validateField:function(event,value,jTarget){
		var target = divi.util.getTarget(event);
		var isValid = this.checkValid(target,jTarget,value);
		if(isValid){
			this.readData(event,value,jTarget,target);
			this.setValue(this.files[0].name);
		}
		return isValid;
	}
	
	,readData:function(event,targetVal,jTarget,target){
		this.files = [target.files[0]];
	}
	
	,checkValid:function(target,jTarget,value){
		var isValid = true;
		target = target ? target : this.doms[this.inputdom].dom;
		jTarget = jTarget ? jTarget : divi.domBase.fetchJSel(this.doms[this.inputdom].id);
		if(target){
			var files = target.files;
			if(this.scope.isNew){
				if(files && files.length > 0){
					var baseFile = files[0];
					if(baseFile && !$.isEmptyObject(this.validTypes)){
						if(this.validTypes.indexOf(baseFile.type) == -1){
							isValid = false;
						}
						if(!isValid && this.isRequired && !divi.util.isjQEmpty(target)){
							jTarget.remove();
							var inputDiv = this.doms[this.inputDiv];
							this.createField({},inputDiv.dom);
							this.setProperties({});
							alert('File format is not expected.Please select relevent file');
						}
					}
				}else if(this.isRequired){
					isValid = false
				}
			}
			this.isValid = isValid;
		}
		return this.isValid;
		
	}
	
	,setProperties:function(options){
		var input = this.doms[this.inputdom];
		if(input){
			input.dom.setAttribute('id',input.id);
			input.dom.setAttribute('name',this.name);
		}
	}
	
	,createField:function(options,parDom){
		var dflts,inputdom,buttonDiv;
		dflts = $.extend({},this.defaults,{disabled:this.isReadOnly,scope:this,tabIndex:this.tabIndex});
		inputdom = divi.domBase.create(dflts,parDom);
		this.doms[this.inputdom] = inputdom;
	}
	
	,createInputDiv:function(options,parent){
		var dflts = $.extend({},this.inputDivdflts,{scope:this});
		var inputDiv = divi.domBase.create(dflts,parent);
		this.doms[this.inputDiv] = inputDiv;
		return inputDiv.dom;
	}
});


divi.form.videofield  = divi.extend(divi.form.file, {
	validTypes:['video/mp4'],
	isFormField:true,
	init:function(cfg){
		$.extend(this,cfg);
		divi.form.videofield.superclass.init.call(this);
	}
});

divi.form.audiofield  = divi.extend(divi.form.file, {
	validTypes:['audio/mp3','audio/m4a'],
	isFormField:true,
	init:function(cfg){
		$.extend(this,cfg);
		divi.form.audiofield.superclass.init.call(this);
	}
});

divi.form.imagefield  = divi.extend(divi.form.file, {
	validTypes:['image/png','image/jpg','image/jpeg'],
	init:function(cfg){
		$.extend(this,cfg);
		divi.form.imagefield.superclass.init.call(this);
	}
});



divi.button  = divi.extend(divi.baseField, {
	defaults:{tag:"button",attachLis:true},
	events:['click','keypress'],
	defaultCss:'btnprop',
	css:'',
	baseCss:'info button',
	init:function(cfg){
		divi.button.superclass.init.call(this);
		$.extend(this, cfg);
	}

	,validateField:function(event,targetVal,target){
		//empty
	}
	
	,retrieveBtncss:function(){
		var css = this.baseCss;
		if(this.css){
			css += " "+this.css;
		}
		return css;
	}
	
	,draw:function(options){
		var result = this.html;
		var parDom,labeldiv,lblDfts,text,inputDiv,dflts;
		var attribs = [];
		
		var parentDiv = divi.domBase.create({tag:'div'});
		if(parentDiv && parentDiv.dom){
			this.dom = parDom = parentDiv.dom;
			parDom.setAttribute('class',this.defaultCss+this.checkHidden());
			
			dflts = $.extend({},this.defaults,{scope:this,tabIndex:this.tabIndex,value:this.value,'class':this.retrieveBtncss(),listeners:this.listeners});
			buttonDiv = divi.domBase.create(dflts,this.dom);
			this.doms[this.buttondom] = buttonDiv

			buttonDiv.dom.setAttribute('id',buttonDiv.id);
		}
	}
});
divi.form.radio  = divi.extend(divi.baseField, {
	trueValue : "Yes",
	falseValue : "No",
	type: "boolean",
	fieldType : "radio",
	isFormField:true,
	init:function(cfg){
		$.extend(this,cfg);
		divi.baseField.superclass.init.call(this);
	}
});

