//read the book into structure
//save the book into master.json
//handle all pop-ups ( chapters/topics/assessments)


$.widget( "custom.superDialog", $.ui.dialog, {
	_createButtons: function() {
		var that = this,
			buttons = this.options.buttons;

		// if we already have a button pane, remove it
		this.uiDialogButtonPane.remove();
		this.uiButtonSet.empty();

		if ( $.isEmptyObject( buttons ) || ($.isArray( buttons ) && !buttons.length) ) {
			this.uiDialog.removeClass("ui-dialog-buttons");
			return;
		}

		$.each( buttons, function( name, btnProps ) {
			var scope = btnProps.scope;
			var props = btnProps.fn;
			var click, buttonOptions;
			props = $.isFunction( props ) ?
				{ click: props, text: name } :
				props;
			// Default to a non-submitting button
			props = $.extend( { type: "button" }, props );
			// Change the context for the click callback to be the main element
			click = props.click;
			props.click = function() {
				click.apply(scope,[that.element[0],arguments[0]]);
			};
			buttonOptions = {
				icons: props.icons,
				text: props.showText
			};
			delete props.icons;
			delete props.showText;
			$( "<button></button>", props )
				.button( buttonOptions )
				.appendTo( that.uiButtonSet );
		});
		this.uiDialog.addClass("ui-dialog-buttons");
		this.uiDialogButtonPane.appendTo( this.uiDialog );
	}

	,close: function (e) {
	    var i, s = this;
	    if (this._isOpen && this._trigger("beforeClose", e) !== !1) {
	        if (this._isOpen = !1, this._destroyOverlay(), !this.opener.filter(":focusable").focus().length) try {
	            i = this.document[0].activeElement, i && "body" !== i.nodeName.toLowerCase() && t(i).blur()
	        } catch (n) {}
	        this._hide(this.uiDialog, this.options.hide, function () {
	        	var closeObj = s.options['close'];
	        	var scope = closeObj.scope;
	        	var fn = closeObj.fn;
	        	scope[fn].apply(scope,[this,e]);
	        })
	    }
	}
});

function formulaOnclick(inst, e, d) {
	inst.on("click", function(curr, e) {
		var target = curr.srcElement ? curr.srcElement : curr.target;
		if (target.localName == "img") {
			var targetJ = $(target);
			var text = targetJ.attr("text");
			if (text) {
				this.execCommand('mceFormulaUpload', null, target.outerHTML);
			}
		}
	});
}


(function() {
	var http = ('https:' == document.location.protocol ? 'https://' : 'http://');

	EQUATION_ENGINE = http + 'latex.codecogs.com';
	FAVORITE_ENGINE = http + 'latex.codecogs.com/json';
	EDITOR_SRC = http + 'latex.codecogs.com';
	EMBED_ENGINE = 'formulaEditor.html';
	EDIT_ENGINE = http + 'www.codecogs.com/eqnedit.php';
	EDITOR_SW_FLASH = http+ 'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0';
	EDITOR_SW_PLAYER = http + 'www.macromedia.com/go/getflashplayer';
})();

function S4() {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function guid() {
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4()+ S4() + S4());
}

