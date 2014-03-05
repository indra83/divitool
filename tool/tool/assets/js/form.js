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
				$("."+dataElement).append(prepareCombo);
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
    	for(var key in form.elementsMap){
    		if(form.elementsMap.hasOwnProperty(key)){
    			eachField = form.elementsMap[key];
    			if(eachField){
    					value = eachField.getValue();
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
    		if(type == "image" || type == "file"){
    			this.isFileUpload = true;
    			this.fileFields.push(elem);
    			$.extend(eachField,{hidden:true});
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
    	this.afterFormRender();
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
    	scope.comboFiledData = [];
    	$.each(elements, function(key, element) {
    		var keysplt = key.split('_');
			var fieldName = (keysplt.length > 1) ? keysplt[1] : keysplt[0];
			var prefix = (keysplt.length > 1) ? keysplt[0] : "";
    		if(element && element.type == "combofield") {
    			var handler=element.listener ? element.listener : element.name;
    			$.prepareCombo({defaultText : 'Select a Value',tag : element.name+'DD', name : element.name,listener:handler, minWidth:"176"});
    		}
    		else if(element && element.type=="datefield"){
				  $("."+element.name+'_date').customDatePicker({format:"yyyy-mm-dd"});
		  }
    	});
    	scope.loadComboData(scope.comboFiledData);
	}
    ,draw:function(appendToTag){
    	this.appendToElement = appendToTag;
    	this.appendFormTo(appendToTag);
    }
    ,filterComboData: function(comboVal,o){
    	var filterListener = o.filterListener;
    	var key = o.filterKey ? o.filterKey+"id" : "id";
    	var filterredData = this.filterData({key:key,value:comboVal},this.comboFiledData[filterListener].data);
    	$("."+filterListener).loadComboData({data:filterredData});
    }
    ,filterData: function(op,data){
		var filtrdData = [];
		$.each(data, function(i,rec){
			if(rec.hasOwnProperty(op.key) && op.value==rec[op.key]){
				filtrdData.push(rec);
			}
		});
		return filtrdData;
	}
    ,prepareComboParams:function(name,handler){
    	var params={params : $.toJSON({key : name}),controllerName : name,resultName : handler};
    	return params;
    }
	,loadComboData:function(params){
		if(params && params.length>0){
			divi.core.ajax.call(this, {data : {'data' : $.toJSON(params)},url : "Controllers/combo",succCall : this.onComboLoadSuccess});
		}
	},
	onComboLoadSuccess:function(data){
		var scope = this;
		scope.comboFiledData = {};
		if(data){
			$.each(data, function(k,v){
				$("."+k).loadComboData({data:v.data});
				scope.comboFiledData[k] = v;
			});
		}
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
		divi.baseField.superclass.init.call(this);
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
	
	,validateField:function(event,targetVal,target){
		var target = divi.util.getTarget(event);
		targetVal = target.checked;
		targetVal = this.values[targetVal];
		divi.baseField.prototype.validateField(event,targetVal,target);
	}
});
 
divi.form.numberfield  = divi.extend(divi.form.textfield, {
	defaults:{tag:"input",type: 'text',attachLis:true},
	applyFormat:true,
	defaultValue:'',
	init:function(cfg){
		$.extend(this,cfg);
		if(this.name && (this.name.indexOf('_id') != -1 || this.name.indexOf('_ID') != -1)){
			this.defaultValue = -1;
		}
		divi.form.emailfield.superclass.init.call(this);
	}
	
	,isEmpty:function(val){
		isEmpty = divi.baseField.prototype.isEmpty.call(this,val);
		if(!isEmpty && val == "-1"){
			isEmpty = true;
		}
		return isEmpty;
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
		this.baseCss = this.name+'DD';
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
			input.dom.setAttribute('class',this.name+'DD combofield');
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
		if(this.isRequired && !divi.util.isEmpty(target)){
			if(divi.util.isEmpty(target.value)){
				this.isValid = false;
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

divi.form.image  = divi.extend(divi.baseField, {
	tag:'img',
	fieldType:'file',
	baseCss:'pic',
	isFormField:true,
	init:function(cfg){
		$.extend(this,cfg);
		divi.form.image.superclass.init.call(this);
	}
	,configureFieldElement:function(options){
		var inputTxt = {};
		this.tag = "input";
		options.attribs.push({name:"style", value:"position:relative; width:60%; height:85%;"});
		options.attribs.push({name:"id", value:"uploadimage"});
		options.attribs.push({name:"name", value:"sampleImage"});
		options.attribs.push({name:"accept", value:"image/jpeg"});
		inputTxt.inputCfg = [{tag:this.tag, attribs:options.attribs}];
		inputTxt.buttonCfg = this._createBtnCfg("btn-file", options.btnID);
		options.cls = "file";
		options.role = "input-control";
		inputTxt.divAttribs = this._createDivCtrlAttrib(options);
		return inputTxt;
	}
});

divi.form.file  = divi.extend(divi.baseField, {
	tag:'img',
	fieldType:'file',
	baseCss:'pic',
	isFormField:true,
	init:function(cfg){
		$.extend(this,cfg);
		divi.form.file.superclass.init.call(this);
	}
	,configureFieldElement:function(options){
		var inputTxt = {};
		this.tag = "input";
		options.attribs.push({name:"style", value:"position:relative; width:60%; height:85%;"});
		options.attribs.push({name:"id", value:"uploadimage"});
		options.attribs.push({name:"name", value:"sampleImage"});
		options.attribs.push({name:"accept", value:"image/jpeg"});
		inputTxt.inputCfg = [{tag:this.tag, attribs:options.attribs}];
		inputTxt.buttonCfg = this._createBtnCfg("btn-file", options.btnID);
		options.cls = "file";
		options.role = "input-control";
		inputTxt.divAttribs = this._createDivCtrlAttrib(options);
		return inputTxt;
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

