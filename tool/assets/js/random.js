
$('#mod-chapter').click(function(){
  $('#dialog-chapter').dialog('open');
});


$('#dialog-chapter').dialog({
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
      buttons: {
        "Insert Chapter": function() {
            master_json.chapters.push({'name':$('#chapter_name').val(),'order':parseInt($('#chapter_no').val())});


            uploadJSON('/savefile/masteer.json',master_json,'maaster.json');





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
for (var i = master_json.chapters.length - 1; i > 0; i--) {
      var a = $('<li>');
      var link=$('<a>').append(master_json.chapters[i]['name'])
      a.append(link)
      $('#book-nav').prepend(a);

    };
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
              xml_id=parseInt($(".header.xml_id").val());
              editing_state=false;

              for(var i=0, len=current_topic.length; i < len; i++){
                if (xml_id == current_topic[i].xml_id) {
                  current_topic[i].data=val;
                  topic_json[global_topic]=current_topic;
                  break;
                };
              }

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
              topic_json[global_topic].push({"type":"header","data":val,"xml_id":(xml_id)});
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
            i=i+1;
            var current_topic=topic_json[global_topic];
              for(var i=0, len=current_topic.length; i < len; i++){
                if (i>=current_clicked) {
                  var temp=current_topic[i];
                  temp.xml_id = parseInt(temp.xml_id)+1;
                  current_topic[i]=temp;
                }
              }
              topic_json[global_topic]=current_topic;
              topic_json[global_topic].push({"type":"subheader","data":val,"xml_id":(xml_id)});


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
            var files=document.getElementById('imagefilemod').files;
            $("#overlay").show();
            var fslocation= global_chapter+"/"+global_topic+"/media";
            console.log(fslocation);
            var file_name=files[0].name;
            insert=true;

            var current_topic=topic_json[global_topic];
              for(var i=0, len=current_topic.length; i < len; i++){
                if (i>=current_clicked) {
                  var temp=current_topic[i];
                  temp.xml_id = parseInt(temp.xml_id)+1;
                  current_topic[i]=temp;
                }
              }
              topic_json[global_topic]=current_topic;
              topic_json[global_topic].push({"type":"image","data":file_name,"xml_id":(xml_id),"attribution":attr_text});



            for (var i = 0, f; f = files[i]; i++) {
            //    $.ajax({
            //   url: '/savefile/'+global_chapter+"/"+global_topic,
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

            $('#image_form_submit').attr('action','/savefile/'+global_chapter+"/"+global_topic);

            // $('#image_form_submit').submit();

            uploadFiles('/savefile/'+global_chapter+"/"+global_topic,f)

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




              // if (insert && ((file.name.toLowerCase().indexOf(".png") != -1) || (file.name.toLowerCase().indexOf(".jp") != -1) || (file.name.toLowerCase().indexOf(".gif") != -1)  )) {
              //  insert_image(file.name);
              // }else if(insert && ((file.name.toLowerCase().indexOf('.mp4')!=-1) || (file.name.toLowerCase().indexOf(".ogg") != -1) || (file.name.toLowerCase().indexOf(".webm") != -1) )){
              //  insert_video(file.name);
              // }


              refresh_dom();

            $( this ).dialog( "close" );

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

            var attr_text=$('#audio-attr').val();
            var files=document.getElementById('audiofilemod').files;
            $("#overlay").show();
            var fslocation= global_chapter+"/"+global_topic+"/media";
            console.log(fslocation);
            var file_name=files[0].name;
            insert=true;

            var current_topic=topic_json[global_topic];
              for(var i=0, len=current_topic.length; i < len; i++){
                var temp=current_topic[i];
                temp.xml_id = parseInt(temp.xml_id)+1;
                current_topic[i]=temp;
              }
              topic_json[global_topic]=current_topic;
              topic_json[global_topic].push({"type":"audio","data":file_name,"xml_id":(xml_id),"attribution":attr_text});



            for (var i = 0, f; f = files[i]; i++) {
              uploadFiles('/savefile/'+global_chapter+"/"+global_topic,f);
            }




              // if (insert && ((file.name.toLowerCase().indexOf(".png") != -1) || (file.name.toLowerCase().indexOf(".jp") != -1) || (file.name.toLowerCase().indexOf(".gif") != -1)  )) {
              //  insert_image(file.name);
              // }else if(insert && ((file.name.toLowerCase().indexOf('.mp4')!=-1) || (file.name.toLowerCase().indexOf(".ogg") != -1) || (file.name.toLowerCase().indexOf(".webm") != -1) )){
              //  insert_video(file.name);
              // }


              // refresh_dom();

            $( this ).dialog( "close" );

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
      height: 300,
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

            var attr_text=$('#video-attr').val();
            var files=document.getElementById('videofilemod').files;
            $("#overlay").show();
            var fslocation= global_chapter+"/"+global_topic+"/media";
            console.log(fslocation);
            var file_name=files[0].name;
            insert=true;

            var current_topic=topic_json[global_topic];
              for(var i=0, len=current_topic.length; i < len; i++){
                var temp=current_topic[i];
                temp.xml_id = parseInt(temp.xml_id)+1;
                current_topic[i]=temp;
              }






            var files1=document.getElementById('thumbfilemod').files;
            $("#overlay").show();
            var fslocation= global_chapter+"/"+global_topic+"/media";
            console.log(fslocation);
            var file_name1=files1[0].name;
            insert=true;


              topic_json[global_topic]=current_topic;
              topic_json[global_topic].push({"type":"video","data":file_name,"xml_id":(xml_id),"attribution":attr_text,"thumb":file_name1});


              // var deferred = new $.Deferred();
              // var deferred1 = new $.Deferred();
              // defArray.push(deferred);
              // defArray.push(deferred1);
              for (var i = 0, f; f = files[i]; i++) {
                uploadFiles('/savefile/'+global_chapter+"/"+global_topic,f)
              }

            for (var i = 0, f; f = files1[i]; i++) {
              uploadFiles('/savefile/'+global_chapter+"/"+global_topic,f)
            }

            // $.when.apply($, defArray).then( function() {
              //this code is called after all the ajax calls are done
              refresh_dom();
            // });






              // if (insert && ((file.name.toLowerCase().indexOf(".png") != -1) || (file.name.toLowerCase().indexOf(".jp") != -1) || (file.name.toLowerCase().indexOf(".gif") != -1)  )) {
              //  insert_image(file.name);
              // }else if(insert && ((file.name.toLowerCase().indexOf('.mp4')!=-1) || (file.name.toLowerCase().indexOf(".ogg") != -1) || (file.name.toLowerCase().indexOf(".webm") != -1) )){
              //  insert_video(file.name);
              // }


              // refresh_dom();

            $( this ).dialog( "close" );

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
              for(var i=0, len=current_topic.length; i < len; i++){
                var temp=current_topic[i];
                temp.xml_id = parseInt(temp.xml_id)+1;
                current_topic[i]=temp;
              }
              topic_json[global_topic]=current_topic;
              topic_json[global_topic].push({"type":"formula","data":val,"xml_id":(xml_id)});


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
                  for(var i=0, len=current_topic.length; i < len; i++){
                    var temp=current_topic[i];
                    temp.xml_id = parseInt(temp.xml_id)+1;
                    current_topic[i]=temp;
                  }
                  topic_json[global_topic]=current_topic;
                  topic_json[global_topic].push({"type":"html","data":escape(val),"xml_id":(xml_id)});




              // if (insert && ((file.name.toLowerCase().indexOf(".png") != -1) || (file.name.toLowerCase().indexOf(".jp") != -1) || (file.name.toLowerCase().indexOf(".gif") != -1)  )) {
              //  insert_image(file.name);
              // }else if(insert && ((file.name.toLowerCase().indexOf('.mp4')!=-1) || (file.name.toLowerCase().indexOf(".ogg") != -1) || (file.name.toLowerCase().indexOf(".webm") != -1) )){
              //  insert_video(file.name);
              // }


              refresh_dom();

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

  for(var i=0, len=current_topic.length; i < len; i++){
    switch(current_topic[i].type){
        case "header":
              preview_pane.append("<h1>"+current_topic[i].data+"</h1>");
              side_bar.append('<button xml_index='+current_topic[i].xml_id+' class="add-btn btn btn-primary"><span class="glyphicon glyphicon-plus-sign"></span></button>');
              var holder=$('<div></div>').addClass('sortable').addClass('well well-sm').html('<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable testing1 header-d">HEADING</a>');
              side_bar.append(holder);
              // side_bar.append('<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable testing1 header-d">HEADING</a>');

              break;
        case "subheader":
              preview_pane.append("<h3>"+current_topic[i].data+"</h3>");
              side_bar.append('<a href="#" xml_index="'+current_topic[i].xml_id+'" class="testing1"> <i class="icon-plus-sign"></i> </a>');
              side_bar.append('<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable plus">SUB HEADING</a>');
              break;

        case "html":
              console.log("HTML");
              preview_pane.append("div"+unescape(current_topic[i].data)+"</div>");
              preview_pane.attr('contenteditable','false');
              side_bar.append('<a href="#" xml_index="'+current_topic[i].xml_id+'" class="testing1"> <i class="icon-plus-sign"></i> </a>');
              side_bar.append('<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable plus">HTML</a>');

              break;

        case "image":
              var parent_div=document.createElement("div");

              var span = document.createElement("img");


              var attr_text = current_topic[i].attribution;


              span.src = "/getfiles/"+global_chapter+"/"+global_topic+"/"+current_topic[i]['data'];
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
              custom_text.innerHTML=attr_text;
              parent_div.appendChild(span);
              parent_div.appendChild(custom_text);

              preview_pane.append(parent_div);
              side_bar.append('<a href="#" xml_index="'+xml_id+'" class="testing1"> <i class="icon-plus-sign"></i> </a>');
              side_bar.append('<a href="#" id="header" xml_index="'+xml_id+'" class="editable plus">Image</a>');

              break;

        case "video":
              var parent_div=document.createElement("div");

              var span = document.createElement("video");

                  span.setAttribute('controls','')


              var attr_text = current_topic[i].attribution;


              span.src = "/getfiles/"+global_chapter+"/"+global_topic+"/"+current_topic[i]['data'];
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
                custom_text.innerHTML=attr_text;
                parent_div.appendChild(span);
                parent_div.appendChild(custom_text);
                side_bar.append('<a href="#" xml_index="'+xml_id+'" class="testing1"> <i class="icon-plus-sign"></i> </a>');
                side_bar.append('<a href="#" id="header" xml_index="'+xml_id+'" class="editable plus">Video</a>');
              // }else{
                var span1 = document.createElement("img");
                span1.src = "/getfiles/"+global_chapter+"/"+global_topic+"/"+current_topic[i]['thumb'];
                span1.width=100;
                parent_div.appendChild(span1);
              // };



              preview_pane.append(parent_div);


              break;

        case "audio":
                var parent_div=document.createElement("div");

                var span = document.createElement("audio");

                    span.setAttribute('controls','')


                var attr_text = current_topic[i].attribution;


                span.src = "/getfiles/"+global_chapter+"/"+global_topic+"/"+current_topic[i]['data'];
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
                  custom_text.innerHTML=attr_text;
                  parent_div.appendChild(span);
                  parent_div.appendChild(custom_text);
                  side_bar.append('<a href="#" xml_index="'+xml_id+'" class="testing1"> <i class="icon-plus-sign"></i> </a>');
                  side_bar.append('<a href="#" id="header" xml_index="'+xml_id+'" class="editable plus">Video</a>');
                  preview_pane.append(parent_div);
                  break;
                // }else{
                  // var span1 = document.createElement("img");
                  // span1.src=current_topic[i]['thumb1'];
                  // span1.width=100;
                  // parent_div.appendChild(span1);


        case "formula":
                preview_pane.append("<p>"+current_topic[i].data+"</p>");
                MathJax.Hub.Queue(['Typeset',MathJax.Hub]);
                // loadImage('http://latex.codecogs.com/png.latex?'+current_topic[i].data,insert_formula,preview_pane);
                side_bar.append('<a href="#" xml_index="'+xml_id+'" class="testing1"> <i class="icon-plus-sign"></i> </a>');
                // side_bar.append('<a href="#" id="header" xml_index="'+xml_id+'" class="editable plus">Formula</a>');
                break;

    }
  }
  side_bar.append('<button xml_index='+current_topic.length+' class="add-btn btn btn-primary"><span class="glyphicon glyphicon-plus-sign"></span></button>');
  // $('#side_bar').sortable();
  // $( "#side_bar" ).disableSelection();
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

function uploadFiles(url, file) {
  var formData = new FormData();

  // for (var i = 0, file; file = files[i]; ++i) {
    formData.append(file, file);
  // }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.onload = function(e) { console.log(e) };

  xhr.send(formData);  // multipart/form-data
}