divi.appBase = divi.extend(divi.base, {
    title: '',
    padMax:3,
    cmKey:'.contextmenu',
    //fileFields:['videofield','audiofield','imagefield'],
	popupKey:'.popup',
	htmlKey:'.dialog-html',
	comboMaster:{},
	getFileAction:'/getfiles',
	savefileAction:'/savefile/',
	data:{},
	values:{},
	
    constructor: function (cfg) {
    	$.extend(this, cfg);
    	this.data = {};
    	this.values = {};
    	divi.appBase.superclass.constructor.call(this);
        this.startup();
    }

	,startup:function(){
		this.initializeValues();
	}
	
	,initializeValues:function(){
		var table = divi.app[this.table];
		var eachCfg;
		if(table){
			var fieldConfig = table.getFieldConfig();
			for(var index in fieldConfig){
				if(fieldConfig.hasOwnProperty(index)){
					eachCfg = fieldConfig[index];
					this.values[eachCfg.name] = eachCfg.value || '';
				}
			}
		}
	}
	
	,licenseData:function(){
		var licenseData = [{description:"CC Attribution (CC BY)",id:"CC Attribution (CC BY)"},
		  	{description:"CC Attribution - Sharealike (CC BY-SA)",id:"CC Attribution - Sharealike (CC BY-SA)"},
		  	{description:"CC Attribution - Noderivs (CC BY-ND)",id:"CC Attribution - Noderivs (CC BY-ND)"},
		  	{description:"CC Attribution - NonCommercial (CC BY-NC)",id:"CC Attribution - NonCommercial (CC BY-NC)"},
		  	{description:"CC Attribution - NonCommercial Sharealike (CC BY-NC-SA)",id:"CC Attribution - NonCommercial Sharealike (CC BY-NC-SA)"},
		  	{description:"CC Attribution - NonCommercial NoDerivs (CC BY-NC-ND)",id:"CC Attribution - NonCommercial NoDerivs (CC BY-NC-ND)"},
		  	{description:"Public Domain",id:"Public Domain"},
		  	{description:"GNU Free License",id:"GNU Free License"}];
		this.setData({'license':licenseData});
	}
	
	,loadinitialCombos:function(){
		this.stringify();//need this initialize combos.(masterObj);
	}
	
	,loadCombos:function(book){
		if(book){
			this.setData({});
			this.setComboMaster({});
			this.licenseData();
			
		}
	}
	
	,getValues:function(){
		return this.values;
	}
	
	,getFieldValue:function(key){
		return this.values[key];
	}
	
	,setComboMasterData:function(newObj){
		if(this.comboKey){
			var data = this.getComboMaster();
			if(!data[this.comboKey]){
				data[this.comboKey] = {};
			} 
			data[this.comboKey][newObj.id] = this;
		}
	}
	
	,setData:function(values){
		divi.appBase.prototype.data = values;
	}
	
	,setComboMaster:function(values){
		divi.appBase.prototype.comboMaster = values;
	}
	
	,getData:function(){
		return divi.appBase.prototype.data;
	}
	
	,getComboMaster:function(){
		return divi.appBase.prototype.comboMaster;
	}
	
	,getComboMasterValue:function(comboKey,key){
		var value,combo;
		if(key){
			combo = divi.appBase.prototype.comboMaster[comboKey];
			if(combo){
				value = combo[key];
			}
		}
		return value;
	}
	
	,setComboData:function(newObj){
		if(this.comboKey){
			var data = this.getData();
			if(!data[this.comboKey]){
				data[this.comboKey] = [];
			} 
			var comboElem = {id:newObj.id,'description': newObj[this.descKey]};
			data[this.comboKey].push(comboElem);
		}
	}
	
	,pluralize:function(key){
		if(key){
			key = key+'s';
		}
		return key;
	}
	
	,removechars:function(key){
		if(key){
			key = key.replace('.','').replace('#','');
		}
		return key;
	}
	
	,retrievePopUpDiv:function(){
		return this.getSelector(this.popupKey);
	}
	
	,cancelDailog:function(b,e){
		var jB = $(b);
		var elem = (jB.hasClass('ui-dialog-content')) ? jB : jB.find("ui-dialog-content");
		if(elem){
			elem.superDialog("close");
		}
	}
	
	,closeCmMenu:function(){
		this.getSelector(this.cmKey).hide();
	}
	
	,blockcmMenu:function(cfg,event){
		event.preventDefault();
		event.stopPropagation();
	}
	
	,getSelector:function(key){
		var refKey = this.removechars(key);
		if(!this[refKey]){
			this[refKey] = $(key);
		}
		return this[refKey];
	}
	
	,launchEditor:function(instance,homeScope){
		if(instance){
			var sel = this.getSelector(this.htmlKey);
			var dlgConfig  = {autoOpen: false,modal: true,width: '50%', buttons: {"Insert": {fn:instance.insert,scope:this},Cancel: {fn:homeScope.cancelDailog,scope:homeScope}},close: function () {homeScope.cancelDailog();}};
			sel.empty().superDialog(dlgConfig).superDialog('open').removeClass('hidden');
		}
	}
	
	,persistData:function(){
		 var book = this.retrieveBook(this);
		 if(book){
			 window.URL = window.webkitURL || window.URL;
	         window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
	         var file = new Blob([JSON.stringify(this.stringify(), undefined, 2)]);
	         file.name = this.masterFile;
	         book.persist(this.savefileAction,file);
	         this.persistChild();
		 }else{
			 alert("Please Contact administrator. Could not save the changes");
		 }
	}

	,persistChild:function(){
		var scope = this.elements ? this : this.parent;
		if(scope && scope.fileName){
			var url = scope.savefileAction;
			var eachSet;
			var elemId,eachElem;
			var elements = scope.elements;
			elemId =  scope.getFieldValue('id');
			var files = [];
			var dom = jsxml.fromString('<?xml version="1.0" encoding="UTF-8"?><topic version="1" id="' + elemId+ '"/>');
			var masterObj = {};
			for(var index = 0; index  < elements.length;index++){
				eachElem = elements[index];
				if(eachElem){
					eachElem.getPersistValues(dom);
					var elemFiles = eachElem.formPanel ? eachElem.formPanel.files : [];
					files = files.concat(elemFiles);
				}
			}
			var chapterId = scope.prepareCompleteId();
			url += "/"+chapterId+"/"+elemId;
			var file = new Blob([jsxml.toXml(dom)]);
			file.name = scope.fileName;
			scope.persist(url,file);
			scope.persist(url,files,true);
		}
	}
	
	,getCount:function(){
		return divi[this.table].prototype.idCount;
	}
	
	,addToCount:function(){
		var cnt = this.getCount();
		if(cnt >= 0){
			this.setCount(cnt+1);
		}
	}
	
	,setCount:function(id){
		if(id){
			divi[this.table].prototype.idCount = id;
		}
	}
	
	,submitForm:function(b,e){
		var scope = this;
		var form = scope.formPanel;
		if(form){
			var isValidForm = form.validateForm();
	    	if(isValidForm){
	    		if(scope.isNew){
					var values = form.getValues({});
					this.setParent(scope,values);
					var key = scope.table;
					var lookupKey = this.pluralize(key);
					this.initilizeChild(scope.parent,lookupKey);
					this.addChild(scope.parent,lookupKey,scope);
				}
	    		if(form){
	    			scope.update(form);
	    		}
	    		divi.home.prototype.cancelDailog(b,e);
	    	}
		}
	}
	
	,setValues:function(updated){
		if(updated){
			$.extend(this.values,updated);
		}
	}
	
	
	,setParent:function(scope,values){
		var parent = this.getComboMasterValue(this.parent.comboKey,values[this.parent.comboKey]);
		if(!parent){ parent = this.parent;}
		scope.parent = parent;
	}
	
	,update:function(form){
		var values = form.getValues({});
		if(!$.isEmptyObject(values)){
			this.updated = true;
			this.setValues(values);
		}
		if(this.updated){
			this.persistData();
			this.draw();
			this.updated = false;
		}
	}
	
	,prepareCompleteId:function(){
		var rtnId;
		if(this.table == 'chapter'){
			rtnId = this.getValues()['id'];
		}else{
			rtnId = this.prepareCompleteId.call(this.parent);
		}
		return !rtnId? '' : rtnId;
	}
	
	,prepareId:function(){
		var prefix = this.idPrefix;
		var parentId = this.prepareCompleteId();
		if(parentId){
			parentId += "_";
		}
		var id = this.idPrefix+parentId+divi.util.pad(this.getCount(),this.padMax);
		return id;
	}
	
	,prepareSideBar:function(book){
		var parentCont = this.getSelector(this.previewSel);
		parentCont.empty();
		book.retrieveTree(parentCont);
		this.prepareDropDown(parentCont);
	}
	
	,prepareDropDown:function(parentCont){
		 var elem = parentCont.find("[data-role=slidedown]");
		 elem.each(function(idx, li) {
		    var b = $(li);
	        b.find("li.disabled a").on("click", function (a) {
	             a.preventDefault()
	        });
		});
	}
	
	,launchPopUp:function(instance){
		if(instance){
			instance.home.preparepopUp.call(instance.home);
			var popupDiv = this.retrievePopUpDiv();
			var mydialog = popupDiv.superDialog();
			var buttons = mydialog.superDialog("option", "buttons");
			var newButtons = {};
			$.extend(newButtons,{ 'Submit':{scope:instance,fn:instance.submitForm}},buttons);
			mydialog.superDialog("option", "buttons", newButtons);
			popupDiv.empty().superDialog('open');
			instance.showContent(popupDiv);
		}
	}
	
    
});

