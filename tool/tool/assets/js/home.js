//read the book into structure
//save the book into master.json
//handle all pop-ups ( chapters/topics/assessments)

$(document).ready(function() {
  $.ajaxSetup({ cache: false });
});

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

	,_createOverlay: function () {
		var t = $;
	    if (this.options.modal) {
	        var e = this,
	            i = this.widgetFullName;
	        t.ui.dialog.overlayInstances || this._delay(function () {
	            t.ui.dialog.overlayInstances && this.document.bind("focusin.dialog", function (s) {
	            	if(t(".ui-dialog:visible:last .ui-dialog-content").data(i)){
	            		 e._allowInteraction(s) || (s.preventDefault(), t(".ui-dialog:visible:last .ui-dialog-content").data(i)._focusTabbable())
	            	}
	            })
	        }), this.overlay = t("<div>").addClass("ui-widget-overlay ui-front").appendTo(this._appendTo()), this._on(this.overlay, {
	            mousedown: "_keepFocus"
	        }), t.ui.dialog.overlayInstances++
	    }
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
	EDITOR_SW_FLASH = http
			+ 'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0';
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
    contentPreview:'.contentPreview',
    contents:{},
    defaultImgExtension:'.png',
    cmKey:'.contextmenu',
	popupKey:'.popup',
	htmlKey:'.dialog-html',
	equations:'./equations',
	comboMaster:{},
	getFileAction:'/getfiles',
	toolbarCls:'.toolbarCls',
	getFileActionWoPrefix:'getfiles',
	savefileAction:'/savefile/',
	saveformulaAction:'/saveformula/',
	imageLocExact:"./htmlimages/",
	equationLocExact:"./equations/",
	imageLoc:"/htmlimages/",
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
	
	,initiliazeEditor:function(){
		var fonts = ['Serif', 'Sans', 'Arial', 'Arial Black', 'Courier', 
		             'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande', 'Lucida Sans', 'Tahoma', 'Times',
		             'Times New Roman', 'Verdana'],
         fontTarget = $('[title=Font]').siblings('.dropdown-menu');
       $.each(fonts, function (idx, fontName) {
           fontTarget.append($('<li><a data-edit="fontName ' + fontName +'" style="font-family:\''+ fontName +'\'">'+fontName + '</a></li>'));
       });
        //$('a[title]').tooltip({container:'body'});
     	$('.dropdown-menu input').click(function() {return false;})
 		    .change(function () {$(this).parent('.dropdown-menu').siblings('.dropdown-toggle').dropdown('toggle');})
         .keydown('esc', function () {this.value='';$(this).change();});
     	
	}
	
	,S4:function() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}

	,guid:function() {
		return (this.S4() + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4()+ this.S4() + this.S4());
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
		this.setData({'license':licenseData},true);
	}
     
	,boxInfoData:function(){
		var boxInfoData = [{description:"None",id:"none"},
		  	{description:"Box Info",id:"box_info"},
		  	{description:"Box Alert",id:"box_alert"},
		  	{description:"Other",id:"other"}];
		this.setData({'boxInfo':boxInfoData},true);
	}
	
	,loadinitialCombos:function(){
		this.stringify();// need this initialize combos.(masterObj);
	}
	
	,readFileIntoDataUrl :function (fileInfo) {
		var loader = $.Deferred(),fReader = new FileReader();
		fReader.onload = function (e) {
			loader.resolve(e);
		};
		fReader.onerror = loader.reject;
		fReader.onprogress = loader.notify;
		fReader.readAsDataURL(fileInfo);
		return loader.promise();
	}
	
	,loadCombos:function(book){
		if(book){
			this.setData({});
			this.setComboMaster({});
			this.licenseData();
			this.boxInfoData();
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
	
	,setData:function(values,apend){
		if(apend){
			$.extend(divi.appBase.prototype.data,values);
		}else{
			divi.appBase.prototype.data = values;	
		}
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
	
	,prepareRetrievePath:function (location,val, files,cbScope) {
	    var dataQuery = $("<div/>").append($(val));
	    var matchedElem;
	    for (var i = 0; i < files.length; i++) {
	        currData = files[i];
	        matchedElem = dataQuery.find('img[name="' + currData.name + '"]');
	        if (!divi.util.isjQEmpty(matchedElem)) {
	            $(matchedElem).attr('src', location + currData.name);
	        }
	    }
	    return dataQuery.clone().html();
	}
	
	,prepareEquationPath:function (location,val, files,cbScope) {
	    var dataQuery = $("<div/>").append($(val));
	    var matchedElem;
	    for (var i = 0; i < files.length; i++) {
	        currData = files[i];
	        matchedElem = dataQuery.find(currData.src);
	        if (!divi.util.isjQEmpty(matchedElem)) {
	            $(matchedElem).attr('src', location + currData.name);
	        }
	    }
	    return dataQuery.clone().html();
	}
	
	,prepareResourcePath:function (val,fromLoc,toLoc) {
		if(val && fromLoc && toLoc){
			val = val.replace(new RegExp(fromLoc, 'g'), toLoc);
		}
		return val;
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
		if(!this.contents[refKey]){
			this.contents[refKey] = $(key);
		}
		return this.contents[refKey];
	}
	
	,getFirstEditor:function(editor){
		var first;
		if(editor){
			var sortedKeys = Object.keys(editor.getEditors()).sort();
			first = editor.getEditors()[sortedKeys[0]];
		}
		return first;
	}
	
	,launchEditor:function(instance,homeScope){
		if(instance){
			var sel = this.getSelector(this.htmlKey);
			var dlgConfig  = {position: "top",autoOpen: false,modal: true,top:'1%',width: '80%', buttons: {"Insert": {fn:instance.editorCBack,scope:instance},Cancel: {fn:instance.closeDailog,scope:instance}},close:{fn:'closeDailog',scope:instance}};
			sel.superDialog(dlgConfig).superDialog('open').removeClass('hidden');
			var value = instance.getFieldValue(instance.bookoverviewkey);
			instance.createEditor.call(instance,sel,value);
		}
	}
	
	,createEditor:function(sel,value){
		if(sel && !this.editor){
			sel.find(this.toolbarCls).remove();
			sel.find('div.editableDiv').remove();
			sel.append(divi.tpl.richtoolbar);
			this.initiliazeEditor();
			var editorDom = divi.domBase.create({tag:'div','class':'editableDiv'});
			sel.append(editorDom.dom);
			var params = {};
			params['editors'] = {};
			$(editorDom.dom).attr('ref',editorDom.id);
			params['editors'][editorDom.id] = {'editor':editorDom.dom,value:value};
			$.extend(params,{toolbardomCls:'.toolbarCls',sel:sel});
			this.editor = new divi.contentEditor(params);
		}
	}
	
	
	,closeDailog:function(b,e){
		var scope = this;
		if($.isFunction(scope.cancelDailog)){
			delete scope.editor;
			scope.cancelDailog(b,e);
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
	
	,editorCBack:function(uidialog,b){
		var scope = this;
		var editor = scope.editor;
		var value = "";
		if(editor){
			var first = this.getFirstEditor(editor);
			if(first){
				value = first.getValue();
			}
		}
	}

	,persistChild:function(){
		var scope = this.elements ? this : this.parent;
		if(scope && scope.fileName){
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
			
			var url = this.prepareFilePath(this,url);
			var file = new Blob([jsxml.toXml(dom)]);
			file.name = scope.fileName;
			scope.persist(url,file);
			scope.persist(url,files,true);
		}
	}
	
	,isTopic:function(elem){
		return (elem && elem.table == "topic");
	}
	
	,prepareFilePath:function(scope,url,action){
		url = url || "";
		url = action || scope.savefileAction;
		var topic = scope.isTopic(scope) ? scope : scope.parent;
		var elemId =  topic.getFieldValue('id');
		var chapterId = topic.prepareCompleteId();
		url += "/"+chapterId+"/"+elemId;
		return url;
	}
	
	,prepareBookPath:function(scope,url,action,addAction){
		url = url || "";
		url = action || scope.savefileAction;
		if(addAction){
			url += addAction;
		}
		return url;
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
		var values = form ? form.getValues({}) : this.getValues();
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
			popupDiv.empty().removeClass('hidden').superDialog('open');
			instance.showContent(popupDiv);
		}
	}
	
    
});

divi.elementbase = divi.extend(divi.appBase,{
	table:'',
	elemTable:'eachHeader',
	ignoreFields:['id','src','thumb','references'],
	referenceFields:['source','name','url','license'],
	tpl:undefined,
	elemTpl:undefined,
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.elementbase.superclass.constructor.call(this);
		this.initialTpl();
		this.initElemTpl();
	}

	,initElemTpl:function(){
		var table = this.elemTable;
		this.elemTpl = currTpl = divi.tpl[table];
		if(currTpl){
			$.template(table,currTpl);
		}
	}

	,initialTpl:function(){
		var table = this.table;
		this.tpl = currTpl = divi.tpl[table];
		if(currTpl){
			$.template(this.table,currTpl);
		}
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
						this.values[eachCfg.name] = eachCfg.value || '';
					}
				}
			}
		}
		if(this.reference){
			this.reference.initializeValues();
		}
	}
	
	,draw:function(){
		var parent = this.parent;
		if(this.isTopic(parent)){
			parent.loadFile();
		}
	}
	
	,drawElement:function(selector){
		var currSel = selector;
		if(selector && this.tpl){
			var values = this.getValues();
			if(this.reference){
				this.previewElement(values,selector);
				currSel =  elemDom = $('<div class="contentElem place-right"></div>');
				selector.append(elemDom);
				this.reference.drawElement(currSel);
			}
			var results = $.tmpl(this.table,values);
			currSel.append(results);
		}
	}
	
	,loadElement:function(currNode,appendSel){
		var values = {};
		var children = currNode.children;
		var attributes = currNode.attributes;
		var refNode;
		if(children){
			for(var index = 0;index < children.length;index++){
				var key = children[index];
				if(key.tagName == "references"){
					refNode = key;
				}else{
					values[key.tagName] = key.textContent;
				}
			}
			for(var index = 0;index < attributes.length;index++){
				var key = attributes[index];
				values[key.nodeName] = key.nodeValue;
			}
			this.setValues(values);
			if(this.reference){
				this.reference.loadElement(refNode,appendSel);
				var elemDom = $.tmpl(this.elemTable,{});
				appendSel.append(elemDom);
				this.drawElement(elemDom);
			}
		}
	}
	
	,previewElement:function(values,appendSel){
		var tag = document.createElement(this.tag || this.table);
		var url = this.prepareFilePath(this.parent,null,this.getFileAction);
		if(values['src']){
			tag.setAttribute('src',url+'/'+values['src']);
			tag.setAttribute('controls','');
		}
		appendSel.append($('<div class="mainElem place-left elemPreview"></div>').append(tag));
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
		this.addSplValues(dom, child, values, parent);
	}
	
	,addSplValues:function(dom,child,values,parent){
		
	}
	
	,prepareParentDom:function(dom,childdom,values,parent){
		if(childdom){
			childdom.setAttribute('id', values['id']);
			childdom.setAttribute('src', values['src']);
			childdom.setAttribute('thumb', values['thumb']);
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

	,attachpreContent:function(appendTo,showToggle){
		
	}
	
	,showContent:function(appendTo,showToggle){
		this.attachpreContent(appendTo, showToggle);
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
	tpl:undefined,
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.element.superclass.constructor.call(this);
		this.reference = new divi.references({parent:this});
	
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

divi.html = divi.extend(divi.element,{
	ignoreFields:['data','references'],
	table:'html',
	dataField:'data',
	idCount:1,
	editor:undefined,
	idPrefix:'html',
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.html.superclass.constructor.call(this);
	}

	,getSaveHtmlLoc:function(){
		var url = this.prepareFilePath(this.parent,"",this.savefileAction);
		return url+"/"+this.imageLoc;
	}
	
	,getEquationsLoc:function(){
		var url = this.prepareFilePath(this.parent,"",this.getFileAction);
		return url+"/"+this.equationLocExact;
	}
	
	,getSaveEquationsHtmlLoc:function(){
		return this.prepareFilePath(this.parent,"",this.saveformulaAction);
	}
	
	,getHtmlLoc:function(){
		var url = this.prepareFilePath(this.parent,"",this.getFileAction);
		return url+"/"+this.imageLoc;
	}

	,previewElement:function(values,appendSel){
		var val = values['data'];
		if(val){
			var tag = document.createElement('div');
			val = this.prepareResourcePath(val,this.imageLocExact,this.getHtmlLoc());
			val = this.prepareResourcePath(val,this.equationLocExact,this.getEquationsLoc());
			$(tag).html(val);
		}
		appendSel.append($('<div class="mainElem place-left elemPreview"></div>').append(tag));
	}

	,attachpreContent:function(appendTo,showToggle){
		this.createEditor(appendTo,"");
	}
	
	,addSplValues:function(dom,child,values,parent){
		var dataF = values[this.dataField];
		var data;
		if(dataF){
			data = dom.createElement('data');
            cdata = dom.createCDATASection(unescape(dataF));
            data.appendChild(cdata);
            child.appendChild(data);
		}
	}
	
	,persistChild:function(){
		var editor = this.editor;
		if(editor){
			var first = this.getFirstEditor(editor);
			if(first){
				first.getValue(this,this.htmlcallBack);
			}
		}else{
			this.htmlcallBack();
		}
	}
	
	,htmlcallBack:function(val){
		var scope = this;
		var values = this.getValues();
		values[this.dataField] = val;
		this.setValues(values);
		divi.appBase.prototype.persistChild.call(scope);
	}
	
	,prepareParentDom:function(dom,childdom,values,parent){
		if(childdom){
		}
	}
});


divi.audio = divi.extend(divi.element,{
	table:'audio',
	idCount:1,
	idPrefix:'aud',
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.audio.superclass.constructor.call(this);
	}
});


divi.image = divi.extend(divi.element,{
	tag:'img',
	table:'image',
	idCount:1,
	idPrefix:'img',
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.image.superclass.constructor.call(this);
	}


	,previewElement:function(values,appendSel){
		var tag = document.createElement(this.tag || this.table);
		var url = this.prepareFilePath(this.parent,null,this.getFileAction);
		if(values['src']){
			tag.setAttribute('src',url+'/'+values['src']);
		}
		appendSel.append($('<div class="mainElem place-left elemPreview"></div>').append(tag));
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
			var currSeq = children.length-1;// already children are updated
			this.prepareSideBar(parDom,currKey,currSeq);
			this.isNew = false;
		}
	}
	
	,drawUpdate:function(){
		
	}
	
	
	,load:function(data){
		this.read(data);
		this.loadinitialCombos(this);// need this initialize combos.
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
			/*
			 * if(!input.children){ input.children = {}; }
			 */
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
	
	,loadFile:function(){
		var scope = this;
		var url = this.prepareFilePath(this,null,this.getFileAction);
		$.ajax({dataType: "xml",url:divi.core.prepareUrl(url,this.fileName)}).done(function (data) {scope.readFile(data);}).fail(function (data) {scope.readFileFail(data);});
	}
	
	,readFile:function(data){
		var topicChild = data.firstChild;
		if(topicChild){
			var selected = this;
			var parentCont = this.getSelector(this.contentPreview);
			parentCont.empty();
			selected.elements = [];// resetting the elems
			var eachChild,eachElem,children = topicChild.children;
			for(var index = 0; index  < children.length;index++){
				eachChild = children[index];
				if(eachChild){
					var key = eachChild.tagName;
					var eachElem = new divi[key]({parent:selected,home:selected.home});
					if(eachElem){
						eachElem.loadElement(eachChild,parentCont);
						eachElem.addChild(selected,'',eachElem);
					}
				}
			}
		}
	}
	
	,readFileFail:function(data){
		
	}
	
});

