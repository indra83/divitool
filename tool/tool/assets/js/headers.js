divi.namespace("divi.app");
divi.app.book = new divi.pageBase({
	 fieldconfig:function(){
		 return [{name:"name", "desc": "Author Name/Organization Name", "type": "textfield","isRequired": true},
		 	    {name:"title", "desc": "Name/ Title/ Afflication", "type": "textfield","isRequired": true},
		 	    {name:"url","desc": "Website URL", "type": "textfield"},
		 	    {name:"License", "desc": "License", "type": "textfield","isRequired": true},
		 	    {name:"version", "desc": "Book Version", "type": "numberfield",hidden:true},
		 	    {name:"bookId", "desc": "Book Version", "type": "numberfield",hidden:true},
		 	    {name:"orderNo", "desc": "Book Order", "type": "numberfield",hidden:true}
		 	  ];
	}
});

divi.app.chapter = new divi.pageBase({
	 fieldconfig:function(){
		 return [{name:"name", "desc": "Chapter Name", "type": "textfield","isRequired": true}];
	}
});