divi.elementbase = divi.extend(divi.appBase,{
	table:'',
	ignoreFields:['id','src'],
	referenceFields:['source','name','url','License'],
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.elementbase.superclass.constructor.call(this);
	}

	,initializeValues:function(){
		var table = divi.app[this.table];
		var eachCfg,condition;		
		if(table){
			var fieldConfig = table.getFieldConfig();
			for(var index in fieldConfig){
				if(fieldConfig.hasOwnProperty(index)){
					condition = (this.table == "references") ? this.referenceFields.contains(index) : !this.referenceFields.contains(index);
					if(condition){
						eachCfg = fieldConfig[index];
						/*if(this.fileFields.contains(eachCfg.type)){
							this.files[eachCfg.name];
						}*/
						this.values[eachCfg.name] = eachCfg.value || '';
					}
				}
			}
		}
		if(this.reference){
			this.reference.initializeValues();
		}
	}

	,persistData:function(){
		   this.persistChild();
	}
	
	,setValues:function(updated){
		var condition;
		if(updated){
			var values = {};
			for(var eachValue in updated){
				if(updated.hasOwnProperty(eachValue)){
					condition = (this.table == "references") ? this.referenceFields.contains(eachValue) : !this.referenceFields.contains(eachValue);
					if(condition){
						values[eachValue] = updated[eachValue];
					}
				}
			}
			$.extend(this.values,values);
		}
		if(this.reference){
			this.reference.setValues(updated);
		}
	}
	
	,draw:function(){
		
	}
	
	,prepareDomValues:function(dom,child,values,parent){
		var key,val;
		for(var eachValue in values){
			if(values.hasOwnProperty(eachValue) && !this.ignoreFields.contains(eachValue)){
				key = dom.createElement(eachValue);
				key.textContent = values[eachValue];
				child.appendChild(key);
			}
		}
	}
	
	,prepareParentDom:function(dom,childdom,values,parent){
		if(childdom){
			childdom.setAttribute('id', values['id']);
			childdom.setAttribute('src', values['src']);
			this.addAddValues(dom,childdom);
		}
	}
	
	,addAddValues:function(dom,childdom,values,paren){
		
	}
	
	,getPersistValues:function(dom,parent){
		var child = dom.createElement(this.table);
		var values = this.getValues();
		this.prepareParentDom(dom,child,values,parent);
		this.prepareDomValues(dom,child,values,parent);
		if(parent){
			parent.appendChild(child);
		}else if(this.reference){
			this.reference.getPersistValues(dom,child);
			dom.documentElement.appendChild(child);
		}
	}
	
	,setParent:function(scope,values){
	}

	,prepareId:function(){
		var id = this.idPrefix+divi.util.pad(this.getCount(),this.padMax);
		return id;
	}

	,showContent:function(appendTo,showToggle){
		if(!this.formPanel){
			this.formPanel = new divi.formPanel({data:this.table,scope:this,comboData:this.getData()});
		}
		if(!this.formPanel.toggle && showToggle){
			$.extend(this.formPanel,{toggle:true});
			this.formPanel.createToggle();
		}
		this.formPanel.draw(appendTo);
		this.formPanel.setValues(this.getValues());
		this.formPanel.setValue('id', this.prepareId());
	}
	
	,initilizeChild:function(input){
		input = input || this;
		if(!input.elements){
			input.elements = [];
		}
	}
	
	,addChild:function(input,key,child){
		if(input.elements){
			child.fileName = input.fileName;
			input.elements.push(child);
			child.addToCount();
		}
	}
});


