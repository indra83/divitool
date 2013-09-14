topic_json=[];
global_topic=0;
global_chapter=1;
var clicked;
var xml_id=0;
var parent;
i=0;
var editing_state=false;
var master_json={}
current_clicked=0;
chapter_json={'id':'','name':'','topic':[]}


$(function(){
	$( "#sidebar" ).sortable();

  var master=$.get('/getfiles/master.json');
  console.log(master);
  if (master.status==404) {
    master_json={'name':'default','chapters':[]};
  }else{
    console.log("IN");
    // master_json=master.response_text;
    master.success(function(data){
    console.log(data);
    master_json=JSON.parse(data);
    for (var i = master_json.chapters.length - 1; i >= 0; i--) {
      var a = $('<li>');
      var link=$('<a>').append(master_json.chapters[i]['name'])
      a.append(link)
      $('#book-nav').prepend(a);

    };
    })
  };






$('#sidebar').on('mouseover','.sortable',function(){
    $(this).children('.inner-btn').show();
});

$('#sidebar').on('mouseout','.sortable',function(){
    $(this).children('.inner-btn').hide();
});







	$('#sidebar').on('click','.add-btn',function(){
    var current_clicked=parseInt($(this).attr('xml_id'));
		$('#dialog-add').dialog('open');
		return false;
	});

	$('#mod-heading').click(function(e){
		console.log(xml_id);
	    console.log($(this));
	    clicked=$(this);

	    if (topic_json[global_topic]==undefined) {
	      topic_json[global_topic]=[];
	    };
		$( "#dialog-heading" ).dialog( "open" );
	    e.preventDefault();
	});



  $(document).on('click','.mod-subheading',function(e){
    console.log(xml_id);
    console.log($(this));
    clicked=$(this);

    if (topic_json[global_topic]==undefined) {
      topic_json[global_topic]=[];
    };
    $( "#dialog-sub-heading" ).dialog( "open" );
    e.preventDefault();
  });

  $(document).on('click','.mod-formula',function(e){
    console.log(xml_id);
    console.log($(this));
    clicked=$(this);

    if (topic_json[global_topic]==undefined) {
      topic_json[global_topic]=[];
    };
    $( "#dialog-formula" ).dialog( "open" );
    e.preventDefault();
  });


  $(document).on('click','.mod-image',function(e){
    console.log(xml_id);
    console.log($(this));
    clicked=$(this);

    if (topic_json[global_topic]==undefined) {
      topic_json[global_topic]=[];
    };
    $( "#dialog-image" ).dialog( "open" );
    e.preventDefault();
  });

  $(document).on('click','.mod-audio',function(e){
    console.log(xml_id);
    console.log($(this));
    clicked=$(this);

    if (topic_json[global_topic]==undefined) {
      topic_json[global_topic]=[];
    };
    $( "#dialog-audio" ).dialog( "open" );
    e.preventDefault();
  });

  $(document).on('click','.mod-video',function(e){
    console.log(xml_id);
    console.log($(this));
    clicked=$(this);

    if (topic_json[global_topic]==undefined) {
      topic_json[global_topic]=[];
    };
    $( "#dialog-video" ).dialog( "open" );
    e.preventDefault();
  });

  $(document).on('click','.mod-html',function(e){
    console.log(xml_id);
    console.log($(this));
    clicked=$(this);

    if (topic_json[global_topic]==undefined) {
      topic_json[global_topic]=[];
    };
    $( "#dialog-html" ).dialog( "open" );
    e.preventDefault();
  });


  $(document).on('click','.testing1',function(e){
    console.log(xml_id);
    console.log($(this));
    parent=$(this);
    xml_id=parseInt($(this).attr("xml_index"));
    if (topic_json[global_topic]==undefined) {
      topic_json[global_topic]=[];
    };
    $( "#dialog-form" ).dialog( "open" );
    e.preventDefault();
  });

});
