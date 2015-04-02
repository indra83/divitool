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
			var scope = btnProps.scope,tabi = btnProps.tabindex;
			var props = btnProps.fn;
			var click, buttonOptions;
			props = $.isFunction( props ) ?
				{ click: props, text: name } :
				props;
			// Default to a non-submitting button
			props = $.extend( { type: "button",tabindex:tabi}, props );
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
	EMBED_ENGINE = 'formulaEditor1.html';
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
    countKey:'_count',
    padMax:3,
    modalKey:'',
    moveUp:'Move Up',
    moveDown:'Move Down',
    editKey:'editElem',
    editableDiv:'editableDiv',
    contentPreview:'.contentPreview',
    contents:{},
    deleteElems:['.deleteWin','.cancelWin'],
    defaultImgExtension:'.png',
    cmKey:'.contextmenu',
    dlEvents:'click',
	popupKey:'.popup',
	htmlKey:'.dialog-html',
	equations:'./equations',
	comboMaster:{},
	listenerKey:'editor',
	tabsKey:'tabs',
	tagsData:{},
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

	dlgDflts:{shadow: true,overlay: false,icon: '',width: '100%',height:'100%',padding: 10,sysButtons: {btnClose: true},overlayClickClose:false},

    constructor: function (cfg) {
    	$.extend(this, cfg);
    	this.data = {};
    	this.values = {};
    	this.tagsData = {};
    	divi.appBase.superclass.constructor.call(this);
        this.startup();
    }

	,startup:function(){
		this.initializeValues();
	}


	,initiliazeEditor:function(){

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

	,readTags:function(data){
		var tags_json = {};
		var tagsData = [];
		if(data){
			tags_json = JSON.parse(data);
			for(var eachEntry in tags_json){
				if(tags_json.hasOwnProperty(eachEntry)){
					tagsData.push({id:tags_json[eachEntry]['id'],description:tags_json[eachEntry]['name']});
				}
			}
		}
		this.setTagsData(tagsData);
		if($.isEmptyObject(this.getData()['tags'])){
			this.setData({'tags':this.getTagsData()},true);
		}
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

	,destroydoms:function(elem){
		elem = elem || this;
		var crr,crref,doms = elem.divs;
		for(var ech in doms){
			if(doms.hasOwnProperty(ech)){
				crr = elem.doms[doms[ech]];
				if(crr && crr.id){
					crref =  crr.id;
					divi.eventBase.destroy(crref);
					divi.domBase.destroy(crref);
				}
			}
		}
	}

	,loadCombos:function(book){
		if(book){
			this.setData({});
			this.setComboMaster({});
			this.licenseData();
			this.boxInfoData();
			this.difficultData();
			this.assessTypeData();
			this.setData({'tags':this.getTagsData()},true);
		}
	}

	,cleanValues:function(values,key){
		var key = this.htmlValKey;
		if(key){
			var eachElem,keys =  this.htmlValKey.split(',');
			for(var i=0;i < keys.length;i++){
				eachElem = keys[i];
				if(eachElem){
					value = values[eachElem];
					value = this.prepareResourcePath(value,this.getHtmlLoc(),this.imageLocExact);
					value = this.prepareResourcePath(value,this.getEquationsLoc(),this.equationLocExact);
					values[eachElem] = value;
				}
			}
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

	,setTagsData:function(values){
		divi.appBase.prototype.tagsData = values;
	}

	,getTagsData:function(){
		return divi.appBase.prototype.tagsData;
	}

	,getComboMaster:function(){
		return divi.appBase.prototype.comboMaster;
	}

	,getDeleteElems:function(){
		return this.deleteElems;
	}

	,confirmDelete:function(event,scope,target,text){

	}

	,deletefn:function(event,val,jTarget,previewKey){
		$.showLoader();
		this.show('Delete',previewKey);
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

	,modifyForm:function(form){

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
		$('.metro').removeClass('fix-body');
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

	,saveBook:function(book,fileOps){
		fileOps = fileOps || {};
		book = book || this.retrieveBook(this)
		if(book){
			window.URL = window.webkitURL || window.URL;
	         window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
	         var file = new Blob([JSON.stringify(book.stringify(true), undefined, 2)]);
	         file.name = fileOps.fileName || this.masterFile;
	         url = fileOps.url || this.savefileAction;
	         var prs = {url:url,data:[file]};
	         if(!fileOps.isChildexists && fileOps.attachCb){
	        	 $.extend(prs,{succcb:this.drawOnSuccess,context:this});
	         }else{
	        	 $.extend(prs,{skipLoader:true,context:this});
	         }
			 book.persist(prs);
		}
	}

	,persistData:function(elem,url,fileName,fileops){
		fileops = fileops || {};
		var attachCb = true;
		if(fileops.hasOwnProperty('attachCb')){ attachCb = fileops['attachCb'];}
		 var book = elem || this.retrieveBook(this);
		 if(book){
			 var isChildexists = this.childExists();
	         this.saveBook(book,{attachCb:attachCb,isChildexists:isChildexists,fileName:fileName,url:url});
	         if(isChildexists){
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
		var parms  = {url:url,data:[file]};
		if(attachCb){
			$.extend(parms,{skipLoader:true});
		}
		scope.persist(parms);
		var ops = {url:url,data:files};
		if(attachCb){
			$.extend(ops,{succcb:this.drawOnSuccess,context:scope});
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
		var count = this.parent.getFieldValue(this.countKey);
		count = !count? 1 : ++count;
		return count;
	}

	,updateId:function(event,targetVal,target){
		var scope = event.data.scope;
		var form = scope.scope;
		var parent = form.scope;
		if(parent && form){
			var values = {};
			values[this.name] = targetVal;
			parent.setParent(parent,values);
			form.setValue('id',parent.prepareId());
		}
	}

	,addToCount:function(){
		var cnt = this.parent.getFieldValue(this.countKey);
		if(!cnt){
			cnt = 0;
		}else{
			cnt = parseInt(cnt);
		}
		if(cnt >= 0){
			this.setCount(cnt+1);
		}
	}

	,setCount:function(id){
		if(id){
			this.parent.setValueForKey(this.countKey,id);
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
		$.showLoader();
		var values = this.prepareSubmitValues(scope,form);
		if(scope.isNew){
			var key = scope.table;
			var lookupKey = this.pluralize(key);
			this.initilizeChild(scope.parent,lookupKey);
			this.addChild(scope.parent,lookupKey,scope);
			scope.addToCount();
		}
		if(form){
			scope.update(form,values);
		}
		divi.home.prototype.cancelDailog(event);
	}

	,submitForm:function(b,e){
		$('.metro').removeClass('fix-body');
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
			var eachElem,keys =  this.htmlValKey.split(',');
			for(var i=0;i < keys.length;i++){
				eachElem = keys[i];
				if(eachElem){
					value = values[eachElem];
					value = this.prepareResourcePath(value,this.imageLocExact,this.getHtmlLoc());
					value = this.prepareResourcePath(value,this.equationLocExact,this.getEquationsLoc());
					values[eachElem] = value;
				}
			}
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

	,launchPopUp:function(instance,edit){
		if(instance){
			instance.home.preparepopUp.call(instance.home,instance);
			var popupDiv = this.retrievePopUpDiv();
			popupDiv.empty().removeClass('hidden').superDialog('open');
			instance.showContent(popupDiv,false,edit);
			var mydialog = popupDiv.superDialog();
			var newButtons = {};
			var tabi = 1;
			if(instance.formPanel){
				tabi = instance.formPanel.fieldCount;
			}else if(instance.fieldCount){
				tabi = instance.fieldCount+1;
			}
			$('.metro').addClass('fix-body');
			var cancelScope = instance.cancelDailog ? instance : instance.home;
			$.extend(newButtons,{ 'Submit':{scope:instance,fn:instance.submitForm,tabindex:tabi},'Cancel':{scope:cancelScope,fn:cancelScope.cancelDailog,tabindex:tabi+1}});
			mydialog.superDialog("option", "buttons", newButtons);
			
			$('.metro .ui-dialog .ui-dialog-buttonset .ui-button.ui-widget.ui-state-default.ui-corner-all.ui-button-text-only').first().prepend('<img src="/tool/assets/images/crux.png">');
			$('.metro .ui-dialog .ui-dialog-buttonset .ui-button.ui-widget.ui-state-default.ui-corner-all.ui-button-text-only').last().prepend('<img src="/tool/assets/images/graycross.png">');
			
		}
	}


	,getSiblings:function(scope){
		var children;
		if(scope){
			var parent = scope.parent;
			if(parent){
				children = parent.elements;
			}
		}
		return children;
	}

	,rearrange:function(scope,pushUp,pushDown,event,jTarget){
		$.showLoader({text:'Re-arranging'});
		var siblings = this.getSiblings(scope);
		if(siblings){
			var index = siblings.indexOf(scope);
			var frind = pushUp? index-1 : index+1;
			console.log("index: "+frind);
			siblings.remove(scope);
			console.log("siblings: "+siblings.length);
			siblings.splice(frind, 0, scope);
			this.loadPostRearrange();
			jTarget.scrollintoview();
		}
		$.hideLoader();
	}
	
	,loadPostRearrange:function(){
		this.parent.persistData(null,null,null,{attachCb:true});
		this.getSelector(this.contentPreview).empty();
	}

	,rearrangeElemClick:function(event,val,jTarget){
		var scope = event.data.scope;
		if(!jTarget.parent().hasClass('disabled')){

			var pushUp = jTarget.hasClass('icon-arrow-up') || jTarget.children().hasClass('icon-arrow-up');
			this.rearrange(scope,pushUp,!pushUp,event,jTarget);
		}
	}

	,getchildrenForParent:function(scope){
		return scope.elements;
	}

	,enableRearrange:function(scope){
		var children = this.getchildrenForParent(scope);
		var eachChild,elems = [],parent;
		for(var ind in children){
			if(children.hasOwnProperty(ind)){
				elems = [];
				eachChild = children[ind];
				jdom = eachChild.doms[this.divs['preview']];
				var index = children.indexOf(eachChild);
				if(index != children.length-1){
					parent = jdom.find('.icon-arrow-down').parent(),parent.removeClass('disabled'),elems.push(parent);
				}
				if(index != 0){
					parent = jdom.find('.icon-arrow-up').parent(),parent.removeClass('disabled'),elems.push(parent);
				}
				divi.listeners.attachElementListeners(elems,eachChild,null,eachChild.rearrangeKey,eachChild.dlEvents);
			}
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
		var elems = this.getDeleteElems();
		if(elems){
			divi.listeners.attachElementListeners(this.getDeleteElems(),this,null,key,this.dlEvents);
		}
	}

	,destroy:function(){
		divi.listeners.removeListeners(this.elems,this.events);
		$('.window-overlay').remove();
	}

	,buttonClick:function(event){
		var scope = this;
		var target = divi.util.getTarget(event);
		var text = target.innerText;
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
		$.hideLoader();
	}

	,loadFile:function(url,ops,fileName){
		var scope = this;
		var url = url || this.prepareFilePath(this,null,this.getFileAction);
		fileName = fileName || scope.fileName;
		ops = ops || {};
		var dataType = ops.dataType ? ops.dataType : "xml";
		var requestType = ops.requestType ? ops.requestType : "GET";
		var data = {};
		if(ops){
			$.extend(data,ops.data);
		}
		$.ajax({dataType: dataType,type:requestType,url:divi.core.prepareUrl(url,fileName),data:data}).done(function (data) {scope.readFile(data);}).fail(function (data) {scope.readFileFail(data);});
	}

	,readFile:function(data){
		var topicChild = data? data.firstChild : undefined;
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
						eachElem.addChild(selected,'',eachElem);
						eachElem.loadElement(eachChild,parentCont);

					}
				}
			}
			this.activateElements();
		}
	}

	,activateElements:function(){
		$('.carousel').carousel({auto: false,period: 3000,duration: 2000,height:'100%',markers: {type: "square",position:"bottom-center"}});
		this.enableRearrange(this);
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
		var skipLoader = fileOps.hasOwnProperty("skipLoader") ? fileOps.skipLoader : false;
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
			 xhr.reqOps = {cb:callback,scope:context};
		     xhr.open('POST', url, true);
		     xhr.send(formData);
			if(!skipLoader){
				$.hideLoader();
			}
		}
		 xhr.onreadystatechange=function(){
        	if (xhr.readyState==4 && xhr.status==200){
        		var cbOps = xhr.reqOps;
    			if(cbOps && cbOps.cb){
    				cbOps.cb.call(cbOps.scope,xhr.responseText);
    				$.hideLoader();
    			}
        	}
    		return;
        }
		return xhr;
	}
});

divi.elementbase = divi.extend(divi.appBase,{
	countKey:'_elemCount',
	table:'',
	preview:'prev',
	deleteKey:'deletekey',
	rearrangeKey:'rearrangeKey',
	deleteElem:'.ui-cancelRemove',
	elemTable:'eachHeader',
	ignoreFields:['id','src','thumb','references'],
	referenceFields:['source','name','url','license','blooms','difficulty','languageLevel'],
	doms:{},
	divs:{'preview':'previewDom'},
	tpl:undefined,
	elemTpl:undefined,
	listeners:{},
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.elementbase.superclass.constructor.call(this);
		this.doms = {};
		this.initialTpl();
		this.initElemTpl();
		this.listeners[this.editKey] = {},this.listeners[this.deleteKey] = {};
		this.listeners[this.editKey]=  {'click':[this.editElemClick]},
		this.listeners[this.deleteKey]=  {'click':[this.deleteElemClick]};
		this.listeners[this.rearrangeKey]=  {'click':[this.rearrangeElemClick]};
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

	,getDeleteElems1:function(){
		var elems = $(this.elemTpl).find(this.deleteElem);
		var baseElem;
		if(!divi.util.isjQEmpty(elems)){
			baseElem = [elems[0]];
		}
		return baseElem;
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

	,confirmDelete:function(event,scope,target,text){
		this.beforeDelete(event);
		this.parent.persistData(null,null,null,{attachCb:true});
		this.getSelector(this.contentPreview).empty();
		$.hideLoader();
	}


	,beforeDelete:function(event,val,jTarget){
		var children = this.parent.elements;
		if(children){
			children.remove(this);
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
		var refNodeCheck = "references";
		for(var index = 0;index < children.length;index++){
			var key = children[index];
			if(key.tagName == refNodeCheck){
				refNode = key;
			}else{
				values[key.tagName] = key.textContent;
			}
		}
		for(var index = 0;index < attributes.length;index++){
			var key = attributes[index];
			values[key.nodeName] = key.value;
		}
		return refNode;
	}

	,populateValues:function(currNode){
		values = {};
		var refNode = this.loadValues(currNode,values);
		values = this.prepareLoadValues(currNode,values);
		this.setValues(values);
		if(this.reference && refNode){
			this.reference.populateValues(refNode);
		}
	}

	,loadElement:function(currNode,appendSel){
		this.populateValues(currNode);
		var elemDom = $.tmpl(this.elemTable,{});
		dom = this.drawElement(elemDom);
		this.doms[this.divs['preview']] = elemDom;
		appendSel.append(elemDom.append(dom));
		this.enableEditList(elemDom);
	}

	,editElemClick:function(event){
		var scope = event.data.scope;
		var target = divi.util.getTarget(event);
		scope.parent.launchElem(scope,scope.key);
	}

	,deleteElemClick:function(event,val,jTarget){
		var scope = event.data.scope;
		var target = divi.util.getTarget(event);
		this.deletefn(event,val,jTarget);
	}

	,enableEditList:function(scope){
		var insideElem = scope.find('div.insideElem');
		divi.listeners.attachElementListeners([insideElem],this,null,this.editKey,this.dlEvents);
		var deleteBtn = scope.find('button.ui-cancel');
		divi.listeners.attachElementListeners([deleteBtn],this,null,this.deleteKey,this.dlEvents);
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
		  this.persistChild(true);
		  this.saveBook.call(this.parent,null,{attachCb:false,isChildexists:false});
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
			var values = this.modifyValues(values,updated);
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

	,padCount:function(){
		return divi.util.pad(this.getCount(),this.padMax);
	}

	,prepareId:function(){
		var id = this.idPrefix+this.padCount();
		return id;
	}

	,attachpreContent:function(appendTo,showToggle){

	}

	,attachpostContent:function(appendTo,showToggle){

	}

	,showContent:function(appendTo,showToggle,index){
		var appendElem = $(appendTo);
		if(this.reference && this.tagging){
			index = index || 1;
			var index2 = (100-index),index3 = (50-index);
			appendElem.append($.tmpl(this.tabsKey,{i1:index,i2:index2,i3:index3}));
			appendElem = appendElem.find('._page_'+index);
			this.attachpreContent(appendElem, showToggle);
			this.prepareForm.call(this.reference,appendElem.parent().find('._page_'+index2),showToggle);
			this.prepareForm.call(this.tagging,appendElem.parent().find('._page_'+index3),showToggle);
		}else if(this.reference){
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
		this.modifyForm(this.formPanel);
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
		}
	}
});

divi.tags = divi.extend(divi.elementbase,{
	table:'tags',
	isTagging:true,
	evtDflts:{attachLis:true,events:['change']},
	ignoreFields:['blooms','difficulty','languageLevel','points','tags'],
	divs:{'diff':'diff','points':'points','level':'level','blooms':'blooms','tags':'tags','preview':'previewDom'},
	bloomsValues:['None','Knowledge','Understanding','Application','Hots'],
	doms:{},
	blooms:{},
	constructor: function (cfg) {
		$.extend(this,cfg);
		this.doms = {};
		this.blooms = {};
		divi.tags.superclass.constructor.call(this);
	}

	,prepareLoadValues:function(currNode,values){
		if(values.hasOwnProperty('tag')){
			var nodeList = currNode.children,tagsValue = [],key;
			for(var index = 0;index < nodeList.length;index++){
				key = nodeList[index];
				tagsValue.push(key.getAttribute("id"));
			}
			values['tags'] = tagsValue;
			delete values['tag'];
		}
		return values;
	}


	,editTags:function(){
		var tagsata = this.getTagsData();
		/*for(){

		}*/
	}


	,modifyValues:function(values,updated){
		values =  updated;
		return values;
	}

	,prepareForm:function(appendElem){
		appendElem.append('<div class="thirddiv"></div>');
		var thirddiv = appendElem.find(".thirddiv");
		inptDflts = {tag:'div',scope:this,name:'tags','class':'combofield tagsDD'};
		thirddiv.append("<label>Related Topics: </label>");
		elem = this.doms[this.divs.tags] || divi.domBase.create(inptDflts,thirddiv);
		$(elem.dom).attr('id',elem.id);
		var selElem = {name:"tags","listener": "tags",events:['change'],scope:this,listeners:{'change':[this.ontagsChange]},isMultiple:true};
		divi.formPanel.prototype.invokeComboListener.call(this,elem.dom,selElem,this.getData(),elem)
		$(elem.dom.firstChild).val(this.getFieldValue('tags')).trigger('chosen:updated');

		appendElem.append('<div class="firstdiv"></div>');
		var firstDiv = appendElem.find(".firstdiv");
		var diffDom = $('<div class="elemDom"></div>');
		diffDom.append('<label>Difficulty Level: </label>');
		firstDiv.append(diffDom);

		dom =  this.doms[this.divs.diff] = divi.domBase.create({tag:'div','class':'diff rating',scope:this},diffDom);
		var ptsField = new divi.form.numberfield({name:"points",value:(this.getFieldValue('points') || 1),defaultCss:'formfield points',"desc": "Points",scope:this,listeners:{'change':[this.onpointsChange]}});
		divi.domBase.append(firstDiv,ptsField.dom);

		var leveldom = $('<div class="elemDom"></div>');
		leveldom.append('<label>Language Level: </label>');
		firstDiv.append(leveldom);
		dom =  this.doms[this.divs.level] = divi.domBase.create({tag:'div','class':'level rating',scope:this},leveldom);

		appendElem.append('<div class="seconddiv"></div>');
		var seconddiv = appendElem.find(".seconddiv");
		var bloomsdom = $('<div class="bloomsdiv"><label>Blooms: </label></div>');
		var inptDflts = $.extend({tag:'input',type:"radio",scope:this,name:'blooms','data-transform':'input-control',listeners:{'change':[this.onbloomsChange]}},this.evtDflts);
		var eachEntry,currdflts,elem;
		var bloomsVal = this.getFieldValue('blooms') || "NONE";
		for(var entry in this.bloomsValues){
			if(this.bloomsValues.hasOwnProperty(entry)){
				currdflts = {};
				delete inptDflts.ref;
				$.extend(currdflts,inptDflts);
				eachEntry = this.bloomsValues[entry];
				$.extend(currdflts,{'ref':eachEntry});
				if(bloomsVal == eachEntry.toUpperCase()){
					$.extend(currdflts,{'checked':'checked'});
				}
				elem = this.blooms[eachEntry] || divi.domBase.create(currdflts,bloomsdom);
				$(elem.dom).attr('id',elem.id);
				bloomsdom.append('<label>'+eachEntry+'</label>');
			}
		}
		seconddiv.append(bloomsdom);
	}

	,ontagsChange:function(event,targetVal,target){
		var scope = event.data.scope.scope;
		scope.setValueForKey('tags',targetVal);
	}

	,updateRating:function(value,fieldname){
		var values = this.getValues();
		values[fieldname] = value;
		this.setValues(values);
	}

	,onpointsChange:function(event,targetVal,target){
		var scope = event.data.scope.scope;
		scope.setValueForKey('points',targetVal);
	}

	,onbloomsChange:function(event,targetVal,target){
		var scope = event.data.scope;
		scope.setValueForKey('blooms',target.attr('ref'));
	}

	,prepareParentDom:function(dom,childdom,values,parent){
		if(childdom){
			var bloomsVal = values['blooms'] || "None";
			childdom.setAttribute('blooms',bloomsVal.toUpperCase());
			childdom.setAttribute('difficulty', values['difficulty'] || 1);
			childdom.setAttribute('languageLevel', values['languageLevel'] || 1);
		}
	}

	,addSplValues:function(dom,child,values,parent){
		var tags = values['tags'];
		if(tags){
			for(var eachSplt in tags){
				if(tags.hasOwnProperty(eachSplt) && tags[eachSplt]){
					data = dom.createElement('tag');
		            data.setAttribute("id",tags[eachSplt]);
		            child.appendChild(data);
				}
			}
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
	notagging:true,
	reference:undefined,
	tagging:undefined,
	tpl:undefined,
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.element.superclass.constructor.call(this);
		if(!this.noreference && !this.notagging){
			this.reference = new divi.references({parent:this});
			$.template(this.tabsKey,divi.tpl.alltabs);
			this.tagging = new divi.tags({parent:this});
		}else if(!this.noreference){
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
		scope.attachElement(scope.appendElem, scope.showToggle,scope.elems.length+1,null,true);
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

divi.youtube = divi.extend(divi.element,{
	ignoreFields:['youtubeId','id'],
	table:'youtube',
	idCount:1,
	idPrefix:'yt',
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.youtube.superclass.constructor.call(this);
	}

	,addAddValues:function(dom,childdom,values,parent){
		if(childdom){
			childdom.removeAttribute('thumb');
			childdom.removeAttribute('src');
			childdom.setAttribute('youtubeId', values['youtubeId']);
		}
	}
});


divi.application = divi.extend(divi.element,{
	ignoreFields:['appVersionCode','appPackage','id','src','activityName'],
	table:'application',
	idCount:1,
	idPrefix:'app',
	noreference:true,
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.application.superclass.constructor.call(this);
	}

	,validateForm:function(form){
		var elem,isValidForm = false;
		if(form){
			isValidForm = form.validateForm();
			var srcField = form.elementsMap['src'];
			if(srcField.getValue()){
				var appVersionCode = form.elementsMap['appVersionCode'].getValue();
				if(!appVersionCode){
					isValidForm = false;
					alert('Please enter the app version code.');
				}
			}
		}
		return isValidForm;
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
	
	,addAddValues:function(dom,childdom,values,parent){
		if(childdom){
			childdom.removeAttribute('thumb');
			childdom.setAttribute('appVersionCode', values['appVersionCode']);
			childdom.setAttribute('appPackage', values['appPackage']);
			childdom.setAttribute('activityName', values['activityName']);
		}
	}
});

divi.heading3 = divi.extend(divi.element,{
	table:'heading3',
	modalKey:'Heading',
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
	modalKey:'Text',
	idCount:1,
	supressFields:['boxType','boxTitle'],
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

	,attachpostContent:function(appendTo,showToggle){
		this.formPanel.hideField('boxType');
		this.formPanel.relaxRequired('boxType');
		this.formPanel.hideField('boxTitle');
		this.formPanel.relaxRequired('boxTitle');
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

		var children = child.children;
		for(var index = 0;index < children.length;index++){
			var key = children[index];
			if(this.supressFields.contains(key.nodeName) && !key.textContent){
				//child.children.splice();
			}
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
		delete values.boxType;
		delete values.boxTitle;
		divi.appBase.prototype.persistChild.call(scope,true);
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
	modalKey:'Slides',
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
		dom = this.drawElement(elemDom);
		appendSel.append(elemDom.append(dom));
		this.doms[this.divs['preview']] = elemDom;
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
		var children = child.children,childDom;
		for(var index = 0;index < children.length;index++){
			var key = children[index];
			childDom = $(key);
			childDom.removeAttr('allowfullscreen');
			childDom.removeAttr('hasText');
			childDom.removeAttr('showborder');
			childDom.find('title').remove();
		}
	}

	,prepareSubmitValues:function(scope,form){
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
		var elem,backUp = appendTo;
		
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
		elem.formPanel.hideField('title');
		elem.formPanel.relaxRequired('title');
		elem.formPanel.hideField('allowFullscreen');
		elem.formPanel.relaxRequired('allowFullscreen');
		elem.formPanel.hideField('hasText');
		elem.formPanel.relaxRequired('hasText');
		elem.formPanel.hideField('showBorder');
		elem.formPanel.relaxRequired('showBorder');
		this.attachCloseLis(parentDom.find('.closeIcon'),elem);
	}

});

divi.mslides = divi.extend(divi.imageset,{
	table:'mslides',
	ignoreFields:['id','title','images'],
	idCount:1,
	noreference:false,
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.mslides.superclass.constructor.call(this);	
	}

	,attachpostContent:function(appendTo,showToggle){
		divi.element.prototype.attachpostContent.call(this,appendTo,showToggle);
	}
	
	,prepareSubmitValues:function(scope,form){
		var values = divi.appBase.prototype.prepareSubmitValues.call(this,scope,form);
		this.setValues(values);
		var files = this.files = form.files;
		var eachFile,eachElem;
		for(var i=0;i< files.length;i++){
			eachFile = files[i];
			eachElem = this.prepareImageElement(true);
			if(eachElem){
				eachElem.setValueForKey('src',eachFile.name);
				eachElem.reference.setValues(this.reference.getValues());
			}
		}
		this.noreference = true;
		this.reference = null;
	}
	
	,getPersistValues:function(dom,parent,attachParent,tag){
		divi.elementbase.prototype.getPersistValues.call(this,dom,parent,attachParent,"imageset");
	}
	
	,prepareImageElement:function(isNew){
		var elem = new divi.image({parent:this,isNew:true,home:this.home});
		if(isNew){
			var count =	this.elems.length;
			this.elems[count] = elem;
		}
		elem.setValueForKey('id', elem.guid());
		elem.setValueForKey('allowFullscreen',false);
		elem.setValueForKey('showBorder',false);
		return elem;
	}
	
});



divi.image = divi.extend(divi.element,{
	tag:'img',
	ignoreFields:['id','src','allowFullscreen','showBorder','hasText'],
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
			childdom.setAttribute('hasText', values['hasText']);
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


divi.multipleImage = divi.extend(divi.element,{
	tag:'img',
	table:'mulImage',
	idCount:1,
	idPrefix:'mulImage',
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.multipleImage.superclass.constructor.call(this);
	}
});

divi.bookBase = divi.extend(divi.appBase,{
	home:undefined,
	idPrefix:undefined,
	idCount:undefined,
	masterFile:'master.json',
	tagFile:'tags.json',
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
			var lidom = this.getLiDom();
			d.preventDefault();
			d.stopPropagation();
			var a = this,b =jTarget.parent().children('ul.slidedown-menu');
			b.closest('li.stick').parent().find('li').removeClass('selected');
            "block" != b.css("display") || b.hasClass("keep-open") ? ($(".slidedown-menu").each(function (d, e) {
                b.parents(".slidedown-menu").is(e) || ($(e).hasClass("keep-open") ||
                    "block" != $(e).css("display")) || a._close(e)
            }), a._open(b,lidom.dom)) : a._close(b)
		}
	}

	,getLiDom:function(){
		return this.doms[this.divs['liDiv']];

	}
	,_open: function (a,dom) {
		if(dom){
			$(dom).addClass('selected');
		}
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
    

	
	,retrieveCmChild:function(dom,text){
		var children = dom.children(),textDom,currDom;
		$.each(children,function(key,value){
			currDom = $(value);
			if(currDom.html() == text){
				textDom = currDom;
			}
		});
		return textDom;
	}
	
	,filterContextMenu:function(dom){
		var siblings = this.getSiblings(this);
		var index = siblings.indexOf(this),length = siblings.length-1;
		$(dom).children().removeClass('hidden');
		if(index != -1 && (index == 0 || index == length)){
			var key = index == 0 ? this.moveUp : this.moveDown;
			parDom = $(dom);
			currDom = this.retrieveCmChild(parDom,key);
			currDom.addClass('hidden');
			if(length == index){
				currDom = this.retrieveCmChild(parDom,this.moveDown);
				currDom.addClass('hidden');	
			}
		}
    	return dom;
    }
	
    
	,toggleContextMenu:function(event,val,jTarget){
		event.preventDefault();
		event.stopPropagation();
		var text = jTarget.val();
		if(this.cmDom){
			this.getSelector(this.cmKey).hide().empty().append(this.filterContextMenu(this.cmDom.dom)).css({top: event.pageY + "px", left: event.pageX + "px"}).show();
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

	,showContent:function(appendTo,showToggle,edit){
		if(!this.formPanel){
			this.formPanel = new divi.formPanel({data:this.table,scope:this,comboData:this.getData()});
		}
		if(!this.formPanel.toggle && showToggle){
			$.extend(this.formPanel,{toggle:true});
			this.formPanel.createToggle();
		}
		this.formPanel.draw(appendTo);
		this.formPanel.setValues(this.getValues(edit));
		this.modifyForm(this.formPanel);
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
			this.prepareSideBar(parDom,false,currKey,currSeq);
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


	,addElem:function(val,jTarget,key){
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
		this.launchPopUp(this,true);
	}

	,rearrange:function(event,val,jTarget){
		var scope = event.data.scope;
		var text = jTarget.html();
		var pushUp = text == this.moveUp ? true : false;
		divi.appBase.prototype.rearrange.call(scope,scope,pushUp,!pushUp,event,jTarget);
	}
	
	,loadPostRearrange:function(){
		var parent = this.parent;
		parent.persistData(null,null,null);
		var childKeys = parent.childrenKeys;
		for(var i=0;childKeys && i< childKeys.length;i++){
			currKey = childKeys[i];
			var siblings = this.getSiblings(this,currKey);
			for(var eachSib in siblings){
				if(siblings.hasOwnProperty(eachSib)){
					siblings[eachSib].destorySideBar();
				}
			}
		}
		this.getSelector(this.contentPreview).empty();
		var ulDiv = parent.doms[parent.divs['ulDiv']]
		if(ulDiv){
			parent.prepareSideBarChildren(ulDiv.dom,true);
		}
		var book = this.retrieveBook();
		book.home.updateBcrumb(book);
		$.hideLoader();
	}
	
	,getSiblings:function(scope,key){
		var children;
		if(scope){
			key = key || this.pluralize(this.table);
			var parent = scope.parent;
			if(parent){
				children = parent.children[key];
			}
		}
		return children;
	}
	
	,reloadParent:function(event,scope,target,text){
		this.parent.persistData(null,null,null,{attachCb:true});
		this.getSelector(this.contentPreview).empty();
		var book = this.retrieveBook();
		book.draw();
		book.home.updateBcrumb(book);
		$.hideLoader();
	}
	
	,confirmDelete:function(event,scope,target,text){
		this.beforeDelete(event);
		this.reloadParent();
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
					childDom = divi.domBase.create($.extend(this.cmItemDflts,{tag:'div',scope:this,prefix:'sidebar_',value:ech,attachLis:true,listeners:this.listeners[this.rclickKey]}),parDom.dom);
					childDom.dom.setAttribute('id',childDom.id);
				}
			}
		}
		this.cmDom = parDom;
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
	navDflts:{tag:'nav','class':'sidebar divi medium'},
	ulDflts:{tag:'ul'},
	divs:{'navDiv':'navDiv','ulDiv':'ul','preview':'previewDom'},
	constructor : function (cfg) {
		$.extend(this,cfg);
		divi.book.superclass.constructor.call(this);
	}

	,init:function(){
		divi.bookBase.prototype.init.call(this);
		this.preview();
	}

	,bookListeners:function(){
		return [{tag:'.btnBkOverview',listType:'click',mapTo:this,listenerFn:'showEditor'},
		        {tag:'.bookEdit',listType:'click',mapTo:this,listenerFn:'showEditor'}];
	}

	,preview:function(){
		this.getSelector(this.contentPreview).empty().html(divi.tpl.book);
		divi.listeners.attachListenersWS(this.bookListeners(),this.home);
		this.home.enableTopEditBtns(this);
		this.home.updateBcrumb(this);

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

	,modifyForm:function(formPanel){
		if(formPanel){
			formPanel.setReadOnly();
			$(formPanel.dom).addClass('marginbtm');
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
	divs:{'liDiv':'liDiv','aDiv':'oLinkDiv','ulDiv':'iUlDiv','preview':'previewDom'},
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
    
    ,filterContextMenu:function(dom){
    	return dom;
    }
    
	,beforeDelete:function(event){
		var lookupKey = this.pluralize(this.table);
		var children = this.parent.children[lookupKey];
		if(children){
			children.remove(this);
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
			this.prepareSideBarChildren(ulDiv.dom,toClean);
		}
	}
	
	,prepareSideBarChildren:function(ulDivDom,toClean){
		this.attachChildren(ulDivDom,toClean,'prepareSideBar',false,false);
	}
});


divi.topic = divi.extend(divi.bookBase,{
	parent:undefined,
	fileName:'topic.xml',
	elements:[],
	table:'topic',
	statediting:false,
	idPrefix:'t',
	counts:{},
	idCount:1,
	sequence:undefined,
	divs:{'liDiv':'liDiv','aDiv':'oLinkDiv','iconDiv':'iconDiv','preview':'previewDom'},
	lidDefaults:{tag:"li",prefix:'sidebar_'},
	aDefaults:{tag:"a",href:"#",prefix:'sidebar_',attachLis:true},
	iconDefaults:{tag:'img',src:"/tool/assets/images/bullet.png",prefix:'sidebar_'},
	comboKey:'topic',

	constructor : function (cfg) {
		this.parent = undefined;
		$.extend(this,cfg);
		this.listeners[this.rclickKey] = {'click':[this.onCmClick]};
		divi.topic.superclass.constructor.call(this);
		var parent = $('.contextmenu');
		this.cmItems = {'Edit':{fn:this.edit},'Delete':{fn:this.deletefn}};
		this.cmItems[this.moveUp] = {fn:this.rearrange};
		this.cmItems[this.moveDown] = {fn:this.rearrange};
		this.createContextMenu(this.cmItems);
		this.elements = [];
	}
	
	,launchElem:function(elem,key){
		divi.appBase.prototype.launchElem.call(this,elem,key);
		if(elem && elem.key == 'html' && !key){
			elem.formPanel.hideField('boxType');
			elem.formPanel.relaxRequired('boxType');
			elem.formPanel.hideField('boxTitle');
			elem.formPanel.relaxRequired('boxTitle');
		}
	}

	,modifyForm:function(formPanel){
		if(formPanel && !this.isNew){
			formPanel.setFieldReadOnly('chapter');
		}
	}

	,drawUpdate:function(){
		if(this.statediting){
			this.statediting = false;
			var valueDom = this.doms[this.divs['aDiv']];
			if(valueDom && valueDom.dom){
				var values = this.getValues();
				$(valueDom.dom).html('');
				iconDiv = this.doms[this.divs['iconDiv']] = divi.domBase.create( $.extend(this.iconDefaults,{scope:this}),valueDom.dom);
				valueDom.dom.innerHTML += values['name'];
			}
		}else{
			this.loadFile();
		}
	}

	,beforeDelete:function(event,val,jTarget){
		var lookupKey = this.pluralize(this.table);
		var children = this.parent.children[lookupKey];
		if(children){
			children.remove(this);
		}
		this.destorySideBar();
	}

	,destorySideBar:function(event,val,jTarget){
		var doms = this.doms[this.divs['liDiv']];
		var currDom = $(doms.dom);
		currDom.remove();
		this.destroydoms();
	}
	
	,getValues:function(edit){
		var values = {};
		$.extend(values,this.values);
		if(!edit){
			delete values.chapter;
		}else{
			this.statediting = true;
			$.extend(values,{chapter:this.parent.getFieldValue('id')});
		}
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
	statediting:false,
	isAssessment:true,
	elements:[],
	comboKey:'assessment',
	childrenKeys:['questions'],
	elements:[],
	sequence:undefined,
	getQuestions:'getQuestions',
	divs:{'liDiv':'liDiv','aDiv':'oLinkDiv','iconDiv':'iconDiv','preview':'previewDom'},
	lidDefaults:{tag:"li",prefix:'sidebar_'},
	aDefaults:{tag:"a",href:"#",prefix:'sidebar_',attachLis:true},
	iconDefaults:{tag:'i','class':"icon-snowflake",prefix:'sidebar_'},

	constructor : function (cfg) {
		this.parent = undefined;
		$.extend(this,cfg);
		this.listeners[this.rclickKey] = {'click':[this.onCmClick]};
		divi.assessment.superclass.constructor.call(this);
		this.questIds = [];
		this.elements = [];
		var parent = $('.contextmenu');
		this.cmItems = {'Edit':{fn:this.edit},'Delete':{fn:this.deletefn}};
		this.cmItems[this.moveUp] = {fn:this.rearrange};
		this.cmItems[this.moveDown] = {fn:this.rearrange};
		this.createContextMenu(this.cmItems);
	}
	
	,beforeDelete:function(event,val,jTarget){
		var lookupKey = this.pluralize(this.table);
		var children = this.parent.children[lookupKey];
		if(children){
			children.remove(this);
		}
		this.destorySideBar();
	}

	,destorySideBar:function(event,val,jTarget){
		var doms = this.doms[this.divs['liDiv']];
		var currDom = $(doms.dom);
		currDom.remove();
		this.destroydoms();
	}

	,modifyForm:function(formPanel){
		if(formPanel && !this.isNew){
			formPanel.setFieldReadOnly('chapter');
		}
	}

	,getValues:function(edit){
		var values = {};
		$.extend(values,this.values);
		if(!edit){
			delete values.chapter;
		}else{
			this.statediting = true;
			$.extend(values,{chapter:this.parent.getFieldValue('id')});
		}
		return values;
	}

	,persistChild:function(){
		// do nothing.
	}

	,drawUpdate:function(){
		if(this.statediting){
			this.statediting = false;
			var valueDom = this.doms[this.divs['aDiv']];
			if(valueDom && valueDom.dom){
				var values = this.getValues();
				$(valueDom.dom).html('');
				iconDiv = this.doms[this.divs['iconDiv']] = divi.domBase.create( $.extend(this.iconDefaults,{scope:this}),valueDom.dom);
				valueDom.dom.innerHTML += values['name'];
			}
		}else if(this.isAssessment){
			this.loadFile();
		}
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
				divi.appBase.prototype.loadFile.call(this,'../'+this.getQuestions,{data:{url:url,ids:questIds},dataType:'json',requestType:'POST'},divi.question.prototype.fileName);
			}
		}
	}

	,persistData:function(elem,url){
		divi.appBase.prototype.persistData.call(this);// save master.json
		this.persistCurr();
	}

	,persistCurr:function(){
		var url = this.prepareFilePath(this);
		divi.appBase.prototype.persistData.call(this,this,url,this.assessFile,{attachCb:false});// save assessments.json
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
				if(quesChild && quesChild.children.length > 2){
					var self = quesChild.children[1];
					var answers = quesChild.children[2].children;
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
		this.enableRearrange(this);
	}

	,getchildrenForParent:function(scope){
		return scope.children[this.childrenKeys[0]];
	}
});

divi.question = divi.extend(divi.element,{
	notagging:false,
	countKey:'_elemCount',
	ansCnt:1,
	addClose:true,
	maxansCnt:undefined,
	answers:[],
	popWdith:'80%',
	fieldCount:undefined,
	doms:{},
	elems:[],
	optionsKey:'options',
	optionKey:'option',
	isQuestion:true,
	editorKey:undefined,
	mainEditorCls:"question",
	divs:{'preview':'previewDom'},
	fileName:'question.xml',
	editors:{},
	answerKey:'answer',
// /noreference:true,
	ignoreFields:['data','references','id','version','type','_elemCount','points','tags','license','source','name','url'],
	table:'question',
	htmlValKey:'data',
	idCount:1,
	prssIndex:-1,
	editor:undefined,
	idPrefix:'Q',

	constructor : function (cfg) {
		$.extend(this,cfg);
		divi.question.superclass.constructor.call(this);
		this.fieldCount = 1;
		this.elems = [];
		this.doms = {};
	}

	,enableEditList:function(scope){
		var insideElem = scope.find('div').filter(function( index) {
		    return this.className != 'prevBtns';
		  });
		divi.listeners.attachElementListeners([insideElem],this,null,this.editKey,this.dlEvents);
		var deleteBtn = scope.find('button.ui-cancel');
		divi.listeners.attachElementListeners([deleteBtn],this,null,this.deleteKey,this.dlEvents);
	}


	,beforeDelete:function(event,val,jTarget){
		var lookupKey = divi.assessment.prototype.childrenKeys[0];
		var children = this.parent.children[lookupKey];
		if(children){
			children.remove(this);
		}
	}

	,padCount:function(){
		return this.getCount();
	}

	,initializeValues:function(){
		divi.appBase.prototype.initializeValues.call(this);
		this.values['type'] = this.type;
	}


	,prepareLoadValues:function(currNode,values){
		if(values.hasOwnProperty('tags')){
			var nodeList = currNode.getElementsByTagName ('tags');
			var tagsNode;
			if(nodeList.length > 0){
				tagsNode = nodeList[0];
			}
			if(!tagsNode){
				return;
			}
			this.tagging.populateValues(tagsNode);
			this.tagging.setValueForKey('points',values['points']);
			delete values['points'];
			delete values['tags'];
		}
		return values;
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
		this.doms[this.divs['preview']] = elemDom;
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
		delete values[this.optionsKey];
		delete values['html'];
		this.loadAnswers(questionChild,self,answers);
	}
	
	,loadAnswers:function(questionChild,self,answers){
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
		$.showLoader();
		if(scope.isNew){
			var key = divi.question.prototype.table;
			var lookupKey = this.pluralize(key);
			this.initilizeChild(scope.parent,lookupKey);
			scope.parent.addChild(scope.parent,lookupKey,scope);
		}
		var values = this.prepareSubmitValues(scope,form);
		if(form){
			scope.update(form,values);
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
		var htmlValue = this.getFieldValue('data');
		appendTo.find(this.editableDiv).remove();
		this.editors = {};
		var editorDom = this.prepareEditableDom({cls:this.mainEditorCls,tabIndex:this.fieldCount,autofocus:true},this.editors,htmlValue,true);
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
			appendTo.parent().find('div.'+this.optionsKey).find('a').addClass('disabled');
		}else{
			appendTo.parent().find('div.'+this.optionsKey).find('a').removeClass('disabled');
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
			appendTo.append("<div class='answersTag'>Answers</div>");
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
		}else if(this.isTagging){
			divi.tags.prototype.prepareForm.call(this,appendElem);
		}else{
			var aCls = this.checkMax() ? 'disabled' : '';
			appendElem.append('<div class="'+this.optionsKey+'"><a class="'+aCls+'">+Add More Options</a></div>');
		}
	}

	,attachpostContent:function(appendTo,showToggle){
		this.initiateRating();
		this.attachMoreLis(appendTo.find('div.'+this.optionsKey));
	}

	,checkMax:function(){
		return (this.maxansCnt && this.elems.length >= this.maxansCnt);
	}

	,initiateRating:function(){
		var scope = this.tagging;
		$(".diff.rating").rating({'static': false,stars: 5,showHint: true,hints: ['bad', 'poor', 'regular', 'good', 'gorgeous'],score:(scope.getFieldValue('difficulty') || 1),
				click: function(value, rating){rating.rate(value);scope.updateRating(value,'difficulty');}});
		$(".level.rating").rating({'static': false,stars: 5,showHint: true,hints: ['bad', 'poor', 'regular', 'good', 'gorgeous'],score:(scope.getFieldValue('languageLevel') || 1),
			click: function(value, rating){rating.rate(value);scope.updateRating(value,'languageLevel');}});
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
			data = dom.createElement(this.htmlValKey);
            cdata = dom.createCDATASection(unescape(dataF));
            data.appendChild(cdata);
            child.appendChild(data);
		}
	}

	,persistChild:function(){
		var editor = this.editor;
		this.updateCount();
		if(editor){
			var first = editor.getEditorsForKey(this.editorKey);
			if(first){
				first.getValue(this,this.htmlcallBack);
			}
		}else{
			this.htmlcallBack();
		}
	}

	,updateCount:function(){
		//create new id before submit
		if(this.isNew){
			this.setValueForKey('id',this.prepareId());
		}
		this.addToCount();
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
			var dom = jsxml.fromString('<?xml version="1.0" encoding="UTF-8"?><question version="1" id="' + scope.getFieldValue('id')+ '" type = "'+scope.getFieldValue('type') + '" _elemCount = "'+scope.getFieldValue('_elemCount') + '" points = "'+(scope.tagging.getFieldValue('points') || 1)+'"/>');
			if(this.tagging){
				this.tagging.getPersistValues(dom,null);
			}
			this.getPersistValues(dom,null,false,'html');
			var ops = dom.createElement(this.optionsKey);
			dom.documentElement.appendChild(ops);
			var masterObj = {};
			for(var index = 0; index  < elements.length;index++){
				eachElem = elements[index];
				if(eachElem){
					eachElem.getPersistValues(dom,ops,false,this.optionKey);
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

	,getSiblings:function(scope){
		var children;
		if(scope){
			var parent = scope.parent;
			if(parent){
				var lookupKey = divi.assessment.prototype.childrenKeys[0];
				children = parent.children[parent.childrenKeys[0]];
			}
		}
		return children;
	}
});


divi.answer = divi.extend(divi.element,{
	ansCnt:2,
	maxansCnt:2,
	idPrefix:'A',
	modalKey:'True or False',
	table:'answer',
	htmlValKey:'data',
	noreference:true,
	elemLisKey:'elemList',
	ignoreFields:['id','isAnswer','thumb','references','data'],
	listeners:{},
	btnListeners:{},
	listernsAttchd:false,
	evtDflts:{attachLis:true,events:['change','mouseout','keypress','click']},
	doms:{},
	divs:{'check':'checkDom','elem':'elemDom','main':'answerDiv','button':'buttonDiv','preview':'previewDom'},
	idCount:1,
	editor:undefined,
	editorKey:undefined,
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.answer.superclass.constructor.call(this);
		this.btnListeners = {};this.listeners = {};this.doms = {};
	}

	,attachfieldListeners:function(){
		this.btnListeners = {'click':[this.removeAns]};
		this.listeners[this.elemLisKey] = {'change':[this.changeListener],'mouseout':[this.changeListener],'keypress':[this.changeListener],'click':[this.changeListener]};
		$.extend(this.evtDflts,{listeners:this.listeners[this.elemLisKey],scope:this});
	}

	,removeAns:function(event,targetVal,target){
		this.removeAnswerFromParent(this.getIndexForElem());
	}

	,padCount:function(){
		return this.getCount();
	}

	,undrawAns:function(ans){
		if(ans){
			$(ans).remove();
		}
	}

	,retriveEditorDoms:function(){
		return 	[this.doms[this.divs.elem]];
	}

	,adjustIds1:function(index){
		var elems = this.parent.elems;
		for(var i = elems.length-1;i > index;i--){
			currEdit = elems[i];
			if(currEdit){
				this.parent.editor.removeEditor(currEdit.id);
			}
		}
	}

	,removeAnswerFromParent:function(index){
		if(index > -1){
			var elem = this.parent.elems[index];
			var editorDoms = this.retriveEditorDoms();
			var currEdit;
			for(var i = 0;i < editorDoms.length;i++){
				currEdit = editorDoms[i];
				if(currEdit){
					this.parent.editor.removeEditor(currEdit.id);
				}
			}
			this.undrawAns(elem.doms[elem.divs.main].dom);
			elem.destroydoms();
			this.parent.elems.remove(elem);
		}
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

	,setFieldCount:function(fieldCount){
		this.parent.fieldCount = fieldCount;
	}

	,getFieldCount:function(){
		return this.parent.fieldCount;
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

	,prepareCloseButton:function(parDom,fieldCount){
		var button = this.doms[this.divs.button] = divi.domBase.create({events:['click'],tag:'button','class':'ui-cancelRemove',scope:this,value:'<i class="icon-remove-circle"></i>',listeners:this.btnListeners,tabIndex:++fieldCount,attachLis:true},parDom.dom);
		$(button.dom).attr('id',button.id);
	}

	,checkAndAttachLis:function(){
		if(!this.listernsAttchd){
			this.listernsAttchd = true;
			this.attachfieldListeners();
		}
	}

	,draw:function(append){
		this.checkAndAttachLis();
		var values = this.getValues();
		var fieldCount = this.getFieldCount();
		var isAnswer = this.getFieldValue("isAnswer");
		var parDom = this.doms[this.divs.main] = divi.domBase.create({tag:'div','class':'answerDiv',scope:this},append);
		var inptDflts = $.extend({tag:'input',type:"checkbox",name:'isAnswer','data-transform':'input-control',tabIndex:++fieldCount},this.evtDflts);
		if(isAnswer == "true"){
			$.extend(inptDflts,{'checked':true});
		}
		this.prepareCloseButton(parDom,fieldCount);
		var elem = this.doms[this.divs.check] || divi.domBase.create(inptDflts,parDom.dom);
		$(elem.dom).attr('id',elem.id);
		var answerDom = this.doms[this.divs.elem] = this.prepareEditableDom($.extend({cls:"answer",tabIndex:++fieldCount},this.evtDflts),this.parent.editors,this.getFieldValue(this.htmlValKey));
		this.editorKey = answerDom.id;
		$(parDom.dom).append(answerDom.dom);
		this.setFieldCount(fieldCount);
	}
});

divi.torfAns = divi.extend(divi.answer,{
	trueText:'True',
	falseText:'False',
	htmlValKey:undefined,
	ignoreFields:['id','isAnswer'],
	table:'torfAns',
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.answer.superclass.constructor.call(this);
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
		this.checkAndAttachLis();
		var values = this.getValues();
		var isAnswer = this.getFieldValue("isAnswer");
		var fieldCount = this.getFieldCount();
		var parDom = this.doms[this.divs.main] = divi.domBase.create({tag:'div','class':'answerDiv',scope:this},append);
		var inptDflts = $.extend({tag:'input',type:"radio",name:'r3','data-transform':'input-control',tabIndex:fieldCount++},this.evtDflts);
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
		var answerDom = this.doms[this.divs.elem] = divi.domBase.create({tag:'div',scope:this,value:text,tabIndex:fieldCount++},append)
		this.editorKey = elem.id;
		$(parDom.dom).append(answerDom.dom);
		this.setFieldCount(fieldCount);
	}

});

divi.fill_blankAns = divi.extend(divi.answer,{
	ignoreFields:['id','data'],
	table:'fill_blankAns',
	toolbarDisabled:false,
	constructor: function (cfg) {
		$.extend(this,cfg);
		this.doms = {};
		this.listeners = {};
		divi.fill_blankAns.superclass.constructor.call(this);
	}

	,changeListener:function(event,val,jTarget,type,target){
		this.setValueForKey(this.htmlValKey,val);
		this.disableToolbar(event);
	}

	,disableToolbar:function(event){
		if(event.type =="click"){
			var baseEditor = this.parent.editor;
			if(baseEditor){
				baseEditor.disableToolbar();
			}
		}
	}

	,addAddValues:function(dom,childdom,values,parent){
		if(childdom){
			childdom.removeAttribute('thumb');
			childdom.removeAttribute('id');
			childdom.removeAttribute('src');
		}
	}

	,addSplValues:function(dom,child,values,parent){
		child.textContent = values[this.htmlValKey];
	}

	,loadValues:function(currNode,values){
		values[this.htmlValKey] = currNode.textContent;
		return null;
	}

	,draw:function(append,index){
		this.checkAndAttachLis();
		var values = this.getValues();
		var fieldCount = this.getFieldCount();
		var parDom = this.doms[this.divs.main] = divi.domBase.create({tag:'div','class':'answerDiv',scope:this,tabIndex:fieldCount++},append);
		this.prepareCloseButton(parDom,fieldCount);
		var inptDflts = $.extend({tag:'textarea','class':"answer",'data-transform':'input-control',tabIndex:fieldCount++,value:this.getFieldValue('data')},this.evtDflts);
		var elem = this.doms[this.divs.elem] || divi.domBase.create(inptDflts,parDom.dom);
		$(elem.dom).attr('id',elem.id);
		$(parDom.dom).append(elem.dom);
		this.setFieldCount(fieldCount);
	}

});

divi.labelingAns = divi.extend(divi.answer,{
	ignoreFields:['id','image','labels'],
	imageKey:'image',
	labelsKey:'labels',
	divs:{'formDom':'formDom','control':'controlDom','label':'labelDom','elem':'elemDom','main':'answerDiv','preview':'previewDom'},
	table:'labelingAns',
	labels:{},
	table:'label',
	imageField:null,
	files:{},
	constructor: function (cfg) {
		$.extend(this,cfg);
		this.imageField = null;
		this.listeners = {};
		this.labels = {};
		divi.labelingAns.superclass.constructor.call(this);
	}
	
	,addAddValues:function(dom,childdom,values,parent){
		if(childdom){
		}
	}

	,prepareLoadValues:function(currNode,values){
		var lbls = this.getFieldValue('labels');
		values.text = currNode.textContent;
		if(!this.getFieldValue('labels') || divi.util.isEmpty(this.getFieldValue('labels'))){
			lbls = [values];
		}else{
			var newLbls = [values];
			lbls = lbls.concat(newLbls);
		}
		this.setValueForKey('labels',lbls);
		return this.values;
	}
		
	,addSplValues:function(dom,child,values,parent){
		var values = this.cleanValues(values);
		var key = this.labelsKey;
		var eachElem,lbl,labelVals = values[key];
		
		child.removeAttribute('thumb');
		child.removeAttribute('id');
		child.removeAttribute('src');
		
		for(var i=0;i < labelVals.length;i++){
			eachElem = labelVals[i];
			if(eachElem){
				lbl = (i == 0) ? child : dom.createElement('label');
	            cdata = dom.createCDATASection(unescape(eachElem.text));
				lbl.appendChild(cdata);
				lbl.setAttribute('x',eachElem.x);
				lbl.setAttribute('y',eachElem.y);
				if(i != 0){
					parent.appendChild(lbl);
				}
			}
		}
	}
	
	,draw:function(append,index){
		var values = this.getValues();
		var fieldCount = this.getFieldCount();
		var parDom = this.doms[this.divs.main] = divi.domBase.create({tag:'div','class':'answerDiv',scope:this},append);
		var imageField = this.imageField = new divi.form.imagefield({name:"image", "desc": "image", "type": "textfield","isRequired": true});
		$.extend(imageField.lbldfts,{"class":"labelStyle hidden"});
		$.extend(imageField,{"defaultCss":"formfield medium"});
		imageField.draw({},parDom.dom);
	}

	
});

divi.matchAns = divi.extend(divi.answer,{
	ignoreFields:['id','data','right','left','left,right'],
	table:'matchAns',
	leftKey:'left',
	rightKey:'right',
	htmlValKey:'left,right',
	divs:{'left':'left','right':'right','main':'main'},
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.matchAns.superclass.constructor.call(this);
		this.listeners = {};
	}

	,addAddValues:function(dom,childdom,values,parent){
		if(childdom){
			childdom.removeAttribute('thumb');
			childdom.removeAttribute('src');
		}
	}
	,retriveEditorDoms:function(){
		return 	[this.doms[this.divs.left],this.doms[this.divs.right]];
	}

	,addSplValues:function(dom,child,values,parent){
		var values = this.cleanValues(values);
		var key = this.htmlValKey;
		var eachElem,keys =  this.htmlValKey.split(',');
		for(var i=0;i < keys.length;i++){
			eachElem = keys[i];
			var dataF = values[eachElem];
			if(dataF){
				data = dom.createElement(eachElem);
	            cdata = dom.createCDATASection(unescape(dataF));
	            data.appendChild(cdata);
	            child.appendChild(data);
			}
		}
	}

	,htmlcallBack:function(val,key){
		var scope = this;
		var values = this.getValues();
		var paskey = key ? "left": "right";
		var cldkey = (paskey == 'right') ? "": "left";
		var ind = this.getIndexForElem();
		var index = (paskey == 'left') ? (ind-1) : ind;
		values[paskey] = val;
		this.parent.persistChildHtml(index,cldkey);
	}

	,draw:function(append,index){
		this.checkAndAttachLis();
		var values = this.getValues();
		var fieldCount = this.getFieldCount();
		var parDom = this.doms[this.divs.main] = divi.domBase.create({tag:'div','class':'answerDiv matchAns',scope:this},append);
		this.prepareCloseButton(parDom,fieldCount);
		var leftdom = this.doms[this.divs.left] = this.prepareEditableDom($.extend({cls:"answer place-left",tabIndex:fieldCount++},this.evtDflts),this.parent.editors,this.getFieldValue('left'));
		var rightdom = this.doms[this.divs.right] = this.prepareEditableDom($.extend({cls:"answer place-right",tabIndex:fieldCount++},this.evtDflts),this.parent.editors,this.getFieldValue('right'));
		this.leftKey = leftdom.id;
		this.rightKey = rightdom.id;
		$(parDom.dom).append(leftdom.dom);
		$(parDom.dom).append(rightdom.dom);
		this.setFieldCount(fieldCount);
	}

});


divi.mcq = divi.extend(divi.question,{
	type:'mcq',
	table:'mcq',
	modalKey:'MCQ',
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.mcq.superclass.constructor.call(this);
	}
});


divi.torf = divi.extend(divi.question,{
	type:'torf',
	table:'torf',
	modalKey:'True/False',
	answerKey:'torfAns',
	ansCnt:2,
	maxansCnt:2,
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.torf.superclass.constructor.call(this);
	}

	,updateChildDom:function(ansDom){
		ansDom.find('input').attr('name',this.getFieldValue('id'));
	}

	,attachpostContent:function(appendTo,showToggle){
		divi.question.prototype.attachpostContent.call(this,appendTo,showToggle);
		appendTo.find('div.'+this.optionsKey).addClass('hidden');
	}
});


divi.fill_blank = divi.extend(divi.question,{
	type:'fill_blank',
	table:'fill_blank',
	modalKey:'Fill in Blanks',
	answerKey:'fill_blankAns',
	optionsKey:'blanks',
	optionKey:'blank',
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

divi.match = divi.extend(divi.question,{
	type:'match',
	table:'match',
	modalKey:'Matching',
	mainEditorCls:'question matchthefol',
	optionsKey:'matches',
	optionKey:'match',
	answerKey:'matchAns',
	constructor: function (cfg) {
		$.extend(this,cfg);
		divi.match.superclass.constructor.call(this);
	}

	,attachEditorContent:function(appendTo,editors){
		if(appendTo){
			for(var edt in editors){
				if(editors.hasOwnProperty(edt)){
					appendTo.append("<div class='colheaders'><div class='place-left padding5 colHead'>Title</div></div>");
					appendTo.append(editors[edt].editor);
				}
			}
			appendTo.append("<div class='dottedLine padding5'></div>");
			appendTo.append("<div class='colheaders'><div class='place-left padding5 colHead'>Left Column</div><div class='place-left padding5 colHead'>Right Column</div></div>");
			appendTo.append("<div class='place-left matchDiv'></div>");
			appendTo.append("<div class='place-left contentElem'></div>");
			this.appendElem = appendTo =  appendTo.find('.matchDiv');
			var childCnt = this.isNew ? this.ansCnt : this.elems.length;
			for(var i=0;i < childCnt;i++){
				var elem = this.isNew ? null : this.elems[i];
				this.attachChildPreCont(appendTo,i,elem,this.isNew);
			}
			editors = this.editors;
		}
	}

	,persistChildHtml:function(index,key){
		if(index+1 < this.elems.length){
			var elem,key,passKey;
			elem = this.elems[index+1];
			key = !key ? elem.leftKey : elem.rightKey;
			passKey = (key ==  elem.leftKey) ? elem.leftKey : undefined;
			var editorIn = this.editor.getEditorsForKey(key);
			if(editorIn && elem){
				editorIn.getValue(elem,elem.htmlcallBack,passKey);
			}else{
				this.persistChildHtml(index+1);
			}
		}else{
			this.parent.persistCurr();
			this.persistElem();
		}
	}

	,drawChildren:function(){
		var currSSel =$('<div>');
		var answerdom;
		var currAns,ansDom,answers = this.elems;
		var tmpl = divi.tpl[this.answerKey];
		for(var i=0;answers && i < answers.length;i++){
			currAns = answers[i];
			answerdom = $('<div class="matchedMain padding10">');
			answerdom.append("<div class='place-left padding5 matchedAns'>"+currAns.getFieldValue('left')+"</div>");
			answerdom.append("<div class='place-right padding5 matchedAns'>"+currAns.getFieldValue('right')+"</div>");
			currSSel.append(answerdom);
		}
		return currSSel;
	}

	,updateChildDom:function(ansDom){
	}
});


divi.label = divi.extend(divi.question,{
	type:'label',
	table:'label',
	submitCount:0,
	imageLoc:'',
	optionsKey:'labels',
	optionKey:'label',
	mainEditorCls:'question matchthefol',
	answerKey:'labelingAns',
	divs:{'labels':'labelsDiv','lblImage':'lblImageDiv'},
	constructor: function (cfg) {
		$.extend(this,cfg);
		this.resetSubmitCount();
		divi.label.superclass.constructor.call(this);
	}

	,imageSubmit:function(scope,form,event){
		divi.question.prototype.submit.call(this,scope,form,event);
		
	}
	
	,loadAnswers:function(questionChild,self,answers){
		var eachAns,elem = new divi[this.answerKey]({parent:this,home:this.home});;
		for(var i=0;i < answers.length;i++){
			eachAns = answers[i];
			elem.loadAnswer(eachAns);
		}
		this.addAnswer(this,elem);
	}
	
	
	,getChild:function(){
		return this.elems[0];
	}
	
	,hasNewImage:function(){
		var baseElement = this.getChild();
		var hasImage = false;
		if(baseElement.imageField){
			hasImage = baseElement.imageField.files.length > 0;
		}
		return hasImage;
	}
	
	,persistChildHtml:function(index){
		var child = this.getChild();
		if(this.hasNewImage()){
			var url = this.prepareFilePath(this,url);
			var ops = {url:url,data:child.imageField.files,succcb:this.imageSaveCb};
			this.persist(ops);
		}else{
			this.imageSaveCb();
		}
	}
	
	,imageSaveCb:function(){
		divi.question.prototype.persistChildHtml.call(this,0);
	}
	
	,submit:function(scope,form,event){
		if(this.submitCount == 0){
			this.submitCount++;
			divi.home.prototype.cancelDailog(event);
			var values = this.prepareSubmitValues(scope,form);
			divi.appBase.prototype.launchPopUp.call(this,scope,form,event);
		}else{
			this.imageSubmit(scope,form,event);
			this.resetSubmitCount();
		}
	}
	
	,resetSubmitCount:function(){
		this.submitCount = 0;
	}
	
	,showContent:function(appendTo,showToggle,edit){
		if(this.submitCount == 0){
			divi.elementbase.prototype.showContent.call(this,appendTo,showToggle,edit);
		}else{
			this.labelContent(appendTo,showToggle,edit);
		}
	}
	
	,cancelDailog:function(b,e){
		this.resetSubmitCount();
		divi.appBase.prototype.cancelDailog.call(this,b,e);
	}
	
	,labelContent:function(appendTo,showToggle,edit){
		var mainDivDom =this.doms[this.divs.lblImage] =  divi.domBase.create({tag:'div','class':'lblImage'},appendTo);
		var mainJdom = $(mainDivDom.dom);
		var baseElement = this.getChild();
		if(this.hasNewImage()){
			 while (mainJdom.children().length) {
				 mainJdom.children().remove();
		      }
			var imageFile = baseElement.imageField.files.length > 0 ? baseElement.imageField.files[0] : null;
			if(imageFile){
				img = document.createElement("img");
				mainJdom.append(img);
				reader = new FileReader();
				reader.onload = (function (theImg) {
					return function (evt) {
						theImg.src = evt.target.result;
					};
				}(img));
				reader.readAsDataURL(imageFile);
			}
		}else{
			img = document.createElement("img");
			mainJdom.append(img);
			img.src =baseElement.getHtmlLoc()+"/"+this.getValues()['src'];
		}
        var taggd = mainJdom.children().taggd(this.getOptions(), []);
        if(baseElement.getFieldValue('labels') && baseElement.getFieldValue('labels').length > 0){
        	taggd.setData(baseElement.getFieldValue('labels'));
        }
        taggd.on('change', function() {
            this.data = taggd.data;
            baseElement.setValueForKey('labels',taggd.data);
        });
	}
	
	,getOptions:function() {
	    return {
	        align: {
	            x: 'center',
	            y: 'center'
	        },
	        offset: {
	            left: 0,
	            top: 24
	        },
	        edit: true
	    };
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
	
	,attachpostContent:function(appendTo,showToggle){
		divi.question.prototype.attachpostContent.call(this,appendTo,showToggle);
		appendTo.find('div.'+this.optionsKey).addClass('hidden');
		appendTo.find('div.answersTag').addClass('hidden');
	}
	
	,updateChildDom:function(ansDom){
	}
	
	,prepareParentDom:function(dom,childdom,values,parent){
		var imgName;
		if(childdom){
			var baseElement = this.elems[0];
			if(baseElement.imageField){
				imgName = baseElement.imageField.files.length > 0 ? baseElement.imageField.files[0].name : this.getFieldValue('src');
			}
			childdom.setAttribute('src',imgName);
		}
	}
});


divi.contentEditor = divi.extend(divi.appBase,{
	_editors:{},
	editors:{},
	activeKey:undefined,
	toolbar:undefined,
	activeEditor:undefined,
	toolbarDisabled:false,
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
	fileCmds:'imageInsert',
	activeToolbarClass: 'btn-info',
	selectionMarker: 'edit-focus-marker',
	selectionColor: 'darkgrey',
	options:undefined,
	toolbardomCls:undefined,
	constructor : function (cfg) {
		$.extend(this,cfg);
		divi.contentEditor.superclass.constructor.call(this);
		this.initialize();
		//document.execCommand('useCSS', false, false);
	}

	,removeEditor:function(key){
		var editor = this.getEditorsForKey(key);
		if(editor){
			editor.removeListeners();
			delete this.getEditors()[key];
		}
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

	,deactivateToolBar:function(scope,refKey){
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

	,activateToolBar:function(scope,refKey){
		if(!scope.activeKey || scope.activeKey != refKey || this.toolbarDisabled){
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
		//this.getSelectionHtml();
		var par = this.parent ? this.parent : this;
		par.updateToolbar();
	}

	/*,getSelectionHtml:function() {
	    var html = "";
	    if (typeof window.getSelection != "undefined") {
	        var sel = window.getSelection();
	        if (sel.rangeCount) {
	            var container = document.createElement("div");
	            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
	                container.appendChild(sel.getRangeAt(i).cloneContents());
	                sel.getRangeAt(i).deleteContents(true);
	            }
	            html = container.innerHTML;
	        }
	    } else if (typeof document.selection != "undefined") {
	        if (document.selection.type == "Text") {
	            html = document.selection.createRange().htmlText;
	        }
	    }
	   this.replaceSelectionWithHtml(this.cleanHTML(html));
	}*/

	// removes MS Office generated guff


	/*,replaceSelectionWithHtml:function(html) {
	    var range, html;
	    if (window.getSelection && window.getSelection().getRangeAt) {
	        range = window.getSelection().getRangeAt(0);
	        range.deleteContents(true);
	       var div = document.createElement("div");
	        div.innerHTML = html;
	        var frag = document.createDocumentFragment(), child;
	        while ( (child = div.firstChild) ) {
	            frag.appendChild(child);
	        }
	        range.insertNode(frag);
	    } else if (document.selection && document.selection.createRange) {
	        range = document.selection.createRange();
	        html = (node.nodeType == 3) ? node.data : node.outerHTML;
	        range.pasteHTML(html);
	    }
	}
	*/
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



	/*,getSel: function () {
	     var e = window;
	     return e.getSelection ? e.getSelection() : e.document.selection
	}

	,getRoot: function () {
	      var e = this,dom;
	      if(this.activeKey){
	    	  var first = editor.getEditorsForKey(this.editorKey);
	    	  dom = first.editor;
	      }
	      return dom;
	}

	,processSel:function(){
		 var t, n,x = this;
		 t = x.getParent(this.getNode(), "ol,ul"), t && (n = t.parentNode, /^(H[1-6]|P|ADDRESS|PRE)$/.test(n.nodeName) && (b(), x.split(n, t), C()))
	}

	,getNode:function(){
		var t = this,
        n = t.getRng(),
        r, i = n.startContainer,
        o = n.endContainer,
        a = n.startOffset,
        s = n.endOffset;
		return n ? n.setStart ? (r = n.commonAncestorContainer, !n.collapsed && (i == o && 2 > s - a && i.hasChildNodes() && (r = i.childNodes[a]), 3 === i.nodeType && 3 === o.nodeType && (i = i.length === a ? e(i.nextSibling, !0) : i.parentNode, o = 0 === s ? e(o.previousSibling, !1) : o.parentNode, i && i === o)) ? i : r && 3 == r.nodeType ? r.parentNode : r) : n.item ? n.item(0) : n.parentElement() : t.getRoot()
	}

	 ,getParent: function (e, t, n) {
	     return this.getParents(e, t, n, !1)
	 }

	 ,get: function (e) {
         var t;
         return e && this.doc && "string" == typeof e && (t = e, e = this.doc.getElementById(e), e && e.id !== t) ? this.doc.getElementsByName(t)[1] : e
     }

  	 ,getParents: function (e, n, r, i) {
	      var o = this,t,
	          a, s = [];
	      for (e = o.get(e), i = i === t, r = r || ("BODY" != o.getRoot().nodeName ? o.getRoot().parentNode : null), d(n, "string") && (a = n, n = "*" === n ? function (e) {
	          return 1 == e.nodeType
	      } : function (e) {
	          return o.is(e, a)
	      }); e && e != r && e.nodeType && 9 !== e.nodeType;) {
	          if (!n || n(e)) {
	              if (!i) return e;
	              s.push(e)
	          }
	          e = e.parentNode
	      }
	      return i ? s : null
	  }

	,getRng: function (e) {
       var t = this,n, r, i, o = window.document,a;
       if (!e && t.lastFocusBookmark) {
           var s = t.lastFocusBookmark;
           return s.startContainer ? (r = o.createRange(), r.setStart(s.startContainer, s.startOffset), r.setEnd(s.endContainer, s.endOffset)) : r = s, r
       }
     //  if (e && t.tridentSel) return t.tridentSel.getRangeAt(0);
       try {
           (n = t.getSel()) && (r = n.rangeCount > 0 ? n.getRangeAt(0) : n.createRange ? n.createRange() : o.createRange())
       } catch (l) {}
       if (r && r.setStart) {
           try {
               a = o.selection.createRange()
           } catch (l) {}
           a && a.item && (i = a.item(0), r = o.createRange(), r.setStartBefore(i), r.setEndAfter(i))
       }
       return r || (r = o.createRange ? o.createRange() : o.body.createTextRange()), r.setStart && 9 === r.startContainer.nodeType && r.collapsed && (i = t.getRoot(), r.setStart(i, 0), r.setEnd(i, 0)), t.selectedRange && t.explicitRange && (0 === r.compareBoundaryPoints(r.START_TO_START, t.selectedRange) && 0 === r.compareBoundaryPoints(r.END_TO_END, t.selectedRange) ? r = t.explicitRange : (t.selectedRange = null, t.explicitRange = null)), r
   }
	*/
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
		this.toolbarDisabled = true;
	}

	,startup:function(){
		this.toolbarBtnSelector = 'a[data-' + this.commandRole + '],button[data-' + this.commandRole + '],input[type=button][data-' + this.commandRole + ']:not(input[type=file])';
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
		toolbar.find('a[data-edit=' + this.fileCmds + ']').on('click',null,{scope:this,toolbar:toolbar},this.fileOpener);
		this.attachEquationsListeners();
	}
	
	
	,fileOpener:function(e){
		var toolbar = e.data ? e.data.toolbar : undefined;
		if(toolbar){
			var scope = e.data.scope;
			var fileCmd = toolbar.find('input[type=file]');
			fileCmd.on('change',null,{scope:scope},scope.onFileChange).trigger('click');
		}
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
	events:'paste mouseup keyup keydown mouseout',
	//events:'mouseup keyup keydown mouseout',
	constructor : function (cfg) {
		$.extend(this,cfg);
		divi.indEditor.superclass.constructor.call(this);
		this.ref = this.editor.attr('ref');
		this.files = {};
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

	,getValue:function(rtnScope,callback,key){
		var val = "";
		if(this.editor){
			this.saveinlineImages(rtnScope,this.cleanHTML(this.editor.html()),callback,key);
		}
	}

	,cleanHTML:function(input) {
		  var input = this.cleanStyles(input);
		  // 1. remove line breaks / Mso classes
		  var stringStripper = /(\n|\r| class=(")?Mso[a-zA-Z]+(")?)/g;
		  var output = input.replace(stringStripper, ' ');
		  // 2. strip Word generated HTML comments
		  var commentSripper = new RegExp('<!--(.*?)-->','g');
		  var output = output.replace(commentSripper, '');
		  var tagStripper = new RegExp('<(/)*(meta|link|span|\\?xml:|st1:|o:|font)(.*?)>','gi');
		  // 3. remove tags leave content if any
		  output = output.replace(tagStripper, '');
		  // 4. Remove everything in between and including tags '<style(.)style(.)>'
		  var badTags = ['style', 'script','applet','embed','noframes','noscript'];

		  for (var i=0; i< badTags.length; i++) {
		    tagStripper = new RegExp('<'+badTags[i]+'.*?'+badTags[i]+'(.*?)>', 'gi');
		    output = output.replace(tagStripper, '');
		  }
		  var emptytags = ['blockquote', 'b','i','strong','s','u'];
		  for (var i=0; i< emptytags.length; i++) {
		    tagStripper = new RegExp('<'+emptytags[i]+'></'+emptytags[i]+'>', 'gi');
		    output = output.replace(tagStripper, '');
		  }
		  // 5. remove attributes ' style="..."'
		  var badAttributes = ['start'];
		  for (var i=0; i< badAttributes.length; i++) {
			  var attributeStripper = new RegExp(' ' + badAttributes[i] + '="(.*?)"','gi');
			  output = output.replace(attributeStripper, '');
		  }
		  return output;
	}

	,cleanStyles:function(output){
		var elemDom = $('<div>').append(output);
		var elems = elemDom.find("[style]");
		var eachElem;
		elems.each(function() {
			eachElem = $(this);
			if(eachElem.css('text-align')){
				var key = eachElem.css('text-align');
				eachElem.removeAttr('style');
				eachElem.css('text-align',key);
			}else{
				eachElem.removeAttr('style');
			}
		});
		return elemDom.html();
	}

	,updateInlineFiles:function(value,files){
		var upfiles = {};
		var val = $('<div>').append(value);
		for(var eachFile in files){
			if(!divi.util.isjQEmpty(val.find("[name='"+eachFile+"']"))){
				upfiles[eachFile] = files[eachFile];
			}
		}
		return upfiles;
	}

	,saveinlineImages:function(rtnScope,value,callback,key){
		var scope = this;
		var files = scope.files = this.updateInlineFiles(value,scope.files);
		var cbScope = rtnScope;
        var filesList = [],currFile;
        var deferredArr = [];
        var method = rtnScope.persist;
        if(!method){
        	method = rtnScope.parent.persist;
        }
        var url = rtnScope.getSaveHtmlLoc();
        if (files && url) {
        	for (var key1 in files) {
	            if (files.hasOwnProperty(key1)) {
	                filesList.push(files[key1]);
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
        		scope.saveInlineSucess.call(scope,value, filesList,imageFiles,callback,cbScope,key);
        	});
        }else{
        	scope.saveInlineSucess.call(scope,value, filesList,imageFiles,callback,cbScope,key);
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

	,saveInlineSucess:function (val, files,imageFiles,callback,cbScope,key) {
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
	    	callback.apply(cbScope,[saveVal,key]);
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
		this.listeners[this.listenerKey] = {'keydown':[this.triggerCommand],'keyup':[this.triggerCommand,this.editorListener],'mouseup':[this.editorListener],'mouseout':[this.editorListener],'paste':[this.pasteListener]};
		divi.listeners.attachElementListeners([this.editor],this,null,this.listenerKey);
		this.activate();
	}

	,pasteListener:function(evt,target,jTarget){
		var items = evt.originalEvent.clipboardData.items, paste;
		if( items[0].kind === 'string' && items[1].kind === 'file' && items[1].type.match( /^image/ ) ) {
	        item = items[0];
	    } else if( items[0].kind === 'string' && items[1].kind === 'string' ) {
	        item = items[0];
	    }
	    var text = evt.originalEvent.clipboardData.getData(item.type);
	    if(text){
	    	evt.preventDefault();
	    	$('.richtext-html').html(text);
	    	text = unescape($('.richtext-html').html());
	    	document.execCommand("insertText", false, text);
	    	$('.richtext-html').val('');
	    }
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
		this.editor.find(this.parent.formuleImages).on('click',null,{scope:this.parent},this.parent.onToolBarclick);
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


	,getDeleteElems:function(){
		return this.elems;
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
			var content = '<img src="%s"  text="%y"/>';
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
	firstLoad:true,
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
	//	this.modifyCss();
	}

	,modifyCss:function(){
		var avalWidth = window.screen.availWidth;
		if(avalWidth <= 1300){
			var images = $('.metro nav.topicbtns button.varwidth');
			images.find('span').hide();
			images.width(50);
		}
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
		var liDiv = selected.doms[selected.divs['liDiv']];
		if(liDiv && liDiv.dom){
			currDom = $(liDiv.dom);
			if(selected && (selected.table == 'topic' || selected.table == 'assessment')){
				currDom.parent().find('li.selected').removeClass('selected');
				currDom.addClass('selected');
			}else{
				if(currDom.hasClass('stick')){
					currDom.find('li.selected').removeClass('selected');
				}
			}
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
			this.getSelector(this.assessHolder).addClass('hidden');
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
		         {tag:'.addother',listType:'click',parent:this.book,listenerFn:'addelement',key:'other',mapTo:scope},
		         {tag:'.addapp',listType:'click',parent:this.book,listenerFn:'addelement',key:'application',mapTo:scope},
		         {tag:'.addyoutube',listType:'click',parent:this.book,listenerFn:'addelement',key:'youtube',mapTo:scope},
		         {tag:'.addmslides',listType:'click',parent:this.book,listenerFn:'addelement',key:'mslides',mapTo:scope}];
	}

	,editAssessListeners:function(scope){
		 return [{tag:'.addmcq',listType:'click',parent:this.book,listenerFn:'addelement',key:'mcq',mapTo:scope},
		         {tag:'.addtorf',listType:'click',parent:this.book,listenerFn:'addelement',key:'torf',mapTo:scope},
		         {tag:'.addfill_blank',listType:'click',parent:this.book,listenerFn:'addelement',key:'fill_blank',mapTo:scope},
		         {tag:'.addmatch',listType:'click',parent:this.book,listenerFn:'addelement',key:'match',mapTo:scope},
		         {tag:'.addlabeling',listType:'click',parent:this.book,listenerFn:'addelement',key:'label',mapTo:scope}];
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
		var title = elem.modalKey ? elem.modalKey : elem.table.toCamel();
		title = "Add "+title;
		var dlgConfig  = {title: title,position: "top",autoOpen: false,modal: true,width: width, buttons: {},close:{scope:this,fn:'cancelDailog'}};
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

	,tagsreadFail:function(r){
		if(r.status == "404"){
		}else{
			alert("Unable to read the book. Please contact administrator");
		}
	}

	,loadBook:function(){
		var scope = this;
		var timest = (new Date()).getTime();
		var masterFile = this.book.masterFile;
		if(this.firstLoad){
			masterFile += "?time="+timest;
			this.firstLoad = false;
		}
		$.ajax({url: divi.core.prepareUrl(this.getFileAction,masterFile)}).done(function (data) {scope.readBook(data);}).fail(function (data) {scope.bookreadFail(data);});
		this.loadTags();
	}


	,loadTags:function(){
		scope = this,tagFile = this.book.tagFile+"?time="+(new Date()).getTime();
		$.ajax({url: divi.core.prepareUrl(this.getFileAction,tagFile)}).done(function (data) {scope.readTags(data);}).fail(function (data) {scope.tagsreadFail(data);});
	}

	,defaultListeners:function(){
		return [{tag:'.btnAthr',listType:'click',mapTo:this.book,listenerFn:'prepareFormUp'},
		        {tag:'.bkcover',listType:'click',mapTo:this.book,listenerFn:'drawitem'},
		        {tag:'.bookEdit',listType:'click',mapTo:this.book,listenerFn:'showEditor'},
		        {tag:'.addchapter',listType:'click',parent:this.book,listenerFn:'addcontent',mapTo:this.book,key:'chapter'},
		        {tag:'.mangeTags',listType:'click',parent:this.book,listenerFn:'addcontent',mapTo:this.book,key:'chapter'},
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
			scope.addElem(null,null,cfg.key);
		}
	}

	,drawitem:function(lstnCfg){
		if(lstnCfg && lstnCfg.mapTo){
			lstnCfg.mapTo.preview();
			lstnCfg.mapTo.draw();
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