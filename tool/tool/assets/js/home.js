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

divi.listeners = function(){
	
};

$.extend(divi.listeners,{
	attachElementListeners:function(elements,scope,baseListener,key,events){
		baseListener = baseListener || this.contentStdListener;
		var avlListeners = events || scope.events;
		if(avlListeners && elements){
			 for(var eachEditor in elements){
				 if(elements.hasOwnProperty(eachEditor)){
					 $(elements[eachEditor]).on(avlListeners,null,{scope:scope,key:key},baseListener);
				 }
			 }
		}
	}

	,contentStdListener:function(event,b,f,g){
		var target = divi.util.getTarget(event);
		var type = divi.util.getEvtType(event);
		var data = event.data;
		if(data){
			var scope = data.scope;
			var key = data.key;
			var jTarget = $(target);
			if(scope.listeners[key] && scope.listeners[key][type]){
				var keyListeners =  scope.listeners[key];
				if(keyListeners){
					var evtListeners = scope.listeners[key][type];
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
	 }

	,attachListenersWS:function(listeners,scope){
		if (listeners != null) {
			$.each(listeners, function(k, v) {
				v.scope = v.scope || scope;
				var callback = v.scope[v.listenerFn];
				$(v.tag).unbind(v.listType).bind(v.listType,$.proxy(function (d,e,f,g) {if(callback){callback.apply(scope,[v,d])};},v.scope)).removeClass('disabled');
			});
		}
	}
	,unbindListeners:function(listeners,scope){
		if (listeners != null) {
			$.each(listeners, function(k, v) {
				v.scope = v.scope || scope;
				var callback = v.scope[v.listenerFn];
				$(v.tag).unbind(v.listType).addClass('disabled');
			});
		}
	}
	
	
	,removeListeners:function(elems,events){
		var elem;
		if(elems){
			for(var i=0;i < elems.length;i++){
				if(elems.hasOwnProperty(i)){
					elem = elems[i];
					$(elem).off(events,null);
				}
			}
		}
	}
});

divi.appBase = divi.extend(divi.base, {
    title: '',
    padMax:3,
    editKey:'editElem',
    editableDiv:'editableDiv',
    contentPreview:'.contentPreview',
    contents:{},
    elems:['.deleteWin','.cancelWin'],
    defaultImgExtension:'.png',
    cmKey:'.contextmenu',
    dlEvents:'click',
	popupKey:'.popup',
	htmlKey:'.dialog-html',
	equations:'./equations',
	comboMaster:{},
	listenerKey:'editor',
	tabsKey:'tabs',
	htmlValKey:undefined,
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
	dlgDflts:{shadow: true,overlay: false,icon: '',width: '100%',height:'100%',padding: 10,sysButtons: {btnClose: true}},
	
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
     	$('.dropdown-menu input').click(function() {return false;})
 		    .change(function () {$(this).parent('.dropdown-menu').siblings('.dropdown-toggle').dropdown('toggle');})
         .keydown('esc', function () {this.value='';$(this).change();});
     	
	}
	

	,retrieveElem:function(melem,key){
		var tryChap = melem || this;
		var chap = (tryChap.table === key) ? tryChap : this.retrieveElem(tryChap.parent,key);
		return chap;
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
     
	,assessTypeData:function(){
		var typeData = [{description:"Test",id:"test"},
		  	{description:"Assignment",id:"assignment"},
		  	{description:"Quiz",id:"quiz"}];
		this.setData({'type':typeData},true);
	}
	
	,difficultData:function(){
		var diffData = [{description:"Easy",id:"easy"},
		  	{description:"Medium",id:"medium"},
		  	{description:"Difficult",id:"difficult"}];
		this.setData({'difficulty':diffData},true);
	}
	
	,boxInfoData:function(){
		var boxInfoData = [{description:"None",id:"none"},
		  	{description:"Box Info",id:"box_info"},
		  	{description:"Box Alert",id:"box_alert"},
		  	{description:"Other",id:"other"}];
		this.setData({'boxType':boxInfoData},true);
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
			this.difficultData();
			this.assessTypeData();
		}
	}
	
	,cleanValues:function(values,key){
		var key = this.htmlValKey;
		if(key){
			value = values[key];
			value = this.prepareResourcePath(value,this.getHtmlLoc(),this.imageLocExact);
			value = this.prepareResourcePath(value,this.getEquationsLoc(),this.equationLocExact);
			values[this.htmlValKey] = value;
		}
		return values;
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
	

	,attachChildren:function(input,toClean,callback,initialize,addParams,skipChildren){
		var currKey;
		for(var i=0;input && this.childrenKeys && i< this.childrenKeys.length;i++){
			currKey = this.childrenKeys[i];
			addParams = addParams || [];
			this.attachEachChild(callback,toClean,input,currKey,initialize,addParams,skipChildren);
		}
	}
	
	,attachEachChild:function(callback,toClean,input,currKey,initialize,addParams,skipChildren){
		var eachChild;
		if(initialize){
			this.initilizeChild(input,currKey,skipChildren)
		}
		var currChildren = this.children[currKey];
		for(var i=0;currChildren && i < currChildren.length;i++){
			eachChild = currChildren[i];
			var params = [input,toClean,currKey,i].concat(addParams).concat([skipChildren]);
			eachChild[callback].apply(eachChild,params);
		}
	}
	
	,prepareData:function(input,toClean,currKey,index,isArray,skipChildren){
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
			if(toClean){
				values = this.cleanValues(values);
			}
			$.extend(newObj,values);
			this.setComboMasterData(values);
			this.setComboData(values);
			this.attachChildren(newObj,toClean,'prepareData',true,[true],true);
			if(isArray){
				input.push(newObj);
			}else{
				$.extend(input,newObj);
			}
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
	    var dataQuery = $("<div/>").append(val);
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
	
	,getEditorByIndex:function(editor,index){
		var first;
		if(editor){
			index = index || 0;
			var sortedKeys = Object.keys(editor.getEditors()).sort();
			first = editor.getEditors()[sortedKeys[index]];
		}
		return first;
	}
	
	,launchEditor:function(instance,homeScope){
		if(instance){
			var sel = this.getSelector(this.htmlKey);
			var dlgConfig  = {position: "top",autoOpen: false,modal: true,top:'1%',width: '80%', buttons: {"Insert": {fn:instance.editorCBack,scope:instance},Cancel: {fn:instance.closeDailog,scope:instance}},close:{fn:'closeDailog',scope:instance}};
			sel.superDialog(dlgConfig).superDialog('open').removeClass('hidden');
			var value = instance.getFieldValue(instance.htmlValKey);
			var editrs = {};
			this.prepareEditableDom(null,editrs,value);
			instance.createEditor.call(instance,{editors:editrs,sel:sel,attachtbar:true});
		}
	}
	
	,createEditor:function(ops){
		ops = ops || {};
		sel = ops.sel;
		editors = ops.editors;
		attachtbar = ops.attachtbar;
		if(sel){
			attachtbar = (attachtbar == undefined)? true : attachtbar;
			if(attachtbar){
				sel.find(this.toolbarCls).remove();
				sel.find("div."+this.editableDiv).remove();
				sel.append(divi.tpl.richtoolbar);
				this.initiliazeEditor();
			}
			this.attachEditorContent(sel,editors);
			var params = this.prepareEditorParams(editors);
			if(!this.editor){
				this.editor = new divi.contentEditor(params);
			}else{
				$.extend(this.editor,params);
				this.editor.initialize();
			}
		}
	}

	,closeDailog:function(b,e){
		var scope = this;
		if($.isFunction(scope.cancelDailog)){
			delete scope.editor;
			scope.cancelDailog(b,e);
		}
	}
	
	,persistData:function(elem,url,fileName,fileops){
		fileops = fileops || {};
		var attachCb = true;
		if(fileops.hasOwnProperty('attachCb')){ attachCb = fileops['attachCb'];}
		 var book = elem || this.retrieveBook(this);
		 if(book){
			 window.URL = window.webkitURL || window.URL;
	         window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
	         var file = new Blob([JSON.stringify(book.stringify(true), undefined, 2)]);
	         file.name = fileName || this.masterFile;
	         url = url || this.savefileAction;
	         var prs = {url:url,data:[file]};
	         var attach = this.childExists();
	         if(!attach && attachCb){
	        	 $.extend(prs,{succcb:this.drawOnSuccess,context:this});
	         }
	         book.persist(prs);
	         if(attach){
	        	 this.persistChild(attachCb);
	         }
		 }else{
			 alert("Please Contact administrator. Could not save the changes");
		 }
	}
	
	,editorCBack:function(uidialog,b){
		var scope = this;
		var editor = scope.editor;
		var value = "";
		if(editor){
			var first = this.getEditorByIndex(editor);
			if(first){
				value = first.getValue();
			}
		}
	}
	
	,childExists:function(){
		var scope = this.elements ? this : this.parent;
		return scope && scope.fileName;
	}

	,persistChild:function(attachCb){
		var isAssessment = this.isAssessment ? true :false;
		var eachSet;
		var elemId,eachElem;
		var scope = this.elements ? this : this.parent;
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
				if(elemFiles && elemFiles.length > 0){
					files = files.concat(elemFiles);
				}
			}
		}
		
		var url = this.prepareFilePath(this,url);
		var file = new Blob([jsxml.toXml(dom)]);
		file.name = scope.fileName;
		scope.persist({url:url,data:[file]});
		var ops = {url:url,data:files};
		if(attachCb){
			$.extend(ops,{succcb:this.drawOnSuccess});
		}
		scope.persist(ops);
	}
	
	,isTopic:function(elem){
		return (elem && elem.table == "topic");
	}
	
	,prepareFilePath:function(scope,url,action){
		url = url || "";
		url = action || scope.savefileAction;
		url = this.prepareInternalPath(scope, url, action);
		return url;
	}
	

	,prepareInternalPath:function(scope,url,action){
		var topic = (scope.isTopic(scope) || scope.isAssessment) ? scope : scope.parent;
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
	
	,validateForm:function(form){
		var isValidForm = false;
		if(form){
			isValidForm = form.validateForm();
		}
		return isValidForm;
	}
	
	,prepareSubmitValues:function(scope,form){
		scope = scope || this;
		var values = form.getValues({});
		if(scope.reference){
			$.extend(values,scope.reference.formPanel.getValues({}));
		}
		return values;
	}
	
	,submit:function(scope,form,event){
		var values = this.prepareSubmitValues(scope,form);
		this.setParent(scope,values);
		if(scope.isNew){
			var key = scope.table;
			var lookupKey = this.pluralize(key);
			this.initilizeChild(scope.parent,lookupKey);
			this.addChild(scope.parent,lookupKey,scope);
		}
		if(form){
			scope.update(form,values);
		}
		divi.home.prototype.cancelDailog(event);
	}
	
	,submitForm:function(b,e){
		var scope = this;
		var isValidForm = true;
		var form = scope.formPanel ? scope.formPanel : this;
		if(form){
			var isValidForm = scope.validateForm(form);
	    	if(isValidForm){
	    		this.submit(scope,form,b);
	    	}
		}
	}
	
	,setValues:function(updated){
		if(updated){
			var updated = this.modifyValues(updated);
			$.extend(this.values,updated);
		}
	}
	
	,setValueForKey:function(key,value){
		if(key){
			this.values[key] = value;
		}
	}
	
	,setParent:function(scope,values){
		var parent = this.getComboMasterValue(this.parent.comboKey,values[this.parent.comboKey]);
		if(!parent){ parent = this.parent;}
		scope.parent = parent;
	}
	
	,modifyValues:function(values){
		var key = this.htmlValKey;
		if(key){
			value = values[key];
			value = this.prepareResourcePath(value,this.imageLocExact,this.getHtmlLoc());
			value = this.prepareResourcePath(value,this.equationLocExact,this.getEquationsLoc());
			values[this.htmlValKey] = value;
		}
		return values;
	}
	
	,fetchUpdateValues:function(form,values){
		return values;
	}
	
	,update:function(form,values){
		form = form || this;
		values = values || form.values;
		if(!values){
			values = form.getValues({});
		}
		this.fetchUpdateValues(form, values);
		if(!$.isEmptyObject(values)){
			this.updated = true;
			this.setValues(values);
		}
		if(this.updated){
			this.persistData();
			this.updated = false;
		}
	}
	
	,drawOnSuccess:function(r){
		this.draw();
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
			instance.home.preparepopUp.call(instance.home,instance);
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
	
	,show:function(key){
		var scope = this;
		var dflts = scope.dlgDflts;
		this.overlayDflts(dflts,key);
		$.extend(dflts,{sysBtnCloseClick:function(e){scope.closeClick(e);},key:key});
		$.extend(dflts,{onShow:function(e){scope.onShow(e,key);}});
		$.Dialog(dflts);
	}
	
	,launchElem:function(elem,key){
		this.launchPopUp.call(elem,elem);
		if(key){
			elem.formPanel.setValue('boxType', key);
			elem.formPanel.hideField('boxType');
		}
	}
	
	,overlayDflts:function(dflts,key){
		if(key == "Delete"){
			$.extend(dflts,{title:'Delete Confirmation',width:'40%',height:'100px'});
		}
	}

	,onShow:function(event,key){
		if(key == "Delete"){
			$.Dialog.content(divi.tpl.deleteBts);
			this.handleListeners(key);
		}
	}
	
	,handleListeners:function(key){
		this.listeners[key]=  {'click':[this.buttonClick]};
		divi.listeners.attachElementListeners(this.elems,this,null,key,this.dlEvents);
	}
	
	,destroy:function(){
		divi.listeners.removeListeners(this.elems,this.events);
		$('.window-overlay').remove();
	}
	
	,buttonClick:function(event){
		var scope = this;
		var target = divi.util.getTarget(event);
		var text = target.innerHTML;
		if(text == "Cancel"){
			this.closeClick();
		}else if(text == "Delete"){
			this.confirmDelete(event,scope,target,text);
			this.closeClick();
		}else{
			this.buttonClickOverlay(event,scope,target,text);
		}
	}
	
	,closeClick:function(){
		if(this.parent.parent && this.parent.parent.sel){
			$(this.parent.parent.sel).closest(".ui-dialog").css('display','block');
		}
		$.Dialog.close();
	}
	
	,loadFile:function(url,ops,fileName){
		var scope = this;
		var url = url || this.prepareFilePath(this,null,this.getFileAction);
		fileName = fileName || scope.fileName;
		ops = ops || {};
		var dataType = ops.dataType ? ops.dataType : "xml";
		var data = {};
		if(ops){
			$.extend(data,ops.data);
		}
		$.ajax({dataType: dataType,url:divi.core.prepareUrl(url,fileName),data:data}).done(function (data) {scope.readFile(data);}).fail(function (data) {scope.readFileFail(data);});
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
			this.activateElements();
		}
	}
	
	,activateElements:function(){
		$('.carousel').carousel({auto: false,period: 3000,duration: 2000,height:'100%',markers: {type: "square",position:"bottom-center"}});
	}
	
	,readFileFail:function(data){
		
	}
	
	,prepareEditableDom:function(ops,editors,value,isQuestion){
		ops = ops || {};
		cls = ops.cls ? this.editableDiv+" "+ops.cls : this.editableDiv;
		delete ops.cls;
		var editorDom = divi.domBase.create($.extend(ops,{tag:'div','class':cls}));
		$(editorDom.dom).attr('id',editorDom.id);
		if(editors){
			editors[editorDom.id] = {editor:editorDom.dom,value:value,isQuestion:isQuestion};
		}
		return editorDom;
	}
	
	,attachEditorContent:function(sel,editors){
		
		if(sel){
			for(var edt in editors){
				if(editors.hasOwnProperty(edt)){
					sel.append(editors[edt].editor);	
				}
			}
		}
	}
	
	,prepareEditorParams:function(editors){
		var params = {};
		params['editors'] = editors;
		$.extend(params,{toolbardomCls:'.toolbarCls',sel:sel});
		return params;
	}
    
	
	,persist:function(fileOps){
		fileOps = fileOps || {};
		var url = fileOps.url;
		context = fileOps.context || this;
		var callback = fileOps.succcb;
		var formData = new FormData();
		var eachFile;
		var file = fileOps.data;
		for(var ind = 0;ind < file.length;ind++){
			eachFile = file[ind];
			formData.append(eachFile.name, eachFile, eachFile.name);
		}
		var toStringify = fileOps.toStringify;
		if(toStringify){
			formData = {'data': JSON.stringify(formData)};
		}
		var xhr;
		if(url){
			 xhr = new XMLHttpRequest();
		     xhr.open('POST', url, true);
		     xhr.send(formData);
		}
		 xhr.onreadystatechange=function(){
        	if (xhr.readyState==4 && xhr.status==200){
    			if(callback){
    				callback.call(context,xhr.responseText);
    			}
        	}
    		return;
        }
		 
		return xhr;
	}
});

divi.elementbase = divi.extend(divi.appBase,{
	table:'',
	preview:'prev',
	elemTable:'eachHeader',
	ignoreFields:['id','src','thumb','references'],
	referenceFields:['source','name','url','license'],
	tpl:undefined,
	elemTpl:undefined,
	listeners:{},
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.elementbase.superclass.constructor.call(this);
		this.initialTpl();
		this.initElemTpl();
		this.listeners[this.editKey] = {};
		this.listeners[this.editKey]=  {'click':[this.editElemClick]};
	}

	,initElemTpl:function(){
		var table = this.elemTable;
		this.elemTpl = currTpl = divi.tpl[table];
		if(currTpl){
			$.template(table,currTpl);
		}
		if(divi.tpl.prev[this.table]){
			$.template(this.preview+this.table,divi.tpl.prev[this.table]);
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
					condition = this.isReference ? this.referenceFields.contains(index) : !this.referenceFields.contains(index);
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
		if(this.isTopic(parent) || parent.isAssessment){
			parent.loadFile();
		}
	}
	
	
	,drawElement:function(){
		var leftSel,rightSel,results,elemDom;
		if(this.tpl){
			leftSel = $('<div class="insideElem"></div>');
			var values = this.getValues();
			if(this.reference){
				leftSel.append(this.previewElement(values));
				rightSel = $('<div class="contentElem place-right"></div>');
				rightSel.append(this.reference.drawElement());
			}
			results = $.tmpl(this.table,values);
			if(rightSel){
				rightSel.after(results);
				leftSel.append(rightSel);
			}else{
				leftSel = results;
			}
		}
		return leftSel;
	}
	
	,prepareLoadValues:function(currNode,values){
		return values;
	}
	
	,loadValues:function(currNode,values){
		var refNode;
		var children = currNode.children;
		var attributes = currNode.attributes;
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
		return refNode;
	}
	
	,populateValues:function(currNode){
		values = {};
		var refNode = this.loadValues(currNode,values);
		this.prepareLoadValues(currNode,values);
		this.setValues(values);
		if(this.reference && refNode){
			this.reference.populateValues(refNode);
		}
	}
	
	,loadElement:function(currNode,appendSel){
		this.populateValues(currNode);
		var elemDom = $.tmpl(this.elemTable,{});
		var dom = this.drawElement(elemDom);
		appendSel.append(elemDom.append(dom));
		this.enableEditList(elemDom);
	}
	
	,editElemClick:function(event){
		var scope = event.data.scope;
		var target = divi.util.getTarget(event);
		scope.parent.launchElem(scope,scope.key);
	}
	
	,enableEditList:function(scope){
		divi.listeners.attachElementListeners([scope],this,null,this.editKey,this.dlEvents);
	}
	
	,previewElement:function(values){
		var elem,vals = {},url = this.prepareFilePath(this.parent,null,this.getFileAction);
		var filePath = url+'/'+values['src'];
		if(divi.tpl.prev[this.table]){
			$.extend(vals,values);
			if(vals['src'] ){
				vals['src'] = filePath;
			}
			if(values['thumb']){
				vals['thumb'] = url+'/'+values['thumb'];
			}
			elem = $.tmpl(this.preview+this.table,vals);
		}
		var elemDom = $('<div class="mainElem place-left elemPreview"></div>').append(elem);
		return elemDom;
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
			var values = this.modifyValues(values);
			$.extend(this.values,values);
		}
		if(this.reference){
			this.reference.setValues(updated);
		}
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
			this.addAddValues(dom,childdom,values,parent);
		}
	}
	
	,addAddValues:function(dom,childdom,values,parent){
		
	}
	
	,getPersistValues:function(dom,parent,attachParent,tag){
		var child = dom.createElement(tag || this.table);
		var values = this.getValues();
		this.prepareParentDom(dom,child,values,parent);
		this.prepareDomValues(dom,child,values,parent);
		if(parent && !attachParent){
			parent.appendChild(child);
		}else if(this.reference){
			this.reference.getPersistValues(dom,child);
			if(attachParent){
				parent.appendChild(child);
			}else{
				dom.documentElement.appendChild(child);
			}
		}else{
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
	
	,attachpostContent:function(appendTo,showToggle){
		
	}
	
	,showContent:function(appendTo,showToggle,index){
		var appendElem = $(appendTo);
		if(this.reference){
			index = index || 1;
			var index2 = (100-index);
			appendElem.append($.tmpl(this.tabsKey,{i1:index,i2:index2}));
			appendElem = appendElem.find('._page_'+index);
			this.attachpreContent(appendElem, showToggle);
			this.prepareForm.call(this.reference,appendElem.parent().find('._page_'+index2),showToggle);
		}
		this.prepareForm(appendElem,showToggle);
		this.attachpostContent(appendElem, showToggle);
		if(this.isNew && this.formPanel){
			this.formPanel.setValue('id', this.prepareId());
		}
		if(this.reference){
			$('.tab-control').tabcontrol();
		}
	}
	
	,prepareForm:function(appendElem,showToggle,ref){
		ref = ref || 'formPanel';
		if(!this[ref]){
			this[ref] = new divi.formPanel({data:this.table,scope:this,comboData:this.getData()});
		}
		if(this[ref] && !this[ref].toggle && showToggle){
			$.extend(this[ref],{toggle:true});
			this[ref].createToggle();
		}
		this[ref].draw(appendElem);
		this[ref].setValues(this.getValues());
	}
	
	,initilizeChild:function(input){
		input = input || this;
		if(!input.elements){
			input.elements = [];
		}
	}
	
	,addChild:function(input,key,child){
		if(input.elements){
			child.fileName = input.fileName || child.fileName;
			input.elements.push(child);
			child.addToCount();
		}
	}

});


divi.references = divi.extend(divi.elementbase,{
	table:'references',
	isReference:true,
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
		if(!this.noreference){
			this.reference = new divi.references({parent:this});
			$.template(this.tabsKey,divi.tpl.tabs);
		}
	}

	,attachMoreLis:function(elem){
		if(elem){
			elem.on('click',null,{scope:this},this.addMoreClick)
		}
	}
	
	,addMoreClick:function(e){
		var scope = e.data.scope;
		scope.attachElement(scope.appendElem, scope.showToggle,scope.elems.length+1);
	}
	
	,attachCloseLis:function(elem,imageElem){
		if(elem){
			elem.on('click',null,{scope:imageElem,parent:this},this.onCloseImage)
		}
	}
	
	,onCloseImage:function(e){
		var elem = e.data.scope;
		var parent = e.data.parent;
		var dom = elem.dom;
		var ref = elem.dom.id;
		parent.elems.remove(elem);
		divi.domBase.destroy(ref);
	}
	
	,attachCloseLis:function(elem,imageElem){
		if(elem){
			elem.on('click',null,{scope:imageElem,parent:this},this.onCloseImage)
		}
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

divi.heading3 = divi.extend(divi.element,{
	table:'heading3',
	idCount:1,
	idPrefix:'heading',
	tag:'span',
	noreference:true,
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.heading3.superclass.constructor.call(this);
	}

	,drawElement:function(){
		var currSel = $('<div class="insideElem"></div>');
		var results = $.tmpl(this.table,this.getValues());
		currSel.append(results);
		return currSel;
	}

	,prepareLoadValues:function(currNode,values){
		values[this.idPrefix] = currNode.textContent;
		return values;
	}

	,prepareParentDom:function(dom,childdom,values,parent){
		if(childdom){
			childdom.setAttribute('id', values['id']);
			this.addAddValues(dom,childdom);
		}
	}
	
	,prepareDomValues:function(dom,child,values,parent){
		var key,val;
		for(var eachValue in values){
			if(values.hasOwnProperty(eachValue) && !this.ignoreFields.contains(eachValue)){
				child.textContent = values[eachValue];
			}
		}
	}
});


divi.subtopic = divi.extend(divi.element,{
	table:'subtopic',
	idCount:1,
	idPrefix:'subtopic',
	tag:'span',
	noreference:true,
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.subtopic.superclass.constructor.call(this);
	}

	,drawElement:function(){
		var currSel = $('<div class="insideElem"></div>');
		var results = $.tmpl(this.table,this.getValues());
		currSel.append(results);
		return currSel;
	}

	,prepareLoadValues:function(currNode,values){
		values[this.idPrefix] = currNode.textContent;
		return values;
	}

	,prepareParentDom:function(dom,childdom,values,parent){
		if(childdom){
			childdom.setAttribute('id', values['id']);
			this.addAddValues(dom,childdom);
		}
	}
	
	,prepareDomValues:function(dom,child,values,parent){
		var key,val;
		for(var eachValue in values){
			if(values.hasOwnProperty(eachValue) && !this.ignoreFields.contains(eachValue)){
				child.textContent = values[eachValue];
			}
		}
	}
});


divi.html = divi.extend(divi.element,{
	ignoreFields:['data','references'],
	table:'html',
	htmlValKey:'data',
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
			$(tag).html(val);
		}
		var elemDom = $('<div class="mainElem place-left elemPreview"></div>').append(tag);
		return elemDom;
	}

	,attachpreContent:function(appendTo,showToggle){
		var htmlValue = this.getFieldValue('data');
		var editrs = {};
		this.prepareEditableDom(null,editrs,htmlValue);
		this.createEditor({editors:editrs,sel:appendTo,attachtbar:true});
	}
	
	,addSplValues:function(dom,child,values,parent){
		var values = this.cleanValues(values);
		var dataF = values[this.htmlValKey];
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
			var first = this.getEditorByIndex(editor);
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
		values[this.htmlValKey] = val;
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

	,addAddValues:function(dom,childdom){
		childdom.removeAttribute('thumb');
	}

});

divi.imageset = divi.extend(divi.element,{
	table:'imageset',
	idCount:1,
	isImageSet:true,
	ignoreFields:['id','src','title'],
	prevElem:'previewImages',
	slideKey:'slide',
	appendElem:undefined,
	elems:[],
	noreference:true,
	idPrefix:'imgSet',
	showToggle:false,
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.imageset.superclass.constructor.call(this);
		this.elems = [];
	}

	,fetchUpdateValues:function(form,values){
		this.formPanel.files = this.files;
		delete this.files;
		return values;
	}

	,loadElement:function(currNode,appendSel){
		this.populateValues(currNode);
		var eachImage,eachImageNode,refNode,imgValues,images = [];
		var children = currNode.children;
		for(var index = 0;index < children.length;index++){
			var key = children[index];
			if(key.tagName == "item"){
				eachImageNode = key;
				eachImage = new divi.image({parent:this,home:this.home});
				eachImage.populateValues(eachImageNode);
				images.push(eachImage);
			}
		}
		this.elems = images;
		var elemDom = $.tmpl(this.elemTable,{});
		var dom = this.drawElement(elemDom);
		appendSel.append(elemDom.append(dom));
		this.enableEditList(elemDom);
	}
	
	,drawElement:function(selector){
		var currSel = $('<div class="insideElem"></div>');
		var key,results,slideHtml=$('<div>'),imageDom,currSel = selector;
		if(selector){
			for(var index = 0;index < this.elems.length;index++){
				key = this.elems[index];
				imageDom = key.drawElement();
				slideHtml.append($(divi.tpl[this.slideKey]).append(imageDom));
			}
			results = $.tmpl(this.table,{});
			$(results).prepend(slideHtml.children());
			currSel.append(results);
		}
		return currSel;
	}

	,prepareLoadValues:function(currNode,values){
		delete values['item'];
		return values;
	}

	,addAddValues:function(dom,childdom,values,parent){
		if(childdom){
			childdom.removeAttribute('src', values['src']);
			childdom.removeAttribute('thumb', values['thumb']);
			childdom.setAttribute('title', values['title']);
		}
	}

	,addSplValues:function(dom,child,values,parent){
		for(var i=0;i< this.elems.length;i++){
			elem = this.elems[i];
			if(elem){
				elem.getPersistValues(dom,child,true,'item');
			}
		}
	}
	
	,prepareSubmitValues:function(scope,form){
		divi.appBase.prototype.prepareSubmitValues.call(this,scope,form);
		var files = [];
		for(var i=0;i< this.elems.length;i++){
			elem = this.elems[i];
			if(elem && elem.formPanel){
				elem.updated = true;
				elem.setValues(elem.prepareSubmitValues(elem,elem.formPanel));
				var elemFiles = elem.formPanel ? elem.formPanel.files : [];
				files = files.concat(elemFiles);
			}
		}
		this.files = files;
	}

	,validateForm:function(form){
		var elem,isValidForm = false;
		if(form){
			isValidForm = form.validateForm();
			for(var i=0;i< this.elems.length;i++){
				elem = this.elems[i];
				if(elem && elem.formPanel){
					isValidForm = isValidForm*(elem.formPanel.validateForm());
				}
			}
		}
		return isValidForm;
	}

	,attachpostContent:function(appendTo,showToggle){
		this.showToggle = showToggle;
		var elem;
		appendTo.append("<div class='"+this.prevElem+"'></div>").append("<div class='addmore place-right icon-plus-sign'></div>");
		this.appendElem = appendTo = appendTo.find("."+this.prevElem);
		if(this.isNew){
			this.attachElement(appendTo, this.showToggle,i,null,true);
		}else{
			var length = this.elems.length;
			for(var i=0;i < length;i++){
				this.attachElement(appendTo, this.showToggle,i,this.elems[i]);
			}
		}
		this.attachMoreLis(appendTo.parent().find('.addmore'));
	}
	
	,attachElement:function(appendTo,showToggle,index,elem,isNew){
		elem = elem || new divi.image({parent:this,isNew:true,home:this.home});
		if(isNew){
			var count =	this.elems.length;
			this.elems[count] = elem;
		}
		var parDom = elem.dom = elem.dom || divi.domBase.create({tag:'div','class':'eachImage',scope:this},appendTo);
		var parentDom = $(parDom.dom);
		parentDom.append("<div class='closeIcon place-right icon-minus-sign'></div>");
		elem.showContent(parentDom,showToggle,index+1);
		elem.formPanel.setValue('id', elem.guid());
		elem.formPanel.hideField('id');
		this.attachCloseLis(parentDom.find('.closeIcon'),elem);
	}
	
	
	
});

divi.image = divi.extend(divi.element,{
	tag:'img',
	ignoreFields:['id','src','title','allowFullscreen','showBorder'],
	table:'image',
	idCount:1,
	idPrefix:'img',
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.image.superclass.constructor.call(this);
	}

	,addAddValues:function(dom,childdom,values,parent){
		if(childdom){
			childdom.removeAttribute('thumb', values['thumb']);
			childdom.setAttribute('allowFullscreen', values['allowFullscreen']);
			childdom.setAttribute('showBorder', values['showBorder']);
		}
	}

	,previewElement:function(values,appendSel){
		var tag = document.createElement(this.tag || this.table);
		var url = this.prepareFilePath(this.parent,null,this.getFileAction);
		if(values['src']){
			tag.setAttribute('src',url+'/'+values['src']);
		}
		var elemDom = $('<div class="mainElem place-left elemPreview"></div>').append(tag);
		return elemDom;
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
	listeners:{},
	defaultKey:'default',
	rclickKey:'rclick',
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
		this.listeners[this.defaultKey] = {'click':[this.sidebarClick],'contextmenu':this.toggleContextMenu};
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
	
	,stringify:function(toClean){
		var masterObj =  {};
		var book = this.retrieveBook();
		this.loadCombos(book);
		book.prepareData(masterObj,toClean);
		return masterObj;
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
		var backUpKey;
		if(key == "info" || key == "alert" || key == "other"){
			backUpKey ="box_"+key;
			if(key == "other"){
				backUpKey = "other";
			}
			key = 'html';
		}
		var eachElem = new divi[key]({parent:this,isNew:true,home:this.home});
		$.extend(eachElem,{key:key});
		this.launchElem(eachElem, backUpKey);
	}
	
	,edit:function(event,val,jTarget){
		this.launchPopUp(this,this);
	}
	
	,deletefn:function(event,val,jTarget){
		this.show('Delete');
	}
	
	,confirmDelete:function(event,scope,target,text){
		this.beforeDelete(event);
		this.parent.persistData();
		this.getSelector(this.contentPreview).empty();
		var book = this.retrieveBook();
		book.draw();
		book.home.updateBcrumb(book);
	}
	
	,beforeDelete:function(event){
		
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
	
	,createContextMenu:function(items){
		var childDom,parDom = divi.domBase.create({tag:'div',scope:this,prefix:'sidebar_'});
		if(items){
			for(var ech in items){
				if(items.hasOwnProperty(ech)){
					// childDom =
					// divi.domBase.create($.extend(this.cmItemDflts,{tag:'div',scope:this,prefix:'sidebar_',value:ech,events:['click'],attachLis:true,listeners:this.listeners[this.defaultKey]}),parDom.dom);
					childDom = divi.domBase.create($.extend(this.cmItemDflts,{tag:'div',scope:this,prefix:'sidebar_',value:ech,attachLis:true,listeners:this.listeners[this.rclickKey]}),parDom.dom);
					childDom.dom.setAttribute('id',childDom.id);
				}
			}
		}
		this.cmDom = parDom;
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
		
});

divi.book = divi.extend(divi.bookBase,{
	parent:undefined,
	prviwForm:'.btnAthr',
	isBook:true,
	bookoverview:'.bookoverview',
	htmlValKey:'overview',
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
	
	,setParent:function(scope,values){
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
				parse = (key !== this.htmlValKey || !divi.util.isEmpty(values[key])) ? true : false;
				if(parse){
					val = values[key];
					if(key == this.htmlValKey){
						$(this.bookheader).removeClass('hidden').attr('contenteditable', false);
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
			var first = this.getEditorByIndex(editor);
			if(first){
				first.getValue(this,this.htmlCallBack);
			}
		}
		scope.home.cancelDailog(uidialog);
	}
	
	,htmlCallBack:function(saveVal){
		var values = this.getValues();
		values[this.htmlValKey] = saveVal;
		this.setValues(values);
		this.update(null,values);
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
		this.attachChildren(ulDiv.dom,true,'prepareSideBar',false,false);
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
		this.listeners[this.rclickKey]= {'click':[this.onCmClick]};
		divi.chapter.superclass.constructor.call(this);
		var parent = $('.contextmenu');
		this.cmItems = {'Add Topic':{fn:this.add,key:'topic'},'Add Assessment':{fn:this.add,key:'assessment'},'Edit':{fn:this.edit},'Delete':{fn:this.deletefn}};
		this.createContextMenu(this.cmItems);
	}

	,beforeDelete:function(event){
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
		if(divi.util.isEmptyId(this.sequence)){
			this.sequence = 0;
		}
		rtn += (this.sequence +1) +'.  ';
		rtn += val;
		return rtn;
	}

	,prepareSideBar:function(parent,toClean,currKey,index){
		var livDiv,values,dflts,aDiv,ulDiv;
		livDiv = this.doms[this.divs['liDiv']] = divi.domBase.create($.extend(this.lidDefaults,{scope:this}),parent);
		values = this.getValues();
		this.sequence = index;
		dflts = $.extend(this.aDefaults,{value:this.prepareValue(values['name']),scope:this,listeners:this.listeners[this.defaultKey]});
		aDiv = this.doms[this.divs['aDiv']] = divi.domBase.create(dflts,livDiv.dom);
		aDiv.dom.setAttribute('id',aDiv.id);
		ulDiv = this.doms[this.divs['ulDiv']] = divi.domBase.create($.extend(this.ulDefaults,{scope:this}),livDiv.dom);
		if(this.hasChildren){
			this.attachChildren(ulDiv.dom,toClean,'prepareSideBar',false,false);
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
		this.listeners[this.rclickKey] = {'click':[this.onCmClick]};
		divi.topic.superclass.constructor.call(this);
		var parent = $('.contextmenu');
		this.cmItems = {'Delete':{fn:this.deletefn}};
		this.createContextMenu(this.cmItems);
	}
	
	,drawUpdate:function(){
		this.loadFile();
	}
	
	,beforeDelete:function(event,val,jTarget){
		var lookupKey = this.pluralize(this.table);
		var children = this.parent.children[lookupKey];
		if(children){
			children.remove(this);
		}
		var doms = this.doms[this.divs['liDiv']];
		var currDom = $(doms.dom);
		currDom.remove();
		this.destroydoms();
	}
	
	,getValues:function(){
		var values = {};
		$.extend(values,this.values);
		delete values.chapter;
		return values;
	}
	
	
	,prepareSideBar:function(parent,toClean,currKey,index){
		var livDiv,values,dflts,aDiv,iconDiv;
		this.sequence = this.index;
		livDiv = this.doms[this.divs['liDiv']] = divi.domBase.create($.extend(this.lidDefaults,{scope:this}),parent);
		aDiv = this.doms[this.divs['aDiv']] = divi.domBase.create( $.extend(this.aDefaults,{scope:this,listeners:this.listeners[this.defaultKey]}),livDiv.dom);
		aDiv.dom.setAttribute('id',aDiv.id);
		iconDiv = this.doms[this.divs['iconDiv']] = divi.domBase.create( $.extend(this.iconDefaults,{scope:this}),aDiv.dom);
		values = this.getValues();
		aDiv.dom.innerHTML += values['name'];
	}
});


divi.assessment = divi.extend(divi.bookBase,{
	parent:undefined,
	idPrefix:'ass',
	idCount:0,
	table:'assessment',
	questIds:[],
	assessFile:'assessments.json',
	isAssessment:true,
	elements:[],
	comboKey:'assessment',
	childrenKeys:['questions'],
	elements:[],
	sequence:undefined,
	getQuestions:'getQuestions',
	divs:{'liDiv':'liDiv','aDiv':'oLinkDiv','iconDiv':'iconDiv'},
	lidDefaults:{tag:"li",prefix:'sidebar_'},
	aDefaults:{tag:"a",href:"#",prefix:'sidebar_',attachLis:true},
	iconDefaults:{tag:'i','class':"icon-briefcase",prefix:'sidebar_'},
	
	constructor : function (cfg) {
		$.extend(this,cfg);
		divi.assessment.superclass.constructor.call(this);
		this.questIds = [];
	}

	,getValues:function(){
		var values = {};
		$.extend(values,this.values);
		delete values.chapter;
		return values;
	}
	
	,persistChild:function(){
		// do nothing.
	}
	
	,loadFile:function(url,fileName){
		var scope = this;
		var url = this.prepareFilePath(this,null,this.getFileAction);
		$.ajax({dataType: "json",url:divi.core.prepareUrl(url,this.assessFile)}).done(function (data) {scope.readAssessmentFile(data);}).fail(function (data) {scope.readFileFail(data);});
	}
	
	,readAssessmentFile:function(data){
		this.children = {};
		this.children[this.childrenKeys[0]] = [];
		this.getSelector(this.contentPreview).empty();
		if(data){
			this.read(data);
			var questIds = this.questIds;
			if(questIds && questIds.length > 0){
				url = this.prepareFilePath(this,null,'/');
				divi.appBase.prototype.loadFile.call(this,'../'+this.getQuestions,{data:{url:url,ids:questIds},dataType:'json'},divi.question.prototype.fileName);
			}
		}
	}
	
	,persistData:function(elem,url){
		divi.appBase.prototype.persistData.call(this);// save master.json
		this.persistCurr();
	}
	
	,persistCurr:function(){
		var url = this.prepareFilePath(this);
		divi.appBase.prototype.persistData.call(this,this,url,this.assessFile,{attachCb:false});// save
																				// assessments.json
	}
	

	,stringify:function(){
		var masterObj= {};
		if(this.isAssessment){
			this.prepareData(masterObj,true);
		}
		return masterObj;
	}
	
	,prepareSideBar:function(parent,toClean,currKey,index){
		var livDiv,values,dflts,aDiv,iconDiv;
		this.sequence = this.index;
		livDiv = this.doms[this.divs['liDiv']] = divi.domBase.create($.extend(this.lidDefaults,{scope:this}),parent);
		aDiv = this.doms[this.divs['aDiv']] = divi.domBase.create( $.extend(this.aDefaults,{scope:this,listeners:this.listeners[this.defaultKey]}),livDiv.dom);
		aDiv.dom.setAttribute('id',aDiv.id);
		iconDiv = this.doms[this.divs['iconDiv']] = divi.domBase.create( $.extend(this.iconDefaults,{scope:this}),aDiv.dom);
		values = this.getValues();
		aDiv.dom.innerHTML += values['name'];
	}
	
	,readEachChild:function(children,currKey){
		var eachChild,rchild;
		this.initilizeChild(this,currKey)
		this.loadQuestions(children);
	}
	
	,loadQuestions:function(children){// better approach.TBD.
		var ids = "";
		for(var i=0;children && children && i < children.length;i++){
			rchild = children[i];
			if(divi[rchild['type']]){
				ids += rchild['id'];
				if(i != children.length-1){
					ids += ",";
				}
			}
		}
		this.questIds = ids;
	}

	,readFile:function(data){
		var xml,jXml,xmlDoc,currData = data,currKey = this.childrenKeys[0];
		delete currData.Success;
		var selected = this;
		var questIds = this.questIds.split(",");
		for(var eachKey in questIds){
			if(questIds.hasOwnProperty(eachKey)){
				xml = currData[questIds[eachKey]];
				xmlDoc = $.parseXML(xml);
				var quesChild = xmlDoc.firstChild;
				if(quesChild){
					var self = quesChild.children[0];
					var answers = quesChild.children[1].children;
					selected.elemes = [];// resetting the elems
					var type = $(quesChild).attr('type');
					if(divi[type]){
						eachChild = new divi[type]({parent:this,home:this.home});
						eachChild.loadQuestion(quesChild,self,answers);
						eachChild.drawQuestion();
						this.addChild(this, currKey, eachChild);
					}
				}
			}
		}
	}
});

divi.question = divi.extend(divi.element,{
	ansCnt:1,
	maxansCnt:undefined,
	answers:[],
	popWdith:'80%',
	doms:{},
	elems:[],
	isQuestion:true,
	editorKey:undefined,
	divs:{'rating':'rating'},
	fileName:'question.xml',
	editors:{},
	answerKey:'answer',
// /noreference:true,
	ignoreFields:['data','references','id','version','type'],
	table:'question',
	htmlValKey:'data',
	idCount:1,
	prssIndex:-1,
	editor:undefined,
	idPrefix:'ques', 
	
	constructor : function (cfg) {
		$.extend(this,cfg);
		divi.question.superclass.constructor.call(this);
		this.elems = [];
	}
	
	,initializeValues:function(){
		divi.appBase.prototype.initializeValues.call(this);
		this.values['type'] = this.type;
	}
	
	
	,drawChildren:function(){
		var currSSel =$('<div>');
		var currAns,ansDom,answers = this.elems;
		var tmpl = divi.tpl[this.answerKey];
		for(var i=0;answers && i < answers.length;i++){
			currAns = answers[i];
			ansDom = $(tmpl);
			ansDom.find('label').append(currAns.getFieldValue('data'));
			if(currAns.getFieldValue('isAnswer') =="true"){
				ansDom.find('input').attr('checked',true);
			}
			this.updateChildDom(ansDom);
			currSSel.append(ansDom);
		}
		return currSSel;
	}
	
	,updateChildDom:function(ansDom){
		
	}
	,drawElement:function(){
		var dom = $(divi.tpl.question);
		dom.append(this.getFieldValue('data'));
		return dom;
	}
	
	,drawQuestion:function(){
		var parentCont = this.getSelector(this.contentPreview);
		var elemDom = $.tmpl(this.elemTable,{});
		var dom = this.drawElement(elemDom);
		var childDom = this.drawChildren();
		parentCont.append(elemDom.append(dom).append(childDom));
		this.enableEditList(elemDom);
	}

	,attachChildren:function(input,toClean,callback,initialize,addParams,skipChildren){
		var currKey;
		for(var i=0;input && this.childrenKeys && i< this.childrenKeys.length;i++){
			currKey = this.childrenKeys[i];
			addParams = addParams || [];
			this.attachEachChild(callback,toClean,input,currKey,initialize,addParams,skipChildren);
		}
	}
	

	,loadQuestion:function(questionChild,self,answers){
		this.populateValues(questionChild);
		this.populateValues(self);
		var values = this.getValues();
		delete values['options'];
		delete values['html'];
		var eachAns,elem;
		for(var i=0;i < answers.length;i++){
			eachAns = answers[i];
			elem = new divi[this.answerKey]({parent:this,home:this.home});
			elem.loadAnswer(eachAns);
			this.addAnswer(this,elem);
		}
	}
	
	,prepareData:function(input,toClean,currKey,index,isArray,skipChildren){
		if(input){
			if(isArray){
				if(skipChildren){
					input = input[currKey];
				}else{
					input = input.children[currKey];
				}
			}
			var newObj = {};
			newObj['id'] = this.getFieldValue('id');
			newObj['type'] = this.getFieldValue('type');
			input.push(newObj);
		}
	}
	
	,read:function(input){
		this.setValues(input);
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
		var url = this.prepareFilePath(this.parent,"",this.saveformulaAction);
		return url;
		
	}
	
	,getHtmlLoc:function(){
		var url = this.prepareFilePath(this.parent,"",this.getFileAction);
		return url+"/"+this.imageLoc;
	}
	
	,submit:function(scope,form,event){
		if(scope.isNew){
			var key = divi.question.prototype.table;
			var lookupKey = this.pluralize(key);
			this.initilizeChild(scope.parent,lookupKey);
			scope.parent.addChild(scope.parent,lookupKey,scope);
		}
		if(form){
			scope.update(form);
		}
		divi.home.prototype.cancelDailog(event);
	}
	
	,validate:function(){
		var values = this.getValues();
		return true;
	}

	,validateForm:function(){
		var elem,isValidForm = this.validate();
		for(var i=0;i< this.elems.length;i++){
			elem = this.elems[i];
			if(elem){
				isValidForm = isValidForm*elem.validate();
			}
		}
		return isValidForm;
	}

	,previewElement:function(values,appendSel){
		var val = values['data'];
		if(val){
			var tag = document.createElement('div');
			$(tag).html(val);
		}
		var elemDom = $('<div class="mainElem place-left elemPreview"></div>').append(tag);
		return elemDom;
	}
	
	,attachpreContent:function(appendTo){
		if(this.isNew){
			this.setValueForKey('id',this.prepareId());
		}
		var htmlValue = this.getFieldValue('data');
		appendTo.find(this.editableDiv).remove();
		this.editors = {};
		var editorDom = this.prepareEditableDom({cls:"question"},this.editors,htmlValue,true);
		this.editorKey = editorDom.id;
		this.createEditor({editors:this.editors,sel:appendTo,attachtbar:true});
	}
	
	,attachChildPreCont:function(appendTo,index,elem,isNew){
		elem = elem || new divi[this.answerKey]({parent:this,isNew:true,home:this.home});
		if(isNew){
			elem.setValueForKey('id',elem.prepareId());
			if(elem.getValues().hasOwnProperty("isAnswer")){
				elem.setValueForKey('isAnswer',false);
			}
			this.addAnswer(this,elem);
		}
		elem.draw(appendTo,index);
		if(this.editor){
			this.editor.addEditors(this.editors);
		}
		if(this.checkMax()){
			appendTo.parent().find('div.options').find('a').addClass('disabled');
		}else{
			appendTo.parent().find('div.options').find('a').removeClass('disabled');
		}
	}
	
	,attachEditorContent:function(appendTo,editors){
		if(appendTo){
			for(var edt in editors){
				if(editors.hasOwnProperty(edt)){
					appendTo.append(editors[edt].editor);	
				}
			}
			appendTo.append("<div class='dottedLine padding5'></div>");
			appendTo.append("<div class='place-left mainElem'></div><div class='place-right contentElem'></div>");
			this.appendElem = appendTo =  appendTo.find('.mainElem');
			appendTo.append("<div class=''>Answers</div>");
			var childCnt = this.isNew ? this.ansCnt : this.elems.length;
			for(var i=0;i < childCnt;i++){ 
				var elem = this.isNew ? null : this.elems[i];
				this.attachChildPreCont(appendTo,i,elem,this.isNew);
			}
			editors = this.editors;
		}
	}
	
	,prepareForm:function(appendElem,showToggle){
		if(this.isReference){
			divi.elementbase.prototype.prepareForm.call(this,appendElem,showToggle);
		}else{
			appendElem =  appendElem.find('.contentElem');
			appendElem.append('<div>Difficulty Level</div>');
			dom =  this.doms[this.divs.rating] = divi.domBase.create({tag:'div','class':'rating',scope:this},appendElem);
			var aCls = this.checkMax() ? 'disabled' : '';
			appendElem.append('<div class="options"><a class="'+aCls+'">+Add More Options</a></div>');
		}
	}
	
	,attachpostContent:function(appendTo,showToggle){
		this.initiateRating();
		this.attachMoreLis(appendTo.find('div.options'));
	}
	
	,checkMax:function(){
		return (this.maxansCnt && this.elems.length >= this.maxansCnt); 
	}
	
	,updateRating:function(value){
		var values = this.getValues();
		values['difficulty'] = value;
		this.setValues(values);
	}
	
	,initiateRating:function(){
		var scope = this;
		difficulty = this.getFieldValue('difficulty') || 0;
		$(".rating").rating({'static': false,stars: 5,showHint: true,hints: ['bad', 'poor', 'regular', 'good', 'gorgeous'],score:difficulty,
				click: function(value, rating){rating.rate(value);scope.updateRating(value);}});
	}

	,addAnswer:function(input,child){
		if(input.elems){
			input.elems.push(child);
			child.addToCount();
		}
	}
	
	,attachElement:function(appendTo,showToggle,index,elem,isNew){
		if(!this.checkMax()){
			this.attachChildPreCont(appendTo,index,elem,true);
		}
	}
	
	,addSplValues:function(dom,child,values,parent){
		var values = this.cleanValues(values);
		var dataF = values[this.htmlValKey];
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
			var first = editor.getEditorsForKey(this.editorKey);
			if(first){
				first.getValue(this,this.htmlcallBack);
			}
		}else{
			this.htmlcallBack();
		}
	}

	,prepareFilePath:function(scope,url,action){
		var url = divi.appBase.prototype.prepareFilePath.call(this,this,url,action);
		url += "/"+this.getFieldValue('id');
		return url;
	}
	
	,htmlcallBack:function(val){
		var scope = this;
		var values = this.getValues();
		values[this.htmlValKey] = val;
		this.persistChildHtml(this.prssIndex);
	}
	
	,persistChildHtml:function(index){
		if(index+1 < this.elems.length){
			var elem = this.elems[index+1];
			var editorIn = this.editor.getEditorsForKey(elem.editorKey);
			if(editorIn && elem){
				editorIn.getValue(elem,elem.htmlcallBack);
			}else{
				this.persistChildHtml(index+1);
			}
		}else{
			this.parent.persistCurr();
			this.persistElem();
		}
	}
	
	,persistElem:function(){
		var scope = this;
		if(scope && scope.fileName){
			var eachSet;
			var elemId,eachElem;
			var elements = scope.elems;
			var files = [];
			var dom = jsxml.fromString('<?xml version="1.0" encoding="UTF-8"?><question version="1" id="' + scope.getFieldValue('id')+ '" type = "'+scope.getFieldValue('type')+'"/>');
			this.getPersistValues(dom,null,false,'html');
			
			var ops = dom.createElement('options');
			dom.documentElement.appendChild(ops);
			var masterObj = {};
			for(var index = 0; index  < elements.length;index++){
				eachElem = elements[index];
				if(eachElem){
					eachElem.getPersistValues(dom,ops,false,'option');
				}
			}
			var url = this.prepareFilePath(this,url);
			var file = new Blob([jsxml.toXml(dom)]);
			file.name = scope.fileName;
			scope.persist({url:url,data:[file],succcb:this.drawOnSuccess});
		}
	}
	
	,prepareParentDom:function(dom,childdom,values,parent){
		if(childdom){
		}
	}
});


divi.answer = divi.extend(divi.element,{
	ansCnt:2,
	maxansCnt:2,
	table:'answer',
	htmlValKey:'data',
	noreference:true,
	elemLisKey:'elemList',
	ignoreFields:['id','isAnswer','thumb','references','data'],
	listeners:{},
	evtDflts:{attachLis:true,events:['change','mouseout','keypress']},
	doms:{},
	divs:{'check':'checkDom','elem':'elemDom','main':'answerDiv'},
	idCount:1,
	editor:undefined,
	idPrefix:'ans',
	editorKey:undefined,
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.answer.superclass.constructor.call(this);
		this.listeners = {};
		this.listeners[this.elemLisKey] = {'change':[this.changeListener],'mouseout':[this.changeListener],'keypress':[this.changeListener]};
		$.extend(this.evtDflts,{listeners:this.listeners[this.elemLisKey],scope:this});
	}
	
	,loadAnswer:function(answer){
		this.populateValues(answer);
	}
	
	,validate:function(){
		var values = this.getValues(),validateForm = true;
		for(var key in values){
			if(values.hasOwnProperty(key)){
				validateForm = validateForm*values[key];
			}
		}
		return true;
	}
	
	,htmlcallBack:function(val){
		var scope = this;
		var values = this.getValues();
		values[this.htmlValKey] = val;
		this.parent.persistChildHtml(this.getIndexForElem());
	}
	
	,getSaveHtmlLoc:function(){
		return this.parent.getSaveHtmlLoc();
	}
	
	,getEquationsLoc:function(){
		return this.parent.getEquationsLoc();
	}
	
	
	,getSaveEquationsHtmlLoc:function(){
		return this.parent.getSaveEquationsHtmlLoc();
	}
	
	,getHtmlLoc:function(){
		return this.parent.getHtmlLoc();
	}
	
	,getIndexForElem:function(){
		var matchedInd,elem,elems = this.parent.elems;
		for(var i =0;elems && i < elems.length;i++){
			elem = elems[i];
			if(elem == this){
				matchedInd = i;
				break;
			}
		}
		return matchedInd;
	}
	
	,prepareSubmitValues:function(){
		scope = scope || this;
		return scope.getValues();
	}
	
	,addSplValues:function(dom,child,values,parent){
		this.parent.addSplValues(dom,child,values,parent);
	}
	
	,addAddValues:function(dom,childdom,values,parent){
		if(childdom){
			childdom.removeAttribute('thumb');
			childdom.removeAttribute('src');
			childdom.setAttribute('isAnswer',this.getFieldValue('isAnswer'));
		}
	}
	
	,changeListener:function(event,val,jTarget,type,target){
		var key = "data",val;
		if(target && target.name == "isAnswer"){
			key = "isAnswer";
			val = jTarget.prop('checked') ? true : false;
		}else{
			val = jTarget.html();
		}
		this.setValueForKey(key,val);
	}
	
	,draw:function(append){
		var values = this.getValues();
		var isAnswer = this.getFieldValue("isAnswer");
		var parDom = this.doms[this.divs.main] = divi.domBase.create({tag:'div','class':'answerDiv',scope:this},append);
		var inptDflts = $.extend({tag:'input',type:"checkbox",name:'isAnswer','data-transform':'input-control'},this.evtDflts); 
		if(isAnswer == "true"){
			$.extend(inptDflts,{'checked':true});
		}
		var elem = this.doms[this.divs.check] || divi.domBase.create(inptDflts,parDom.dom);
		$(elem.dom).attr('id',elem.id);
		var answerDom = this.doms[this.divs.elem] = this.prepareEditableDom($.extend({cls:"answer"},this.evtDflts),this.parent.editors,this.getFieldValue(this.htmlValKey));
		this.editorKey = answerDom.id;
		$(parDom.dom).append(answerDom.dom);
	}
});

divi.torfAns = divi.extend(divi.answer,{
	trueText:'True',
	falseText:'False',
	idPrefix:'torfAns',
	htmlValKey:undefined,
	ignoreFields:['id','isAnswer'],
	table:'torfAns',
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.answer.superclass.constructor.call(this);
		this.listeners = {};
		this.listeners[this.elemLisKey] = {'change':[this.changeListener],'mouseout':[this.changeListener],'keypress':[this.changeListener]};
		$.extend(this.evtDflts,{listeners:this.listeners[this.elemLisKey],scope:this});
	}

	,addSplValues:function(dom,child,values,parent){
	}

	,changeListener:function(event,val,jTarget,type,target){
		var key = "isAnswer";
		val = jTarget.prop('checked') ? true : false;
		this.setValueForKey(key,val);
		var matched = this.getOtherTarget(jTarget);
		if(matched){
			matched.setValueForKey(key,!val);
		}
	}
	
	,getOtherTarget:function(jTarget){
		var matched,elem,parent = this.parent;
		var elems = parent.elems;
		for(var key = 0;elems && key < elems.length;key++){
			elem = elems[key];
			if(jTarget.attr('id') != elem.editorKey){
				matched = elem;
				break;
			}
		}
		return matched;
	}

	,draw:function(append,index){
		var values = this.getValues();
		var isAnswer = this.getFieldValue("isAnswer");
		var parDom = this.doms[this.divs.main] = divi.domBase.create({tag:'div','class':'answerDiv',scope:this},append);
		var inptDflts = $.extend({tag:'input',type:"radio",name:'r3','data-transform':'input-control'},this.evtDflts); 
		if(isAnswer == "true"){
			$.extend(inptDflts,{'checked':true});
		}
		var elem = this.doms[this.divs.check] || divi.domBase.create(inptDflts,parDom.dom);
		$(elem.dom).attr('id',elem.id);
		var text = this.trueText;
		if(index == 1){
			text = this.falseText;
		}
		this.setValueForKey('data',text);
		var answerDom = this.doms[this.divs.elem] = divi.domBase.create({tag:'div',scope:this,value:text},append)
		this.editorKey = elem.id;
		$(parDom.dom).append(answerDom.dom);
	}
	
});

divi.fill_blankAns = divi.extend(divi.answer,{
	idPrefix:'fobAns',
	ignoreFields:['id'],
	table:'fill_blankAns',
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.fill_blankAns.superclass.constructor.call(this);
		this.listeners = {};
		this.listeners[this.elemLisKey] = {'change':[this.changeListener],'mouseout':[this.changeListener],'keypress':[this.changeListener]};
		$.extend(this.evtDflts,{listeners:this.listeners[this.elemLisKey],scope:this});
	}

	,addAddValues:function(dom,childdom,values,parent){
		if(childdom){
			childdom.removeAttribute('thumb');
			childdom.removeAttribute('src');
		}
	}

	,draw:function(append,index){
		var values = this.getValues();
		var parDom = this.doms[this.divs.main] = divi.domBase.create({tag:'div','class':'answerDiv',scope:this},append);
		var answerDom = this.doms[this.divs.elem] = this.prepareEditableDom($.extend({cls:"answer"},this.evtDflts),this.parent.editors,this.getFieldValue(this.htmlValKey));
		this.editorKey = answerDom.id;
		$(parDom.dom).append(answerDom.dom);
	}
	
});

divi.mcq = divi.extend(divi.question,{
	type:'mcq',
	table:'mcq',
	idPrefix:'mcq',
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.mcq.superclass.constructor.call(this);
	}
});


