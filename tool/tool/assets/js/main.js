function formulaOnclick(inst,e,d) {
	inst.on("click",function(curr,e) {
		var target = curr.srcElement ? curr.srcElement : curr.target;
		if(target.localName == "img"){
			var targetJ = $(target);
			var text = targetJ.attr("text");
			if(text){
				this.execCommand('mceFormulaUpload',null,target.outerHTML);
			}
		}
	});
}


divi.filesAttach = function(){
	return '/getfiles/';
};


(function(){
	var http = ('https:' == document.location.protocol ? 'https://' : 'http://');

	EQUATION_ENGINE = http+'latex.codecogs.com';
	FAVORITE_ENGINE = http+'latex.codecogs.com/json';
	EDITOR_SRC      = http+'latex.codecogs.com';
	EMBED_ENGINE    = 'formulaEditor.html';
	EDIT_ENGINE     = http+'www.codecogs.com/eqnedit.php';
	EDITOR_SW_FLASH = http+'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0';
	EDITOR_SW_PLAYER= http+'www.macromedia.com/go/getflashplayer';
})();

function S4() {
	   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

idRegex = '^[_a-zA-Z0-9]+$';
defaultImgExtension = ".png";
topic_json = [];
gl_img = {};
imageCount = "imagesCount";
defaultId = 0;
global_topic = -1;
global_chapter = -1;
var clicked;
var xml_id = 0;
var parent;
i = 0;
var editing_state = false;
var master_json = {}
current_clicked = -1;
chapter_json = {
    'id': '',
    'name': '',
    'topic': []
};
before_array = [];
after_drop = [];

before_chapter = [];
after_chapter = [];

$.ajaxSetup({
    cache: false
});
$("#sidebar").sortable({
    start: function (e, ui) {
        // alert("started");
        before_array = $('.editable');

    },
    update: function (e, ui) {
        after_drop = $('.editable');
        console.log(e);
        console.log(ui);
        console.log($(this).attr("xml_index"));
        var xml_index = ui.item.children('button').attr('xml_index');

        var bf_tn_array = before_array.map(function () {
            return $(this).attr("xml_index");
        });
        var after_tn_array = after_drop.map(function () {
            return $(this).attr("xml_index");
        });

        current_topic = topic_json[global_topic]
        var temp_array = []
        for (var i = 0; i < current_topic.length; i++) {
            temp_array[i] = current_topic[parseInt(after_tn_array[i])];
        };

        current_topic = temp_array;

        for (var i = 0; i < current_topic.length; i++) {
            current_topic[i].xml_id = i;
        };

        topic_json[global_topic] = current_topic;

        refresh_dom();

    }
});

$(".sortchapters").sortable({
    start: function (e, ui) {
        before_chapter = $('.topic_link');

    },
    update: function (e, ui) {
        after_chapter = $('.topic_link');
    }
});


$.ajax({
    url: divi.filesAttach()+"master.json",
}).done(function (data) {

    console.log("IN");
    console.log(data);
    master_json = JSON.parse(data);
    var currTopic,imgCount,currChap,currAsses;
    for (var i = master_json.chapters.length - 1; i >= 0; i--) {
    	currChap = master_json.chapters[i];
        var a = $('<li>');
        var del_btn_ch = $('<button>').addClass('btn del-chp sidebar-btn btn-danger btn-xs').attr('chapterid', currChap['id']).append($('<span>').addClass('glyphicon glyphicon-trash'));
        var edit_btn_ch = $('<button>').addClass('btn edit-chp sidebar-btn btn-warning btn-xs').attr('chapterid', currChap['id']).append($('<span>').addClass('glyphicon glyphicon-edit'));

        var link = $('<a>').append(currChap['name']);
        link.attr('chapter-id', i);
        link.prepend(edit_btn_ch);
        link.append(del_btn_ch);
        a.append(link);

        var top = $('<ul>');
        top.addClass('sortchapters');
        if (currChap.topics != undefined) {
        	
            for (var j = currChap.topics.length - 1; j >= 0; j--) {
            	currTopic = currChap.topics[j];
                var a1 = $('<li>');
                var link1 = $('<a>').append(currTopic['name']);
                var del_btn = $('<button>').addClass('btn del-tpc sidebar-btn btn-danger btn-xs').attr('chapterid', currChap['id']).attr('topicid', currTopic['id']).append($('<span>').addClass('glyphicon glyphicon-trash'));
                var edit_btn = $('<button>').addClass('btn edit-tpc sidebar-btn btn-warning btn-xs').attr('chapterid', currChap['id']).attr('topicid', currTopic['id']).append($('<span>').addClass('glyphicon glyphicon-edit'));
                //adding image count internally.
                imgCount = currTopic[imageCount] ? currTopic[imageCount]  :defaultId;
                edit_btn.attr(imageCount, imgCount);
                
                var previewBytton = $('<button>').addClass('btn sidebar-btn preview-tpc btn-warning btn-xs').attr('chapterid', currChap['id']).attr('topicid', currTopic['id']).append($('<span>').addClass('glyphicon glyphicon-zoom-in'));
                link1.addClass('topic_link');
                link1.attr('chapter-id', i);
                link1.attr('topic-id', j);
                link1.attr(imageCount, imgCount);
                a1.append(edit_btn).append('&nbsp;');
                a1.append(link1);
                a1.append('&nbsp;').append(del_btn);
                a1.append('&nbsp;').append(previewBytton);
                top.prepend(a1);
            }

            var top1 = $('<ul>');

            if (currChap.assessments == undefined) {
                currChap.assessments = [];
            };

            for (var k = 0; k < currChap.assessments.length; k++) {
            	currAsses = master_json.chapters[i].assessments[k];
                var test_el = $('<li style="background-color:wheat;padding:2px;">');
                var link = $('<a>').append(currAsses['name']).addClass('assess');
                link.attr('chapter-id', i);
                link.attr('assessmentid', k);
                var del_btn_ch = $('<button>').addClass('btn del-test sidebar-btn btn-danger btn-xs').attr('chapterid', currChap['id']).attr('assessmentid', currAsses['id']).append($('<span>').addClass('glyphicon glyphicon-trash'));
                var edit_btn_ch = $('<button>').addClass('btn edit-test sidebar-btn btn-warning btn-xs').attr('chapterid', currChap['id']).attr('assessmentid', currAsses['id']).append($('<span>').addClass('glyphicon glyphicon-edit'));
                var previewBytton = $('<button>').addClass('btn edit-test sidebar-btn btn-warning btn-xs').attr('chapterid', currChap['id']).attr('assessmentid', currAsses['id']).append($('<span>').addClass('glyphicon glyphicon-zoom-in'));
                test_el.append(edit_btn_ch)
                test_el.append(link);
                test_el.append(del_btn_ch);
                test_el.append(previewBytton);
                top1.prepend(test_el);
            }
            a.append(top);
            a.append(top1);
        }
        $('#book-nav').prepend(a);
    }

    $('#bookname-cont').html(' Book Name : ' + master_json['name']);
    $('#bookid-cont').html(' Book ID : ' + master_json['bookId']);
    $('#courseid-cont').html(' Course ID : ' + master_json['courseId']);
    $('#bookorder-cont').html(' Book Order : ' + master_json['orderNo']);
    $('#bookversion-cont').html(' Book Version : ' + master_json['version']);
    $('.preview-tpc').on('click',previewTopic);
    $(".sortchapters").sortable({
        start: function (e, ui) {
            // alert("started");
            before_chapter = ui.item.parent('ul').find('.topic_link');
            global_chapter = parseInt(ui.item.children('a').attr('chapter-id'), 10);
        },
        update: function (e, ui) {
            after_chapter = ui.item.parent('ul').find('.topic_link');
            console.log(e);
            console.log(ui);
            console.log($(this).attr("topic-id"));
            var topic_id = ui.item.children('a').attr('topic-id');

            var bf_tn_array = before_chapter.map(function () {
                return $(this).attr("topic-id");
            });
            var after_tn_array = after_chapter.map(function () {
                return $(this).attr("topic-id");
            });

            var temp_array = []
            for (var i = 0; i < master_json.chapters[global_chapter].topics.length; i++) {
                temp_array[i] = master_json.chapters[global_chapter].topics[parseInt(after_tn_array[i])];
            };

            master_json.chapters[global_chapter].topics = temp_array;
            refresh_chapters();

        }
    });



}).fail(function (data) {
    console.log(data);
    if (data.status == 404) {
        master_json = {
            'name': 'default book name',
            'bookId': 'bookid',
            'courseId': 'courseid',
            'version': 0,
            'orderNo': 0,
            'chapters': []
        };
        $('#bookname-cont').append(' Book Name : ' + master_json['name']);
        $('#bookid-cont').append(' Book ID : ' + master_json['bookId']);
        $('#courseid-cont').append(' Course ID : ' + master_json['courseId']);
        $('#bookorder-cont').append(' Book Order : ' + master_json['orderNo']);
        $('#bookversion-cont').append(' Book Version : ' + master_json['version']);
    };


});


previewTopic = function(e){
	var chapterid = $(this).attr('chapterid');
    var topicid = $(this).attr('topicid');
	if(!$.isEmptyObject(chapterid) && !$.isEmptyObject(topicid)){
		window.open("/preview/?/"+chapterid+"/"+topicid+"/topic.xml",'open_window');
	}else{
		alert("something went wrong. Please check");
	}
};

$('#sidebar').on('mouseover', '.sortable', function () {
    $(this).children('.inner-btn').css('visibility', 'visible');
});

$('#sidebar').on('mouseout', '.sortable', function () {
    $(this).children('.inner-btn').css('visibility', 'hidden');
});

$('#book-show').on('mouseover', '#book-nav li', function () {
    $(this).find('.sidebar-btn').css('visibility', 'visible');
});

$('#book-show').on('mouseout', '#book-nav li', function () {
    $(this).find('.sidebar-btn').css('visibility', 'hidden');
});

$('#book-show').on('mouseover', '.sortchapters li', function () {
    $(this).find('.sidebar-btn').css('visibility', 'visible');
});

$('#book-show').on('mouseout', '.sortchapters li', function () {
    $(this).find('.sidebar-btn').css('visibility', 'hidden');
});

$(document).on('click', '#bookedit', function () {
    $('#bookname').val(master_json['name']);
    $('#bookid').val(master_json['bookId']);
    $('#courseid').val(master_json['courseId']);
    $('#bookorder').val(master_json['orderNo']);
    $('#bookversion').val(master_json['version']);
    $('#dialog-book').dialog('open');
    return false;

});

$('#book-show').on('click', '.topic_link', function () {
    global_topic = parseInt($(this).attr('topic-id'), 10);
    global_chapter = parseInt($(this).attr('chapter-id'), 10);
    var imgCount = parseInt($(this).attr(imageCount), 10);
    topic_json[global_topic] = [];
    
    var xml_string = "";
    current_topic = topic_json[global_topic] || [];
    $.ajax({
        dataType: "xml",
        url: divi.filesAttach()+ master_json.chapters[global_chapter]['id'] + "/" + master_json.chapters[global_chapter].topics[global_topic]['id'] + "/topic.xml",
    }).done(function (data) {

        var iterate = data.childNodes[0];
        for (var i = 0; i < iterate.children.length; i++) {
            console.log(iterate.children[i]);
            console.log(iterate.children[i].nodeName);
            console.log(iterate.children[i].InnerText);

            switch (iterate.children[i].nodeName) {
            case "heading3":
                current_topic.push({
                    'type': 'header',
                    'data': iterate.children[i].textContent,
                    'xml_id': i,
                    'id': iterate.children[i].getAttribute('id')
                })
                break;
            case "subtopic":
                current_topic.push({
                    'type': 'subheader',
                    'data': iterate.children[i].textContent,
                    'xml_id': i,
                    'id': iterate.children[i].getAttribute('id')
                })
                break;

            case "html":
                try {
                    current_topic.push({
                        'type': 'html',
                        'data': escape(iterate.children[i].getElementsByTagName('data')[0].textContent),
                        'xml_id': i,
                        'attribution': iterate.children[i].getElementsByTagName('references')[0].children[0].textContent,
                        'name': iterate.children[i].getElementsByTagName('references')[0].children[1].textContent,
                        'url': iterate.children[i].getElementsByTagName('references')[0].children[2].textContent,
                        'license': iterate.children[i].getElementsByTagName('references')[0].children[3].textContent,
                        'box_type': (iterate.children[i].getAttribute('boxType') ? iterate.children[i].getAttribute('boxType') : ''),
                        'box_title': iterate.children[i].getAttribute('boxTitle')
                    })
                } catch (err) {
                    current_topic.push({
                        'type': 'html',
                        'data': escape(iterate.children[i].getElementsByTagName('data')[0].textContent),
                        'xml_id': i,
                        'attribution': iterate.children[i].getElementsByTagName('references')[0].children[0].textContent,
                        'name': iterate.children[i].getElementsByTagName('references')[0].children[1].textContent,
                        'url': iterate.children[i].getElementsByTagName('references')[0].children[2].textContent,
                        'license': iterate.children[i].getElementsByTagName('references')[0].children[3].textContent
                    })
                }

                console.log("HTML");
                break;

            case "image":
                current_topic.push({
                    'type': 'image',
                    'data': iterate.children[i].getAttribute('src'),
                    'allowFullscreen': iterate.children[i].getAttribute('allowFullscreen'),
                    'showBorder': iterate.children[i].getAttribute('showBorder'),
                    'xml_id': i,
                    'attribution': iterate.children[i].getElementsByTagName('references')[0].children[0].textContent,
                    'name': iterate.children[i].getElementsByTagName('references')[0].children[1].textContent,
                    'url': iterate.children[i].getElementsByTagName('references')[0].children[2].textContent,
                    'license': iterate.children[i].getElementsByTagName('references')[0].children[3].textContent,
                    'description': iterate.children[i].getElementsByTagName('description')[0].textContent,
                    'id': iterate.children[i].getAttribute('id'),
                    'title': iterate.children[i].getElementsByTagName('title')[0].textContent
                });
                break;

            case "video":
                current_topic.push({
                    'type': 'video',
                    'data': iterate.children[i].getAttribute('src'),
                    'xml_id': i,
                    'attribution': iterate.children[i].getElementsByTagName('references')[0].children[0].textContent,
                    'name': iterate.children[i].getElementsByTagName('references')[0].children[1].textContent,
                    'url': iterate.children[i].getElementsByTagName('references')[0].children[2].textContent,
                    'license': iterate.children[i].getElementsByTagName('references')[0].children[3].textContent,
                    'thumb': iterate.children[i].getAttribute('thumb'),
                    'description': iterate.children[i].getElementsByTagName('description')[0].textContent,
                    'id': iterate.children[i].getAttribute('id'),
                    'title': iterate.children[i].getElementsByTagName('title')[0].textContent
                });



                break;

            case "audio":
                current_topic.push({
                    'type': 'audio',
                    'data': iterate.children[i].getAttribute('src'),
                    'xml_id': i,
                    'attribution': iterate.children[i].getElementsByTagName('references')[0].children[0].textContent,
                    'name': iterate.children[i].getElementsByTagName('references')[0].children[1].textContent,
                    'url': iterate.children[i].getElementsByTagName('references')[0].children[2].textContent,
                    'license': iterate.children[i].getElementsByTagName('references')[0].children[3].textContent,
                    'description': iterate.children[i].getElementsByTagName('description')[0].textContent,
                    'id': iterate.children[i].getAttribute('id'),
                    'title': iterate.children[i].getElementsByTagName('title')[0].textContent
                });
                //   var parent_div=document.createElement("div");


                break;
            case "formula":
                current_topic.push({
                    'type': 'formula',
                    'data': iterate.children[i].textContent,
                    'xml_id': i
                });

                break;
            }

        };
        topic_json[global_topic] = current_topic;
        gl_img[imageCount] = imgCount;
        console.log(gl_img);
        refresh_dom();

    }).fail(function (data) {
        console.log(data);
    });


    return false;
});

$('#sidebar').on('click', '.add-btn', function () {
    current_clicked = parseInt($(this).attr('xml_index'));
    if(current_clicked && !$(this).hasClass('emptybtn')){
    	current_clicked = current_clicked+1;
    }
    $('#dialog-add').dialog('open');
    return false;
});


$('#sidebar').on('click', '.del-btn', function () {
    current_clicked = parseInt($(this).attr('xml_index'), 10);
    // $('#dialog-add').dialog('open');
    var result = confirm("Are you sure you want to delete this element?");

    if (result) {
        current_topic = topic_json[global_topic];
        for (var i = 0; i < current_topic.length; i++) {
            if (current_topic[i]['xml_id'] == current_clicked) {
                current_topic.splice(i, 1);
                break;
            }
        }
        topic_json[global_topic] = current_topic;
        refresh_dom();
    }
    return false;
});




$('#mod-heading').click(function (e) {
    console.log(xml_id);
    console.log($(this));
    clicked = $(this);

    if (topic_json[global_topic] == undefined) {
        topic_json[global_topic] = [];
    };

    $("#dialog-heading").dialog("open");
    e.preventDefault();
});



$(document).on('click', '.mod-subheading', function (e) {
    console.log(xml_id);
    console.log($(this));
    clicked = $(this);

    if (topic_json[global_topic] == undefined) {
        topic_json[global_topic] = [];
    };
    $("#dialog-sub-heading").dialog("open");
    e.preventDefault();
});

$(document).on('click', '.mod-formula', function (e) {
    console.log(xml_id);
    console.log($(this));
    clicked = $(this);

    if (topic_json[global_topic] == undefined) {
        topic_json[global_topic] = [];
    };
    $("#dialog-formula").dialog("open");
    e.preventDefault();
});


$(document).on('click', '.mod-image', function (e) {
    console.log(xml_id);
    console.log($(this));
    clicked = $(this);

    if (topic_json[global_topic] == undefined) {
        topic_json[global_topic] = [];
    };

    divi.resetValues(['#img-attr','#imageid','#img-attr','#img-desc','#img-title','#img-attr-name','#img-attr-url','#img-data','#image_xml_id']);
    $("#dialog-image").dialog("open");
    e.preventDefault();
});

$(document).on('click', '.mod-audio', function (e) {
    console.log(xml_id);
    console.log($(this));
    clicked = $(this);

    if (topic_json[global_topic] == undefined) {
        topic_json[global_topic] = [];
    };
    divi.resetValues(['#audioid','#audio-title','#audio-attr','#audio-desc','#audio-attr-name','#audio-attr-url']);
    $("#dialog-audio").dialog("open");
    e.preventDefault();
});

$(document).on('click', '.mod-video', function (e) {
    console.log(xml_id);
    console.log($(this));
    clicked = $(this);

    if (topic_json[global_topic] == undefined) {
        topic_json[global_topic] = [];
    };
    divi.resetValues(['#videoid','#video-attr','#video-desc','#video-title','#video-attr-name','#video-attr-url','#video_data','#video_xml_id']);
    $("#dialog-video").dialog("open");
    e.preventDefault();
});

divi.resetValues = function(data){
	if(data){
		var eachValue;
		for(var key in data){
			if(data.hasOwnProperty(key)){
				eachValue = data[key];
				if(eachValue){
					$(eachValue).val('');
				}
			}
		}
	}
}

divi.setDefaultValues = function(data){
	if(data){
		var eachValue;
		for(var key in data){
			if(data.hasOwnProperty(key)){
				eachValue = data[key];
				if(eachValue){
					$(key).val(eachValue);
				}
			}
		}
	}
}

$(document).on('click', '.mod-html', function (e) {
    console.log(xml_id);
    console.log($(this));
    clicked = $(this);
    tinymce.activeEditor.chapterid = master_json.chapters[global_chapter]['id'];
    tinymce.activeEditor.topic_id = master_json.chapters[global_chapter].topics[global_topic]['id'];

    if (topic_json[global_topic] == undefined) {
        topic_json[global_topic] = [];
    };
    divi.resetValues(['#html-attr','#html-attr-name','#html-attr-url','#html-attr-lcn','#boxtype','#html-box-title']);
    divi.setDefaultValues({'#boxtype':'none','#html-attr-lcn':'CC Attribution - NonCommercial Sharealike (CC BY-NC-SA)'});
    $("#dialog-html").dialog("open");
    e.preventDefault();
});


$(document).on('click', '.testing1', function (e) {
    editing_state = true;
    console.log(xml_id);
    console.log($(this));
    parent = $(this);
    xml_id = parseInt($(this).attr("xml_index"));

    current_topic = topic_json[global_topic];
    for (var i = 0; i < current_topic.length; i++) {
        if (xml_id == current_topic[i].xml_id) {
            $('#headerid').val(current_topic[i]['id']);
            $('#header_text').val(current_topic[i]['data']);
            break;
        };
    };


    $(".header.xml_id").attr('xml_id', xml_id);
    if (topic_json[global_topic] == undefined) {
        topic_json[global_topic] = [];
    };
    $("#dialog-heading").dialog("open");
    e.preventDefault();
});

$(document).on('click', '.editing-subheader', function (e) {
    editing_state = true;
    console.log(xml_id);
    console.log($(this));
    parent = $(this);
    xml_id = parseInt($(this).attr("xml_index"));

    current_topic = topic_json[global_topic];
    for (var i = 0; i < current_topic.length; i++) {
        if (xml_id == current_topic[i].xml_id) {
            $('#subheadingid').val(current_topic[i]['id']);
            $('#sub_header_text').val(current_topic[i]['data']);
            break;
        };
    };


    $(".subheader.xml_id").attr('xml_id', xml_id);
    if (topic_json[global_topic] == undefined) {
        topic_json[global_topic] = [];
    };
    $("#dialog-sub-heading").dialog("open");
    e.preventDefault();
});

$(document).on('click', '.assess', function (e) {
    var popup = window.open('http://localhost:8080/tool/assessment.html?chapter=' + $(this).attr('chapter-id') + "&assessment=" + $(this).attr('assessmentid'));
    popup.json = JSON.stringify(master_json);
    popup.assessment = $(this).attr('assessmentid');
    popup.chapter = $(this).attr('chapter-id');
    popup.postMessage(JSON.stringify(master_json), 'http://localhost:8080/tool/assessment.html');
    e.preventDefault();
});

window.addEventListener('message', function (event) {
    // if(event.origin !== 'http://scriptandstyle.com') return;
    console.log('received response:  ', event.data);
}, false);

$(document).on('click', '.editing-formula', function (e) {
    editing_state = true;
    console.log(xml_id);
    console.log($(this));
    parent = $(this);
    xml_id = parseInt($(this).attr("xml_index"));

    current_topic = topic_json[global_topic];
    for (var i = 0; i < current_topic.length; i++) {
        if (xml_id == current_topic[i].xml_id) {
            $('#formula_text').val(current_topic[i]['data']);
            break;
        };
    };


    $(".formula.xml_id").attr('xml_id', xml_id);
    if (topic_json[global_topic] == undefined) {
        topic_json[global_topic] = [];
    };
    $("#dialog-formula").dialog("open");
    e.preventDefault();
});

$(document).on('click', '.editing-html', function (e) {
    editing_state = true;
    console.log(xml_id);
    console.log($(this));
    parent = $(this);
    xml_id = parseInt($(this).attr("xml_index"));

    current_topic = topic_json[global_topic];
    for (var i = 0; i < current_topic.length; i++) {
        if (xml_id == current_topic[i].xml_id) {
            // $('#sub_header_text').val(current_topic[i]['data']);
            tinyMCE.activeEditor.setContent(divi.UpdateImgContent(unescape(current_topic[i]['data'])));
            $('#html-attr').val(current_topic[i]['attribution']);
            $('#html-attr-name').val(current_topic[i]['name']);
            $('#html-attr-url').val(current_topic[i]['url']);
            $('#html-attr-lcn').val(current_topic[i]['license']);
            $('#boxtype').val(current_topic[i]['box_type']);
            $('#html-box-title').val(current_topic[i]['box_title']);
            break;
        };
    };


    $(".html.xml_id").attr('xml_id', xml_id);
    if (topic_json[global_topic] == undefined) {
        topic_json[global_topic] = [];
    };
    $("#dialog-html").dialog("open");
    e.preventDefault();
});


$(document).on('click', '.editing-image', function (e) {
    console.log(xml_id);
    console.log($(this));
    parent = $(this);
    xml_id = parseInt($(this).attr("xml_index"));

    current_topic = topic_json[global_topic];
    for (var i = 0; i < current_topic.length; i++) {
        if (xml_id == current_topic[i].xml_id) {
            $('#img-attr').val(current_topic[i]['attribution']);
            $('#imageid').val(current_topic[i]['id']).attr("disabled", true);
            $('#img-desc').val(current_topic[i]['description']);
            $('#img-title').val(current_topic[i]['title']);
            $('#img-attr-name').val(current_topic[i]['name']);
            $('#img-attr-url').val(current_topic[i]['url']);
            $('#img-data').val(current_topic[i]['data']);
            $('#image_xml_id').val(xml_id);
            break;
        };
    };
    if (topic_json[global_topic] == undefined) {
        topic_json[global_topic] = [];
    };
    $("#dialog-image").dialog("open");
    e.preventDefault();
});




$(document).on('click', '.editing-audio', function (e) {
    editing_state = true;
    console.log(xml_id);
    console.log($(this));
    parent = $(this);
    xml_id = parseInt($(this).attr("xml_index"));

    current_topic = topic_json[global_topic];
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


    $(".audio.xml_id").attr('xml_id', xml_id);
    if (topic_json[global_topic] == undefined) {
        topic_json[global_topic] = [];
    };
    $("#dialog-audio").dialog("open");
    e.preventDefault();
});



$(document).on('click', '.editing-video', function (e) {
    editing_state = true;
    console.log(xml_id);
    console.log($(this));
    parent = $(this);
    xml_id = parseInt($(this).attr("xml_index"));

    current_topic = topic_json[global_topic];
    for (var i = 0; i < current_topic.length; i++) {
        if (xml_id == current_topic[i].xml_id) {
            $('#videoid').val(current_topic[i]['id']).attr("disabled", true);
            $('#video-attr').val(current_topic[i]['attribution']);
            $('#video-desc').val(current_topic[i]['description']);
            $('#video-title').val(current_topic[i]['title']);
            $('#video-attr-name').val(current_topic[i]['name']);
            $('#video-data-thumb').val(current_topic[i]['thumb']);            
            $('#video-attr-url').val(current_topic[i]['url']);
            $('.video_xml_id').val(xml_id);
            $('#video_data').val(current_topic[i]['data']);
            break;
        };
    };

    if (topic_json[global_topic] == undefined) {
        topic_json[global_topic] = [];
    };
    $("#dialog-video").dialog("open");
    e.preventDefault();
});

$(document).on('click', '.del-chp', function (e) {
    var result = confirm("Are you Sure you want to delete this chapter?")
    if (result == true) {
        var chapterid = $(this).attr('chapterid');

        for (var i = 0; i < master_json.chapters.length; i++) {
            if (master_json.chapters[i]['id'] == chapterid) {
                master_json.chapters.splice(i, 1);
                break;
            };
            // master_json.chapters[i]
        };
        window.URL = window.webkitURL || window.URL;
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
        file = new Blob([JSON.stringify(master_json, undefined, 2)]);
        file.name = "master.json";

        uploadFiles('/savefile/', file);

        refresh_chapters();
    };
    e.preventDefault();
});


$(document).on('click', '.del-tpc', function (e) {
    var result = confirm("Are you Sure you want to delete this Topic?")
    if (result == true) {
        var chapterid = $(this).attr('chapterid');
        var topicid = $(this).attr('topicid');

        for (var i = 0; i < master_json.chapters.length; i++) {
            if (master_json.chapters[i]['id'] == chapterid) {
                for (var j = 0; j < master_json.chapters[i].topics.length; j++) {
                    if (master_json.chapters[i].topics[j]['id'] == topicid) {
                        master_json.chapters[i].topics.splice(j, 1);
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
        file.name = "master.json";

        uploadFiles('/savefile/', file);

        refresh_chapters();
    };
    e.preventDefault();
});


$(document).on('click', '.del-test', function (e) {
    var result = confirm("Are you Sure you want to delete this Assessment?")
    if (result == true) {
        var chapterid = $(this).attr('chapterid');
        var assessmentid = $(this).attr('assessmentid');

        for (var i = 0; i < master_json.chapters.length; i++) {
            if (master_json.chapters[i]['id'] == chapterid) {
                for (var j = 0; j < master_json.chapters[i].assessments.length; j++) {
                    if (master_json.chapters[i].assessments[j]['id'] == assessmentid) {
                        master_json.chapters[i].assessments.splice(j, 1);
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
        file.name = "master.json";

        uploadFiles('/savefile/', file);

        refresh_chapters();
    };
    e.preventDefault();
});


Array.prototype.diff = function (a) {
    return this.filter(function (i) {
        return !(a.indexOf(i) > -1);
    });
};