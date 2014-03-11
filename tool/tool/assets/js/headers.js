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