divi.references = divi.extend(divi.elementbase,{
	table:'references',
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.references.superclass.constructor.call(this);
	}

	,prepareParentDom:function(dom,childdom,values,parent){
		if(childdom){
			this.addAddValues(dom,childdom);
		}
	}

});

divi.element = divi.extend(divi.elementbase,{
	table:'',
	reference:undefined,
	constructor: function (cfg) {
		$.extend(this,cfg);
		this.reference = new divi.references({});
		divi.element.superclass.constructor.call(this);
	}

	
});

divi.video = divi.extend(divi.element,{
	table:'video',
	idCount:1,
	idPrefix:'vid',
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.video.superclass.constructor.call(this);
	}
});


divi.audio = divi.extend(divi.element,{
	table:'audio',
	idCount:1,
	idPrefix:'aud',
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.video.superclass.constructor.call(this);
	}
});


divi.bookBase = divi.extend(divi.appBase,{
	home:undefined,
	idPrefix:undefined,
	idCount:undefined,
	masterFile:'master.json',
	events:['click','contextmenu'],
	treeKey:'tree',
	cmSelector:undefined,
	isNew:false,
	comboKey:undefined,
	cmDom:undefined,
	ddEffect:'slide',
	cmItems:{},
	cmItemDflts:{tag:'div','class':'item'},
	contextMenu:undefined,
	doms:{},
	updated:true,
	hasChildren:false,
	parent:undefined,
	callback:undefined,
	stdState:{'state':{'opened':false,'selected':false}},
	listeners:this.listeners,
	descKey:'name',
	isBook:false,
	selector:undefined,
	table:'',
	children:{},
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.bookBase.superclass.constructor.call(this);
		this.init();
	}
	
	,retrieveTree:function(parent){
		var book = this.retrieveBook();
		var output;
		if(book){
			book.prepareSideBar(parent);
		}
		return output;
	}
	
	,sidebarClick:function(d,val,jTarget){
		if(this.home){
			this.home.updateSelected(this);
		} 
		if(this.table == 'chapter'){
			d.preventDefault();
			d.stopPropagation();
			var a = this,b =jTarget.parent().children('ul.slidedown-menu');
            "block" != b.css("display") || b.hasClass("keep-open") ? ($(".slidedown-menu").each(function (d, e) {
                b.parents(".slidedown-menu").is(e) || ($(e).hasClass("keep-open") ||
                    "block" != $(e).css("display")) || a._close(e)
            }), a._open(b)) : a._close(b)
		}
	}
	
	,_open: function (a) {
        switch (this.ddEffect) {
        case "fade":
            a.fadeIn("fast");
            break;
        case "slide":
           a.slideDown("fast");
            break;
        default:
            a.hide()
        }
    },
    _close: function (a) {
    	var c = $(a);
        switch (this.ddEffect) {
        case "fade":
            c.fadeOut("fast");
            break;
        case "slide":
           c.slideUp("fast");
            break;
        default:
            c.hide()
        }
    }
	
	,toggleContextMenu:function(event,val,jTarget){
		event.preventDefault();
		event.stopPropagation();
		var text = jTarget.val();
		if(this.cmDom){
			this.getSelector(this.cmKey).hide().empty().append(this.cmDom.dom).css({top: event.pageY + "px", left: event.pageX + "px"}).show();
		}
		/*
		$(document).on("contextmenu", function(event) { 
			event.preventDefault();
			
		}).on("click", function(event) {$(".contextmenu").hide();});*/
		 /*
		*/
	}
	
	,onCmClick:function(event,val,jTarget){
		event.preventDefault();
		event.stopPropagation();
		var text = jTarget.html();
		this.getSelector(this.cmKey).hide();
		if(text && this.cmItems[text]){
			var cfg = this.cmItems[text];
			if(cfg && cfg.fn){
				cfg.fn.apply(this,[event,val,jTarget,cfg.key]);
			}
		}
	}
	
	,init:function(){
		this.listeners = {'click':[this.sidebarClick],'contextmenu':this.toggleContextMenu};
		this.children = {};
		this.updated = true;
		this.doms = {};
	}
	
	,showContent:function(appendTo,showToggle){
		if(!this.formPanel){
			this.formPanel = new divi.formPanel({data:this.table,scope:this,comboData:this.getData()});
		}
		if(!this.formPanel.toggle && showToggle){
			$.extend(this.formPanel,{toggle:true});
			this.formPanel.createToggle();
		}
		this.formPanel.draw(appendTo);
		this.formPanel.setValues(this.getValues());
	}
	
	
	
	,clearForm:function(){
		var form = this.formPanel;
		if(form){
			form.reset();
			this.update();
		}	
	}
	
	
	,draw:function(){
		if(this.isNew && $.isEmptyObject(this.doms)){
			this.drawNew();
		}else{
			this.drawUpdate();
		}
	}
	
	
	
	,drawNew:function(){
		var parDom = this.parent.doms[this.parent.divs['ulDiv']].dom;	
		var currKey = this.pluralize(this.table);
		var children = this.parent.children[currKey];
		if(children){
			var currSeq = children.length-1;//already children are updated
			this.prepareSideBar(parDom,currKey,currSeq);
			this.isNew = false;
		}
	}
	
	,drawUpdate:function(){
		
	}
	
	
	,load:function(data){
		this.read(data);
		this.loadinitialCombos(this);//need this initialize combos.
		this.draw();
	}
	
	,stringify:function(input){
		var masterObj =  {};
		var book = this.retrieveBook() 
		this.loadCombos(book);
		book.prepareData(masterObj);
		return masterObj;
	}

	,persist:function(url, file,isArray){
		var formData = new FormData();
		if(isArray){
			var eachFile;
			for(var ind = 0;ind < file.length;ind++){
				eachFile = file[ind];
				formData.append(eachFile.name, eachFile, eachFile.name);
			}
		}else{
			formData.append(file.name, file, file.name);
		}
	    var xhr = new XMLHttpRequest();

	    xhr.open('POST', url, true);
	    xhr.send(formData);
	}
	
	,destinationUrl:function(){
		
	}
	
	,retrieveBook:function(mbook){
		var tryBook = mbook || this;
		var book = tryBook.isBook ? tryBook : this.retrieveBook(tryBook.parent);
		return book;
	}
	
	
	
	
	,initilizeChild:function(input,key,skipChild){
		input = input || this;
		if(key){
			if(!skipChild && !input.children[key]){
				input.children[key] = [];
			}else if(!input[key]){
				input[key] = [];
			}
		}
	}
	
	,addChild:function(input,key,child){
		var input = input  || this;
		if(key && input.children[key]){
			input.children[key].push(child);
			child.addToCount();
		}
	}
	
	
	,fetchCat:function(key){
		return key ? key.substring(0, key.length - 1) : key;
	}
	
	,readEachChild:function(children,currKey){
		var eachChild;
		this.initilizeChild(this,currKey)
		var elemKey = this.fetchCat(currKey);
		if(divi[elemKey]){
			for(var i=0;children && children && i < children.length;i++){
				if(!this.hasChildren){
					this.hasChildren = true;
				}
				eachChild = new divi[elemKey]({parent:this,home:this.home});
				eachChild.read(children[i]);
				this.addChild(this, currKey, eachChild);
			}
		}
	}
	
	,attachChildren:function(input,callback,initialize,addParams,skipChildren){
		var currKey;
		for(var i=0;input && this.childrenKeys && i< this.childrenKeys.length;i++){
			currKey = this.childrenKeys[i];
			/*if(!input.children){
				input.children = {};
			}*/
			addParams = addParams || [];
			this.attachEachChild(callback,input,currKey,initialize,addParams,skipChildren);
		}
	}
	
	,attachEachChild:function(callback,input,currKey,initialize,addParams,skipChildren){
		var eachChild;
		if(initialize){
			this.initilizeChild(input,currKey,skipChildren)
		}
		var currChildren = this.children[currKey];
		for(var i=0;currChildren && i < currChildren.length;i++){
			eachChild = currChildren[i];
			var params = [input,currKey,i].concat(addParams).concat([skipChildren]);
			eachChild[callback].apply(eachChild,params);
		}
	}
	
	
	,prepareData:function(input,currKey,index,isArray,skipChildren){
		if(input){
			if(isArray){
				if(skipChildren){
					input = input[currKey];
				}else{
					input = input.children[currKey];
				}
			}
			var newObj = {};
			var values = this.getValues();
			$.extend(newObj,values);
			this.setComboMasterData(values);
			this.setComboData(values);
			this.attachChildren(newObj,'prepareData',true,[true],true);
			if(isArray){
				input.push(newObj);
			}else{
				$.extend(input,newObj);
			}
		}
	}
	
	,add:function(event,val,jTarget,key){
		if(key){
			var eachChild = new divi[key]({parent:this,isNew:true,home:this.home});
			/*var lookupKey = this.pluralize(key);
			this.initilizeChild(this,lookupKey);
			this.addChild(this,key,eachChild);*/
			this.launchPopUp.call(eachChild,eachChild);
			var currId = this.getFieldValue('id');
			if(this.comboKey){
				eachChild.formPanel.setValue(this.comboKey, currId);
			}
			eachChild.formPanel.setValue('id', eachChild.prepareId());
		}
	}
	

	,addElem:function(event,val,jTarget,key){
		var eachElem = new divi[key]({parent:this,isNew:true,home:this.home});
		this.launchPopUp.call(eachElem,eachElem);
	}
	
	,edit:function(event,val,jTarget){
		this.launchPopUp(this,this);
	}
	
	,deletefn:function(event,val,jTarget){
		this.beforeDelete(event,val,jTarget);
		this.persistData();
	}
	,beforeDelete:function(event,val,jTarget){
		
	}
	
	,read:function(input){
		var currKey,backup = {},currElem;
		for(var i=0;this.childrenKeys && i< this.childrenKeys.length;i++){
			currKey = this.childrenKeys[i];
			backup[currKey] = input[currKey];
			delete input[currKey];
		}
		this.setValues(input);
		for(var i=0;this.childrenKeys && i< this.childrenKeys.length;i++){
			currKey = this.childrenKeys[i];
			currElem = backup[currKey];
			this.readEachChild(currElem,currKey);
		}
	}
	
});

