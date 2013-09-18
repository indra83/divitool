topic_json=[];
global_topic=-1;
global_chapter=-1;
var clicked;
var xml_id=0;
var parent;
i=0;
var editing_state=false;
var master_json={}
current_clicked=0;
chapter_json={'id':'','name':'','topic':[]};
before_array=[];
after_drop=[];

before_chapter=[];
after_chapter=[];


$(function(){
	$( "#sidebar" ).sortable({
    start: function (e, ui) {
      // alert("started");
      before_array=$('.editable');

    },
    update: function(e,ui){
      after_drop=$('.editable');
      console.log(e);
      console.log(ui);
      console.log($(this).attr("xml_index"));
    var xml_index= ui.item.children('button').attr('xml_index');

    var bf_tn_array = before_array.map(function() {
                    return $(this).attr("xml_index");
                    });
  var after_tn_array = after_drop.map(function() {
                    return $(this).attr("xml_index");
                    });

    current_topic=topic_json[global_topic]
    var temp_array=[]
    for (var i = 0; i <current_topic.length ; i++) {
      temp_array[i]=current_topic[parseInt(after_tn_array[i])];
    };

    current_topic=temp_array;

    for (var i = 0; i <current_topic.length; i++) {
      current_topic[i].xml_id=i;
    };

    topic_json[global_topic]=current_topic;

    refresh_dom();

    }
  });





















$( ".sortchapters" ).sortable({
    start: function (e, ui) {
      // alert("started");
      before_chapter=$('.topic_link');

    },
    update: function(e,ui){
      after_chapter=$('.topic_link');
  //     console.log(e);
  //     console.log(ui);
  //     console.log($(this).attr("topic-id"));
  //   var topic_id= ui.item.children('button').attr('topic-id');

  //   var bf_tn_array = before_chapter.map(function() {
  //                   return $(this).attr("topic-id");
  //                   });
  // var after_tn_array = after_chapter.map(function() {
  //                   return $(this).attr("topic-id");
  //                   });

  //   // current_topic=topic_json[global_topic]
  //   var temp_array=[]
  //   for (var i = 0; i <master_json.chapters[global_chapter] ; i++) {
  //     temp_array[i]=current_topic[parseInt(after_tn_array[i])];
  //   };

  //   current_topic=temp_array;

  //   for (var i = 0; i <current_topic.length; i++) {
  //     current_topic[i].xml_id=i;
  //   };

  //   topic_json[global_topic]=current_topic;

  //   refresh_dom();

    }
  });





















  $.ajax({
      url: "/getfiles/master/master.json",
    }).done(function(data) {
      // $( this ).addClass( "done" );

    console.log("IN");
    // master_json=master.response_text;
    // master.success(function(data){
    console.log(data);
    master_json=JSON.parse(data);
    for (var i = master_json.chapters.length - 1; i >= 0; i--) {
      var a = $('<li>');
      var link=$('<a>').append(master_json.chapters[i]['name']);
      link.attr('chapter-id',i);
      a.append(link);

      var top=$('<ul>');
      top.addClass('sortchapters');
      if (master_json.chapters[i].topics != undefined) {
        for (var j = master_json.chapters[i].topics.length - 1; j >= 0; j--) {
            var a1 = $('<li>');
            var link1=$('<a>').append(master_json.chapters[i].topics[j]['name']);
            link1.addClass('topic_link');
            link1.attr('chapter-id',i);
            link1.attr('topic-id',j);
            a1.append(link1);
            top.prepend(a1);
        }
        a.append(top);
      }

      $('#book-nav').prepend(a);
      $('#book-desc').html(master_json['name']);

    };

    $( ".sortchapters" ).sortable({
    start: function (e, ui) {
      // alert("started");
      before_chapter=ui.item.parent('ul').find('.topic_link');
      global_chapter=parseInt(ui.item.children('a').attr('chapter-id'),10);
    },
    update: function(e,ui){
      after_chapter=ui.item.parent('ul').find('.topic_link');
      console.log(e);
      console.log(ui);
      console.log($(this).attr("topic-id"));
    var topic_id= ui.item.children('a').attr('topic-id');

    var bf_tn_array = before_chapter.map(function() {
                    return $(this).attr("topic-id");
                    });
  var after_tn_array = after_chapter.map(function() {
                    return $(this).attr("topic-id");
                    });

    // current_topic=topic_json[global_topic]
    var temp_array=[]
    for (var i = 0; i <master_json.chapters[global_chapter].topics.length ; i++) {
      temp_array[i]=master_json.chapters[global_chapter].topics[parseInt(after_tn_array[i])];

      // current_topic[parseInt(after_tn_array[i])];
    };

    master_json.chapters[global_chapter].topics=temp_array;

    // for (var i = 0; i <current_topic.length; i++) {
    //   current_topic[i].xml_id=i;
    // };

    // topic_json[global_topic]=current_topic;

    refresh_chapters();

    }
  });



    }).fail(function(data){
      console.log(data);
      if (data.status==404) {
        master_json={'name':'default book name','chapters':[]};
        $('#book-desc').html(master_json['name']);
      };


    });

// try{
//   var master=$.get('/getfiles/master/master.json');
// }catch(err){

// }
//   console.log(master);
//   if (master.status==404) {
//     master_json={'name':'default','chapters':[]};
//   }else{

//   };






$('#sidebar').on('mouseover','.sortable',function(){
    $(this).children('.inner-btn').show();
});

$('#sidebar').on('mouseout','.sortable',function(){
    $(this).children('.inner-btn').hide();
});





  $('#book-show').on('click','.topic_link',function(){

    global_topic=parseInt($(this).attr('topic-id'),10);
    global_chapter=parseInt($(this).attr('chapter-id'),10);
    topic_json[global_topic]=[];

    var xml_string="";

    current_topic=topic_json[global_topic] || [];
    $.ajax({
      dataType:"xml",
      url: "/getfiles/"+master_json.chapters[global_chapter]['id']+"/"+master_json.chapters[global_chapter].topics[global_topic]['id']+"/topic.xml",
    }).done(function(data) {

      var iterate=data.childNodes[0];
      for (var i = 0; i < iterate.children.length; i++) {
        console.log(iterate.children[i]);
        console.log(iterate.children[i].nodeName);
        console.log(iterate.children[i].InnerText);

        switch(iterate.children[i].nodeName){
            case "header":

              current_topic.push({'type':'header','data':iterate.children[i].textContent,'xml_id':i})


              break;
        case "subheader":
              current_topic.push({'type':'subheader','data':iterate.children[i].textContent,'xml_id':i})

              break;

        case "html":
              s=(new XMLSerializer()).serializeToString(iterate.children[i])
              current_topic.push({'type':'html','data':escape(s),'xml_id':i})
              console.log("HTML");


              break;

        case "image":

              current_topic.push({'type':'image','data':iterate.children[i].getAttribute('src'),'xml_id':i,'attribution':(new XMLSerializer()).serializeToString(iterate.children[i].getElementsByTagName('references')[0])});

              // var parent_div=document.createElement("div");

              break;

        case "video":
              current_topic.push({'type':'video','data':iterate.children[i].getAttribute('src'),'xml_id':i,'attribution':(new XMLSerializer()).serializeToString(iterate.children[i].getElementsByTagName('references')[0]),'thumb':iterate.children[i].getAttribute('thumb')});



              break;

        case "audio":
              current_topic.push({'type':'audio','data':iterate.children[i].getAttribute('src'),'xml_id':i,'attribution':(new XMLSerializer()).serializeToString(iterate.children[i].getElementsByTagName('references')[0])});
              //   var parent_div=document.createElement("div");


                  break;



        case "formula":
              current_topic.push({'type':'formula','data':iterate.children[i].textContent,'xml_id':i});

                break;
        }

      };
      topic_json[global_topic]=current_topic;
      refresh_dom();



    }).fail(function(data){
      console.log(data);
      // if (data.status==404) {
      //   master_json={'name':'default book name','chapters':[]};
      //   $('#book-desc').html(master_json['name']);
      // };


    });


    return false;
  });

	$('#sidebar').on('click','.add-btn',function(){
    current_clicked=parseInt($(this).attr('xml_index'));
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
    editing_state=true;
    console.log(xml_id);
    console.log($(this));
    parent=$(this);
    xml_id=parseInt($(this).attr("xml_index"));

    current_topic=topic_json[global_topic];
    for (var i = 0; i < current_topic.length; i++) {
      if (xml_id == current_topic[i].xml_id) {
            $('#header_text').val(current_topic[i]['data']);
            break;
      };
    };


    $(".header.xml_id").attr('xml_id',xml_id);
    if (topic_json[global_topic]==undefined) {
      topic_json[global_topic]=[];
    };
    $( "#dialog-heading" ).dialog( "open" );
    e.preventDefault();
  });

  $(document).on('click','.editing-subheader',function(e){
    editing_state=true;
    console.log(xml_id);
    console.log($(this));
    parent=$(this);
    xml_id=parseInt($(this).attr("xml_index"));

    current_topic=topic_json[global_topic];
    for (var i = 0; i < current_topic.length; i++) {
      if (xml_id == current_topic[i].xml_id) {
            $('#sub_header_text').val(current_topic[i]['data']);
            break;
      };
    };


    $(".subheader.xml_id").attr('xml_id',xml_id);
    if (topic_json[global_topic]==undefined) {
      topic_json[global_topic]=[];
    };
    $( "#dialog-sub-heading" ).dialog( "open" );
    e.preventDefault();
  });


  $(document).on('click','.editing-formula',function(e){
    editing_state=true;
    console.log(xml_id);
    console.log($(this));
    parent=$(this);
    xml_id=parseInt($(this).attr("xml_index"));

    current_topic=topic_json[global_topic];
    for (var i = 0; i < current_topic.length; i++) {
      if (xml_id == current_topic[i].xml_id) {
            $('#formula_text').val(current_topic[i]['data']);
            break;
      };
    };


    $(".formula.xml_id").attr('xml_id',xml_id);
    if (topic_json[global_topic]==undefined) {
      topic_json[global_topic]=[];
    };
    $( "#dialog-formula" ).dialog( "open" );
    e.preventDefault();
  });

  $(document).on('click','.editing-html',function(e){
    editing_state=true;
    console.log(xml_id);
    console.log($(this));
    parent=$(this);
    xml_id=parseInt($(this).attr("xml_index"));

    current_topic=topic_json[global_topic];
    for (var i = 0; i < current_topic.length; i++) {
      if (xml_id == current_topic[i].xml_id) {
            // $('#sub_header_text').val(current_topic[i]['data']);
            tinyMCE.activeEditor.setContent(unescape(current_topic[i]['data']));
            break;
      };
    };


    $(".html.xml_id").attr('xml_id',xml_id);
    if (topic_json[global_topic]==undefined) {
      topic_json[global_topic]=[];
    };
    $( "#dialog-html" ).dialog( "open" );
    e.preventDefault();
  });


  $(document).on('click','.editing-image',function(e){
    editing_state=true;
    console.log(xml_id);
    console.log($(this));
    parent=$(this);
    xml_id=parseInt($(this).attr("xml_index"));

    current_topic=topic_json[global_topic];
    for (var i = 0; i < current_topic.length; i++) {
      if (xml_id == current_topic[i].xml_id) {
        $('#img-attr').val(current_topic[i]['attribution']);
            $('#img-attr').val(current_topic[i]['attribution']);
            break;
      };
    };


    $(".image.xml_id").attr('xml_id',xml_id);
    if (topic_json[global_topic]==undefined) {
      topic_json[global_topic]=[];
    };
    $( "#dialog-image" ).dialog( "open" );
    e.preventDefault();
  });




$(document).on('click','.editing-audio',function(e){
    editing_state=true;
    console.log(xml_id);
    console.log($(this));
    parent=$(this);
    xml_id=parseInt($(this).attr("xml_index"));

    current_topic=topic_json[global_topic];
    for (var i = 0; i < current_topic.length; i++) {
      if (xml_id == current_topic[i].xml_id) {
            $('#audio-attr').val(current_topic[i]['attribution']);
            break;
      };
    };


    $(".audio.xml_id").attr('xml_id',xml_id);
    if (topic_json[global_topic]==undefined) {
      topic_json[global_topic]=[];
    };
    $( "#dialog-audio" ).dialog( "open" );
    e.preventDefault();
  });



$(document).on('click','.editing-video',function(e){
    editing_state=true;
    console.log(xml_id);
    console.log($(this));
    parent=$(this);
    xml_id=parseInt($(this).attr("xml_index"));

    current_topic=topic_json[global_topic];
    for (var i = 0; i < current_topic.length; i++) {
      if (xml_id == current_topic[i].xml_id) {
            $('#video-attr').val(current_topic[i]['attribution']);
            break;
      };
    };


    $(".video.xml_id").attr('xml_id',xml_id);
    if (topic_json[global_topic]==undefined) {
      topic_json[global_topic]=[];
    };
    $( "#dialog-video" ).dialog( "open" );
    e.preventDefault();
  });





});

// editing-subheader
// editing-html
// editing-image
// editing-video
// editing-audio
// editing-formula




Array.prototype.diff = function(a) {
    return this.filter(function(i) {return !(a.indexOf(i) > -1);});
};