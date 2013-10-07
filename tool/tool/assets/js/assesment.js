topic_json=[];
// global_question=-1;
global_assessment=-1;
global_question=-1;
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

defArray=[];

$.ajaxSetup({ cache: false });

var assessments_json={};




window.addEventListener('message',function(event) {
	// if(event.origin !== 'http://davidwalsh.name') return;
	console.log('message received:  ' + event.data,event);
	event.source.postMessage('holla back youngin!',event.origin);
},false);

$(function(){

	global_chapter= parseInt($.url.param('chapter'),10);
	global_assessment=parseInt($.url.param('assessment'),10);





$('#mod-quest').click(function(){
  $("#questionid").removeAttr("disabled");
  $('#dialog-quest').dialog('open');
});



$('#dialog-quest').dialog({
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
      buttons: {
        "Insert Question": function() {
            // master_json.chapters.push({'name':$('#chapter_name').val(),'order':parseInt($('#chapter_no').val())});
            // if (master_json.chapters[parseInt($('#chapter_no').val())-1] != undefined) {
              topic_json[global_question]=topic_json[global_question] || [];

              var uniqueness=true;
              var chp_id=$('#questionid').val();

              for (var i = 0; i < master_json.chapters.length; i++) {

                if (master_json.chapters[i]['id'] == chp_id) {
                  uniqueness=false;
                };

                for (var j = 0; j < master_json.chapters[i].topics.length; j++) {
                  if (master_json.chapters[i].topics[j]['id'] == chp_id) {
                    uniqueness=false;
                  };
                };
              };

              if ($('#questionid').val().match('^[_a-zA-Z0-9]+$') == null) {
                alert("The ID is wrong. It can only include alpha numerals and (_)");
              }else if(!uniqueness){
                alert("The ID is not unique through the book.");
              }else{


                    if (editing_state==true) {
                      editing_state=false;
                      for (var i = 0; i < master_json.chapters.length; i++) {
                        if (master_json.chapters[i]['id']==$('#chapterid').val()) {
                          master_json.chapters[i]['name']=$('#chapter_name').val();
                          break;
                        }

                      };
                    }else{
                      if (assessments_json.questions == undefined) {
                        assessments_json.questions=[];
                      };
                      assessments_json.questions.push({'id':$('#questionid').val(),'name':$('#question_name').val()});

                        var dom = jsxml.fromString('<?xml version="1.0" encoding="UTF-8"?><root/>'),
                          child = dom.createElement('question');
                          child.setAttribute('id', $('#questionid').val());
                          dom.documentElement.appendChild(child);

                          window.URL = window.webkitURL || window.URL;
                          window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
                          file = new Blob([jsxml.toXml(dom)]);


                          file.name="question.xml"
                          // file.append(master_json);
                          // var a = document.getElementById("downloadFile");
                          // a.hidden = '';
                          // a.href = window.URL.createObjectURL(file.getBlob('text/plain'));
                          // a.download = 'filename.txt';
                          // a.textContent = 'Download file!';


                          uploadFiles('/savefile/'+master_json.chapters[global_chapter]['id']+"/"+assessments_json['id']+"/"+$('#questionid').val(),file);


                    }




                  window.URL = window.webkitURL || window.URL;
                  window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
                  file = new Blob([JSON.stringify(assessments_json, undefined, 2)]);
                  file.name="assessments_json.json";
                  // file.append(master_json);
                  // var a = document.getElementById("downloadFile");
                  // a.hidden = '';
                  // a.href = window.URL.createObjectURL(file.getBlob('text/plain'));
                  // a.download = 'filename.txt';
                  // a.textContent = 'Download file!';


                  uploadFiles('/savefile/'+master_json.chapters[global_chapter]['id']+"/"+assessments_json['id'],file);

                  global_question=topic_json.length;
                  topic_json[global_question] = topic_json[global_question] || [];
                  topic_json[global_question].push({"type":"html","data":escape("Please Edit the Question"),"xml_id":(current_clicked),"attribution":"Attribution of question"});





                  // $.post('/savefile/.json', {file1:master_json}).done(function(data) {
                  //   console.log(data);
                  // });

                  refresh_chapters();
                  refresh_dom();

                  $( this ).dialog( "close" );

              }


        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function() {
        $('#sub_header_text').val('');
        $( '#dialog-add' ).dialog( "close" );
      }
    });


$( "#dialog-add" ).dialog({
      autoOpen: false,
      height: 500,
      width: 350,
      modal: true,
      buttons: {
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function() {

      }
    });



$('#book-show').on('click','.quest_link',function(){
	global_question=parseInt($(this).attr('questionid'),10);
    // global_assessment=parseInt($(this).attr('assessmentid'),10);
    // global_chapter=parseInt($(this).attr('chapter-id'),10);
    topic_json[global_question]=[];

    var xml_string="";

    current_topic=topic_json[global_question] || [];
    $.ajax({
      dataType:"xml",
      url: "/getfiles/"+master_json.chapters[global_chapter]['id']+"/"+assessments_json['id']+"/"+assessments_json.questions[global_question]['id']+"/question.xml",
    }).done(function(data) {

      var iterate=data.childNodes[0];
      for (var i = 0; i < iterate.children.length; i++) {
        console.log(iterate.children[i]);
        console.log(iterate.children[i].nodeName);
        console.log(iterate.children[i].InnerText);

        switch(iterate.children[i].nodeName){
            case "header":

              current_topic.push({'type':'header','data':iterate.children[i].textContent,'xml_id':i,'id':iterate.children[i].getAttribute('id')})


              break;
        case "subheader":
              current_topic.push({'type':'subheader','data':iterate.children[i].textContent,'xml_id':i,'id':iterate.children[i].getAttribute('id')})

              break;

        case "html":
              // s=(new XMLSerializer()).serializeToString(iterate.children[i])
              current_topic.push({'type':'html','data':escape(iterate.children[i].getElementsByTagName('data')[0].textContent),'xml_id':i,'attribution':iterate.children[i].getElementsByTagName('references')[0].textContent})
              console.log("HTML");


              break;

        case "option":
        	current_topic.push({'type':'option','data':escape(iterate.children[i].getElementsByTagName('data')[0].textContent),'xml_id':i,'is_correct':iterate.children[i].getAttribute('isAnswer')})
              console.log("HTML");

              break;

        case "image":

              current_topic.push({'type':'image','data':iterate.children[i].getAttribute('src'),'correct_x':iterate.children[i].getAttribute('correct_x'),'correct_y':iterate.children[i].getAttribute('correct_y'),'allowFullscreen':iterate.children[i].getAttribute('allowFullscreen'),'xml_id':i,'attribution':iterate.children[i].getElementsByTagName('references')[0].textContent,'description':iterate.children[i].getElementsByTagName('description')[0].textContent,'id':iterate.children[i].getAttribute('id')});

              // var parent_div=document.createElement("div");

              break;

        case "video":
              current_topic.push({'type':'video','data':iterate.children[i].getAttribute('src'),'xml_id':i,'attribution':iterate.children[i].getElementsByTagName('references')[0].textContent,'thumb':iterate.children[i].getAttribute('thumb'),'description':iterate.children[i].getElementsByTagName('description')[0].textContent,'id':iterate.children[i].getAttribute('id')});



              break;

        case "audio":
              current_topic.push({'type':'audio','data':iterate.children[i].getAttribute('src'),'xml_id':i,'attribution':iterate.children[i].getElementsByTagName('references')[0].textContent,'description':iterate.children[i].getElementsByTagName('description')[0].textContent,'id':iterate.children[i].getAttribute('id')});
              //   var parent_div=document.createElement("div");


                  break;



        case "formula":
              current_topic.push({'type':'formula','data':iterate.children[i].textContent,'xml_id':i});

                break;
        }

      };
      topic_json[global_question]=current_topic;
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
      current_topic=topic_json[global_question];
      for (var i = 0; i < current_topic.length; i++) {
        if (current_topic[i]['xml_id'] == current_clicked) {
          current_topic.splice(i,1);
          break;
        }
      }
      topic_json[global_question]=current_topic;
      refresh_dom();
    }
    return false;
  });



// NEW CODE


$.ajax({
      url: "/getfiles/master.json",
    }).done(function(data) {

      master_json=JSON.parse(data);

      $.ajax({
      url: "/getfiles/"+master_json.chapters[global_chapter]['id']+"/"+master_json.chapters[global_chapter].assessments[global_assessment]['id']+"/assessments_json.json",
    }).done(function(data) {

      assessments_json=JSON.parse(data);

      refresh_chapters();



    }).fail(function(data){
      alert('No assesment json. Loading new json');
      assessments_json=master_json.chapters[global_chapter].assessments[global_assessment];
    });



}).fail(function(data){
      console.log(data);
    });





// a.append(top);



  // $.ajax({
  //     url: "/getfiles/master.json",
  //   }).done(function(data) {
  //     // $( this ).addClass( "done" );

  //   console.log("IN");
  //   // master_json=master.response_text;
  //   // master.success(function(data){
  //   console.log(data);
  //   master_json=JSON.parse(data);
    // for (var i = master_json.chapters.length - 1; i >= 0; i--) {
    //   var a = $('<li>');
    //   var del_btn_ch=$('<button>').addClass('btn del-chp sidebar-btn btn-danger btn-xs').attr('chapterid',master_json.chapters[i]['id']).append($('<span>').addClass('glyphicon glyphicon-trash'));
    //   var edit_btn_ch=$('<button>').addClass('btn edit-chp sidebar-btn btn-warning btn-xs').attr('chapterid',master_json.chapters[i]['id']).append($('<span>').addClass('glyphicon glyphicon-edit'));

    //   var link=$('<a>').append(master_json.chapters[i]['name']);
    //   link.attr('chapter-id',i);
    //   link.prepend(edit_btn_ch);
    //   link.append(del_btn_ch);
    //   a.append(link);

    //   var top=$('<ul>');
    //   top.addClass('sortchapters');
    //   if (master_json.chapters[i].topics != undefined) {
    //     for (var j = master_json.chapters[i].topics.length - 1; j >= 0; j--) {


    //         var a1 = $('<li>');
    //         var link1=$('<a>').append(master_json.chapters[i].topics[j]['name']);
    //         var del_btn=$('<button>').addClass('btn del-tpc sidebar-btn btn-danger btn-xs').attr('chapterid',master_json.chapters[i]['id']).attr('topicid',master_json.chapters[i].topics[j]['id']).append($('<span>').addClass('glyphicon glyphicon-trash'));
    //         var edit_btn=$('<button>').addClass('btn edit-tpc sidebar-btn btn-warning btn-xs').attr('chapterid',master_json.chapters[i]['id']).attr('topicid',master_json.chapters[i].topics[j]['id']).append($('<span>').addClass('glyphicon glyphicon-edit'));
    //         link1.addClass('topic_link');
    //         link1.attr('chapter-id',i);
    //         link1.attr('topic-id',j);
    //         a1.append(edit_btn).append('&nbsp;');
    //         a1.append(link1);
    //         a1.append('&nbsp;').append(del_btn);
    //         top.prepend(a1);
    //     }

    //     var top1=$('<ul>');

    //     for (var k = 0; k < master_json.chapters[i].assessments.length; k++) {
    //       // master_json.chapters[i].assessments[k]
    //       var test_el=$('<li style="background-color:wheat;">');
    //       var link=$('<a>').append(master_json.chapters[i].assessments[k]['name']).addClass('assess');
    //       link.attr('chapter-id',i);
    //       link.attr('assessmentid',k);
    //       var del_btn_ch=$('<button>').addClass('btn del-chp sidebar-btn btn-danger btn-xs').attr('chapterid',master_json.chapters[i]['id']).attr('assessmentid',master_json.chapters[i].assessments[j]).append($('<span>').addClass('glyphicon glyphicon-trash'));
    //       var edit_btn_ch=$('<button>').addClass('btn edit-chp sidebar-btn btn-warning btn-xs').attr('chapterid',master_json.chapters[i]['id']).attr('assessmentid',master_json.chapters[i].assessments[j]).append($('<span>').addClass('glyphicon glyphicon-edit'));
    //       link.prepend(edit_btn_ch);
    //       link.append(del_btn_ch);
    //       test_el.append(link);
    //       top1.prepend(test_el);
    //     }



    //     a.append(top);
    //     a.append(top1);
    //   }

    //   $('#book-nav').prepend(a);
    //   // $('#book-desc').html(master_json['name']);

    // }

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

    // current_topic=topic_json[global_question]
    var temp_array=[]
    for (var i = 0; i <master_json.chapters[global_chapter].topics.length ; i++) {
      temp_array[i]=master_json.chapters[global_chapter].topics[parseInt(after_tn_array[i])];

      // current_topic[parseInt(after_tn_array[i])];
    };

    master_json.chapters[global_chapter].topics=temp_array;

    // for (var i = 0; i <current_topic.length; i++) {
    //   current_topic[i].xml_id=i;
    // };

    // topic_json[global_question]=current_topic;

  //   refresh_chapters();

    }
  });



    // }).fail(function(data){
    //   console.log(data);
    //   if (data.status==404) {
    //     master_json={'name':'default book name','bookId':'bookid','courseId':'courseid','version':0,'orderNo':0,'chapters':[]};
    //     // $('#book-desc').html(master_json['name']);
    //     $('#bookname-cont').append(' Book Name : '+master_json['name']);
    //     $('#bookid-cont').append(' Book ID : '+master_json['bookId']);
    //     $('#courseid-cont').append(' Course ID : '+master_json['courseId']);
    //     $('#bookorder-cont').append(' Book Order : '+master_json['orderNo']);
    //     $('#bookversion-cont').append(' Book Version : '+master_json['version']);
    //   };


    // });


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

$(document).on('click','.mod-html',function(e){
    console.log(xml_id);
    console.log($(this));
    clicked=$(this);
    tinymce.activeEditor.chapterid=master_json.chapters[global_chapter]['id'];
    tinymce.activeEditor.assessmentid=assessments_json['id'];
    tinymce.activeEditor.topic_id=assessments_json.questions[global_question]['id'];

    if (topic_json[global_question]==undefined) {
      topic_json[global_question]=[];
    };
    $( "#dialog-html" ).dialog( "open" );
    e.preventDefault();
  });


$(document).on('click','.mod-canvas',function(e){
    console.log(xml_id);
    console.log($(this));
    clicked=$(this);


    if (topic_json[global_question]==undefined) {
      topic_json[global_question]=[];
    };
    $( "#dialog-canvas" ).dialog( "open" );
    e.preventDefault();
  });



$(document).on('click','.mod-opt',function(e){
    console.log(xml_id);
    console.log($(this));
    clicked=$(this);
    tinymce.activeEditor.chapterid=master_json.chapters[global_chapter]['id'];
    tinymce.activeEditor.assessmentid=assessments_json['id'];
    tinymce.activeEditor.topic_id=assessments_json.questions[global_question]['id'];

    if (topic_json[global_question]==undefined) {
      topic_json[global_question]=[];
    };
    $( "#dialog-opt" ).dialog( "open" );
    e.preventDefault();
  });


$(document).on('click','.mod-image',function(e){
    console.log(xml_id);
    console.log($(this));
    clicked=$(this);

    if (topic_json[global_question]==undefined) {
      topic_json[global_question]=[];
    };
    $( "#dialog-image" ).dialog( "open" );
    e.preventDefault();
  });

$( "#dialog-canvas" ).dialog({
      autoOpen: false,
      height: 600,
      width: 600,
      modal: true,
      buttons: {
        "Insert Question": function() {

          var canvas_x=$('#canvas_x').val();
          var canvas_y=$('#canvas_y').val();
          var canvas_xml=$('#canvas_xml').val();

          var final_x=canvas_x/$('#image-ppt').width();
          var final_y=canvas_y/$('#image-ppt').height();

          for (var i = 0; i < topic_json[global_question].length; i++) {
            if (canvas_xml==topic_json[global_question][i]['id']) {
              topic_json[global_question][i].correct_x=final_x;
              topic_json[global_question][i].correct_y=final_y;
            }
          }

          $( this ).dialog( "close" );
          refresh_dom();

        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function() {
        $('#main-body').html('');
        $( '#dialog-add' ).dialog( "close" );
      }
    });



$( "#dialog-image" ).dialog({
      autoOpen: false,
      height: 500,
      width: 350,
      modal: true,
      buttons: {
        "Insert Image": function() {


            var attr_text=$('#img-attr').val();

            var desc_text=$('#img-desc').val();

            var full_screen=$('#fullscheck').is(':checked');

            var id=$('#imageid').val();
            i=i+1;

            var uniqueness=true;
            var regex=false;

            for (var i = 0; i < topic_json[global_question].length; i++) {
                if(topic_json[global_question][i]['id'] == id){
                  uniqueness=false;
                }
            };

            if (id.match('^[_a-zA-Z0-9]+$') == null) {
              alert("The ID is wrong. It can only include alpha numerals and (_)");
            }else if(!uniqueness){
              alert("The ID is not unique");
            }else{


                  var files=document.getElementById('imagefilemod').files;
                  $("#overlay").show();
                  var fslocation= global_chapter+"/"+global_question+"/media";
                  console.log(fslocation);
                  var file_name=files[0].name;
                  insert=true;

                  var current_topic=topic_json[global_question];


                  var deferred = new $.Deferred();
                    // var deferred1 = new $.Deferred();
                    defArray.push(deferred);
                    // defArray.push(deferred1);

                  // var deferred1

                  var img_dlg=$(this);




                  for (var i = 0, f; f = files[i]; i++) {
                    uploadFilesImage('/savefile/'+master_json.chapters[global_chapter]['id']+"/"+assessments_json['id']+"/"+assessments_json.questions[global_question]['id'],f,deferred);
                  }




                  if (editing_state == true) {

                    // $('#header_text').val()

                    $.when.apply($, defArray).then( function() {
                      xml_id=parseInt($(".image.xml_id").attr('xml_id'));
                      editing_state=false;
                    //this code is called after all the ajax calls are done
                      // sanitise_media();
                       // topic_json[global_question].push({"type":"image","data":file_name,"xml_id":(current_clicked),"attribution":attr_text});
                       for(var i=0, len=current_topic.length; i < len; i++){
                          if (xml_id == parseInt(current_topic[i].xml_id,10)) {
                            current_topic[i].data=file_name;
                            current_topic[i].attribution=attr_text;
                            current_topic[i].description=desc_text;
                            current_topic[i].allowFullscreen=full_screen;
                            topic_json[global_question]=current_topic;
                            break;
                          };
                        }

                       $("#overlay").hide();
                       $('#canvas_xml').val(id);

                       var canvas = document.getElementById('image-ppt');

                      var context = canvas.getContext('2d');

                      // load image from data url
                      var imageObj = new Image();
                      imageObj.onload = function() {

                        canvas.width=parseInt(imageObj.width);
                        canvas.height=parseInt(imageObj.height);

                        context.drawImage(this, 0, 0);
                      };

                      imageObj.src = "/getfiles/"+master_json.chapters[global_chapter]['id']+"/"+assessments_json['id']+"/"+assessments_json.questions[global_question]['id']+"/"+file_name;







                       $('#dialog-canvas').dialog('open');
                      // refresh_dom();

                      // img_dlg.dialog( "close" );

                    });

                  }else{



                    $.when.apply($, defArray).then( function() {
                            for(var i=0, len=current_topic.length; i < len; i++){
                                if (i>=current_clicked) {
                                  var temp=current_topic[i];
                                  temp.xml_id = parseInt(temp.xml_id)+1;
                                  current_topic[i]=temp;
                                }
                              }
                              topic_json[global_question]=current_topic;
                      //this code is called after all the ajax calls are done
                      // sanitise_media();
                      topic_json[global_question].push({"type":"image","data":file_name,"xml_id":(current_clicked),"attribution":attr_text,"description":desc_text,"allowFullscreen":full_screen,"id":id});
                      $("#overlay").hide();
                      $('#canvas_xml').val(id);

                       var canvas = document.getElementById('image-ppt');

                      var context = canvas.getContext('2d');

                      // load image from data url
                      var imageObj = new Image();
                      imageObj.onload = function() {
                        canvas.width=parseInt(imageObj.width);
                        canvas.height=parseInt(imageObj.height);
                        context.drawImage(this, 0, 0);
                      };

                      imageObj.src = "/getfiles/"+master_json.chapters[global_chapter]['id']+"/"+assessments_json['id']+"/"+assessments_json.questions[global_question]['id']+"/"+file_name;


                       $('#dialog-canvas').dialog('open');

                      // refresh_dom();

                      img_dlg.dialog( "close" );
                    });


                  }
            }



              // if (insert && ((file.name.toLowerCase().indexOf(".png") != -1) || (file.name.toLowerCase().indexOf(".jp") != -1) || (file.name.toLowerCase().indexOf(".gif") != -1)  )) {
              //  insert_image(file.name);
              // }else if(insert && ((file.name.toLowerCase().indexOf('.mp4')!=-1) || (file.name.toLowerCase().indexOf(".ogg") != -1) || (file.name.toLowerCase().indexOf(".webm") != -1) )){
              //  insert_video(file.name);
              // }




        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function() {
        $('#imageid').val('');
        $('#imagefilemod').val('');
        $('#img-attr').val('');
        $( '#dialog-add' ).dialog( "close" );
      }
    });

$( "#dialog-html" ).dialog({
      autoOpen: false,
      height: 600,
      width: 600,
      modal: true,
      buttons: {
        "Insert HTML": function() {

            var val=tinyMCE.activeEditor.getContent();
            // i=i+1;


                var current_topic=topic_json[global_question];
                var attr_text=$('#html-attr').val();


            if (editing_state == true) {
              xml_id=parseInt($(".html.xml_id").attr('xml_id'));
              editing_state=false;

              for(var i=0, len=current_topic.length; i < len; i++){
                if (xml_id == parseInt(current_topic[i].xml_id,10)) {
                  current_topic[i].data=val;
                  topic_json[global_question]=current_topic;
                  break;
                };
              }

              // $('#header_text').val()

            }else{
                  for(var i=0, len=current_topic.length; i < len; i++){
                    if (i>=current_clicked) {
                      var temp=current_topic[i];
                      temp.xml_id = parseInt(temp.xml_id)+1;
                      current_topic[i]=temp;
                    }
                  }
                  topic_json[global_question]=current_topic;
                  topic_json[global_question].push({"type":"html","data":escape(val),"xml_id":(current_clicked),"attribution":attr_text});
                }



              // if (insert && ((file.name.toLowerCase().indexOf(".png") != -1) || (file.name.toLowerCase().indexOf(".jp") != -1) || (file.name.toLowerCase().indexOf(".gif") != -1)  )) {
              //  insert_image(file.name);
              // }else if(insert && ((file.name.toLowerCase().indexOf('.mp4')!=-1) || (file.name.toLowerCase().indexOf(".ogg") != -1) || (file.name.toLowerCase().indexOf(".webm") != -1) )){
              //  insert_video(file.name);
              // }


              refresh_dom();

            tinyMCE.activeEditor.setContent('');
            $('#html-attr').val('');
            $( this ).dialog( "close" );

        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function() {
        $('#main-body').html('');
        $( '#dialog-add' ).dialog( "close" );
      }
    });


$(document).on('click','.editing-html',function(e){

    editing_state=true;
    console.log(xml_id);
    console.log($(this));
    parent=$(this);
    xml_id=parseInt($(this).attr("xml_index"));

    current_topic=topic_json[global_question];
    for (var i = 0; i < current_topic.length; i++) {
      if (xml_id == current_topic[i].xml_id) {
            // $('#sub_header_text').val(current_topic[i]['data']);
            tinymce.EditorManager.get('html_ip').setContent(unescape(current_topic[i]['data']));
            break;
      };
    };

    $(".html.xml_id").attr('xml_id',xml_id);
    if (topic_json[global_question]==undefined) {
      topic_json[global_question]=[];
    };
    $( "#dialog-html" ).dialog( "open" );
    e.preventDefault();
  });

$(document).on('click','.editing-option',function(e){
    editing_state=true;
    console.log(xml_id);
    console.log($(this));
    parent=$(this);
    xml_id=parseInt($(this).attr("xml_index"));

    current_topic=topic_json[global_question];
    for (var i = 0; i < current_topic.length; i++) {
      if (xml_id == current_topic[i].xml_id) {
            // $('#sub_header_text').val(current_topic[i]['data']);
            tinymce.EditorManager.get('opt_ip').setContent(unescape(current_topic[i]['data']));
            $('#html-attr').val(current_topic[i]['attribution']);
            break;
      };
    };

    $(".opt.xml_id").attr('xml_id',xml_id);
    if (topic_json[global_question]==undefined) {
      topic_json[global_question]=[];
    };
    $( "#dialog-opt" ).dialog( "open" );
    e.preventDefault();
  });



$( "#dialog-opt" ).dialog({
      autoOpen: false,
      height: 600,
      width: 600,
      modal: true,
      buttons: {
        "Insert Option": function() {

            var val=tinyMCE.activeEditor.getContent();
            // i=i+1;


                var current_topic=topic_json[global_question];
                // var attr_text=$('#html-attr').val();
                var is_correct=$('#correct').is(':checked');



            if (editing_state == true) {
              xml_id=parseInt($(".opt.xml_id").attr('xml_id'));
              editing_state=false;

              for(var i=0, len=current_topic.length; i < len; i++){
                if (xml_id == parseInt(current_topic[i].xml_id,10)) {
                  current_topic[i].data=val;
                  current_topic[i].isAnswer=is_correct;
                  topic_json[global_question]=current_topic;
                  break;
                };
              }

              // $('#header_text').val()

            }else{
                  for(var i=0, len=current_topic.length; i < len; i++){
                    if (i>=current_clicked) {
                      var temp=current_topic[i];
                      temp.xml_id = parseInt(temp.xml_id)+1;
                      current_topic[i]=temp;
                    }
                  }
                  topic_json[global_question]=current_topic;
                  topic_json[global_question].push({"type":"option","data":escape(val),"xml_id":(current_clicked),"is_correct":is_correct});
                }



              // if (insert && ((file.name.toLowerCase().indexOf(".png") != -1) || (file.name.toLowerCase().indexOf(".jp") != -1) || (file.name.toLowerCase().indexOf(".gif") != -1)  )) {
              //  insert_image(file.name);
              // }else if(insert && ((file.name.toLowerCase().indexOf('.mp4')!=-1) || (file.name.toLowerCase().indexOf(".ogg") != -1) || (file.name.toLowerCase().indexOf(".webm") != -1) )){
              //  insert_video(file.name);
              // }


              refresh_dom();

            tinyMCE.activeEditor.setContent('');
            $('#html-attr').val('');
            $( this ).dialog( "close" );

        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function() {
        $('#main-body').html('');
        $( '#dialog-add' ).dialog( "close" );
      }
    });

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





//ED OF NEW CODE


// FOR THE CANVAS

// $('#image-ppt').mousemove(function(e) {
//     var pos = findPos(this);
//     var x = e.pageX - pos.x;
//     var y = e.pageY - pos.y;
//     var coord = "x=" + x + ", y=" + y;
//     var c = this.getContext('2d');
//     var p = c.getImageData(x, y, 1, 1).data;
//     // var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
//     $('#status').html(coord + "<br>");
// });

$(document).on('click','#image-ppt',function(e){
    var pos = findPos(this);
    var x = e.pageX - pos.x;
    var y = e.pageY - pos.y;
    var coord = "x=" + x + ", y=" + y;

    $('#canvas_x').val(x);
    $('#canvas_y').val(y);

    var c = this.getContext('2d');
    var p = c.getImageData(x, y, 1, 1).data;
   $('#status').html(coord + "<br>");
});

//END OF CANVAS

  });


function uploadFiles(url, file) {
  var formData = new FormData();

  // for (var i = 0, file; file = files[i]; ++i) {
    formData.append(file.name, file,file.name);
  // }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.onload = function(e) {
    console.log(e);
  };

  xhr.send(formData);  // multipart/form-data

}



function refresh_dom(){

  current_topic=topic_json[global_question]

  var preview_pane=$('#preview');
  preview_pane.html('');

  var side_bar=$('#sidebar');
  side_bar.html('');

  preview_pane.append("<h1>"+assessments_json.questions[global_question]['id']+"<small> is being editted </small></h1><hr>");


  // var current_topic=topic_json[global_question];

  // if (current_topic == undefined) {
  //   break;
  // };


  current_topic.sort(function(obj1, obj2) {
    // Ascending: first age less than the previous
    return parseInt(obj1.xml_id) - parseInt(obj2.xml_id);
  });

      var dom = jsxml.fromString('<?xml version="1.0" encoding="UTF-8"?><question id="'+assessments_json.questions[global_question]['id']+'"/>');

      // child = dom.createElement('topic');
      // child.setAttribute('id', master_json.chapters[global_chapter].topics[global_question]['id']);
      // dom.documentElement.appendChild(child);


  for(var i=0, len=current_topic.length; i < len; i++){
    switch(current_topic[i].type){
        case "header":
              preview_pane.append("<h3>"+current_topic[i].data+"</h3>");

              var holder=$('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index='+current_topic[i].xml_id+' class="add-btn inner-btn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable testing1 header-d">HEADING</a>&nbsp;<button xml_index='+current_topic[i].xml_id+' class="del-btn inner-btn btn btn-danger btn-xs"><span class="glyphicon glyphicon-trash"></span></button>');
              side_bar.append(holder);


              child = dom.createElement('header');
              child.setAttribute('id',current_topic[i].id);

              child.textContent=current_topic[i].data;

              dom.documentElement.appendChild(child);


              // side_bar.append('<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable testing1 header-d">HEADING</a>');

              break;
        case "subheader":
              preview_pane.append("<h4>"+current_topic[i].data+"</h4>");

              var holder=$('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index='+current_topic[i].xml_id+' class="add-btn inner-btn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable editing-subheader header-d">SUB HEADING</a>&nbsp;<button xml_index='+current_topic[i].xml_id+' class="del-btn inner-btn btn btn-danger btn-xs"><span class="glyphicon glyphicon-trash"></span></button>');
              side_bar.append(holder);
              // side_bar.append('<a href="#" xml_index="'+current_topic[i].xml_id+'" class="testing1"> <i class="icon-plus-sign"></i> </a>');
              // side_bar.append('<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable plus">SUB HEADING</a>');

              child = dom.createElement('subheader');
              child.setAttribute('id',current_topic[i].id);

              child.textContent=current_topic[i].data;

              dom.documentElement.appendChild(child);

              break;

        case "html":
              console.log("HTML");
              preview_pane.append("<div>"+unescape(current_topic[i].data)+"</div>");
              preview_pane.append("Reference : "+current_topic[i].attribution+"<hr>");
              // preview_pane.attr('contenteditable','false');

              var holder=$('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index='+current_topic[i].xml_id+' class="add-btn inner-btn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable editing-html header-d">HTML</a>&nbsp;<button xml_index='+current_topic[i].xml_id+' class="del-btn inner-btn btn btn-danger btn-xs"><span class="glyphicon glyphicon-trash"></span></button>');
              side_bar.append(holder);

              child = dom.createElement('html');

              // child.textContent = unescape(current_topic[i].data);

              data1=dom.createElement('data');
              data1.textContent=unescape(current_topic[i].data);

              child.appendChild(data1);

              ref=dom.createElement('references');
              ref.textContent=current_topic[i].attribution;


              child.appendChild(ref);

              dom.documentElement.appendChild(child);

              // side_bar.append('<a href="#" xml_index="'+current_topic[i].xml_id+'" class="testing1"> <i class="icon-plus-sign"></i> </a>');
              // side_bar.append('<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable plus">HTML</a>');

              break;

        case "option":
              console.log("HTML");
              preview_pane.append("<div>"+unescape(current_topic[i].data)+"</div> <hr>");
              preview_pane.append("Is Correct : "+current_topic[i].is_correct);
              // preview_pane.attr('contenteditable','false');

              var holder=$('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index='+current_topic[i].xml_id+' class="add-btn inner-btn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable editing-option header-d">OPTION</a>&nbsp;<button xml_index='+current_topic[i].xml_id+' class="del-btn inner-btn btn btn-danger btn-xs"><span class="glyphicon glyphicon-trash"></span></button>');
              side_bar.append(holder);

              child = dom.createElement('option');
              child.setAttribute('isAnswer',current_topic[i].is_correct);

              // child.textContent = unescape(current_topic[i].data);

              data1=dom.createElement('data');
              data1.textContent=unescape(current_topic[i].data);

              child.appendChild(data1);

              // ref=dom.createElement('references');
              // ref.textContent=current_topic[i].attribution;


              // child.appendChild(ref);

              dom.documentElement.appendChild(child);

              break;

        case "image":
              var parent_div=document.createElement("div");

              var span = document.createElement("img");


              var attr_text = current_topic[i].attribution;

              var full_screen = current_topic[i].allowFullscreen;

              var correct_x=current_topic[i].correct_x;
              var correct_y=current_topic[i].correct_y;


              span.src = "/getfiles/"+master_json.chapters[global_chapter]['id']+"/"+assessments_json['id']+"/"+assessments_json.questions[global_question]['id']+"/"+current_topic[i]['data'];
              console.log(span);
              // span.src = global_chapter+"/"+global_question+"/"+"media/aram.png";
              span.width=320;
              // console.log("FFFIIIIINNNAAAALLLLLLLLLLLL");
              // console.log(e.target.result);
              // console.log("FFFIIIIINNNAAAALLLLLLLLLLLL END");
              // $('#'+xml_id).attr('src',e.target.result);


              // span.style.fontWeight = "bold";
              // span.innerHTML=" NMBS";

              var custom_text=document.createElement("p");
              custom_text.innerHTML="Reference : "+attr_text+"<br>"+"description :"+current_topic[i].description+"<br>Allow fullscreen: "+full_screen+"<br> Correct X"+correct_x+"<br> Correct Y : "+correct_y;
              parent_div.appendChild(span);
              parent_div.appendChild(custom_text);

              preview_pane.append(parent_div);

              var holder=$('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index='+current_topic[i].xml_id+' class="add-btn inner-btn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable editing-image header-d">IMAGE</a>&nbsp;<button xml_index='+current_topic[i].xml_id+' class="del-btn inner-btn btn btn-danger btn-xs"><span class="glyphicon glyphicon-trash"></span></button>');
              side_bar.append(holder);


              child = dom.createElement('image');
              child.setAttribute('id',current_topic[i].id);

              child.setAttribute('src',current_topic[i].data);
              child.setAttribute('correct_x',current_topic[i].correct_x);
              child.setAttribute('correct_y',current_topic[i].correct_y);
              child.setAttribute('allowFullscreen',current_topic[i].allowFullscreen);

              desc=dom.createElement('description');
              desc.textContent=current_topic[i].description;

              child.appendChild(desc);

              ref=dom.createElement('references');
              ref.textContent=attr_text;

              child.appendChild(ref);

              dom.documentElement.appendChild(child);

              // side_bar.append('<a href="#" xml_index="'+xml_id+'" class="testing1"> <i class="icon-plus-sign"></i> </a>');
              // side_bar.append('<a href="#" id="header" xml_index="'+xml_id+'" class="editable plus">Image</a>');

              break;

        case "video":
              var parent_div=document.createElement("div");

              var span = document.createElement("video");

              span.setAttribute('controls','');


              var attr_text = current_topic[i].attribution;


              span.src = "/getfiles/"+master_json.chapters[global_chapter]['id']+"/"+master_json.chapters[global_chapter].topics[global_question]['id']+"/"+current_topic[i]['data'];
              console.log(span);
              // span.src = global_chapter+"/"+global_question+"/"+"media/aram.png";
              span.width=320;
              // console.log("FFFIIIIINNNAAAALLLLLLLLLLLL");
              // console.log(e.target.result);
              // console.log("FFFIIIIINNNAAAALLLLLLLLLLLL END");
              // $('#'+xml_id).attr('src',e.target.result);


              // span.style.fontWeight = "bold";
              // span.innerHTML=" NMBS";

              // if (current_topic[i]['thumb1'] == undefined) {
                var custom_text=document.createElement("p");
                custom_text.innerHTML="Reference : "+attr_text+"<br>"+"description :"+current_topic[i].description;
                parent_div.appendChild(span);
                parent_div.appendChild(custom_text);
                // side_bar.append('<a href="#" xml_index="'+xml_id+'" class="testing1"> <i class="icon-plus-sign"></i> </a>');
                // side_bar.append('<a href="#" id="header" xml_index="'+xml_id+'" class="editable plus">Video</a>');
              // }else{
                var span1 = document.createElement("img");
                span1.src = "/getfiles/"+master_json.chapters[global_chapter]['id']+"/"+master_json.chapters[global_chapter].topics[global_question]['id']+"/"+current_topic[i]['thumb'];
                span1.width=100;
                parent_div.appendChild(span1);
              // };

              preview_pane.append(parent_div);


              var holder=$('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index='+current_topic[i].xml_id+' class="add-btn inner-btn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable editing-video header-d">VIDEO</a>&nbsp;<button xml_index='+current_topic[i].xml_id+' class="del-btn inner-btn btn btn-danger btn-xs"><span class="glyphicon glyphicon-trash"></span></button>');
              side_bar.append(holder);

              child = dom.createElement('video');
              child.setAttribute('id',current_topic[i].id);

              child.setAttribute('src',current_topic[i].data);

              // img1=dom.createElement('image');
              child.setAttribute('thumb',current_topic[i]['thumb']);

              desc=dom.createElement('description');
              desc.textContent=current_topic[i].description;

              child.appendChild(desc);

              ref=dom.createElement('references');
              ref.textContent=attr_text;

              child.appendChild(ref);

              // child.appendChild(img1);

              dom.documentElement.appendChild(child);


              break;

        case "audio":
                var parent_div=document.createElement("div");

                var span = document.createElement("audio");

                    span.setAttribute('controls','');


                var attr_text = current_topic[i].attribution;


                span.src = "/getfiles/"+master_json.chapters[global_chapter]['id']+"/"+master_json.chapters[global_chapter].topics[global_question]['id']+"/"+current_topic[i]['data'];
                // console.log(span);
                // span.src = global_chapter+"/"+global_question+"/"+"media/aram.png";
                span.width=320;
                // console.log("FFFIIIIINNNAAAALLLLLLLLLLLL");
                // console.log(e.target.result);
                // console.log("FFFIIIIINNNAAAALLLLLLLLLLLL END");
                // $('#'+xml_id).attr('src',e.target.result);


                // span.style.fontWeight = "bold";
                // span.innerHTML=" NMBS";

                // if (current_topic[i]['thumb1'] == undefined) {
                  var custom_text=document.createElement("p");
                  custom_text.innerHTML="Reference : "+attr_text+"<br>"+"description :"+current_topic[i].description;
                  parent_div.appendChild(span);
                  parent_div.appendChild(custom_text);
                  // side_bar.append('<a href="#" xml_index="'+xml_id+'" class="testing1"> <i class="icon-plus-sign"></i> </a>');
                  // side_bar.append('<a href="#" id="header" xml_index="'+xml_id+'" class="editable plus">Video</a>');
                  preview_pane.append(parent_div);



              var holder=$('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index='+current_topic[i].xml_id+' class="add-btn inner-btn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable editing-audio header-d">AUDIO</a>&nbsp;<button xml_index='+current_topic[i].xml_id+' class="del-btn inner-btn btn btn-danger btn-xs"><span class="glyphicon glyphicon-trash"></span></button>');
              side_bar.append(holder);

              child = dom.createElement('audio');
              child.setAttribute('id',current_topic[i].id);

              child.setAttribute('src',current_topic[i].data);

              desc=dom.createElement('description');
              desc.textContent=current_topic[i].description;

              child.appendChild(desc);

              ref=dom.createElement('references');
              ref.textContent=attr_text;

              child.appendChild(ref);

              dom.documentElement.appendChild(child);


                  break;
                // }else{
                  // var span1 = document.createElement("img");
                  // span1.src=current_topic[i]['thumb1'];
                  // span1.width=100;
                  // parent_div.appendChild(span1);


        case "formula":

                preview_pane.append('\\['+current_topic[i].data+'\\]');
                // MathJax.Hub.Queue(['Typeset',MathJax.Hub]);

              var holder=$('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index='+current_topic[i].xml_id+' class="add-btn inner-btn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable editing-formula header-d">FORMULA</a>&nbsp;<button xml_index='+current_topic[i].xml_id+' class="del-btn inner-btn btn btn-danger btn-xs"><span class="glyphicon glyphicon-trash"></span></button>');
              side_bar.append(holder);
                // loadImage('http://latex.codecogs.com/png.latex?'+current_topic[i].data,insert_formula,preview_pane);
                // side_bar.append('<a href="#" xml_index="'+xml_id+'" class="testing1"> <i class="icon-plus-sign"></i> </a>');
                // side_bar.append('<a href="#" id="header" xml_index="'+xml_id+'" class="editable plus">Formula</a>');
                child = dom.createElement('formula');
                child.setAttribute('id',current_topic[i].id);

                child.textContent=current_topic[i].data;



                dom.documentElement.appendChild(child);

                break;

    }
  }
side_bar.append('<button xml_index="'+current_topic.length+'" class="add-btn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>');

  // $('#side_bar').sortable();
  // $( "#side_bar" ).disableSelection();
  window.URL = window.webkitURL || window.URL;
            window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
            file = new Blob([jsxml.toXml(dom)]);


            file.name="question.xml"
            // file.append(master_json);
            // var a = document.getElementById("downloadFile");
            // a.hidden = '';
            // a.href = window.URL.createObjectURL(file.getBlob('text/plain'));
            // a.download = 'filename.txt';
            // a.textContent = 'Download file!';


            uploadFiles('/savefile/'+master_json.chapters[global_chapter]['id']+"/"+assessments_json['id']+"/"+assessments_json.questions[global_question]['id'],file);
}

function uploadFilesImage(url, file,deferred) {
  var formData = new FormData();

  // for (var i = 0, file; file = files[i]; ++i) {
    formData.append(file.name, file,file.name);
  // }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.onload = function(e) {

    if (this.status == 200) {
      $("#overlay").hide();
      deferred.resolve();

      // Note: .response instead of .responseText
      // var blob = new Blob([this.response], {type: 'image/png'});
    }else{
      $("#overlay").hide();
      deferred.reject();
    }
  };

  xhr.send(formData);  // multipart/form-data

}


function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

function refresh_chapters () {

          var current_pop = assessments_json;

          for (var i = 0; i < current_pop.questions.length; i++) {


                      var a1 = $('<li>');
                      var link1=$('<a>').append(current_pop.questions[i]['name']);
                      var del_btn=$('<button>').addClass('btn del-quest sidebar-btn btn-danger btn-xs').attr('chapterid',master_json.chapters[global_chapter]['id']).attr('questionid',current_pop.questions[i]['id']).append($('<span>').addClass('glyphicon glyphicon-trash'));
                      var edit_btn=$('<button>').addClass('btn edit-quest sidebar-btn btn-warning btn-xs').attr('chapterid',master_json.chapters[global_chapter]['id']).attr('questionid',current_pop.questions[i]['id']).append($('<span>').addClass('glyphicon glyphicon-edit'));

                      link1.addClass('quest_link');
                      link1.attr('questionid',i);
                      // link1.append(edit_btn).append('&nbsp;');
                      a1.append(edit_btn);
                      a1.append(link1);
                      a1.append(del_btn);
                      // link1.append('&nbsp;').append(del_btn);
                      $('#book-nav').prepend(a1);
          }
}