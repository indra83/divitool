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


// $(function(){
//   $('input').blur(function(event) {
//     event.target.checkValidity();
// }).bind('invalid', function(event) {
//     setTimeout(function() { $(event.target).focus();}, 50);
// });

  $.ajaxSetup({ cache: false });
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
      url: "/getfiles/master.json",
    }).done(function(data) {
      // $( this ).addClass( "done" );

    console.log("IN");
    // master_json=master.response_text;
    // master.success(function(data){
    console.log(data);
    master_json=JSON.parse(data);
    for (var i = master_json.chapters.length - 1; i >= 0; i--) {
      var a = $('<li>');
      var del_btn_ch=$('<button>').addClass('btn del-chp sidebar-btn btn-danger btn-xs').attr('chapterid',master_json.chapters[i]['id']).append($('<span>').addClass('glyphicon glyphicon-trash'));
      var edit_btn_ch=$('<button>').addClass('btn edit-chp sidebar-btn btn-warning btn-xs').attr('chapterid',master_json.chapters[i]['id']).append($('<span>').addClass('glyphicon glyphicon-edit'));

      var link=$('<a>').append(master_json.chapters[i]['name']);
      link.attr('chapter-id',i);
      link.prepend(edit_btn_ch);
      link.append(del_btn_ch);
      a.append(link);

      var top=$('<ul>');
      top.addClass('sortchapters');
      if (master_json.chapters[i].topics != undefined) {
        for (var j = master_json.chapters[i].topics.length - 1; j >= 0; j--) {


            var a1 = $('<li>');
            var link1=$('<a>').append(master_json.chapters[i].topics[j]['name']);
            var del_btn=$('<button>').addClass('btn del-tpc sidebar-btn btn-danger btn-xs').attr('chapterid',master_json.chapters[i]['id']).attr('topicid',master_json.chapters[i].topics[j]['id']).append($('<span>').addClass('glyphicon glyphicon-trash'));
            var edit_btn=$('<button>').addClass('btn edit-tpc sidebar-btn btn-warning btn-xs').attr('chapterid',master_json.chapters[i]['id']).attr('topicid',master_json.chapters[i].topics[j]['id']).append($('<span>').addClass('glyphicon glyphicon-edit'));
            link1.addClass('topic_link');
            link1.attr('chapter-id',i);
            link1.attr('topic-id',j);
            a1.append(edit_btn).append('&nbsp;');
            a1.append(link1);
            a1.append('&nbsp;').append(del_btn);
            top.prepend(a1);
        }

        var top1=$('<ul>');

        if (master_json.chapters[i].assessments == undefined) {
          master_json.chapters[i].assessments=[];
        };

        for (var k = 0; k < master_json.chapters[i].assessments.length; k++) {
          // master_json.chapters[i].assessments[k]
          var test_el=$('<li style="background-color:wheat;padding:2px;">');
          var link=$('<a>').append(master_json.chapters[i].assessments[k]['name']).addClass('assess');
          link.attr('chapter-id',i);
          link.attr('assessmentid',k);
          var del_btn_ch=$('<button>').addClass('btn del-test sidebar-btn btn-danger btn-xs').attr('chapterid',master_json.chapters[i]['id']).attr('assessmentid',master_json.chapters[i].assessments[k]['id']).append($('<span>').addClass('glyphicon glyphicon-trash'));
          var edit_btn_ch=$('<button>').addClass('btn edit-test sidebar-btn btn-warning btn-xs').attr('chapterid',master_json.chapters[i]['id']).attr('assessmentid',master_json.chapters[i].assessments[k]['id']).append($('<span>').addClass('glyphicon glyphicon-edit'));
          test_el.append(edit_btn_ch)
          test_el.append(link);
          test_el.append(del_btn_ch);
          top1.prepend(test_el);
        }



        a.append(top);
        a.append(top1);
      }

      $('#book-nav').prepend(a);
      // $('#book-desc').html(master_json['name']);

    }

        $('#bookname-cont').html(' Book Name : '+master_json['name']);
        $('#bookid-cont').html(' Book ID : '+master_json['bookId']);
        $('#courseid-cont').html(' Course ID : '+master_json['courseId']);
        $('#bookorder-cont').html(' Book Order : '+master_json['orderNo']);
        $('#bookversion-cont').html(' Book Version : '+master_json['version']);

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
        master_json={'name':'default book name','bookId':'bookid','courseId':'courseid','version':0,'orderNo':0,'chapters':[]};
        // $('#book-desc').html(master_json['name']);
        $('#bookname-cont').append(' Book Name : '+master_json['name']);
        $('#bookid-cont').append(' Book ID : '+master_json['bookId']);
        $('#courseid-cont').append(' Course ID : '+master_json['courseId']);
        $('#bookorder-cont').append(' Book Order : '+master_json['orderNo']);
        $('#bookversion-cont').append(' Book Version : '+master_json['version']);
      };


    });


