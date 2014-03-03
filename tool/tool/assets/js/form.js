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
    comboData:[],
    defaults:{tag:'form','class':'diviForm'},
    showBorder:false,
    sbtdefaults:{submitUrl:divi.core.prepareControllerUrl("multiController"),submitText:'Edit'},
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
    afterSubmitCallBack:undefined,
    afterUpdateCallBack:undefined,
    afterDeleteCallBack:undefined,
    ignoreSuccess:false,
    largerForm:true
    	
    ,init:function(cfg){
    	$.extend(this, cfg);
    	this.fieldCount = 0;
    	this.initialize();
    	divi.formPanel.superclass.init.call(this);
    	this.initForm();
    	this.loadSubmitDfts();
		this.createForm(this.appendToElement);
	}
    
    ,initialize:function(){
    	this.elementsMap = {};
    }
    
    ,loadSubmitDfts:function(){
    	this.submitOptions = {context: this,succCall:this.postSuccCallBack,actionType:divi.actionType.submit,url:this.sbtdefaults.submitUrl,failCall:this.failCallBack};
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
    ,returnForm: function(){
    	var scope = this.scope;
		if(scope.returnBtnCall){
			scope.returnBtnCall.call(scope.scope);
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
			var isValid = form.validateAndsubmitForm();
			if(!isValid){
				$('.load').hide();
			}
		/*	if(isValid){
				form.toggleForm();
			}*/
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
    
    ,failCallBack:function(r){
    	alert("Please check the form. There is some error with the submit");
    }
    
    ,updateParams:function(input,key,result){
    	var data = input[key];
    	var tbNm,fdNm,splts;
    	for(var eachD in data){
    		if(data.hasOwnProperty(eachD)){
    			splts = this.splitName(eachD);
    			tbNm = splts.table,fdNm =splts.field;
    			if(!result[tbNm]){result[tbNm] = {}};
    			if(!result[tbNm][key]){result[tbNm][key] = {}};
    			result[tbNm][key][fdNm] = data[eachD];
    		}
    	}
    }
    
    ,splitName:function(name){
    	var tb,field,splts;
    	if(name){
    		splts = name.split('_');
    		tb = splts[0],field =splts[1];
    	}
    	return  {table:tb,field:field}
    }
    
    
    ,filterParams:function(values){
    	var eachParams = {};
    	this.updateParams(values,'filters',eachParams);
    	this.updateParams(values,'values',eachParams);
    	return eachParams;
    }
    
    ,prepareParams:function(formValues){
    	var form = this;
    	var filValues;
    	var inputObject;
    	if(form){
    		var dataObj = {};
	    	if(formValues && formValues.values){
				var values = dataObj.values || {};
				$.extend(values,formValues.values);
				dataObj.values = values;
			}
			if(formValues && formValues.filters){
				var filters = dataObj.filters || {};
				$.extend(filters,formValues.filters);
				dataObj.filters = filters;
			}
			filValues = form.filterParams(dataObj);
    	}
    	return this.prepareSbtParams(filValues);
    }
    
    ,prepareSbtParams:function(filValues){
    	var inputObject = this.prepareSubmitObject(filValues);
    	var dependencies = this.dependencies;
    	return {details:$.toJSON(inputObject),dependencies:$.toJSON(dependencies)};
    }
    
    ,validateAndsubmitForm:function(){
    	var isValidForm = this.validateForm();
    	if(isValidForm){
			this.submitValidForm();
    	}
    	return isValidForm;
    }
    ,submitValidForm: function(){
    	var form  = this;
    	var params = this.submitOptions;
		var inputParams = form.getValues({form:form});
		form.setTableProps(divi.actionType.submit);
		form.submitOptions.data = form.prepareParams(inputParams);
    	this._submitForm({form:form});
    }
    ,_submitForm:function(options){
    	var form = options.form || this;
    	//setTimeout(function() {
			var params = form.submitOptions;
			var context = form.submitOptions.context || form;
    		params.data.Action = form.submitOptions.actionType || divi.actionType.submit;   		
            divi.core.ajax.call(context,params);
		//},100);
    }
    
    ,setTableProps:function(actionType){
    	var form = this;
    	var tabProps = form.tableProps;
    	if(tabProps){
			var val;
			for(var key in tabProps){
				if(tabProps.hasOwnProperty(key)){
					tabProps[key].actionType = actionType;
				}
			}
		}
    }
    
    ,retrieve: function (options) {
    	options = options || {};
    	var values = options.values;
    	var retrieveOpts = options.retrieveOpts || {};
    	form = this;
    	var actionProps = form.actionProps;
    	$.extend_deep(true,form.tableProps,retrieveOpts);
    	var newProps;
		if(form.isNew){
			newProps = actionProps? actionProps['new'] : {}; 
			var values = form.prepareDataObject(values);
			form.setValues(values);
			form.enableButton(form.submitBtn,true);
		}else{
			newProps = actionProps? actionProps['edit'] : {};
			form.setTableProps(divi.actionType.retrieve);
			$.extend(form.submitOptions,{succCall:form.retrieveValuesSucess,actionType:divi.actionType.retrieve,data:form.prepareSbtParams.call(form,values)});
			form._submitForm({form:form});
		}
		form.applyFormProps(newProps);
    }
    
    ,hideShowElement:function(elem,toShow){
    	if(elem){
    		var jElem = $(elem);
	    	if(toShow){
	    		jElem.removeClass('hidden');
	    	}else{
	    		jElem.addClass('hidden');
	    	}
    	}
    }
    
    ,hideShowSections:function(section,toShow){
    	if(section && !$.isEmptyObject(section.doms)){
    		this.hideShowElement(section.doms.header,toShow);
    		this.hideShowElement(section.doms.content,toShow);
    	}
    }
    
    ,checkforSections:function(){
    	var eachsection,hide;
    	for(var eachSec in this.sections){
    		if(this.sections.hasOwnProperty(eachSec)){
    			hide = true;
    			eachsection =  this.sections[eachSec];
	    		for(var key in eachsection.keys){
					if(eachsection.keys.hasOwnProperty(key)){
						eachField = this.elementsMap[eachsection.keys[key]];
						hide = hide*eachField.hidden;
					}
				}
	    		if(hide){
	    			this.hideShowSections(eachsection,false);
	    		}
    		}
    	}
    }
    
    ,applyFormProps:function(props){
    	if(props){
    		for(var key in props){
    			if(props.hasOwnProperty(key)){
					this.hideFieldsByKey(props[key].hide,key);
    			}
    		}
    	}
    	this.checkforSections();
    }
    
    ,hideFieldsByKey:function(toHide,prefix){
    	var form = this;
    	var name,splts,prfName;
    	for(var key in form.elementsMap){
    		if(form.elementsMap.hasOwnProperty(key)){
    			eachField = form.elementsMap[key];
    			name = eachField.name;
    			prfName = form.splitName(name)['table'];
    			if(prfName === prefix){
    				if(toHide){
    					eachField.hide();
    				}else{
    					eachField.show();
    				}
    			}
    			
    		}
    	}
    }
    
    ,prepareDataObject:function(values){
    	if(values){
    		var returnObject = {};
    		for(var key in values){
    			if(values.hasOwnProperty(key)){
    				$.extend(returnObject,this.constructValues(key, values[key].filters));
    				$.extend(returnObject,this.constructValues(key, values[key].values));
    			}
    		}
    	}
    	return returnObject;
    }
    
    ,constructValues:function(prefix,values){
    	var returnObject = {};
    	if(values){
    		for(var key in values){
    			if(values.hasOwnProperty(key)){
    				returnObject[prefix+'_'+key] = values[key];
    			}
    		}
    	}
    	return returnObject;
    }
	,shouldSetValues: function(success) {
		var setvalues = false;
		if(this.ignoreSuccess) {
			setvalues = true;
		}
		else if((!this.ignoreSuccess) && success) {
			setvalues = true;
		}
		return setvalues;
	}
    ,retrieveValuesSucess:function(data){
    	var form = this;
    	var shouldset = this.shouldSetValues(data.Success);
		if (shouldset) {
			form.setValues(data);
			form.setReadOnly(form);
			form.enableButton(form.submitBtn,false);
			form.editMode = false;
			setTimeout(function() {
				$('.load').hide();
				form.displaySuccessMessage();
				form.afterCrudCallBack(form);
			},300);
		}
		else{
			form.enableButton(form.submitBtn,true);
			form.editMode = true;
		}
	}
    ,afterCrudCallBack: function(form){
    	var actionType = this.actionType;
		var messageText = '', header = 'Success';
		switch(actionType){
			case divi.actionType.insert:
				if(form.afterSubmitCallBack){
					form.afterSubmitCallBack.call(this.scope);
				}
				break;
			case divi.actionType.update:
				if(form.afterUpdateCallBack){
					form.afterUpdateCallBack.call(this.scope);
				}
				break;
			case divi.actionType.deleted:
				if(form.afterDeleteCallBack){
					form.afterDeleteCallBack.call(this.scope);
				}
				break;
		}
    }
    ,submit:function(options){
    	var scope = this;
    	options = options || {};
    	var tbPrpop = options.tableProps || {};
    	$.extend_deep(true,this.tableProps,tbPrpop);
    	//mergeOnKey('name',this.tableProps,tbPrpop);
    	var sbOpts = {};
    	if(options.callback){
    		sbOpts['succCall'] = options.callback;
    	}
    	if(options.context){
    		sbOpts['context'] = options.context;
    	}
    	if(options.actionType){
    		sbOpts['actionType'] = options.actionType;
    	}
		$.extend(this.submitOptions,sbOpts);
    }
    ,postSuccCallBack: function(data){
		this.retrieveValuesSucess(data);	
    }
    
    ,preSubmit:function(postParams){
		return postParams;
	}
    
    ,getSubmitActionType:function(form){
		var eachField,value,actionType ;
		if(form.elementsMap.hasOwnProperty('id')){
			eachField = form.elementsMap['id'];
			value = eachField.getValue();
			if(value){
				actionType = divi.actionType.update;
			}else{
				actionType = divi.actionType.insert;
			}
		}
		return actionType;
	}
	
	,shuffleOrder:function(params){
		var form = this;
		var shuffled = params;
		var eachKey;
		var sortOrder = form.tableProps.sortOrder;
		if(sortOrder){
			shuffled = {};
			for(var key in sortOrder){
				if(sortOrder.hasOwnProperty(key)){
					eachKey = sortOrder[key];
					if(params[eachKey]){
						shuffled[eachKey] = params[eachKey];
					}
				}
			}
		}
		return shuffled;
	}
	
	
    
    ,checkIdentity:function(options,key){
    	var options = options || {};
    	var form = options.form || this;
    	var actionType = divi.actionType.update;
    	var tbProps = form.tableProps[key] || {}
    	var identityCols = tbProps.identityCols;
    	var eachCol,value,field;
    	if(identityCols){
    		for(var each in identityCols){
    			if(identityCols.hasOwnProperty(each)){
    				eachCol = identityCols[each];
    				if(eachCol){
    					field = form.elementsMap[eachCol];
    					if(field){
    						value = field.getValue();
        					if(field.isEmpty(value)){
        						actionType = divi.actionType.insert;
        						break;
        					}
    					}
    				}
    			}
    		}
    	}
    	return actionType;
    }
    
    ,setActionType:function(data,actionType){
    	this.actionType = actionType;
    	var filters = data.filters|| {};
    	var values = data.values|| {};
    	switch(actionType){
    		case divi.actionType.insert:
    			$.extend(values,filters);
    			delete data['filters'];
    			delete data['values'];
    			data["formdetails"] = $.toJSON(values);
    			break;
    		case divi.actionType.update:
    			delete data['values'];
    			data["formdetails"] = $.toJSON(values);
    			data["filters"] = $.toJSON(filters);
    			break;
    		case divi.actionType.deleted:
    			data["filters"] = $.toJSON(filters);
    			delete data['values'];
    			break;
    		case divi.actionType.retrieve:
    			data["filters"] = $.toJSON(filters);
    			delete data['values'];
    			break;
    	}
    	return data;
    }
    
    ,setParams:function(data,tbName){
    	var tbPrps = this.tableProps || {};
    	var tableprops = tbPrps[tbName] || {};
    	var actionType =  (tableprops['actionType']) ?  tableprops.actionType : this.submitOptions.actionType;
    	if(!actionType || actionType == divi.actionType.submit){
    		actionType = this.checkIdentity(data,tbName);
    	}
    	data = this.setActionType(data,actionType);
    	var resultName = tableprops.resultName? tableprops.resultName : tbName+'result';
    	var controllerName = tableprops.url ?  tableprops.url : 'RetrieveController';
    	var returndata = {params:$.toJSON(data),resultName:resultName,controllerName:controllerName,action:actionType};
    	var addParams = tableprops.params ?  tableprops.params : {};
    	$.extend(returndata,addParams);
    	return returndata;
    }
    
    ,prepareSubmitObject:function(data){
    	var eachData,returnData,mainData = {}; 
    	if(data){
    		for(var key in data){
    			if(data.hasOwnProperty(key)){
    				eachData = data[key];
    				returnData = this.setParams(eachData,key);
    				mainData[key] = returnData;
    			}
    		}
    	}
    	mainData = this.shuffleOrder(mainData);    	
    	return mainData;
    }
    
    
    
    ,submitcallback:function(resp){
    	//do nothing
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
	
	
	,createRow:function(appendTo,trops,tdOps){
		var row,cell;
		if(appendTo){
			row = document.createElement('tr');
			var jRow = $(row);
			divi.domBase.attachAttrs(jRow,trops);
			
			cell = document.createElement("td"); 
			var jCell = $(cell);
			divi.domBase.attachAttrs(jCell,tdOps);
			divi.domBase.append(row,cell);
			
			divi.domBase.append(appendTo,row);
		}
		return {td:cell,tr:row};
	}
	
	,getSectionText:function(){
		return this.tText;
	}
	
	,getToggleText:function(parent){
		 var buttons = [{tag:'button',defaultCss:'textLeft',baseCss:'imgButton',value:'<img class="toggle"/>',hidden:this.editMode,listeners:{'click':[this.toggleForm]}}];
   		 this.createButtons(buttons,parent);
	}
	
	,createSections:function(parent){
		parent = parent || this.formdom.dom;
		var contentCls = 'formContent';
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
		
		if(this.toggle){
			rowElem = this.createRow(jtableElem, {}, {});
			this.getToggleText(rowElem.td);
		}
		
		
		
		this.createSections(jtableElem);
		this.getFormButtons(jtableElem);
		if(this.showBorder){
			$(jtableElem).find('tbody').addClass('border');
		}
    	this.appendFormTo(appendToTag);
    	this.afterFormRender();
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
			/*if(!this.editMode){
				this.editMode = !this.editMode;
				this.toggleForm();
			}*/
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
	,displaySuccessMessage: function(options){
		var actionType = this.actionType;
		var messageText = '', header = 'Success';
		switch(actionType){
			case divi.actionType.insert:
				messageText = "Inserted";
				break;
			case divi.actionType.update:
				messageText = "Updated";
				break;
			case divi.actionType.deleted:
				messageText = "Deleted";
				break;
		}
		if(actionType!=divi.actionType.retrieve){
			divi.core.alert({text:"Record "+messageText+" successfully",header:header});
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