divi.book = divi.extend(divi.bookBase,{
	parent:undefined,
	prviwForm:'.btnAthr',
	isBook:true,
	prefix:'book',
	table:'book',
	childrenKeys:['chapters'],
	navDflts:{tag:'nav','class':'sidebar light'},
	ulDflts:{tag:'ul'},
	divs:{'navDiv':'navDiv','ulDiv':'ul'},
	constructor : function (cfg) {
		$.extend(this,cfg);
		divi.book.superclass.constructor.call(this);
	}
	
	,drawonScreen:function(values){
		var mainKey = "";
		for(var key in values){
			if(values.hasOwnProperty(key)){
				mainKey = "."+this.prefix+key;
				$(mainKey).html(values[key]);
			}
		}
	}

	,draw:function(){
		var values = this.getValues();
		this.drawonScreen(values);
		if(!divi.util.isEmptyObject(values)){
			$(this.prviwForm).removeClass('button').empty().off('click');
			this.showContent(this.prviwForm,true);
		}
		
	}
	
	,prepareSideBar:function(parent){
		var navDiv,ulDiv;
		navDiv = this.doms[this.divs['navDiv']] = divi.domBase.create(this.navDflts,parent);
		ulDiv = this.doms[this.divs['ulDiv']] = divi.domBase.create(this.ulDflts,navDiv.dom);
		this.attachChildren(ulDiv.dom,'prepareSideBar',false,false);
	}
});

