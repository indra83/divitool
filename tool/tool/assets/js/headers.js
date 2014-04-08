divi.namespace("divi.app");
divi.app.book = new divi.pageBase({
	 fieldconfig:function(){
		 return [{name:"name", "desc": "Author Name/Organization Name", "type": "textfield","isRequired": true},
		 	    {name:"title", "desc": "Name/ Title/ Afflication", "type": "textfield","isRequired": true},
		 	    {name:"url","desc": "Website URL", "type": "textfield"},
		 	    {name:"License", "desc": "License", "type": "combofield","isRequired": true,"listener":"license"},
		 	    {name:"overview", "desc": "overview", "type": "textfield",hidden:true},
		 	    {name:"version", "desc": "Book Version", "type": "numberfield",hidden:true},
		 	    {name:"bookId", "desc": "Book Version", "type": "numberfield",hidden:true},
		 	    {name:"orderNo", "desc": "Book Order", "type": "numberfield",hidden:true}
		 	  ];
	}
});


divi.app.topic = new divi.pageBase({
	 fieldconfig:function(){
		 return [{name:"chapter", "desc": "Chapter", "type": "combofield","isRequired": true,"listener":"chapter"},
		         {name:"id", "desc": "Topic ID", "type": "numberfield","isRequired": true,isReadOnly:true},
		         {name:"name", "desc": "Topic Name", "type": "textfield","isRequired": true}];
	}
});

divi.app.assessment = new divi.pageBase({
	 fieldconfig:function(){
		 return [{name:"chapter", "desc": "Chapter", "type": "combofield","isRequired": true,"listener":"chapter"},
		         {name:"id", "desc": "Assessment ID", "type": "numberfield","isRequired": true,isReadOnly:true},
		         {name:"name", "desc": "Assessment Name", "type": "textfield","isRequired": true}];
	}
});

divi.app.chapter = new divi.pageBase({
	 fieldconfig:function(){
		 return [{name:"id", "desc": "Chapter ID", "type": "numberfield","isRequired": true,isReadOnly:true},
		         {name:"name", "desc": "Name", "type": "textfield","isRequired": true}];
	}
});

divi.app.references = new divi.pageBase({
	fieldconfig:function(){
		 return [{name:"source", "desc": "Author Name/ID/Organization Name", "type": "textfield"},
		         {name:"name", "desc": "Name/Title", "type": "textfield"},
		         {name:"url","desc": "Website URL", "type": "textfield"},
		         {name:"license", "desc": "License", "type": "combofield","listener":"license"}];
	}
});

divi.app.audioAlone = new divi.pageBase({
	fieldconfig:function(){
		 return [{name:"src", "desc": "Audio File", "type": "audiofield","isRequired": true},
		         {name:"id", "desc": "Audio ID", "type": "textfield","isRequired": true,isReadOnly:true},
		         {name:"title", "desc": "Title", "type": "textfield"},
		         {name:"url","desc": "URL", "type": "textfield"}];
	}
});

divi.app.videoAlone = new divi.pageBase({
	fieldconfig:function(){
		 return [{name:"src", "desc": "Video File", "type": "videofield","isRequired": true},
		         {name:"thumb", "desc": "Thumbnail", "type": "imagefield","isRequired": true},
		         {name:"id", "desc": "Video ID", "type": "textfield","isRequired": true,isReadOnly:true},
		         {name:"description", "desc": "Description", "type": "textfield","isRequired": true},
		         {name:"title", "desc": "Title", "type": "textfield"},
		         {name:"url","desc": "URL", "type": "textfield"}];
	}
});

divi.app.imageAlone = new divi.pageBase({
	fieldconfig:function(){
		 return [{name:"src", "desc": "Image File", "type": "imagefield","isRequired": true},
		         {name:"id", "desc": "Video ID", "type": "textfield","isRequired": true,isReadOnly:true},
		         {name:"description", "desc": "Description", "type": "textfield","isRequired": true},
		         {name:"title", "desc": "Title", "type": "textfield"},
		         {name:"url","desc": "URL", "type": "textfield"}];
	}
});

divi.app.htmlAlone = new divi.pageBase({
	fieldconfig:function(){
		return [{name:"boxtype", "desc": "Type", "type": "combofield","isRequired": true,"listener":"boxInfo"},
		        {name:"boxTitle","desc": "Title", "type": "textfield","isRequired": true},
		        {name:"data","desc": "data", "type": "textfield",hidden:true}];
	}
});

divi.app.html = new divi.crossPageBase({
	 tables:["htmlAlone","references"],
	 sections:{"":{name:"", incAll:["htmlAlone","references"]}}
});

divi.app.video = new divi.crossPageBase({
	 tables:["videoAlone","references"],
	 sections:{"":{name:"", incAll:["videoAlone","references"]}}
});


divi.app.audio = new divi.crossPageBase({
	 tables:["audioAlone","references"],
	 sections:{"":{name:"", incAll:["audioAlone","references"]}}
});


divi.app.image = new divi.crossPageBase({
	 tables:["imageAlone","references"],
	 sections:{"":{name:"", incAll:["imageAlone","references"]}}
});

divi.namespace("divi.tpl");

divi.tpl.references = '<div class="formfield larger"><span class="labelStyle">Author Name/ID/Organization Name:</span><span class="lblValue">${source}</span></div><div class="formfield larger"><span class="labelStyle">Name:</span><span class="lblValue">${name}</span></div><div class="formfield larger"><span class="labelStyle">Website URL:</span><span class="lblValue">${url}</span></div><div class="formfield larger"><span class="labelStyle">License:</span><span class="lblValue">${license}</span></div>';
divi.tpl.video = '<div class="formfield larger"><span class="labelStyle">Title:</span><span class="lblValue">${title}</span></div>';
divi.tpl.audio = '<div class="formfield larger"><span class="labelStyle">Title:</span><span class="lblValue">${title}</span></div>';
divi.tpl.image = '<div class="formfield larger"><span class="labelStyle">Title:</span><span class="lblValue">${title}</span></div>';
divi.tpl.eachHeader = '<div class="previewElem"></div>'