divi.book = divi.extend(divi.bookBase,{
	parent:undefined,
	prviwForm:'.btnAthr',
	isBook:true,
	bookoverview:'.bookoverview',
	bookoverviewkey:'overview',
	bookheader:'.bookheader',
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
	
	,getSaveHtmlLoc:function(){
		return this.prepareBookPath(this,null,null,this.imageLoc);
	}
	
	,getSaveEquationsHtmlLoc:function(){
		return "";
	}
	
	,getEquationsLoc:function(){
		return "";
	}
	
	,getHtmlLoc:function(){
		return this.prepareBookPath(this,null,this.getFileAction,this.imageLoc);
	}
	,drawonScreen:function(values){
		var mainKey = "",jMainKey,parse,val;
		for(var key in values){
			if(values.hasOwnProperty(key)){
				mainKey = "."+this.prefix+key;
				jMainKey = $(mainKey);
				parse = (key !== this.bookoverviewkey || !divi.util.isEmpty(values[key])) ? true : false;
				if(parse){
					val = values[key];
					if(key == this.bookoverviewkey){
						$(this.bookheader).removeClass('hidden').attr('contenteditable', false);
						val = this.prepareResourcePath(val,this.imageLocExact,this.getHtmlLoc());
						val = this.prepareResourcePath(val,this.equationLocExact,this.getEquationsLoc());
						values[this.bookoverviewkey] = val;
					}
					jMainKey.html(val);
				}
			}
		}
	}

	,editorCBack:function(uidialog,b){
		var scope = this;
		var editor = scope.editor;
		var value = "";
		if(editor){
			var first = this.getFirstEditor(editor);
			if(first){
				first.getValue(this,this.htmlCallBack);
			}
		}
		scope.home.cancelDailog(uidialog);
	}
	
	,htmlCallBack:function(saveVal){
		var values = this.getValues();
		values[this.bookoverviewkey] = saveVal;
		this.setValues(values);
		this.update();
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
	_editors:{},
	editors:{},
	activeKey:undefined,
	toolbar:undefined,
	activeEditor:undefined,
	events:'click',
	value:'',
	filesList:{},
	sel:undefined,
	listeners:{},
	formuleImages:undefined,
	toolbarBtnSelector:undefined,
	hotKeys: {
		'ctrl+b': 'bold',
		'ctrl+i': 'italic',
		'ctrl+u': 'underline',
		'ctrl+z': 'undo',
		'ctrl+y': 'redo',
		'ctrl+l': 'justifyleft',
		'ctrl+r': 'justifyright',
		'ctrl+e': 'justifycenter',
		'ctrl+j': 'justifyfull',
		'shift+tab': 'outdent',
		'tab': 'indent'
	},
	formula:'formula',
	toolbarSelector: '[data-role=editor-toolbar]',
	dailogKey:'.dialog-html',
	commandRole: 'edit',
	activeToolbarClass: 'btn-info',
	selectionMarker: 'edit-focus-marker',
	selectionColor: 'darkgrey',
	options:undefined,
	toolbardomCls:undefined,
	constructor : function (cfg) {
		$.extend(this,cfg);
		divi.contentEditor.superclass.constructor.call(this);
		this.formuleImages = 'img[src*="' + EQUATION_ENGINE + '"],img[src*="' + this.equations + '"]';
		this.initialize();
	}
	
	,getEditors:function(){
		return this._editors;
	}
	
	,getEditorsForKey:function(ref){
		var editors = this.getEditors();
		var currEditor;
		if(editors && ref){
			currEditor = editors[ref];
		}
		return currEditor;
	}
	
	,setActiveToolbar:function(event,target,jTarget){
		var scope = event.data.scope;
		var currEditor = jTarget.hasClass('editableDiv') ? jTarget : jTarget.closest('div.editableDiv');
		scope.activateToolBar(scope,currEditor.attr('ref'));
		
	}
	
	,activateToolBar:function(scope,refKey){
		if(!scope.activeKey || scope.activeKey != refKey){
			scope.removeActiveToolbar.call(scope);
			scope.activeKey = refKey;
			scope.activeEditor = scope.getEditorsForKey(refKey);
		}
	}
	
	,execCommand:function (commandWithArgs, valueArg) {
		var commandArr = commandWithArgs.split(' '),command = commandArr.shift(),args = commandArr.join(' ') + (valueArg || '');
		document.execCommand(command, 0, args);
		var par = this.parent ? this.parent : this;
		par.updateToolbar();
	}
	
	,updateToolbar:function () {
		if (this.activeToolbarClass) {
			var scope = this;
			$(this.toolbarSelector).find(scope.toolbarBtnSelector).each(function () {
				var command = $(this).data(scope.commandRole);
				if (document.queryCommandState(command)) {
					$(this).addClass(scope.activeToolbarClass);
				} else {
					$(this).removeClass(scope.activeToolbarClass);
				}
			});
		}
	}
	
	,removeActiveToolbar:function(){
		if(this.activeEditor){
			this.activeEditor.destroy();
		}
	}
	
	,contentStdListener:function(event,b,f,g){
		var target = divi.util.getTarget(event);
		var type = divi.util.getEvtType(event);
		var data = event.data;
		if(data){
			var scope = data.scope;
			var jTarget = $(target);
			if(scope.listeners[type]){
				var evtListeners = scope.listeners[type];
				if(evtListeners){
					for(var key in evtListeners){
						 if(evtListeners.hasOwnProperty(key)){
							 eachListener =  evtListeners[key];
							 if(eachListener){
								 scope = scope || this;
								 eachListener.apply(scope,[event,target,jTarget]);
							 }
						 }
					 } 
				}else{
					event.preventDefault();
					event.stopPropagation();
				}
			}
		}
	 }
	
	,attachListeners:function(elements){
		var avlListeners = this.events;
		if(avlListeners && elements){
			 for(var eachEditor in elements){
				 if(elements.hasOwnProperty(eachEditor)){
					 $(elements[eachEditor]).on(avlListeners,null,{scope:this},this.contentStdListener);
				 }
			 }
		}
	}
	
	,startup:function(){
		this.toolbarBtnSelector = 'a[data-' + this.commandRole + '],button[data-' + this.commandRole + '],input[type=button][data-' + this.commandRole + ']';
		this.listeners['click'] = [this.setActiveToolbar];
	}
	
	
	,setEditors:function(editors){
		this._editors = editors;
	}
	
	,initiateEditors:function(){
		var editors = [],eachEdit,mainEditors = {};
		for(var ind in this.editors){
			if(this.editors.hasOwnProperty(ind)){
				eachEdit = this.editors[ind];
				if(eachEdit){
					editors.push(eachEdit.editor);
					mainEditors[ind] = new divi.indEditor({editor:$(eachEdit.editor),parent:this,value:eachEdit.value});
				}
			}
		}
		this.setEditors(mainEditors);
		return editors;
	}
	
	,initialize:function(){
		this.attachListeners(this.initiateEditors());
		this.bindToolbar();
		//this.setDefaultEditor();
	}
	
	,setDefaultEditor:function(){
		var editors = this.editors;
		var sortedKeys = Object.keys(editors).sort();
		if(sortedKeys && sortedKeys.length == 1){
			var first = editors[sortedKeys[0]];
			this.activateToolBar(this, $(first).attr('ref'));
		}
	}
	
	,getEditorDtls:function(scope,event){
		var scope = event.data.scope;
		return scope.parent ? scope : scope.activeEditor;
	}
	
	,onToolBarclick:function(event){
		var scope = event.data.scope;
		var target = divi.util.getTarget(event);
		var jTarget = $(target);
		var editText = jTarget.parent().attr('data-edit');
		if(!editText){
			editText = jTarget.attr('data-edit');
		}
		var editor = scope.getEditorDtls(scope,event);
		if(editor){
			editor.restoreSelection();
			if(editText == scope.formula){
				scope.launchFormula(scope,editor);
			}else if(editText){
				scope.launchCommand($(event.currentTarget).data(scope.commandRole),editor);
			}else{
				
				var checkforImg = jTarget.find(scope.formuleImages);
				if(divi.util.isjQEmpty(checkforImg)){
					checkforImg = jTarget.parent().find(scope.formuleImages);
				}
				if(!divi.util.isjQEmpty(checkforImg)){
					scope.launchFormula(scope,editor,target);
				}
			}
		}
	}
	
	,launchFormula:function(mainEditor,editor,editTarget){
		var range = editor.getCurrentRange();
		if(editor || range){
			$(mainEditor.sel).closest(".ui-dialog").css('display','none');
			editor.formula = new divi.formula({mainEditor:mainEditor,parent:editor,value:editTarget,currSel:range});
		}
	}
	
	,launchCommand:function(data,activeEditor){
		if(activeEditor){
			var scope = activeEditor.parent;
			activeEditor.restoreSelection();
			activeEditor.activate();
			if(data){
				scope.execCommand(data);
			}else{
				this.updateToolbar();
			}	
			activeEditor.saveSelection();
		}
	}
	
	,onRestoreSel:function(event,target,scope){
		var scope = event.data.scope;
		var editor = scope.getEditorDtls(scope,event);
		if(editor){
			editor.restoreSelection();
		}
	}
	
	,insertImage:function(fileInfo,event){
		var file = fileInfo;
		var scope = this;
		var editor = scope.getEditorDtls(scope,event);
		$.when(scope.readFileIntoDataUrl(fileInfo)).done(function (e) {
			editor.addFile(file);
			var tpl = '<img src="%s" name= "%y"/>';
			tpl = tpl.replace('%s', e.target.result);
			tpl = tpl.replace('%y', file.name);
			scope.execCommand.call(scope,'insertHTML', tpl);
		}).fail(function (e) {
			scope.fileUploadError("file-reader", e);
		});
	}
	
	,insertFiles:function (mainEditor,files,event) {
		var scope = mainEditor;
		var editor = scope.getEditorDtls(scope,event);
		$.each(files, function (idx, fileInfo) {
			if (/^image\//.test(fileInfo.type)) {
				scope.insertImage(fileInfo,event);
			} else {
				scope.fileUploadError("unsupported-file-type", fileInfo.type);
			}
		});
	}
	
	,onFileChange:function(event,target,scope){
		var scope = event.data.scope;
		var editor = scope.getEditorDtls(scope,event);
		if(editor){
			editor.onRestoreSel(event,target,scope);
			if (this.type === 'file' && this.files && this.files.length > 0) {
				scope.insertFiles(scope,this.files,event);
			}
			if(scope){
				editor.saveSelection();
				this.value = '';
			}
		}
	}
	
	,attachEquationsListeners:function(){
		$(this.dailogKey).find(this.formuleImages).on('click',null,{scope:this},this.onToolBarclick);
	}
	
	,bindToolbar:function () {
		var toolbar = $(this.toolbarSelector);
		toolbar.find(this.toolbarBtnSelector).on('click',null,{scope:this},this.onToolBarclick);
		toolbar.find('[data-toggle=dropdown]').on('click',null,{scope:this},this.onRestoreSel);
		toolbar.find('input[type=file][data-' + this.commandRole + ']').on('change',null,{scope:this},this.onFileChange);
		this.attachEquationsListeners();
	}
});


divi.indEditor = divi.extend(divi.contentEditor,{
	editor:undefined,
	selectedRange:undefined,
	parent:undefined,
	value:'',
	listeners:{},
	files:{},
	imgFiles:{},
	ref:undefined,
	events:'mouseup keyup keydown mouseout',
	constructor : function (cfg) {
		$.extend(this,cfg);
		divi.indEditor.superclass.constructor.call(this);
		this.ref = this.editor.attr('ref');
	}

	,initialize:function(){//overriding the base initialize
		
	}
	
	,addImgFile:function(file){
		if(file){
			this.imgFiles[file.name] = file;	
		}
	}
	
	,addFile:function(file){
		if(file){
			this.files[file.name] = file;	
		}
	}

	,getValue:function(rtnScope,callback){
		var val = "";
		if(this.editor){
			this.saveinlineImages(rtnScope,this.editor.html(),callback);
		}
	}
	
	,saveinlineImages:function(rtnScope,value,callback){
		var scope = this;
		var files = scope.files;
		var cbScope = rtnScope;
        var filesList = [],currFile;
        var deferredArr = [];
        var method = rtnScope.persist;
        if(!method){
        	method = rtnScope.parent.persist;
        }
        var url = rtnScope.getSaveHtmlLoc();
        if (files && url) {
        	for (var key in files) {
	            if (files.hasOwnProperty(key)) {
	                filesList.push(files[key]);
	            }
	        }
        	deferredArr.push(method.call(scope, url, filesList,true));
        }
        
        var imageFiles = this.fetchFormulas(value);
        var imageUrl = rtnScope.getSaveEquationsHtmlLoc();
        if(imageFiles && imageFiles.length > 0 && imageUrl){
        	 deferredArr.push(method.call(scope, imageUrl, imageFiles,true));
        }
        if(deferredArr.length > 0){
        	$.when.apply(this,deferredArr).then(function(){
            	scope.saveInlineSucess.call(scope,value, filesList,imageFiles,callback,cbScope);
        	});
        }else{
        	scope.saveInlineSucess.call(scope,value, filesList,imageFiles,callback,cbScope);
        }
	}
	
	,fetchFormulas:function(val){
		var files = [];
		if (val) {
	        var elements = $(val).find('img[src^="' + EQUATION_ENGINE + '"]');
	        if (elements && elements.length > 0) {
	            var currData;
	            for (var i = 0; i < elements.length; i++) {
	                currData = elements[i];
	                id = this.guid();
	                files.push({name: id + this.defaultImgExtension,src: currData.src,text: currData.text});
	            }
	        }
	    }
		return files;
	}
	
	,saveInlineSucess:function (val, files,imageFiles,callback,cbScope) {
		var saveVal = val;
		if(files && files.length > 0){
			saveVal = this.prepareRetrievePath(cbScope.imageLocExact, val, files, cbScope);
			this.files = {};
		}
		if(imageFiles && imageFiles.length > 0){
			saveVal = this.prepareEquationPath(cbScope.equationLocExact, val, files, cbScope);
			this.files = {};
		}
		saveVal = this.prepareResourcePath(saveVal,cbScope.getHtmlLoc(),cbScope.imageLocExact);
		saveVal = this.prepareResourcePath(saveVal,cbScope.getEquationsLoc(),cbScope.equationLocExact);
		if(callback){
	    	callback.apply(cbScope,[saveVal]);
	    }
		
	}
	
	,restoreSelection:function () {
		var scope = this;
		var selection = window.getSelection();
		if(scope.editor){
			var selectedRange = scope.getCurrentRange();
			if (selectedRange) {
				try {
					selection.removeAllRanges();
				} catch (ex) {
					document.body.createTextRange().select();
					document.selection.empty();
				}
	
				selection.addRange(selectedRange);
			}
		}
	}
	
	
	,activate:function(){
		if(this.editor){
			this.editor.attr('contenteditable', true);
			this.editor.focus();
		}
	}
	
	,destroy:function(){
		if(this.editor){
			this.editor.attr('contenteditable', false);
		}
	}

	,startup:function(){
		if(this.value){
			this.editor.empty().append(this.value);
		}
		var parent = this.parent;
		this.listeners['keydown'] = [this.triggerCommand];
		this.listeners['keyup'] = [this.triggerCommand,this.editorListener];
		this.listeners['mouseup'] = [this.editorListener];
		this.listeners['mouseout'] = [this.editorListener];
		this.attachListeners([this.editor]);
		this.activate();
	}

	,getCurrentRange:function () {
		var sel = window.getSelection();
		if (sel.getRangeAt && sel.rangeCount) {
			return sel.getRangeAt(0);
		}
	}
	
	,triggerCommand:function(event,target,jTarget){
		var scope = this;
		var activeEditor = scope.activeEditor;
		var keytype = event.keyCode;
		var hotKey = "";
		if(event.ctrlKey || event.shiftKey || event.tabKey){
			if(event.ctrlKey){
				hotKey = "ctrl+";
			}else if(event.shiftKey){
				hotKey = "shift+";
			}if(event.tabKey){
				hotKey = "tab+";
			}
			var char = String.fromCharCode(event.which);
			if(!divi.util.isEmpty(char)){
				hotKey += char.toLowerCase();
			}
		}
		
		if(this.hotKeys[hotKey]){
			var parent = scope.parent;
			event.preventDefault();
			event.stopPropagation();
			if(parent){
				parent.launchCommand.call(parent,scope.hotKeys[hotKey],scope);
			}
		}
	}
	
	,editorListener:function(event,target,jTarget){
		this.saveSelection();
		this.parent.updateToolbar();
	}
	
	,removeListeners:function(){
		if(this.editor){
			this.editor.off(this.events,null);
		}
	}
	
	,destroyFormula:function(){
		this.formula.destroy();
		delete this.formula;
	}
	
	,updateFormula:function(html,range,oldDom){
		if(html){
			this.destroyFormula();
			var node;
			if(oldDom){
				$(oldDom).replaceWith(html);
			}else if(range) {
	            range.deleteContents();
	            if (range.createContextualFragment) {
	                node = range.createContextualFragment(html);
	            } else {
	                var div = document.createElement("div"), child;
	                div.innerHTML = html;
	                node = document.createDocumentFragment();
	                while ( (child = div.firstChild) ) {
	                    node.appendChild(child);
	                }
	            }
	            range.insertNode(node);
		    }else if (document.selection && document.selection.type != "Control") {
		        range = document.selection.createRange();
		        range.pasteHTML(html);
		    }
		}
		this.attachEquationsListeners();
		$(this.parent.sel).closest(".ui-dialog").css('display','block');
	}
	
	,saveSelection:function () {
		this.selectedRange = this.getCurrentRange();
	}
	
});


divi.formula = divi.extend(divi.contentEditor,{
	mainEditor:undefined,
	parent:undefined,
	events:'click',
	listeners:{},
	ref:undefined,
	formulaText:undefined,
	formulaImg:undefined,
	currSel:undefined,
	value:undefined,
	elems:['.insertWin','.cancelWin'],
	tpl:undefined,
	toolbar:'#toolbar',
	value:undefined,
	table:'formula',
	dlgDflts:{ shadow: true,overlay: true,title: '<h3>Formula Upload</h3>',width: '100%',height:'100%',padding: 10,content: '',draggable: true,sysButtons: {btnClose: true}}

	,constructor : function (cfg) {
		$.extend(this,cfg);
		divi.formula.superclass.constructor.call(this);
	}
	
	,setValue:function(val){
		if(val){
			var jVal = $(val);
			this.formulaText = jVal.attr('text');
			$('#formulaText').val(unescape(this.formulaText));
			this.formulaImg = jVal.attr('src');
			$('#prFormula').attr('src',this.formulaImg);
		}
	}

	,initialize:function(){//overriding the base initialize
		this.tpl = divi.tpl[this.table];
		this.show();
	}
	
	,activate:function(){
		$(this.toolbar).focus().removeAttr('readOnly');
	}
	
	,show:function(){
		var scope = this;
		var dflts = scope.dlgDflts;
		$.extend(dflts,{onShow:function(){scope.onShow();}});
		$.Dialog(dflts);
	}

	,onShow:function(){
		var formula = this.tpl;
		$.Dialog.content(formula);
		$(this.toolbar).html(divi.tpl.formToolBar);
		EqEditor.init('',undefined,undefined,'toolbar');
 		EqEditor.add(new EqTextArea('prFormula', 'formulaText'),false);
 		this.handleListeners();
		this.setValue(this.value);
	}
	
	,handleListeners:function(){
		this.listeners['click'] = [this.buttonClick];
		this.attachListeners(this.elems);
	}
	
	,destroy:function(){
		this.removeListeners();
		$('.window-overlay').remove();
	}
	
	,buttonClick:function(event){
		var scope = this;
		var target = divi.util.getTarget(event);
		var text = target.innerHTML;
		if(text == "Insert"){
			this.submitClick();
		}else{
			this.closeClick();
		}
	}
	
	,closeClick:function(){
		$.Dialog.close();
	}
	
	,submitClick:function(){
		var textVal = $('#formulaText').val();
		var val = $('#prFormula').attr('src');
		var content,toProcess = false;
		if (textVal) {
			textVal  = escape(textVal);
			if(this.formulaText){
				var oldVal = this.formulaImg;
				if(oldVal != val){
					toProcess = true;
				}
			}else{
				toProcess = true;
			}
		}
		if(toProcess){
			var content = '<img src="%s"  text="%y""/>';
			content = content.replace('%s', val);
			content = content.replace('%y', textVal);
		}
		this.closeClick();
		this.parent.updateFormula(content,this.currSel,this.value);
	}

	,startup:function(){
		if(this.value){
			//this.editor.empty().append(this.value);
		}
		this.activate();
	}
	

	,removeListeners:function(){
		var elems = this.elems,elem;
		if(this.elems){
			for(var i=0;i < elems.length;i++){
				if(elems.hasOwnProperty(i)){
					elem = elems[i];
					$(elem).off(this.events,null);
				}
			}
		}
	}
});


divi.home =  divi.extend(divi.appBase,{
	parent:undefined,
	selected:undefined,
	book:undefined,
	editors:1,
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
		this.previewContent(selected);
	}
	
	,enableTopEditBtns:function(selected){
		if(selected && selected.table == 'topic'){
			this.attachListeners(this.editBtnListeners(selected));
		}else{
			this.unbindListeners(this.editBtnListeners(selected));
		}
	}
	
	,previewContent:function(selected){
		if(selected && this.isTopic(selected)){
			selected.loadFile();
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
		         {tag:'.addaudio',listType:'click',parent:divi.book,listenerFn:'addelement',key:'audio',mapTo:scope},
		         {tag:'.addhtml',listType:'click',parent:divi.book,listenerFn:'addelement',key:'html',mapTo:scope}];
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
		this.attachListeners(this.defaultListeners());
	}
	
	
	
	,preparepopUp:function(lstnCfg){
		var popupDiv = this.retrievePopUpDiv();
		var dlgConfig  = {position: "top",autoOpen: false,modal: true,width: '60%', buttons: {Cancel:{scope:this,fn:this.cancelDailog}},close:{scope:this,fn:'cancelDailog'}};
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
		$.ajax({url: divi.core.prepareUrl(this.getFileAction,this.book.masterFile)}).done(function (data) {scope.readBook(data);}).fail(function (data) {scope.bookreadFail(data);});
	}
	
	,defaultListeners:function(){
		return [{tag:'.btnAthr',listType:'click',mapTo:this.book,listenerFn:'prepareFormUp'},
		        {tag:'.btnBkOverview',listType:'click',mapTo:this.book,listenerFn:'showEditor'},
		        {tag:'.bookEdit',listType:'click',mapTo:this.book,listenerFn:'showEditor'},
		        {tag:'.addchapter',listType:'click',parent:divi.book,listenerFn:'addcontent',mapTo:this.book,key:'chapter'},
		        {tag:'body',listType:'click',listenerFn:'closeCmMenu'}];
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