divi.chapter = divi.extend(divi.bookBase,{
	parent:undefined,
	table:'chapter',
	idPrefix:'',
	idCount:1,
	sequence:undefined,
	comboKey:'chapter',
	divs:{'liDiv':'liDiv','aDiv':'oLinkDiv','ulDiv':'iUlDiv'},
	childrenKeys:['topics','assessments'],
	lidDefaults:{tag:"li",'class':"stick bg-yellow",prefix:'sidebar_'},
	aDefaults:{tag:"a",'class':"slidedown-toggle",href:"#",prefix:'sidebar_',attachLis:true},
	ulDefaults:{tag:"ul",'class':"slidedown-menu",'data-role':"slidedown",prefix:'sidebar_'},
	constructor : function (cfg) {
		$.extend(this,cfg);
		this.cmListeners = {'click':[this.onCmClick]};
		divi.chapter.superclass.constructor.call(this);
		var parent = $('.contextmenu');
		this.cmItems = {'Add Topic':{fn:this.add,key:'topic'},'Add Assessment':{fn:this.add,key:'assessment'},'Edit':{fn:this.edit},'Delete':{fn:this.deletefn}};
		this.createContextMenu(this.cmItems);
	}
	
	
	,beforeDelete:function(event,val,jTarget){
		var lookupKey = this.pluralize(this.table);
		var children = this.parent.children[lookupKey];
		if(children){
			var index = this.sequence;
			this.parent.children[lookupKey] = children.slice(index+1,children.length);
		}
		var doms = this.doms[this.divs['liDiv']];
		var currDom = $(doms.dom);
		currDom.remove();
		this.destroydoms();
		this.updateSequence(this.parent.children[lookupKey]);
	}
	
	,destroydoms:function(){
		var crr,crref,doms = this.divs;
		for(var ech in doms){
			if(doms.hasOwnProperty(ech)){
				crr = this.doms[doms[ech]];
				if(crr && crr.id){
					crref =  crr.id;
					divi.domBase.destroy(crref);
				}
			}
		}
	}

	,updateSequence:function(children){
		var currChild;
		for(var i=0;i< children.length;i++){
			currChild = children[i];
			$.extend(currChild,{sequence:i});
			currChild.draw();
		}
	}
	
	,drawUpdate:function(){
		var valueDom = this.doms[this.divs['aDiv']];
		if(valueDom && valueDom.dom){
			var values = this.getValues();
			$(valueDom.dom).html(this.prepareValue(values['name']));
		}
	}
	
	,prepareValue:function(val){
		var rtn = "";
		if(!divi.util.isEmptyId(this.sequence)){
			rtn += (this.sequence +1) +'.  ';
		}
		rtn += val;
		return rtn;
	}
	
	
	,createContextMenu:function(items){
		var childDom,parDom = divi.domBase.create({tag:'div',scope:this,prefix:'sidebar_'});
		if(items){
			for(var ech in items){
				if(items.hasOwnProperty(ech)){
					childDom = divi.domBase.create($.extend(this.cmItemDflts,{tag:'div',scope:this,prefix:'sidebar_',value:ech,events:['click'],attachLis:true,listeners:this.cmListeners}),parDom.dom);
					childDom.dom.setAttribute('id',childDom.id);
				}
			}
		}
		this.cmDom = parDom;
	}
	

	,prepareSideBar:function(parent,currKey,index){
		var livDiv,values,dflts,aDiv,ulDiv;
		livDiv = this.doms[this.divs['liDiv']] = divi.domBase.create($.extend(this.lidDefaults,{scope:this}),parent);
		values = this.getValues();
		this.sequence = index;
		dflts = $.extend(this.aDefaults,{value:this.prepareValue(values['name']),scope:this,listeners:this.listeners});
		aDiv = this.doms[this.divs['aDiv']] = divi.domBase.create(dflts,livDiv.dom);
		aDiv.dom.setAttribute('id',aDiv.id);
		ulDiv = this.doms[this.divs['ulDiv']] = divi.domBase.create($.extend(this.ulDefaults,{scope:this}),livDiv.dom);
		if(this.hasChildren){
			this.attachChildren(ulDiv.dom,'prepareSideBar',false,false);
		}
	}
});


