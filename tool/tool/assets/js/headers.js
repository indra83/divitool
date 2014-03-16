divi.namespace("divi.app");
divi.app.book = new divi.pageBase({
	 fieldconfig:function(){
		 return [{name:"name", "desc": "Author Name/Organization Name", "type": "textfield","isRequired": true},
		 	    {name:"title", "desc": "Name/ Title/ Afflication", "type": "textfield","isRequired": true},
		 	    {name:"url","desc": "Website URL", "type": "textfield"},
		 	    {name:"License", "desc": "License", "type": "combofield","isRequired": true,"listener":"license"},
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
		         {name:"License", "desc": "License", "type": "combofield","listener":"license"}];
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
		         {name:"title", "desc": "Title", "type": "textfield"},
		         {name:"url","desc": "URL", "type": "textfield"}];
	}
});

divi.app.video = new divi.crossPageBase({
	 tables:["videoAlone","references"],
	 sections:{"":{name:"", incAll:["videoAlone","references"]}}
});


divi.app.audioHybrid = new divi.crossPageBase({
	 tables:["audioAlone","references"],
	 sections:{"":{name:"", incAll:["audioAlone","references"]}}
});

