
$('#mod-chapter').click(function(){
  $('#dialog-chapter').dialog('open');
});

$('#mod-topic').click(function(){
  // Populate the option tags
  $('#chapter_select').html('');
  // var options=[];
  for (var i = 0; i < master_json.chapters.length; i++) {
    var op=$('<option>').attr('value',i).html(master_json.chapters[i]['name']);
    $('#chapter_select').append(op);
    // options.push(master_json.chapters[i]['name']);

  };



  $('#dialog-topic').dialog('open');
});



$('#dialog-topic').dialog({
      autoOpen: false,
      height: 300,
      width: 400,
      modal: true,
      buttons: {
        "Insert Topic": function() {
            // master_json.chapters.push({'name':$('#chapter_name').val(),'order':parseInt($('#chapter_no').val())});
            // if (master_json.chapters[parseInt($('#chapter_select').val())-1] != undefined) {
              if (master_json.chapters[parseInt($('#chapter_select').val())]['topics'] == undefined) {
                master_json.chapters[parseInt($('#chapter_select').val())]['topics']=[];
              };
                master_json.chapters[parseInt($('#chapter_select').val())]['topics'].push({'id':$('#topicnumber').val(),'name':$('#topicname').val()});
            // }else{
              // var result=confirm("You will be replacing a chapter. Are you sure you want to continue? All Data will be lost !!");
              // if (result) {
                // if (master_json.chapters[parseInt($('#chapter_select').val())-1]['topics'] == undefined) {
                    // master_json.chapters[parseInt($('#chapter_select').val())-1]['topics']=[];
                // };
                // master_json.chapters[parseInt($('#chapter_select').val())-1]['topics'][parseInt($('#topicnumber').val())-1]={'name':$('#topicname').val(),'order':parseInt($('#topicnumber').val())};
              // }
            // };




            var dom = jsxml.fromString('<?xml version="1.0" encoding="UTF-8"?><root/>'),
            child = dom.createElement('topic');
            child.setAttribute('id', $('#topicnumber').val());
            dom.documentElement.appendChild(child);

            window.URL = window.webkitURL || window.URL;
            window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
            file = new Blob([jsxml.toXml(dom)]);


            file.name="topic.xml"
            // file.append(master_json);
            // var a = document.getElementById("downloadFile");
            // a.hidden = '';
            // a.href = window.URL.createObjectURL(file.getBlob('text/plain'));
            // a.download = 'filename.txt';
            // a.textContent = 'Download file!';


            uploadFiles('/savefile/'+master_json.chapters[parseInt($('#chapter_select').val())]['id']+"/"+$('#topicnumber').val(),file);

            window.URL = window.webkitURL || window.URL;
            window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
            file = new Blob([JSON.stringify(master_json, undefined, 2)]);
            file.name="master.json";

            uploadFiles('/savefile/master',file);

            refresh_chapters();





            // $.post('/savefile/master.json', {file1:master_json}).done(function(data) {
            //   console.log(data);
            // });

            refresh_chapters();

            $( this ).dialog( "close" );

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


$('#dialog-chapter').dialog({
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
      buttons: {
        "Insert Chapter": function() {
            // master_json.chapters.push({'name':$('#chapter_name').val(),'order':parseInt($('#chapter_no').val())});
            // if (master_json.chapters[parseInt($('#chapter_no').val())-1] != undefined) {
                master_json.chapters.push({'id':$('#chapterid').val(),'name':$('#chapter_name').val()});
            // }else{
              // var result=confirm("You will be replacing a chapter. Are you sure you want to continue? All Data will be lost !!");
              // if (result) {
                // master_json.chapters[parseInt($('#chapter_no').val())-1]={'name':$('#chapter_name').val(),'order':parseInt($('#chapter_no').val())};
              // }
            // };


            window.URL = window.webkitURL || window.URL;
            window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
            file = new Blob([JSON.stringify(master_json, undefined, 2)]);
            file.name="master.json";
            // file.append(master_json);
            // var a = document.getElementById("downloadFile");
            // a.hidden = '';
            // a.href = window.URL.createObjectURL(file.getBlob('text/plain'));
            // a.download = 'filename.txt';
            // a.textContent = 'Download file!';


            uploadFiles('/savefile/master',file);





            // $.post('/savefile/master.json', {file1:master_json}).done(function(data) {
            //   console.log(data);
            // });

            refresh_chapters();

            $( this ).dialog( "close" );

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


function refresh_chapters(){
  $('#book-nav').html('');
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
}


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

$( "#dialog-heading" ).dialog({
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
      buttons: {
        "Insert Heading": function() {
            var val=$('#header_text').val();
            i=i+1;




            var current_topic=topic_json[global_topic];

            if (editing_state == true) {
              xml_id=parseInt($(".header.xml_id").attr('xml_id'));
              editing_state=false;

              for(var i=0, len=current_topic.length; i < len; i++){
                if (xml_id == parseInt(current_topic[i].xml_id,10)) {
                  current_topic[i].data=val;
                  topic_json[global_topic]=current_topic;
                  break;
                };
              }

              // $('#header_text').val()

            }else{

              console.log("EDIT FALSE");
              for(var i=0, len=current_topic.length; i < len; i++){
                if (i>=current_clicked) {
                    var temp=current_topic[i];
                    temp.xml_id = parseInt(temp.xml_id)+1;
                    current_topic[i]=temp;
                };

              }
              topic_json[global_topic]=current_topic;
              topic_json[global_topic].push({"type":"header","data":val,"xml_id":(current_clicked)});
            }


              refresh_dom();

            $( this ).dialog( "close" );

        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function() {
        $('#header_text').val('');
        $( '#dialog-add' ).dialog( "close" );
      }
    });

// SUB HEADING

$( "#dialog-sub-heading" ).dialog({
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
      buttons: {
        "Insert Sub-Heading": function() {
            var val=$('#sub_header_text').val();
            // i=i+1;
            var current_topic=topic_json[global_topic];
            if (editing_state == true) {
              xml_id=parseInt($(".subheader.xml_id").attr('xml_id'));
              editing_state=false;


              for(var i=0, len=current_topic.length; i < len; i++){
                if (xml_id == parseInt(current_topic[i].xml_id,10)) {
                  current_topic[i].data=val;
                  topic_json[global_topic]=current_topic;
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
              topic_json[global_topic]=current_topic;
              topic_json[global_topic].push({"type":"subheader","data":val,"xml_id":(current_clicked)});
            }

              refresh_dom();

            $( this ).dialog( "close" );

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

// END IF SUB HEADING

// IMAGE START
$( "#dialog-image" ).dialog({
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
      buttons: {
        "Insert Image": function() {

            // var val=$('#sub_header_text').val();
            // i=i+1;
            // var current_topic=topic_json[global_topic];
            //   for(var i=0, len=current_topic.length; i < len; i++){
            //     var temp=current_topic[i];
            //     temp.xml_id = parseInt(temp.xml_id)+1;
            //     current_topic[i]=temp;
            //   }
            //   topic_json[global_topic]=current_topic;
            //   topic_json[global_topic].push({"type":"subheader","data":val,"xml_id":(xml_id+1)});

            var attr_text=$('#img-attr').val();

            var desc_text=$('#img-desc').val();




            var files=document.getElementById('imagefilemod').files;
            $("#overlay").show();
            var fslocation= global_chapter+"/"+global_topic+"/media";
            console.log(fslocation);
            var file_name=files[0].name;
            insert=true;

            var current_topic=topic_json[global_topic];


            var deferred = new $.Deferred();
              // var deferred1 = new $.Deferred();
              defArray.push(deferred);
              // defArray.push(deferred1);

            // var deferred1

            var img_dlg=$(this);




            for (var i = 0, f; f = files[i]; i++) {
            //    $.ajax({
            //   url: '/savefile/'+master_json.chapters[global_chapter]['id']+"/"+master_json.chapters[global_chapter].topics[global_topic]['id'],
            //   type: 'POST',
            //   data:{file1:f},
            //   cache: false,
            //   contentType:false,
            //   processData: false,
            //   data: master_json,
            //   //dataType: "jsonP",
            //   success: function(jsonData) {alert('POST alert'); console.log(jsonData) ; },
            //   error : function(XMLHttpRequest, textStatus, errorThrown) {
            //             console.log('An Ajax error was thrown.');
            //             console.log(XMLHttpRequest);
            //             console.log(textStatus);
            //             console.log(errorThrown);
            //           }
            // });

            // $('#image_form_submit').attr('action','/savefile/'+master_json.chapters[global_chapter]['id']+"/"+master_json.chapters[global_chapter].topics[global_topic]['id']);

            // $('#image_form_submit').submit();

            uploadFilesImage('/savefile/'+master_json.chapters[global_chapter]['id']+"/"+master_json.chapters[global_chapter].topics[global_topic]['id'],f,deferred)

            // $('#image_form_submit').submit(function(){

            //     // Maybe show a loading indicator...

            //     $.post($(this).attr('action'), $(this).serialize(), function(res){
            //         // Do something with the response `res`
            //         console.log(res);
            //         // Don't forget to hide the loading indicator!
            //     });

            //     return false; // prevent default action

            // });

            // $('#image_form_submit').submit();

            }




            if (editing_state == true) {

              // $('#header_text').val()

              $.when.apply($, defArray).then( function() {
                xml_id=parseInt($(".image.xml_id").attr('xml_id'));
                editing_state=false;
              //this code is called after all the ajax calls are done
                // sanitise_media();
                 // topic_json[global_topic].push({"type":"image","data":file_name,"xml_id":(current_clicked),"attribution":attr_text});
                 for(var i=0, len=current_topic.length; i < len; i++){
                    if (xml_id == parseInt(current_topic[i].xml_id,10)) {
                      current_topic[i].data=file_name;
                      current_topic[i].attribution=attr_text;
                      current_topic[i].description=desc_text;
                      topic_json[global_topic]=current_topic;
                      break;
                    };
                  }

                 $("#overlay").hide();
                refresh_dom();

                img_dlg.dialog( "close" );

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
                        topic_json[global_topic]=current_topic;
                //this code is called after all the ajax calls are done
                // sanitise_media();
                topic_json[global_topic].push({"type":"image","data":file_name,"xml_id":(current_clicked),"attribution":attr_text,"description":desc_text});
                $("#overlay").hide();
                refresh_dom();

                img_dlg.dialog( "close" );
              });


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
        $('#imagefilemod').val('');
        $('#img-attr').val('');
        $( '#dialog-add' ).dialog( "close" );
      }
    });
// IMAGE END


//AUDIO

$( "#dialog-audio" ).dialog({
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
      buttons: {
        "Insert Audio": function() {

            // var val=$('#sub_header_text').val();
            // i=i+1;
            // var current_topic=topic_json[global_topic];
            //   for(var i=0, len=current_topic.length; i < len; i++){
            //     var temp=current_topic[i];
            //     temp.xml_id = parseInt(temp.xml_id)+1;
            //     current_topic[i]=temp;
            //   }
            //   topic_json[global_topic]=current_topic;
            //   topic_json[global_topic].push({"type":"subheader","data":val,"xml_id":(xml_id+1)});
              var audio_dialog=$(this);
              var deferred = new $.Deferred();
              // var deferred1 = new $.Deferred();
              defArray.push(deferred);

              var attr_text=$('#audio-attr').val();
              var desc_text=$('#audio-desc').val();
            var files=document.getElementById('audiofilemod').files;
            $("#overlay").show();

            for (var i = 0, f; f = files[i]; i++) {
              uploadFilesImage('/savefile/'+master_json.chapters[global_chapter]['id']+"/"+master_json.chapters[global_chapter].topics[global_topic]['id'],f,deferred);
            }

            $.when.apply($, defArray).then( function() {



            var fslocation= global_chapter+"/"+global_topic+"/media";
            console.log(fslocation);
            var file_name=files[0].name;
            insert=true;

            var current_topic=topic_json[global_topic];


            if (editing_state == true) {
              xml_id=parseInt($(".audio.xml_id").attr('xml_id'));
              editing_state=false;

              for(var i=0, len=current_topic.length; i < len; i++){
                if (xml_id == parseInt(current_topic[i].xml_id,10)) {
                  current_topic[i].data=file_name;
                  current_topic[i].attribution=attr_text;
                  current_topic[i].description=desc_text;
                  topic_json[global_topic]=current_topic;
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
              topic_json[global_topic]=current_topic;
              topic_json[global_topic].push({"type":"audio","data":file_name,"xml_id":(current_clicked),"attribution":attr_text,"description":desc_text});

            }



            refresh_dom();
            audio_dialog.dialog( "close" );
          });



              // if (insert && ((file.name.toLowerCase().indexOf(".png") != -1) || (file.name.toLowerCase().indexOf(".jp") != -1) || (file.name.toLowerCase().indexOf(".gif") != -1)  )) {
              //  insert_image(file.name);
              // }else if(insert && ((file.name.toLowerCase().indexOf('.mp4')!=-1) || (file.name.toLowerCase().indexOf(".ogg") != -1) || (file.name.toLowerCase().indexOf(".webm") != -1) )){
              //  insert_video(file.name);
              // }


              // refresh_dom();



        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function() {
        $('#imagefilemod').val('');
        $('#img-attr').val('');
        $( '#dialog-add' ).dialog( "close" );
      }
    });

//AUDIO END



var defArray=[];

// VIDEO START
$( "#dialog-video" ).dialog({
      autoOpen: false,
      height: 500,
      width: 350,
      modal: true,
      buttons: {
        "Insert Video": function() {

            // var val=$('#sub_header_text').val();
            // i=i+1;
            // var current_topic=topic_json[global_topic];
            //   for(var i=0, len=current_topic.length; i < len; i++){
            //     var temp=current_topic[i];
            //     temp.xml_id = parseInt(temp.xml_id)+1;
            //     current_topic[i]=temp;
            //   }
            //   topic_json[global_topic]=current_topic;
            //   topic_json[global_topic].push({"type":"subheader","data":val,"xml_id":(xml_id+1)});
            var vide_dialog = $(this);
            var attr_text=$('#video-attr').val();
            var desc_text=$('#video-desc').val();
            var files=document.getElementById('videofilemod').files;
            $("#overlay").show();
            var fslocation= global_chapter+"/"+global_topic+"/media";
            console.log(fslocation);
            var file_name=files[0].name;
            insert=true;

            var current_topic=topic_json[global_topic];

            var files1=document.getElementById('thumbfilemod').files;
            $("#overlay").show();

            var file_name1=files1[0].name;

              var deferred = new $.Deferred();
              var deferred1 = new $.Deferred();
              defArray.push(deferred);
              defArray.push(deferred1);
              for (var i = 0, f; f = files[i]; i++) {
                uploadFilesImage('/savefile/'+master_json.chapters[global_chapter]['id']+"/"+master_json.chapters[global_chapter].topics[global_topic]['id'],f,deferred);
              }

            for (var i = 0, f; f = files1[i]; i++) {
              uploadFilesImage('/savefile/'+master_json.chapters[global_chapter]['id']+"/"+master_json.chapters[global_chapter].topics[global_topic]['id'],f,deferred1);
            }

            $.when.apply($, defArray).then( function() {
              $('#overlay').hide();
            if (editing_state == true) {
              xml_id=parseInt($(".video.xml_id").attr('xml_id'));
              editing_state=false;

              for(var i=0, len=current_topic.length; i < len; i++){
                if (xml_id == parseInt(current_topic[i].xml_id,10)) {
                  current_topic[i].data=file_name;
                  current_topic[i].thumb=file_name1;
                  current_topic[i].attribution=attr_text;
                  current_topic[i].description=desc_text;
                  topic_json[global_topic]=current_topic;
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




            var fslocation= global_chapter+"/"+global_topic+"/media";
            console.log(fslocation);

            insert=true;


              topic_json[global_topic]=current_topic;
              topic_json[global_topic].push({"type":"video","data":file_name,"xml_id":(current_clicked),"attribution":attr_text,"thumb":file_name1,"description":desc_text});
            }



            // $.when.apply($, defArray).then( function() {
              //this code is called after all the ajax calls are done
              vide_dialog.dialog( "close" );
              refresh_dom();
            // });

            });




              // if (insert && ((file.name.toLowerCase().indexOf(".png") != -1) || (file.name.toLowerCase().indexOf(".jp") != -1) || (file.name.toLowerCase().indexOf(".gif") != -1)  )) {
              //  insert_image(file.name);
              // }else if(insert && ((file.name.toLowerCase().indexOf('.mp4')!=-1) || (file.name.toLowerCase().indexOf(".ogg") != -1) || (file.name.toLowerCase().indexOf(".webm") != -1) )){
              //  insert_video(file.name);
              // }


              // refresh_dom();



        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function() {
        $('#videofilemod').val('');
        $('#video-attr').val('');
        $( '#dialog-add' ).dialog( "close" );
      }
    });
// VIDEO END




// FORMULA START

$( "#dialog-formula" ).dialog({
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
      buttons: {
        "Insert Formula": function() {
            var val=$('#formula_text').val();
            i=i+1;
            var current_topic=topic_json[global_topic];



            if (editing_state == true) {
              xml_id=parseInt($(".formula.xml_id").attr('xml_id'));
              editing_state=false;

              for(var i=0, len=current_topic.length; i < len; i++){
                if (xml_id == parseInt(current_topic[i].xml_id,10)) {
                  current_topic[i].data=val;
                  topic_json[global_topic]=current_topic;
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
              topic_json[global_topic]=current_topic;
              topic_json[global_topic].push({"type":"formula","data":val,"xml_id":(current_clicked)});
            }

              refresh_dom();

            $( this ).dialog( "close" );

        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function() {
        $('#formula_text').val('');
        $( '#dialog-add' ).dialog( "close" );
      }
    });
// FORMULA END








// HTML START

$( "#dialog-html" ).dialog({
      autoOpen: false,
      height: 600,
      width: 600,
      modal: true,
      buttons: {
        "Insert HTML": function() {

            var val=tinyMCE.activeEditor.getContent();
            // i=i+1;


                var current_topic=topic_json[global_topic];
                var attr_text=$('#html-attr').val();


            if (editing_state == true) {
              xml_id=parseInt($(".html.xml_id").attr('xml_id'));
              editing_state=false;

              for(var i=0, len=current_topic.length; i < len; i++){
                if (xml_id == parseInt(current_topic[i].xml_id,10)) {
                  current_topic[i].data=val;
                  topic_json[global_topic]=current_topic;
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
                  topic_json[global_topic]=current_topic;
                  topic_json[global_topic].push({"type":"html","data":escape(val),"xml_id":(current_clicked),"attribution":attr_text});
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

// HTML END



function refresh_dom(){

  current_topic=topic_json[global_topic]

  var preview_pane=$('#preview');
  preview_pane.html('');

  var side_bar=$('#sidebar');
  side_bar.html('');


  // var current_topic=topic_json[global_topic];

  // if (current_topic == undefined) {
  //   break;
  // };


  current_topic.sort(function(obj1, obj2) {
    // Ascending: first age less than the previous
    return parseInt(obj1.xml_id) - parseInt(obj2.xml_id);
  });

      var dom = jsxml.fromString('<?xml version="1.0" encoding="UTF-8"?><topic id="'+master_json.chapters[global_chapter].topics[global_topic]['id']+'"/>');

      // child = dom.createElement('topic');
      // child.setAttribute('id', master_json.chapters[global_chapter].topics[global_topic]['id']);
      // dom.documentElement.appendChild(child);


  for(var i=0, len=current_topic.length; i < len; i++){
    switch(current_topic[i].type){
        case "header":
              preview_pane.append("<h1>"+current_topic[i].data+"</h1>");

              var holder=$('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index='+current_topic[i].xml_id+' class="add-btn inner-btn btn btn-primary"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable testing1 header-d">HEADING</a>&nbsp;<button xml_index='+current_topic[i].xml_id+' class="del-btn inner-btn btn btn-danger"><span class="glyphicon glyphicon-trash"></span></button>');
              side_bar.append(holder);


              child = dom.createElement('header');

              child.textContent=current_topic[i].data;

              dom.documentElement.appendChild(child);


              // side_bar.append('<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable testing1 header-d">HEADING</a>');

              break;
        case "subheader":
              preview_pane.append("<h3>"+current_topic[i].data+"</h3>");

              var holder=$('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index='+current_topic[i].xml_id+' class="add-btn inner-btn btn btn-primary"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable editing-subheader header-d">SUB HEADING</a>&nbsp;<button xml_index='+current_topic[i].xml_id+' class="del-btn inner-btn btn btn-danger"><span class="glyphicon glyphicon-trash"></span></button>');
              side_bar.append(holder);
              // side_bar.append('<a href="#" xml_index="'+current_topic[i].xml_id+'" class="testing1"> <i class="icon-plus-sign"></i> </a>');
              // side_bar.append('<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable plus">SUB HEADING</a>');

              child = dom.createElement('subheader');

              child.textContent=current_topic[i].data;

              dom.documentElement.appendChild(child);

              break;

        case "html":
              console.log("HTML");
              preview_pane.append("<div>"+unescape(current_topic[i].data)+"</div>");
              preview_pane.append("Reference : "+current_topic[i].attribution);
              // preview_pane.attr('contenteditable','false');

              var holder=$('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index='+current_topic[i].xml_id+' class="add-btn inner-btn btn btn-primary"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable editing-html header-d">HTML</a>&nbsp;<button xml_index='+current_topic[i].xml_id+' class="del-btn inner-btn btn btn-danger"><span class="glyphicon glyphicon-trash"></span></button>');
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

        case "image":
              var parent_div=document.createElement("div");

              var span = document.createElement("img");


              var attr_text = current_topic[i].attribution;


              span.src = "/getfiles/"+master_json.chapters[global_chapter]['id']+"/"+master_json.chapters[global_chapter].topics[global_topic]['id']+"/"+current_topic[i]['data'];
              console.log(span);
              // span.src = global_chapter+"/"+global_topic+"/"+"media/aram.png";
              span.width=320;
              // console.log("FFFIIIIINNNAAAALLLLLLLLLLLL");
              // console.log(e.target.result);
              // console.log("FFFIIIIINNNAAAALLLLLLLLLLLL END");
              // $('#'+xml_id).attr('src',e.target.result);


              // span.style.fontWeight = "bold";
              // span.innerHTML=" NMBS";

              var custom_text=document.createElement("p");
              custom_text.innerHTML="Reference : "+attr_text+"<br>"+"description :"+current_topic[i].description;
              parent_div.appendChild(span);
              parent_div.appendChild(custom_text);

              preview_pane.append(parent_div);

              var holder=$('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index='+current_topic[i].xml_id+' class="add-btn inner-btn btn btn-primary"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable editing-image header-d">IMAGE</a>&nbsp;<button xml_index='+current_topic[i].xml_id+' class="del-btn inner-btn btn btn-danger"><span class="glyphicon glyphicon-trash"></span></button>');
              side_bar.append(holder);


              child = dom.createElement('image');

              child.setAttribute('src',current_topic[i].data);

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


              span.src = "/getfiles/"+master_json.chapters[global_chapter]['id']+"/"+master_json.chapters[global_chapter].topics[global_topic]['id']+"/"+current_topic[i]['data'];
              console.log(span);
              // span.src = global_chapter+"/"+global_topic+"/"+"media/aram.png";
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
                span1.src = "/getfiles/"+master_json.chapters[global_chapter]['id']+"/"+master_json.chapters[global_chapter].topics[global_topic]['id']+"/"+current_topic[i]['thumb'];
                span1.width=100;
                parent_div.appendChild(span1);
              // };

              preview_pane.append(parent_div);


              var holder=$('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index='+current_topic[i].xml_id+' class="add-btn inner-btn btn btn-primary"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable editing-video header-d">VIDEO</a>&nbsp;<button xml_index='+current_topic[i].xml_id+' class="del-btn inner-btn btn btn-danger"><span class="glyphicon glyphicon-trash"></span></button>');
              side_bar.append(holder);

              child = dom.createElement('video');

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


                span.src = "/getfiles/"+master_json.chapters[global_chapter]['id']+"/"+master_json.chapters[global_chapter].topics[global_topic]['id']+"/"+current_topic[i]['data'];
                // console.log(span);
                // span.src = global_chapter+"/"+global_topic+"/"+"media/aram.png";
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



              var holder=$('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index='+current_topic[i].xml_id+' class="add-btn inner-btn btn btn-primary"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable editing-audio header-d">AUDIO</a>&nbsp;<button xml_index='+current_topic[i].xml_id+' class="del-btn inner-btn btn btn-danger"><span class="glyphicon glyphicon-trash"></span></button>');
              side_bar.append(holder);

              child = dom.createElement('audio');

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
                MathJax.Hub.Queue(['Typeset',MathJax.Hub]);

              var holder=$('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index='+current_topic[i].xml_id+' class="add-btn inner-btn btn btn-primary"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable editing-formula header-d">FORMULA</a>&nbsp;<button xml_index='+current_topic[i].xml_id+' class="del-btn inner-btn btn btn-danger"><span class="glyphicon glyphicon-trash"></span></button>');
              side_bar.append(holder);
                // loadImage('http://latex.codecogs.com/png.latex?'+current_topic[i].data,insert_formula,preview_pane);
                // side_bar.append('<a href="#" xml_index="'+xml_id+'" class="testing1"> <i class="icon-plus-sign"></i> </a>');
                // side_bar.append('<a href="#" id="header" xml_index="'+xml_id+'" class="editable plus">Formula</a>');
                child = dom.createElement('formula');

                child.textContent=current_topic[i].data;



                dom.documentElement.appendChild(child);

                break;

    }
  }
side_bar.append('<button xml_index="'+current_topic.length+'" class="add-btn btn btn-primary"><span class="glyphicon glyphicon-plus-sign"></span></button>');

  // $('#side_bar').sortable();
  // $( "#side_bar" ).disableSelection();
  window.URL = window.webkitURL || window.URL;
            window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
            file = new Blob([jsxml.toXml(dom)]);


            file.name="topic.xml"
            // file.append(master_json);
            // var a = document.getElementById("downloadFile");
            // a.hidden = '';
            // a.href = window.URL.createObjectURL(file.getBlob('text/plain'));
            // a.download = 'filename.txt';
            // a.textContent = 'Download file!';


            uploadFiles('/savefile/'+master_json.chapters[global_chapter]['id']+"/"+master_json.chapters[global_chapter].topics[global_topic]['id'],file);
}


function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

function uploadJSON(url, file,name) {
  var formData = new FormData();

  // for (var i = 0, file; file = files[i]; ++i) {
    formData.append(name, file);
  // }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.onload = function(e) { console.log(e) };

  xhr.send(formData);  // multipart/form-data
}



function uploadVideoFiles(url, file) {
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