divi.topic = divi.extend(divi.bookBase,{
	parent:undefined,
	fileName:'topic.xml',
	elements:[],
	table:'topic',
	idPrefix:'t',
	idCount:1,
	sequence:undefined,
	divs:{'liDiv':'liDiv','aDiv':'oLinkDiv','iconDiv':'iconDiv'},
	lidDefaults:{tag:"li",prefix:'sidebar_'},
	aDefaults:{tag:"a",href:"#",prefix:'sidebar_',attachLis:true},
	iconDefaults:{tag:'i','class':"icon-tree-view",prefix:'sidebar_'},
	comboKey:'topic',
	
	constructor : function (cfg) {
		$.extend(this,cfg);
		divi.topic.superclass.constructor.call(this);
	}
	
	,getValues:function(){
		var values = {};
		$.extend(values,this.values);
		delete values.chapter;
		return values;
	}
	
	
	,prepareSideBar:function(parent,currKey,index){
		var livDiv,values,dflts,aDiv,iconDiv;
		this.sequence = this.index;
		livDiv = this.doms[this.divs['liDiv']] = divi.domBase.create($.extend(this.lidDefaults,{scope:this}),parent);
		aDiv = this.doms[this.divs['aDiv']] = divi.domBase.create( $.extend(this.aDefaults,{scope:this,listeners:this.listeners}),livDiv.dom);
		aDiv.dom.setAttribute('id',aDiv.id);
		iconDiv = this.doms[this.divs['iconDiv']] = divi.domBase.create( $.extend(this.iconDefaults,{scope:this}),aDiv.dom);
		values = this.getValues();
		aDiv.dom.innerHTML += values['name'];
	}
});


divi.assessment = divi.extend(divi.bookBase,{
	parent:undefined,
	idPrefix:'a',
	idCount:0,
	table:'assessment',
	comboKey:'assessment',
	sequence:undefined,
	constructor : function (cfg) {
		$.extend(this,cfg);
		divi.assessment.superclass.constructor.call(this);
	}

	,getValues:function(){
		var values = {};
		$.extend(values,this.values);
		delete values.chapter;
		return values;
	}

	,prepareSideBar:function(parent,currKey,index){
		this.sequence = this.index;
	}
});


divi.contentEditor = divi.extend(divi.appBase,{
	parent:undefined,
	callback:undefined,
	isBook:false,
	selector:undefined,
	constructor : function (cfg) {
		divi.contentEditor.superclass.constructor.call(this);
	}
});

