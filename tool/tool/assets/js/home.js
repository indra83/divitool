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


divi.bookBase = divi.extend(divi.appBase,{
	fileName:'master.json',
	updated:true,
	parent:undefined,
	callback:undefined,
	stdState:{'state':{'opened':false,'selected':false}},
	values:{},
	isBook:false,
	selector:undefined,
	table:'',
	children:[],
	constructor: function (cfg) {
		divi.bookBase.superclass.constructor.call(this);
		this.init();
		this.initializeValues();
	}
	
	,retrieveTree:function(){
		var book = this.retrieveBook();
		var output;
		if(book){
			output = this.retrieveTreeString(output);
		}
		return output;
	}
	
	,retrieveTreeString:function(){
		var output = [];
		if(this.isBook){
			var children = this.children['chapters'];
			for(var i=0;children && i< children.length;i++){
				var currChild = children[i];
				var values = currChild.getValues();
				var currString = {id:values['id'],text:values['name']};
				$.extend(currString,this.stdState);
				output.push(currString);
			}
		}
		return output;
	}
	
	,init:function(){
		this.children = {};
		this.values = {};
		this.updated = true;
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
	
	,showContent:function(appendTo,showToggle){
		if(!this.formPanel){
			this.formPanel = new divi.formPanel({data:this.table,scope:this});
		}
		if(!this.formPanel.toggle && showToggle){
			$.extend(this.formPanel,{toggle:true});
			this.formPanel.createToggle();
		}
		this.formPanel.draw(appendTo);
		this.formPanel.setValues(this.getValues());
	}
	
	,submitForm:function(b,e){
		var scope = this;
		var form = scope.formPanel;
		if(form){
			var isValidForm = form.validateForm();
	    	if(isValidForm){
	    		if(form){
	    			scope.update(form);
	    		}
	    		divi.home.prototype.cancelDailog(b,e);
	    	}
		}
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
	
	,clearForm:function(){
		var form = this.formPanel;
		if(form){
			form.reset();
			this.update();
		}	
	}
	
	,getValues:function(){
		return this.values;
	}
	
	,draw:function(){
		var values = this.getValues();
		var mainKey = "";
		for(var key in values){
			if(values.hasOwnProperty(key)){
				mainKey = "."+this.prefix+key;
				$(mainKey).html(values[key]);
			}
		}
	}
	
	,load:function(data){
		this.read(data);
		this.draw();
	}
	
	,read:function(){
		
	}
	
	,stringify:function(input){
		var masterObj =  {};
		this.retrieveBook().prepareData(masterObj);
		return masterObj;
	}
	
	
	,persist:function(url, file){
		var formData = new FormData();
	    formData.append(file.name, file, file.name);
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
	
	
	,persistData:function(){
		 window.URL = window.webkitURL || window.URL;
         window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
         var file = new Blob([JSON.stringify(this.stringify(), undefined, 2)]);
         file.name = this.fileName;
         this.persist('/savefile/',file);
	}
	
	,setValues:function(updated){
		if(updated){
			$.extend(this.values,updated);
		}
	}
	
	,getChildren:function(key){
		if(this.children){
			if(key){
				return this.children[key];
			}else{
				return this.children;
			}
		}
	}
	
	,fetchCat:function(key){
		return key ? key.substring(0, key.length - 1) : key;
	}
	
	,readEachChild:function(children,currKey){
		var eachChild;
		if(!this.children[currKey]){
			this.children[currKey] = [];
		}
		var elemKey = this.fetchCat(currKey);
		if(divi[elemKey]){
			for(var i=0;children && i < children.length;i++){
				eachChild = new divi[elemKey]({parent:this});
				eachChild.read(children[i]);
				this.children[currKey].push(eachChild);
			}
		}
	}
	
	,attachChildren:function(input){
		var currKey;
		for(var i=0;input && this.childrenKeys && i< this.childrenKeys.length;i++){
			currKey = this.childrenKeys[i];
			this.attachEachChild(input,currKey);
		}
	}
	
	,attachEachChild:function(input,currKey){
		var eachChild;
		if(!input.currKey){
			input[currKey] = [];
		}
		var currChildren = this.children[currKey];
		for(var i=0;currChildren && i < currChildren.length;i++){
			eachChild = currChildren[i];
			eachChild.prepareData(input[currKey],true);
		}
	}

	,prepareData:function(input,isArray){
		if(input){
			var newObj = {};
			$.extend(newObj,this.getValues());
			this.attachChildren(newObj);
			if(isArray){
				input.push(newObj);
			}else{
				$.extend(input,newObj);
			}
		}
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
	constructor : function (cfg) {
		divi.book.superclass.constructor.call(this);
	}

	,draw:function(){
		divi.bookBase.prototype.draw.call(this);
		$(this.prviwForm).removeClass('button').empty().off('click');
		this.showContent(this.prviwForm,true);
	}
});

divi.chapter = divi.extend(divi.bookBase,{
	parent:undefined,
	table:'chapter',
	childrenKeys:['topics','assessments'],
	constructor : function (cfg) {
		divi.chapter.superclass.constructor.call(this);
	}
});


divi.topic = divi.extend(divi.bookBase,{
	parent:undefined,
	table:'topics',
	constructor : function (cfg) {
		divi.topic.superclass.constructor.call(this);
	}
});


divi.assessment = divi.extend(divi.bookBase,{
	parent:undefined,
	table:'assessment',
	constructor : function (cfg) {
		divi.assessment.superclass.constructor.call(this);
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
	book:undefined,
	callback:undefined,
	selector:'textarea.html_input',
	constructor : function (cfg) {
		divi.home.superclass.constructor.call(this);
	}
	
	,startup:function(){
		this.book = new divi.book({});
		this.loadBook();
		this.initiliazeEditor();
		this.attachListeners();
		this.preparepopUp();
	}
	
	,preparepopUp:function(lstnCfg){
		var popupDiv = this.retrievePopUpDiv();
		var dlgConfig  = {autoOpen: false,modal: true,top:'2%',width: '50%', buttons: {Cancel:{scope:this,fn:this.cancelDailog}},close:{scope:this,fn:'cancelDailog'}};
		popupDiv.empty().superDialog(dlgConfig);
	}
	
	,prepareFormUp:function(lstnCfg){
		var popupDiv = lstnCfg.scope.retrievePopUpDiv.call(lstnCfg.scope);
		if(popupDiv && lstnCfg && lstnCfg.tag && lstnCfg.mapTo){
			var mapTo = lstnCfg.mapTo;
			popupDiv.empty().superDialog('open');
			var mydialog = popupDiv.superDialog();
			var buttons = mydialog.superDialog("option", "buttons");
			var newButtons = {};
			$.extend(newButtons,{ 'Submit':{scope:mapTo,fn:mapTo.submitForm}},buttons);
			mydialog.superDialog("option", "buttons", newButtons);
			mapTo.showContent(popupDiv);
		}
	}
	
	,readBook:function(data){
		if(data){
			var master_json = JSON.parse(data);
			if(master_json){
				this.book.load(master_json);
				this.showTree();
			}
		}
	}
	
	,fetchTree:function(obj,cb){
		var output = home.book.retrieveTree();
		cb.call(this,output);
	}
	
	,showTree:function(){
		$('#jstree_demo').jstree({
			  "core" : {
			    "animation" : 0,
			    "check_callback" : true,
			    "themes" : { "stripes" : true },
			    'data' :this.fetchTree /* function (obj, cb) {
	            		cb.call(this,['Root 1', 'Root 2']);
	              }*/
			  },
			  "types" : {
			    "#" : {
			      "max_children" : 1, 
			      "max_depth" : 2, 
			      "valid_children" : ["root"]
			    },
			    "root" : {
			      "icon" : "assets/images/tree_icon.png",
			      "valid_children" : ["default"]
			    },
			    "default" : {
			      "valid_children" : ["default","file"]
			    },
			    "file" : {
			      "icon" : "glyphicon glyphicon-file",
			      "valid_children" : []
			    }
			  },
			  "plugins" : [
			    "contextmenu", "dnd", "search",
			    "state", "types", "wholerow"
			  ]
			});
	}
	
	,bookreadFail:function(){
		alert("Unable to read the book. Please contact administrator");
	}
	
	,loadBook:function(){
		var scope = this;
		$.ajax({url: divi.core.prepareUrl('/getfiles',"master.json"),}).done(function (data) {scope.readBook(data);}).fail(function (data) {scope.bookreadFail(data);});
	}
	
	,defaultListeners:function(){
		return [{tag:'.btnAthr',listType:'click',scope:this,mapTo:this.book,listenerFn:'prepareFormUp'},
		        {tag:'.btnBkOverview',listType:'click',scope:this,mapTo:this.book,listenerFn:'launchEditor'},
		        {tag:'.addchapter',listType:'click',scope:this,mapTo:'chapter',listenerFn:'prepareFormUp',add:true}];
	}
	
	,launchEditor:function(lstnCfg){
		var popupDiv = '.dialog-html';
		if(lstnCfg && lstnCfg.tag && (lstnCfg.mapTo || lstnCfg.add)){
			var tag = lstnCfg.tag;
			var mapTo = lstnCfg.mapTo;
			var dlgConfig  = {autoOpen: false,modal: true,width: '50%', buttons: {"Insert": {fn:mapTo.insert,scope:this},Cancel: {fn:lstnCfg.scope.cancelDailog,scope:lstnCfg.scope}},close: function () {lstnCfg.scope.cancelDailog();}};
			$(popupDiv).superDialog(dlgConfig);
			$(popupDiv).superDialog('open').removeClass('hidden');
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
	
	
	,attachListeners:function(){
		var standardListeners = this.defaultListeners();
		if (standardListeners != null) {
			$.each(standardListeners, function(k, v) {
				var callback = v.scope[v.listenerFn];
				$(v.tag).bind(v.listType,$.proxy(function (d,e,f,g) {
					if(callback){
						callback.apply(this,[v])};
					}
				,v.scope));
			});
		}
	}
	
	,retrievePopUpDiv:function(){
		this.popupDiv = this.popupDiv || $('.popup');
		return this.popupDiv;
	}
	
	,retrieveEditorDiv:function(){
		this.editorDiv = this.editorDiv || $('.dialog-html');
		return this.editorDiv;
	}
	
	,cancelDailog:function(b,e){
		var jB = $(b);
		var elem = (jB.hasClass('ui-dialog-content')) ? jB : jB.find("ui-dialog-content");
		if(elem){
			elem.superDialog("close");
		}
	}
	
	,insertContent:function(){
		
	}
});
var home = new divi.home({});