divi.torf = divi.extend(divi.question,{
	type:'torf',
	table:'torf',
	answerKey:'torfAns',
	idPrefix:'torf',
	ansCnt:2,
	maxansCnt:2,
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.torf.superclass.constructor.call(this);
	}

	,updateChildDom:function(ansDom){
		ansDom.find('input').attr('name',this.getFieldValue('id'));
	}
});


divi.fill_blank = divi.extend(divi.question,{
	type:'fill_blank',
	table:'fill_blank',
	answerKey:'fill_blankAns',
	idPrefix:'fob',
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.fill_blank.superclass.constructor.call(this);
	}

	,drawChildren:function(){
		var currSSel =$('<div>');
		var currAns,ansDom,answers = this.elems;
		var tmpl = divi.tpl[this.answerKey];
		for(var i=0;answers && i < answers.length;i++){
			currAns = answers[i];
			ansDom = $(tmpl);
			ansDom.find('label').append(currAns.getFieldValue('data'));
			currSSel.append(ansDom);
		}
		return currSSel;
	}

	,updateChildDom:function(ansDom){
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
	btnToolbar:'.btn-toolbar',
	dsbltoolbar:'disabletoolbar',
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
		this.initialize();
	}

	,addEditors:function(editors){
		this.editors = editors;
		divi.listeners.attachElementListeners(this.initiateEditors(),this,null,this.listenerKey);
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
		var currEditor = jTarget.hasClass("."+this.editableDiv) ? jTarget : jTarget.closest("div."+this.editableDiv);
		scope.activateToolBar(scope,currEditor.attr('id'));
	}
	
	,activateToolBar:function(scope,refKey){
		if(!scope.activeKey || scope.activeKey != refKey){
			scope.removeActiveToolbar.call(scope);
			scope.activeKey = refKey;
			scope.activeEditor = scope.getEditorsForKey(refKey);
			if(scope.activeEditor){
				scope.activeEditor.activate();
				scope.updateToolbar();
				var toolbar = this.getSelector(this.btnToolbar);
				$('div.'+this.dsbltoolbar).remove();
			}
		}
	}
	
	,execCommand:function (commandWithArgs, valueArg) {
		var commandArr = commandWithArgs.split(' '),command = commandArr.shift(),args = commandArr.join(' ') + (valueArg || '');
		document.execCommand(command, 0, args);
		var par = this.parent ? this.parent : this;
		par.updateToolbar();
	}
	
	,resetToolBar:function () {
		if (this.activeToolbarClass) {
			var scope = this;
			$(this.toolbarSelector).find(scope.toolbarBtnSelector).each(function () {
			    $(this).removeClass(scope.activeToolbarClass);
			});
		}
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
			this.disableToolbar();
			this.resetToolBar();
		}
	}
	
	,disableToolbar:function(){
		var toolbar = this.getSelector(this.btnToolbar);
		toolbar.prepend("<div class='"+this.dsbltoolbar+"'></div>");
	}
	
	,startup:function(){
		this.toolbarBtnSelector = 'a[data-' + this.commandRole + '],button[data-' + this.commandRole + '],input[type=button][data-' + this.commandRole + ']';
		this.listeners[this.listenerKey] = {'click':[this.setActiveToolbar]};
		this.disableToolbar();
	}
	
	,setEditors:function(editors){
		this._editors = editors;
	}
	
	,initiateEditors:function(){
		var editors = [],eachEdit,mainEditors = {};
		var exsEditors = this.getEditors();
		for(var ind in this.editors){
			if(this.editors.hasOwnProperty(ind)){
				eachEdit = this.editors[ind];
				if(eachEdit && !exsEditors[ind]){
					editors.push(eachEdit.editor);
					mainEditors[ind] = new divi.indEditor({editor:$(eachEdit.editor),parent:this,value:eachEdit.value,isQuestion:eachEdit.isQuestion});
				}else{
					mainEditors[ind] = exsEditors[ind];
				}
			}
		}
		this.setEditors(mainEditors);
		return editors;
	}
	
	,initialize:function(){
		this.formuleImages = 'img[src*="' + EQUATION_ENGINE + '"],img[src*="' + this.equations + '"]';
		divi.listeners.attachElementListeners(this.initiateEditors(),this,null,this.listenerKey);
		this.bindToolbar();
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
				if(scope instanceof divi.indEditor){
					scope = scope.parent;
				}
				if(!divi.util.isjQEmpty(checkforImg)){
					scope.launchFormula(scope,editor,target);
				}
			}
		}
	}
	
	,launchFormula:function(mainEditor,editor,editTarget){
		var range = editor.getCurrentRange();
		if(editTarget || range){
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
		$("div."+this.editableDiv).find(this.formuleImages).on('click',null,{scope:this},this.onToolBarclick);
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
	isQuestion:false,
	imgFiles:{},
	ref:undefined,
	events:'mouseup keyup keydown mouseout',
	constructor : function (cfg) {
		$.extend(this,cfg);
		divi.indEditor.superclass.constructor.call(this);
		this.ref = this.editor.attr('ref');
	}

	,initialize:function(){// overriding the base initialize
		
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
        	if(filesList.length > 0){
        		deferredArr.push(method.call(scope,{url:url,data:filesList}));
        		isFiles = true;
        	}
        }
        
        var imageFiles = this.fetchFormulas(value);
        var imageUrl = rtnScope.getSaveEquationsHtmlLoc();
        if(imageFiles && imageFiles.length > 0 && imageUrl){
	        deferredArr.push(divi.core.ajax.call(scope,{url:imageUrl,data:imageFiles,isArray:true}));
	        isImages = true;
        }
        if(deferredArr.length > 0){
        	$.when.apply(this,deferredArr).done(function(a,b){
        		scope.saveInlineSucess.call(scope,value, filesList,imageFiles,callback,cbScope);
        	});
        }else{
        	scope.saveInlineSucess.call(scope,value, filesList,imageFiles,callback,cbScope);
        }
	}
	
	,fetchFormulas:function(val){
		var files = [];
		if (val) {
			var dataQuery = $("<div/>").append(val);
	        var elements = dataQuery.find('img[src^="' + EQUATION_ENGINE + '"]');
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
	
	,upateFormulas:function (resData,respData) {
	    var currLocation = "./equations/";
	    var currData, location;
	    var val = resData;
	    for (var i = 0; i < respData.length; i++) {
	        currData = respData[i];
	        location = currLocation + currData.name;
	        val = val.replace(currData.src, location);
	    }
	    return val;
	}
	
	,saveInlineSucess:function (val, files,imageFiles,callback,cbScope) {
		var saveVal = val;
		if(files && files.length > 0){
			saveVal = this.prepareRetrievePath(cbScope.imageLocExact, val, files, cbScope);
			this.files = {};
		}
		if(imageFiles && imageFiles.length > 0){
			saveVal = this.upateFormulas(saveVal, imageFiles);
			// saveVal = this.prepareEquationPath(cbScope.equationLocExact, val,
			// files, cbScope);
		}
		if(callback){
	    	callback.apply(cbScope,[saveVal]);
	    }
	}
	
	,restoreSelection:function () {
		var scope = this;
		var selection = window.getSelection();
		if(scope.editor){
			var selectedRange = scope.selectedRange;
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
		this.listeners[this.listenerKey] = {'keydown':[this.triggerCommand],'keyup':[this.triggerCommand,this.editorListener],'mouseup':[this.editorListener],'mouseout':[this.editorListener]};
		divi.listeners.attachElementListeners([this.editor],this,null,this.listenerKey);
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
		this.saveSelection(event);
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
	
	,saveSelection:function (event) {
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
	overDflts:{title: '<h3>Formula Upload</h3>'}

	,constructor : function (cfg) {
		$.extend(this,cfg);
		divi.formula.superclass.constructor.call(this);
	}
	
	,overlayDflts:function(dflts){
		$.extend(dflts,this.overDflts);
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

	,initialize:function(){// overriding the base initialize
		this.tpl = divi.tpl[this.table];
		this.show();
	}
	
	,activate:function(){
		$(this.toolbar).focus().removeAttr('readOnly');
	}
	,onShow:function(){
		var formula = this.tpl;
		$.Dialog.content(formula);
		$(this.toolbar).html(divi.tpl.formToolBar);
		EqEditor.init('',undefined,undefined,'toolbar');
 		EqEditor.add(new EqTextArea('prFormula', 'formulaText'),false);
 		this.handleListeners('formula');
		this.setValue(this.value);
	}

	,buttonClickOverlay:function(event,scope,target,text){
		if(text == "Insert"){
			this.submitClick();
		}
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
		this.activate();
	}
});


divi.home =  divi.extend(divi.appBase,{
	parent:undefined,
	selected:undefined,
	book:undefined,
	editors:1,
	callback:undefined,
	editContent:'.titleHolder',
	assessHolder:'.assessHolder',
	topicTit:'.topicTit',
	assessTit:'.assessTit',
	assessbtns:'.assessbtns',
	topicbtns:'.topicbtns',
	chapTit:'.chapTit',
	selector:'textarea.html_input',
	previewSel:'.treepreview',
	constructor : function (cfg) {
		divi.home.superclass.constructor.call(this);
	}
	
	,updateSelected:function(selected){
		this.selected = selected;
		this.enableTopBtns(selected);
		this.enableTopEditBtns(selected);
		this.previewContent(selected);
	}
	
	,enableTopEditBtns:function(selected){
		if(selected && selected.table == 'topic'){
			this.getSelector(this.assessbtns).hide();
			this.getSelector(this.topicbtns).show();
			divi.listeners.attachListenersWS(this.editBtnListeners(selected),this);
		}else if(selected && selected.table == 'assessment'){
			this.getSelector(this.assessbtns).show();
			this.getSelector(this.topicbtns).hide();
			divi.listeners.attachListenersWS(this.editAssessListeners(selected),this);
		}else{
			divi.listeners.unbindListeners(this.editBtnListeners(selected),this);
			divi.listeners.unbindListeners(this.editAssessListeners(selected),this);
		}
	}
	
	,previewContent:function(selected){
		this.updateBcrumb(selected);
		this.getSelector(this.contentPreview).empty();
		if(selected && (this.isTopic(selected) || selected.isAssessment)){
			selected.loadFile();
		}
	}
	
	,updateBcrumb:function(selected){
		if(this.isTopic(selected)){
			var chapter = this.retrieveElem(selected,'chapter');
			this.getSelector(this.assessHolder).addClass('hidden');
			this.getSelector(this.editContent).removeClass('hidden');
			this.getSelector(this.chapTit).html(chapter.getFieldValue('name'));
			this.getSelector(this.topicTit).html(selected.getFieldValue('name'));
		}else if(selected.isAssessment){
			var chapter = this.retrieveElem(selected,'chapter');
			this.getSelector(this.editContent).addClass('hidden');
			this.getSelector(this.assessHolder).removeClass('hidden');
			this.getSelector(this.chapTit).html(chapter.getFieldValue('name'));
			this.getSelector(this.assessTit).html(selected.getFieldValue('name'));
			
		}else{
			this.getSelector(this.editContent).addClass('hidden');
		}
	}
	
	,btnListeners:function(scope){
		 return [{tag:'.addtopic',listType:'click',parent:this.book,listenerFn:'addcontent',key:'topic',mapTo:scope},
	        {tag:'.addassessment',listType:'click',parent:this.book,listenerFn:'addcontent',key:'assessment',mapTo:scope}];
	}
	
	,editBtnListeners:function(scope){
		 return [{tag:'.addvideo',listType:'click',parent:this.book,listenerFn:'addelement',key:'video',mapTo:scope},
		         {tag:'.addimage',listType:'click',parent:this.book,listenerFn:'addelement',key:'image',mapTo:scope},
		         {tag:'.addaudio',listType:'click',parent:this.book,listenerFn:'addelement',key:'audio',mapTo:scope},
		         {tag:'.addhtml',listType:'click',parent:this.book,listenerFn:'addelement',key:'html',mapTo:scope},
		         {tag:'.addheading',listType:'click',parent:this.book,listenerFn:'addelement',key:'heading3',mapTo:scope},
		         {tag:'.addsubtopic',listType:'click',parent:this.book,listenerFn:'addelement',key:'subtopic',mapTo:scope},
		         {tag:'.addimageset',listType:'click',parent:this.book,listenerFn:'addelement',key:'imageset',mapTo:scope},
		         {tag:'.addinfo',listType:'click',parent:this.book,listenerFn:'addelement',key:'info',mapTo:scope},
		         {tag:'.addalert',listType:'click',parent:this.book,listenerFn:'addelement',key:'alert',mapTo:scope},
		         {tag:'.addother',listType:'click',parent:this.book,listenerFn:'addelement',key:'other',mapTo:scope}];
	}
	
	,editAssessListeners:function(scope){
		 return [{tag:'.addmcq',listType:'click',parent:this.book,listenerFn:'addelement',key:'mcq',mapTo:scope},
		         {tag:'.addtorf',listType:'click',parent:this.book,listenerFn:'addelement',key:'torf',mapTo:scope},
		         {tag:'.addfill_blank',listType:'click',parent:this.book,listenerFn:'addelement',key:'fill_blank',mapTo:scope}];
	}
	
	,enableTopBtns:function(selected){
		var chapter;
		if(selected){
			chapter = this.retrieveElem(selected,'chapter');
			if(chapter){
				divi.listeners.attachListenersWS(this.btnListeners(chapter),this);
			}
		}
	}
	
	,startup:function(){
		this.book = new divi.book({home:this});
		this.loadBook();
		divi.listeners.attachListenersWS(this.defaultListeners(),this);
	}
	
	,preparepopUp:function(elem){
		var popupDiv = this.retrievePopUpDiv();
		width = elem.popWdith || '60%';
		var dlgConfig  = {position: "top",autoOpen: false,modal: true,width: width, buttons: {Cancel:{scope:this,fn:this.cancelDailog}},close:{scope:this,fn:'cancelDailog'}};
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
		        {tag:'.addchapter',listType:'click',parent:this.book,listenerFn:'addcontent',mapTo:this.book,key:'chapter'},
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
	,insertContent:function(){
		
	}
});
var home = new divi.home({});