divi.home =  divi.extend(divi.appBase,{
	parent:undefined,
	selected:undefined,
	book:undefined,
	callback:undefined,
	selector:'textarea.html_input',
	previewSel:'.treepreview',
	constructor : function (cfg) {
		divi.home.superclass.constructor.call(this);
	}

	,retrieveChapter:function(melem){
		var tryChap = melem || this;
		var chap = (tryChap.table === 'chapter') ? tryChap : this.retrieveChapter(tryChap.parent);
		return chap;
	}
	
	,updateSelected:function(selected){
		this.selected = selected;
		this.enableTopBtns(selected);
		this.enableTopEditBtns(selected);
	}
	
	,enableTopEditBtns:function(selected){
		if(selected && selected.table == 'topic'){
			this.attachListeners(this.editBtnListeners(selected));
		}else{
			this.unbindListeners(this.editBtnListeners(selected));
		}
	}
	
	,unbindListeners:function(listeners){
		if (listeners != null) {
			var scope = this;
			$.each(listeners, function(k, v) {
				v.scope = v.scope || scope;
				var callback = v.scope[v.listenerFn];
				$(v.tag).unbind(v.listType).addClass('disabled');
			});
		}
	}
	
	,btnListeners:function(scope){
		 return [{tag:'.addtopic',listType:'click',parent:divi.book,listenerFn:'addcontent',key:'topic',mapTo:scope},
	        {tag:'.addassessment',listType:'click',parent:divi.book,listenerFn:'addcontent',key:'assessment',mapTo:scope}];
	}
	
	,editBtnListeners:function(scope){
		 return [{tag:'.addvideo',listType:'click',parent:divi.book,listenerFn:'addelement',key:'video',mapTo:scope},
		         {tag:'.addimage',listType:'click',parent:divi.book,listenerFn:'addelement',key:'image',mapTo:scope},
		         {tag:'.addaudio',listType:'click',parent:divi.book,listenerFn:'addelement',key:'audio',mapTo:scope}];
	}
	
	,enableTopBtns:function(selected){
		var chapter;
		if(selected){
			chapter = this.retrieveChapter(selected);
			if(chapter){
				this.attachListeners(this.btnListeners(chapter));
			}
		}
	}
	
	,startup:function(){
		this.book = new divi.book({home:this});
		this.loadBook();
		this.initiliazeEditor();
		this.attachListeners(this.defaultListeners());
	}
	
	,preparepopUp:function(lstnCfg){
		var popupDiv = this.retrievePopUpDiv();
		var dlgConfig  = {autoOpen: false,modal: true,top:'2%',width: '50%', buttons: {Cancel:{scope:this,fn:this.cancelDailog}},close:{scope:this,fn:'cancelDailog'}};
		popupDiv.empty().superDialog(dlgConfig);
	}
	
	
	,readBook:function(data){
		var master_json = {};
		if(data){
			master_json = JSON.parse(data);
		}
		this.book.load(master_json);
		this.prepareSideBar(home.book);
	}
	
	,bookreadFail:function(r){
		if(r.status == "404"){
			this.book.persistData();
			this.prepareSideBar(this.book);
		}else{
			alert("Unable to read the book. Please contact administrator");
		}
	}
	
	,loadBook:function(){
		var scope = this;
		$.ajax({url: divi.core.prepareUrl(this.getFileAction,this.book.masterFile),}).done(function (data) {scope.readBook(data);}).fail(function (data) {scope.bookreadFail(data);});
	}
	
	,defaultListeners:function(){
		return [{tag:'.btnAthr',listType:'click',mapTo:this.book,listenerFn:'prepareFormUp'},
		        {tag:'.btnBkOverview',listType:'click',mapTo:this.book,listenerFn:'showEditor'},
		        {tag:'.addchapter',listType:'click',parent:divi.book,listenerFn:'addcontent',mapTo:this.book,key:'chapter'},
		        {tag:'body',listType:'click',listenerFn:'closeCmMenu'}];
		        //{tag:this.previewSel,listType:'contextmenu',scope:this,listenerFn:'blockcmMenu'}];
	}
	
	,addcontent:function(cfg){
		var scope = cfg.mapTo;
		if(scope){
			scope.add(scope,null,null,cfg.key);
		}
	}
	
	,addelement:function(cfg){
		var scope = cfg.mapTo;
		if(scope){
			scope.addElem(scope,null,null,cfg.key);
		}
	}
	
	
	,prepareFormUp:function(lstnCfg){
		this.launchPopUp(lstnCfg.mapTo);
	}
	
	,showEditor:function(lstnCfg){
		if(lstnCfg && lstnCfg.mapTo){
			this.launchEditor(lstnCfg.mapTo,lstnCfg.scope);
		}
	}
	
	,initiliazeEditor:function(){
		if (this.selector) {
			tinymce.init({
					selector : this.selector,
					paste_as_text : true,
					paste_text_sticky : true,
					paste_text_sticky_default : true,
					plugins : 'imageupload paste formulaupload',
					valid_elements : '*[*]',
					toolbar1 : 'undo redo | styleselect | bold italic underline superscript subscript | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link imageupload | link formulaupload',
					height : 300,
					init_instance_callback : "formulaOnclick"
				});
			tinymce.ScriptLoader.load('assets/js/jquery.iframe-post-form.js');
		}
	}
	
	,attachListeners:function(listeners){
		if (listeners != null) {
			var scope = this;
			$.each(listeners, function(k, v) {
				v.scope = v.scope || scope;
				var callback = v.scope[v.listenerFn];
				$(v.tag).unbind(v.listType).bind(v.listType,$.proxy(function (d,e,f,g) {
					if(callback){
						callback.apply(this,[v,d])};
					}
				,v.scope)).removeClass('disabled');
			});
		}
	}

	,insertContent:function(){
		
	}
});
var home = new divi.home({});