//     'bookId' - id (alpha numeric and '_')
// 'courseId' - id
// 'name' - String
// 'version' - int
// 'orderNo' - int

// try{
//   var master=$.get('/getfiles/master.json');
// }catch(err){

// }
//   console.log(master);
//   if (master.status==404) {
//     master_json={'name':'default','chapters':[]};
//   }else{

//   };






$('#sidebar').on('mouseover','.sortable',function(){
    $(this).children('.inner-btn').css('visibility','visible');
});

$('#sidebar').on('mouseout','.sortable',function(){
    $(this).children('.inner-btn').css('visibility','hidden');
});

$('#book-show').on('mouseover','#book-nav li',function(){
    $(this).find('.sidebar-btn').css('visibility','visible');
});

$('#book-show').on('mouseout','#book-nav li',function(){
    $(this).find('.sidebar-btn').css('visibility','hidden');
});

$('#book-show').on('mouseover','.sortchapters li',function(){
    $(this).find('.sidebar-btn').css('visibility','visible');
});

$('#book-show').on('mouseout','.sortchapters li',function(){
    $(this).find('.sidebar-btn').css('visibility','hidden');
});

$(document).on('click','#bookedit',function(){
  $('#bookname').val(master_json['name']);
  $('#bookid').val(master_json['bookId']);
  $('#courseid').val(master_json['courseId']);
  $('#bookorder').val(master_json['orderNo']);
  $('#bookversion').val(master_json['version']);
  $('#dialog-book').dialog('open');
  return false;

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
            case "heading3":

              current_topic.push({'type':'header','data':iterate.children[i].textContent,'xml_id':i,'id':iterate.children[i].getAttribute('id')})


              break;
        case "subtopic":
              current_topic.push({'type':'subheader','data':iterate.children[i].textContent,'xml_id':i,'id':iterate.children[i].getAttribute('id')})

              break;

        case "html":
              // s=(new XMLSerializer()).serializeToString(iterate.children[i])
              try{
                current_topic.push({'type':'html','data':escape(iterate.children[i].getElementsByTagName('data')[0].textContent),'xml_id':i,'attribution':iterate.children[i].getElementsByTagName('references')[0].children[0].textContent,'name':iterate.children[i].getElementsByTagName('references')[0].children[1].textContent,'url':iterate.children[i].getElementsByTagName('references')[0].children[2].textContent,'license':iterate.children[i].getElementsByTagName('references')[0].children[3].textContent,'box_type':(iterate.children[i].getAttribute('boxType') ? iterate.children[i].getAttribute('boxType') : '' ),'box_title':iterate.children[i].getAttribute('boxTitle')})
              }catch(err){
                current_topic.push({'type':'html','data':escape(iterate.children[i].getElementsByTagName('data')[0].textContent),'xml_id':i,'attribution':iterate.children[i].getElementsByTagName('references')[0].children[0].textContent,'name':iterate.children[i].getElementsByTagName('references')[0].children[1].textContent,'url':iterate.children[i].getElementsByTagName('references')[0].children[2].textContent,'license':iterate.children[i].getElementsByTagName('references')[0].children[3].textContent})
              }

              console.log("HTML");


              break;

        case "image":

              current_topic.push({'type':'image','data':iterate.children[i].getAttribute('src'),'allowFullscreen':iterate.children[i].getAttribute('allowFullscreen'),'showBorder':iterate.children[i].getAttribute('showBorder'),'xml_id':i,'attribution':iterate.children[i].getElementsByTagName('references')[0].children[0].textContent,'name':iterate.children[i].getElementsByTagName('references')[0].children[1].textContent,'url':iterate.children[i].getElementsByTagName('references')[0].children[2].textContent,'license':iterate.children[i].getElementsByTagName('references')[0].children[3].textContent,'description':iterate.children[i].getElementsByTagName('description')[0].textContent,'id':iterate.children[i].getAttribute('id'),'title':iterate.children[i].getElementsByTagName('title')[0].textContent});

              // var parent_div=document.createElement("div");

              break;

        case "video":
              current_topic.push({'type':'video','data':iterate.children[i].getAttribute('src'),'xml_id':i,'attribution':iterate.children[i].getElementsByTagName('references')[0].children[0].textContent,'name':iterate.children[i].getElementsByTagName('references')[0].children[1].textContent,'url':iterate.children[i].getElementsByTagName('references')[0].children[2].textContent,'license':iterate.children[i].getElementsByTagName('references')[0].children[3].textContent,'thumb':iterate.children[i].getAttribute('thumb'),'description':iterate.children[i].getElementsByTagName('description')[0].textContent,'id':iterate.children[i].getAttribute('id'),'title':iterate.children[i].getElementsByTagName('title')[0].textContent});



              break;

        case "audio":
              current_topic.push({'type':'audio','data':iterate.children[i].getAttribute('src'),'xml_id':i,'attribution':iterate.children[i].getElementsByTagName('references')[0].children[0].textContent,'name':iterate.children[i].getElementsByTagName('references')[0].children[1].textContent,'url':iterate.children[i].getElementsByTagName('references')[0].children[2].textContent,'license':iterate.children[i].getElementsByTagName('references')[0].children[3].textContent,'description':iterate.children[i].getElementsByTagName('description')[0].textContent,'id':iterate.children[i].getAttribute('id'),'title':iterate.children[i].getElementsByTagName('title')[0].textContent});
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


  $('#sidebar').on('click','.del-btn',function(){
    current_clicked=parseInt($(this).attr('xml_index'),10);
    // $('#dialog-add').dialog('open');
    var result = confirm("Are you sure you want to delete this element?");

    if (result) {
      current_topic=topic_json[global_topic];
      for (var i = 0; i < current_topic.length; i++) {
        if (current_topic[i]['xml_id'] == current_clicked) {
          current_topic.splice(i,1);
          break;
        }
      }
      topic_json[global_topic]=current_topic;
      refresh_dom();
    }
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
    tinymce.activeEditor.chapterid=master_json.chapters[global_chapter]['id'];
    tinymce.activeEditor.topic_id=master_json.chapters[global_chapter].topics[global_topic]['id'];

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
            $('#headerid').val(current_topic[i]['id']);
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
            $('#subheadingid').val(current_topic[i]['id']);
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

  $(document).on('click','.assess',function(e){
    var popup = window.open('http://localhost:8080/tool/assessment.html?chapter='+$(this).attr('chapter-id')+"&assessment="+$(this).attr('assessmentid'));
    popup.json=JSON.stringify(master_json);
    popup.assessment=$(this).attr('assessmentid');
    popup.chapter=$(this).attr('chapter-id');
    popup.postMessage(JSON.stringify(master_json),'http://localhost:8080/tool/assessment.html');
    e.preventDefault();
  });

window.addEventListener('message',function(event) {
  // if(event.origin !== 'http://scriptandstyle.com') return;
  console.log('received response:  ',event.data);
},false);

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
            $('#html-attr').val(current_topic[i]['attribution']);
            $('#html-attr-name').val(current_topic[i]['name']);
            $('#html-attr-url').val(current_topic[i]['url']);
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
            $('#imageid').val(current_topic[i]['id']);
            $('#img-attr').val(current_topic[i]['attribution']);
            $('#img-desc').val(current_topic[i]['description']);
            $('#img-title').val(current_topic[i]['title']);
            $('#img-attr-name').val(current_topic[i]['name']);
            $('#img-attr-url').val(current_topic[i]['url']);
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
          $('#audioid').val(current_topic[i]['id']);
          $('#audio-title').val(current_topic[i]['title']);
            $('#audio-attr').val(current_topic[i]['attribution']);
            $('#audio-desc').val(current_topic[i]['description']);
            $('#audio-attr-name').val(current_topic[i]['name']);
            $('#audio-attr-url').val(current_topic[i]['url']);
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
            $('#videoid').val(current_topic[i]['id']);
            $('#video-attr').val(current_topic[i]['attribution']);
            $('#video-desc').val(current_topic[i]['description']);
            $('#video-title').val(current_topic[i]['title']);
            $('#video-attr-name').val(current_topic[i]['name']);
            $('#video-attr-url').val(current_topic[i]['url']);
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

$(document).on('click','.del-chp',function(e){
  var result=confirm("Are you Sure you want to delete this chapter?")
  if (result == true) {
    var chapterid=$(this).attr('chapterid');

    for (var i = 0; i < master_json.chapters.length; i++) {
            if (master_json.chapters[i]['id'] == chapterid) {
              master_json.chapters.splice(i,1);
              break;
            };
            // master_json.chapters[i]
    };
    window.URL = window.webkitURL || window.URL;
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
    file = new Blob([JSON.stringify(master_json, undefined, 2)]);
    file.name="master.json";

    uploadFiles('/savefile/',file);

    refresh_chapters();
  };
 e.preventDefault();
});


$(document).on('click','.del-tpc',function(e){
  var result=confirm("Are you Sure you want to delete this Topic?")
  if (result == true) {
    var chapterid=$(this).attr('chapterid');
    var topicid=$(this).attr('topicid');

    for (var i = 0; i < master_json.chapters.length; i++) {
            if (master_json.chapters[i]['id'] == chapterid) {
              for (var j = 0; j < master_json.chapters[i].topics.length; j++) {
                if (master_json.chapters[i].topics[j]['id'] == topicid) {
                    master_json.chapters[i].topics.splice(j,1);
                    break;
                };
              };
              break;
            };
            // master_json.chapters[i]
    };
    window.URL = window.webkitURL || window.URL;
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
    file = new Blob([JSON.stringify(master_json, undefined, 2)]);
    file.name="master.json";

    uploadFiles('/savefile/',file);

    refresh_chapters();
  };
 e.preventDefault();
});


$(document).on('click','.del-test',function(e){
  var result=confirm("Are you Sure you want to delete this Assessment?")
  if (result == true) {
    var chapterid=$(this).attr('chapterid');
    var assessmentid=$(this).attr('assessmentid');

    for (var i = 0; i < master_json.chapters.length; i++) {
            if (master_json.chapters[i]['id'] == chapterid) {
              for (var j = 0; j < master_json.chapters[i].assessments.length; j++) {
                if (master_json.chapters[i].assessments[j]['id'] == assessmentid) {
                    master_json.chapters[i].assessments.splice(j,1);
                    break;
                };
              };
              break;
            };
            // master_json.chapters[i]
    };
    window.URL = window.webkitURL || window.URL;
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
    file = new Blob([JSON.stringify(master_json, undefined, 2)]);
    file.name="master.json";

    uploadFiles('/savefile/',file);

    refresh_chapters();
  };
 e.preventDefault();
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