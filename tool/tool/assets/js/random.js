$(document).on('click', '.edit-chp', function (e) {

    var chapterid = $(this).attr('chapterid');
    var chaptername = "";
    for (var i = 0; i < master_json.chapters.length; i++) {
        if (master_json.chapters[i]['id'] == chapterid) {
            chaptername = master_json.chapters[i]['name'];
            break;
        }
        // master_json.chapters[i]
    }

    $('#chapterid').val(chapterid);
    $('#chapterid').attr('disabled', 'disabled');
    $('#chapter_name').val(chaptername);
    editing_state = true;

    $('#dialog-chapter').dialog('open');

    e.preventDefault();
});


$('#mod-chapter').click(function () {
    $("#chapterid").removeAttr("disabled");
    $('#chapter_name').val('');
    $('#chapterid').val('');
    $('#dialog-chapter').dialog('open');
});


$(document).on('click', '.edit-test', function (e) {

    var chapterid = $(this).attr('chapterid');
    var assessmentid = $(this).attr('assessmentid');
    var assessmentname = "";
    var assessmenttype = "";
    var assessmentdifficulty = "";
    var assessmenttime = "";

    var dropval = 0;

    for (var i = 0; i < master_json.chapters.length; i++) {
        if (master_json.chapters[i]['id'] == chapterid) {

            for (var j = 0; j < master_json.chapters[i].assessments.length; j++) {
                if (master_json.chapters[i].assessments[j]['id'] == assessmentid) {
                    assessmentname = master_json.chapters[i].assessments[j]['name'];
                    assessmenttype = master_json.chapters[i].assessments[j]['type'];
                    assessmentdifficulty = master_json.chapters[i].assessments[j]['difficulty'];
                    assessmenttime = master_json.chapters[i].assessments[j]['time'];
                    // assessmentname=master_json.chapters[i].assessments[j]['name'];
                    dropval = i;
                    break;
                }
            }

            chaptername = master_json.chapters[i]['name'];
            break;
        }
        // master_json.chapters[i]
    }


    $('#chapter_select1').attr('disabled', 'disabled');
    $('#testnumber').val(assessmentid);
    $('#testnumber').attr('disabled', 'disabled');
    $('#testname').val(assessmentname);
    $('#testtype').val(assessmenttype);
    $('#testdifficulty').val(assessmentdifficulty);
    $('#testtime').val(assessmenttime);
    editing_state = true;

    for (var i = 0; i < master_json.chapters.length; i++) {
        var op = $('<option>').attr('value', i).html(master_json.chapters[i]['name']);
        $('#chapter_select1').append(op);
        // options.push(master_json.chapters[i]['name']);
    }

    $('#chapter_select1').val(dropval);

    $('#dialog-test').dialog('open');

    e.preventDefault();
});


$(document).on('click', '.edit-tpc', function (e) {

    var chapterid = $(this).attr('chapterid');
    var chaptername = "";
    var topicid = $(this).attr('topicid');
    var topicname = "";
    var dropval = 0;

    for (var i = 0; i < master_json.chapters.length; i++) {
        if (master_json.chapters[i]['id'] == chapterid) {

            for (var j = 0; j < master_json.chapters[i].topics.length; j++) {
                if (master_json.chapters[i].topics[j]['id'] == topicid) {
                    topicname = master_json.chapters[i].topics[j]['name'];
                    dropval = i;
                    break;
                }
            }

            chaptername = master_json.chapters[i]['name'];
            break;
        }
        // master_json.chapters[i]
    }


    $('#chapter_select').attr('disabled', 'disabled');
    $('#topicnumber').val(topicid);
    $('#topicnumber').attr('disabled', 'disabled');
    $('#topicname').val(topicname);
    editing_state = true;

    for (var i = 0; i < master_json.chapters.length; i++) {
        var op = $('<option>').attr('value', i).html(master_json.chapters[i]['name']);
        $('#chapter_select').append(op);
        // options.push(master_json.chapters[i]['name']);
    }

    $('#chapter_select').val(dropval);

    $('#dialog-topic').dialog('open');

    e.preventDefault();
});


$('#mod-topic').click(function () {
    // Populate the option tags
    $('#chapter_select').html('');
    $("#chapter_select").removeAttr("disabled");
    $("#topicnumber").removeAttr("disabled");
    $("#topicnumber").val('');
    $('#topicname').val('');
    // var options=[];
    for (var i = 0; i < master_json.chapters.length; i++) {
        var op = $('<option>').attr('value', i).html(master_json.chapters[i]['name']);
        $('#chapter_select').append(op);
        // options.push(master_json.chapters[i]['name']);
    }
    $('#dialog-topic').dialog('open');
});






$('#mod-test').click(function () {
    // Populate the option tags
    $('#chapter_select1').html('');
    $("#chapter_select1").removeAttr("disabled");
    // var options=[];
    for (var i = 0; i < master_json.chapters.length; i++) {
        var op = $('<option>').attr('value', i).html(master_json.chapters[i]['name']);
        $('#chapter_select1').append(op);
        // options.push(master_json.chapters[i]['name']);
    }
    $('#dialog-test').dialog('open');
});

$('#dialog-topic').dialog({
    autoOpen: false,
    height: 300,
    width: 400,
    modal: true,
    buttons: {
        "Insert Topic": function () {
            var uniqueness = true;
            var chp_id = $('#topicnumber').val();

            for (var i = 0; i < master_json.chapters.length; i++) {

                if (master_json.chapters[i]['id'] == chp_id) {
                    uniqueness = false;
                };

                for (var j = 0; j < master_json.chapters[i].topics.length; j++) {
                    if (master_json.chapters[i].topics[j]['id'] == chp_id) {
                        uniqueness = false;
                    }
                }
            }

            if (editing_state == false && $('#topicnumber').val().match('^[_a-zA-Z0-9]+$') == null) {
                alert("The ID is wrong. It can only include alpha numerals and (_)");
            } else if (editing_state == false && !uniqueness) {
                alert("The ID is not unique through the book.");
            } else {

                if (editing_state == true) {
                    editing_state = false;
                    for (var i = 0; i < master_json.chapters[parseInt($('#chapter_select').val())].topics.length; i++) {
                        if (master_json.chapters[parseInt($('#chapter_select').val())].topics[i]['id'] == $('#topicnumber').val()) {
                            master_json.chapters[parseInt($('#chapter_select').val())].topics[i]['name'] = $('#topicname').val();
                            break;
                        }
                    }

                } else {

                    if (master_json.chapters[parseInt($('#chapter_select').val())]['topics'] == undefined) {
                        master_json.chapters[parseInt($('#chapter_select').val())]['topics'] = [];
                    };
                    master_json.chapters[parseInt($('#chapter_select').val())]['topics'].push({
                        'id': $('#topicnumber').val(),
                        'name': $('#topicname').val()
                    });
                    var dom = jsxml.fromString('<?xml version="1.0" encoding="UTF-8"?><root/>'),
                    child = dom.createElement('topic');
                    child.setAttribute('id', $('#topicnumber').val());
                    dom.documentElement.appendChild(child);

                    window.URL = window.webkitURL || window.URL;
                    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
                    file = new Blob([jsxml.toXml(dom)]);

                    file.name = "topic.xml"
                    uploadFiles('/savefile/' + master_json.chapters[parseInt($('#chapter_select').val())]['id'] + "/" + $('#topicnumber').val(), file);
                }

                window.URL = window.webkitURL || window.URL;
                window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
                file = new Blob([JSON.stringify(master_json, undefined, 2)]);
                file.name = "master.json";

                uploadFiles('/savefile/', file);

                refresh_chapters();
                //   console.log(data);
                // });
                refresh_chapters();

                $(this).dialog("close");
            }

        },
        Cancel: function () {
            $(this).dialog("close");
        }
    },
    close: function () {
        $('#sub_header_text').val('');
        $('#dialog-add').dialog("close");
    }
});


$('#delete-confirm').dialog({
    autoOpen: false,
    width: 400,
    modal: true,
    buttons: {
        "Ok": function () {
        	var editStatus = divi.getCurrClicked();
            var index = editStatus.index;
            current_topic = topic_json[global_topic];
            if (index >= 0) {
                divi.deleteAt(current_topic, index);
                topic_json[global_topic] = current_topic;
                refresh_dom();
            }
            $(this).dialog("close");
            return false;
        },
        Cancel: function () {
            $(this).dialog("close");
            divi.reseteditStates();
        }
    },
    close: function () {
    	divi.reseteditStates();
    }
});



$('#dialog-test').dialog({
    autoOpen: false,
    height: 500,
    width: 500,
    modal: true,
    buttons: {
        "Insert Assessment": function () {
            var uniqueness = true;
            var chp_id = $('#testnumber').val();
            for (var i = 0; i < master_json.chapters.length; i++) {
                if (master_json.chapters[i]['id'] == chp_id) {
                    uniqueness = false;
                };
                for (var j = 0; j < master_json.chapters[i].topics.length; j++) {
                    if (master_json.chapters[i].topics[j]['id'] == chp_id) {
                        uniqueness = false;
                    }
                }
            }

            if (editing_state == false && $('#testnumber').val().match('^[_a-zA-Z0-9]+$') == null) {
                alert("The ID is wrong. It can only include alpha numerals and (_)");
            } else if (editing_state == false && !uniqueness) {
                alert("The ID is not unique through the book.");
            } else {
            	var currAssessment,assesment;
                if (editing_state == true) {
                    editing_state = false;
                    assesment = master_json.chapters[parseInt($('#chapter_select1').val())].assessments;
                    for (var i = 0; i < assesment.length; i++) {
                    	currAssessment = assesment[i];
                        if (currAssessment['id'] == $('#testnumber').val()) {
                        	currAssessment['name'] = $('#testname').val();
                        	currAssessment['type'] = $('#testtype').val();
                        	currAssessment['difficulty'] = $('#testdifficulty').val();
                        	currAssessment['time'] = $('#testtime').val();
                            break;
                        }
                    }

                } else {

                    if (master_json.chapters[parseInt($('#chapter_select1').val())]['assessments'] == undefined) {
                        master_json.chapters[parseInt($('#chapter_select1').val())]['assessments'] = [];
                    };
                    master_json.chapters[parseInt($('#chapter_select1').val())]['assessments'].push({
                        'id': $('#testnumber').val(),
                        'name': $('#testname').val(),
                        'type': $('#testtype').val(),
                        'level': $('#testlevel').val(),
                        'time': $('#testtime').val(),
                        'difficulty': $('#testdifficulty').val(),
                    });
                }
                window.URL = window.webkitURL || window.URL;
                window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
                file = new Blob([JSON.stringify(master_json, undefined, 2)]);
                file.name = "master.json";

                uploadFiles('/savefile/', file);

                refresh_chapters();
                $(this).dialog("close");
            }
        },
        Cancel: function () {
            $(this).dialog("close");
        }
    },
    close: function () {
        $('#sub_header_text').val('');
        $('#dialog-add').dialog("close");
    }
});


$('#dialog-chapter').dialog({
    autoOpen: false,
    height: 300,
    width: 350,
    modal: true,
    buttons: {
        "Insert Chapter": function () {
            // master_json.chapters.push({'name':$('#chapter_name').val(),'order':parseInt($('#chapter_no').val())});
            // if (master_json.chapters[parseInt($('#chapter_no').val())-1] != undefined) {
            var uniqueness = true;
            var chp_id = $('#chapterid').val();

            for (var i = 0; i < master_json.chapters.length; i++) {

                if (master_json.chapters[i]['id'] == chp_id) {
                    uniqueness = false;
                };

                for (var j = 0; j < master_json.chapters[i].topics.length; j++) {
                    if (master_json.chapters[i].topics[j]['id'] == chp_id) {
                        uniqueness = false;
                    };
                };
            };

            if (editing_state == false && $('#chapterid').val().match('^[_a-zA-Z0-9]+$') == null) {
                alert("The ID is wrong. It can only include alpha numerals and (_)");
            } else if (editing_state == false && !uniqueness) {
                alert("The ID is not unique through the book.");
            } else {


                if (editing_state == true) {
                    editing_state = false;
                    for (var i = 0; i < master_json.chapters.length; i++) {
                        if (master_json.chapters[i]['id'] == $('#chapterid').val()) {
                            master_json.chapters[i]['name'] = $('#chapter_name').val();
                            break;
                        }

                    };
                } else {

                    master_json.chapters.push({
                        'id': $('#chapterid').val(),
                        'name': $('#chapter_name').val(),
                        'topics': []
                    });
                }




                window.URL = window.webkitURL || window.URL;
                window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
                file = new Blob([JSON.stringify(master_json, undefined, 2)]);
                file.name = "master.json";
                uploadFiles('/savefile/', file);

                refresh_chapters();

                $(this).dialog("close");

            }


        },
        Cancel: function () {
            $(this).dialog("close");
        }
    },
    close: function () {
        $('#sub_header_text').val('');
        $('#dialog-add').dialog("close");
    }
});


$('#dialog-book').dialog({
    autoOpen: false,
    height: 450,
    width: 350,
    modal: true,
    buttons: {
        "Book Edit": function () {
            if ($('#bookid').val().match('^[_a-zA-Z0-9]+$') == null) {
                alert("The Book ID is wrong. It can only include alpha numerals and (_)");
            } else if ($('#courseid').val().match('^[_a-zA-Z0-9]+$') == null) {
                alert("The Course ID is wrong. It can only include alpha numerals and (_)");
            } else if ($('#bookorder').val().match('^[0-9]+$') == null) {
                alert("The Book Order is wrong. It can only include numbers");
            } else if ($('#bookversion').val().match('^[0-9]+$') == null) {
                alert("The Book Versions is wrong. It can only include numbers");
            } else {
                master_json['name'] = $('#bookname').val();
                master_json['bookId'] = $('#bookid').val();
                master_json['courseId'] = $('#courseid').val();
                master_json['orderNo'] = $('#bookorder').val();
                master_json['version'] = $('#bookversion').val();
                // master_json['']=
                window.URL = window.webkitURL || window.URL;
                window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
                file = new Blob([JSON.stringify(master_json, undefined, 2)]);
                file.name = "master.json";

                uploadFiles('/savefile/', file);
                refresh_chapters();

                $(this).dialog("close");

            }
        },
        Cancel: function () {
            $(this).dialog("close");
        }
    },
    close: function () {
        $('#bookname').val('');
        $('#bookid').val('');
        $('#courseid').val('');
        $('#bookorder').val('');
        $('#bookversion').val('');
        $('#dialog-add').dialog("close");
    }
});


function refresh_chapters() {
    $('#book-nav').html('');

    $('#bookname-cont').html(' Book Name : ' + master_json['name']);
    $('#bookid-cont').html(' Book ID : ' + master_json['bookId']);
    $('#courseid-cont').html(' Course ID : ' + master_json['courseId']);
    $('#bookorder-cont').html(' Book Order : ' + master_json['orderNo']);
    $('#bookversion-cont').html(' Book Version : ' + master_json['version']);

    for (var i = master_json.chapters.length - 1; i >= 0; i--) {
        var a = $('<li>');
        var link = $('<a>').append(master_json.chapters[i]['name']);
        link.attr('chapter-id', i);
        var del_btn_ch = $('<button>').addClass('btn del-chp sidebar-btn btn-danger btn-xs').attr('chapterid', master_json.chapters[i]['id']).append($('<span>').addClass('glyphicon glyphicon-trash'));
        var edit_btn_ch = $('<button>').addClass('btn edit-chp sidebar-btn btn-warning btn-xs').attr('chapterid', master_json.chapters[i]['id']).append($('<span>').addClass('glyphicon glyphicon-edit'));
        link.prepend(edit_btn_ch);
        link.append(del_btn_ch);
        a.append(link);


        var top = $('<ul>');

        top.addClass('sortchapters');
        if (master_json.chapters[i].topics != undefined) {
            for (var j = master_json.chapters[i].topics.length - 1; j >= 0; j--) {
                var a1 = $('<li>');
                var link1 = $('<a>').append(master_json.chapters[i].topics[j]['name']);
                var del_btn = $('<button>').addClass('btn del-tpc sidebar-btn btn-danger btn-xs').attr('chapterid', master_json.chapters[i]['id']).attr('topicid', master_json.chapters[i].topics[j]['id']).append($('<span>').addClass('glyphicon glyphicon-trash'));
                var edit_btn = $('<button>').addClass('btn edit-tpc sidebar-btn btn-warning btn-xs').attr('chapterid', master_json.chapters[i]['id']).attr('topicid', master_json.chapters[i].topics[j]['id']).append($('<span>').addClass('glyphicon glyphicon-edit'));
                link1.addClass('topic_link');
                link1.attr('chapter-id', i);
                link1.attr('topic-id', j);
                a1.append(edit_btn).append('&nbsp;');
                a1.append(link1);
                a1.append('&nbsp;').append(del_btn);
                top.prepend(a1);
            }
        }

        var top1 = $('<ul>');


        if (master_json.chapters[i].assessments == undefined) {
            master_json.chapters[i].assessments = [];
        } else {

            for (var k = 0; k < master_json.chapters[i].assessments.length; k++) {
                // master_json.chapters[i].assessments[k]
                var test_el = $('<li style="background-color:wheat;padding:2px;">');
                var link = $('<a>').append(master_json.chapters[i].assessments[k]['name']).addClass('assess');
                link.attr('chapter-id', i);
                link.attr('assessmentid', k);
                var del_btn_ch = $('<button>').addClass('btn del-test sidebar-btn btn-danger btn-xs').attr('chapterid', master_json.chapters[i]['id']).attr('assessmentid', master_json.chapters[i].assessments[k]['id']).append($('<span>').addClass('glyphicon glyphicon-trash'));
                var edit_btn_ch = $('<button>').addClass('btn edit-test sidebar-btn btn-warning btn-xs').attr('chapterid', master_json.chapters[i]['id']).attr('assessmentid', master_json.chapters[i].assessments[k]['id']).append($('<span>').addClass('glyphicon glyphicon-edit'));
                // link.prepend(edit_btn_ch);
                // link.append(del_btn_ch);
                test_el.append(edit_btn_ch)
                test_el.append(link);
                test_el.append(del_btn_ch);
                top1.prepend(test_el);
            }
        }

        a.append(top);
        a.append(top1);
        $('#book-nav').prepend(a);
    };

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

            // current_topic=topic_json[global_topic]
            var temp_array = []
            for (var i = 0; i < master_json.chapters[global_chapter].topics.length; i++) {
                temp_array[i] = master_json.chapters[global_chapter].topics[parseInt(after_tn_array[i])];
                // current_topic[parseInt(after_tn_array[i])];
            };

            master_json.chapters[global_chapter].topics = temp_array;

            // for (var i = 0; i <current_topic.length; i++) {
            //   current_topic[i].xml_id=i;
            // };
            // topic_json[global_topic]=current_topic;
            refresh_chapters();

        }
    });
}


$("#dialog-add").dialog({
    autoOpen: false,
    height: 500,
    width: 350,
    modal: true,
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
        }
    },
    close: function () {

    }
});

divi = {};

divi.isValidId = function(dlg,data,callBack){
	var toCallBack = true;
	if(!(data.hasOwnProperty('xml_id') && data['xml_id'] >= 0)){
        var uniqueness = divi.unique('id', data.id);
        if (!divi.idMatch(data.id)) {
        	toCallBack = false;
            alert("The ID is wrong. It can only include alpha numerals and (_)");
        } else if (!uniqueness) {
        	toCallBack = false;
            alert("The ID is not unique");
        }
    }
	if(callBack && toCallBack){
		callBack(dlg,data);
	}
	return toCallBack;
};

divi.modifyMasterContent = function(){
	
};

$("#dialog-heading").dialog({
    autoOpen: false,
    height: 300,
    width: 350,
    modal: true,
    buttons: {
        "Insert Heading3": divi.headerModify,
        Cancel: function () {$(this).dialog("close");}
    },
    close: function () {
        $('#header_text').val('');
        $('#headerid').val('');
        $('#dialog-add').dialog("close");
    }
});


divi.subheaderModify = function(){
	divi.showLoader();
	var val,xml_id,id,passData;
	val = $('#sub_header_text').val();
	id = $('#subheadingid').val();
	xml_id = parseInt($(".subheader.xml_id").attr('xml_id'));
	passData = {"type": "subheader","data": val,"xml_id": xml_id,"id": id};
	divi.isValidId($(this),passData,divi.contentUploadCallBack);
};

divi.headerModify = function(){
	divi.showLoader();
	var val,xml_id,id,passData;
	val = $('#header_text').val();
	id = $('#headerid').val();
	xml_id = parseInt($(".header.xml_id").attr('xml_id'));
	passData = {"type": "header","data": val,"xml_id": xml_id,"id": id};
	divi.isValidId($(this),passData,divi.contentUploadCallBack);	
};

divi.insertAt = function (array, index, data) {
    var editable = false;
    if (!index || index < 0) {
        var editStatus = divi.getCurrClicked();
        index = editStatus.index;
        editable = editStatus.editState;
    }
    if (array && index >= 0) {
        var key = indexKey;
        var len = array.length;
        if (len > index) {
            var newArray = array;
            array = [];
            if (editable) {
                if (newArray.length > index) {
                    $.extend(newArray[index], data);
                }
            } else {
                data[key] = index;
                newArray.splice(index, 0, data);
            }
            array = newArray;
        } else {
            array.push(data);
        }
        divi.resetIndexes(array);
    }
    return array;
};

divi.resetIndexes = function (array) {
    if (array) {
        for (var i = 0; array && i < array.length; i++) {
            array[i][indexKey] = i;
        }
    }
    return array;
}

divi.deleteAt = function (array, index) {
    if (array && index >= 0) {
        var len = array.length;
        if (len > index) {
            array.splice(index, 1);
        }
    }
    divi.resetIndexes(array);
    return array;
};


//can get rid of this once we arrange xml_id based on array number.
divi.retrieveIndex = function (array, index, attr) {
    var matchedIndex = -1;
    if (!index) {
        var editStatus = divi.getCurrClicked();
        index = editStatus.index;
    }
    if (index <= 0 && array) {
        matchedIndex = array.length;
    } else {
        if (!attr) {
            attr = indexKey;
        }
        if (array && index >= 0) {
            for (var i = 0; i < array.length; i++) {
                if (array[i][attr] == index) {
                    matchedIndex = index;
                    break;
                }
            }
        }
    }
    return matchedIndex;
};

divi.UpdateImgContent = function (data, toRemove) {
    var dataJ = $(data);
    var elements = dataJ.find("img");
    var eachElem, regex, originalsrc;
    var prefix = divi.imageLocation("/getfiles/") + "/";
    for (var x in elements) {
        if (elements.hasOwnProperty(x)) {
            eachElem = elements[x];
            if (eachElem && eachElem.localName == 'img') {
                var src = $(eachElem).attr('src');
                originalsrc = src;
/*if(src.indexOf(prefix) != -1){
					regex = new RegExp(prefix, 'g');
					src = src.replace(regex, '');
				}*/
                if (src.indexOf('../getfiles') != -1) {
                    src = src.replace('../getfiles', '/getfiles');
                }
                if (toRemove) {
                    src = src.replace(prefix, '');
                } else {
                    if (src.indexOf(prefix) == -1) {
                        src = prefix + src;
                    }
                }
                data = data.replace(originalsrc, src);
            }
        }
    }
    return data;
};
// SUB HEADING
$("#dialog-sub-heading").dialog({
    autoOpen: false,
    height: 300,
    width: 350,
    modal: true,
    buttons: {
        "Insert Sub-Topic":divi.subheaderModify,
        Cancel: function () {
            $(this).dialog("close");
        }
    },
    close: function () {
        $('#sub_header_text').val('');
        $('#subheadingid').val('');
        $('#dialog-add').dialog("close");
    }
});



divi.contentUploadCallBack = function (dlg, data) {
    var current_topic = topic_json[global_topic];
    current_topic = divi.insertAt(current_topic, null, data);
    topic_json[global_topic] = current_topic;
    divi.hideLoader();
    refresh_dom();
    dlg.dialog("close");
}

divi.postFormulaUpload = function (reqData, data) {
    var currLocation = "./equations/";
    var currData, location;
    var val = data.data;
    for (var i = 0; i < reqData.length; i++) {
        currData = reqData[i];
        location = currLocation + currData.name;
        val = val.replace(currData.src, location);
    }
    data.data = val;
    divi.saveInsertHtml.call(this, data);
};

divi.showLoader = function () {
    setTimeout(function () {
        $('.overlay').show();
        $('.load').show();
    }, 10);
}

divi.hideLoader = function () {
    setTimeout(function () {
        $('.load').hide();
        $('.overlay').hide();
    }, 20);
}


divi.imageLocation = function (action, appendChapter) {
    loc = action + master_json.chapters[global_chapter]['id'] + "/" + master_json.chapters[global_chapter].topics[global_topic]['id'];
    if (appendChapter) {
        loc += "/" + current_topic[i]['data']
    }
    return loc;
}


divi.fileLocation = function () {
    return global_chapter + "/" + global_topic + "/media";;
}

divi.idMatch = function (value) {
    var isId = false;
    if (value) {
        isId = value.match(idRegex);
    }
    return isId;
};


divi.unique = function (tagName, value) {
    var uniqueness = true;
    for (var i = 0; i < topic_json[global_topic].length; i++) {
        if (topic_json[global_topic][i][tagName] == value) {
            uniqueness = false;
            break;
        }
    }
    return uniqueness;
};


divi.videoUpload = function (e, data, mainData) {
    try {
        divi.showLoader();
        var title_text, attr_text, attr_name, attr_url, desc_text, license, id, baseLoc, passData, fileData, files1thumbData, eachFilesList, eachFile,thumb,filesList,update;
        var files = [],
            files1 = [],
            comFiles = [];
        var xmlIdElem = $(".video_xml_id");
        var xml_id;
        var edit = false;
        if (xmlIdElem && xmlIdElem.length > 0) {
            xml_id = parseInt(xmlIdElem.val());
        }
        if (xml_id >= 0) {
            edit = true;
        }
        title_text = $('#video-title').val();
        attr_text = $('#video-attr').val();
        desc_text = $('#video-desc').val();
        attr_name = $('#video-attr-name').val();
        attr_url = $('#video-attr-url').val();
        license = $('#video-attr-lcn').val();
        files = document.getElementById('videofilemod').files;
        files1 = document.getElementById('thumbfilemod').files;
        
        id = $('#videoid').val();

        fileData = $('#video-data').val();
        thumbData = $('#video-data-thumb').val();

        var file_name = edit ? fileData : files[0].name;
        if(edit && thumbData && files1[0] && files1[0].name != thumbData){
        	thumb = files1[0].name;
        	filesList = [files1];
        	update = true;
        }else{
        	 thumb = files1[0].name;
        	 filesList = [files, files1];
        	 update = false;
        }
        for (var eachFilesListKey in filesList) {
            if (filesList.hasOwnProperty(eachFilesListKey)) {
                eachFilesList = filesList[eachFilesListKey];
                for (var eachFileKey in eachFilesList) {
                    if (eachFilesList.hasOwnProperty(eachFileKey)) {
                        eachFile = eachFilesList[eachFileKey];
                        if (eachFile && eachFile.type) {
                            comFiles.push(eachFile);
                        }
                    }
                }
            }
        }

        passData = {
            id: id,
            data: file_name,
            attribution: attr_text,
            description: desc_text,
            title: title_text,
            xmlId: xml_id,
            url: attr_url,
            name: attr_name,
            license: license,
            edit: edit,
            type: "video",
            thumb: thumb,
            update:update
        };
        baseLoc = "/savefile/";
        var video_dlg = $(this);
        divi.upload.call(this, comFiles, video_dlg, passData);
    } catch (err) {
        alert("something went wrong. Please contact system administrator. \n\n Error Message:  \n\n" + err.message);
    } finally {
        divi.hideLoader();
    }
}


divi.imgUpload = function (e, data, mainData) {
    try {
        divi.showLoader();
        var title_text, attr_text, attr_name, attr_url, desc_text, full_screen, showBorder, license, id, passData, imgData;
        var files = [];
        var xml_id = parseInt($("#image_xml_id").val());
        title_text = $('#img-title').val();
        attr_text = $('#img-attr').val();
        attr_name = $('#img-attr-name').val();
        attr_url = $('#img-attr-url').val();
        desc_text = $('#img-desc').val();
        full_screen = $('#fullscheck').is(':checked');
        showBorder = $('#showborder').is(':checked');
        license = $('#img-attr-lcn').val();
        id = $('#imageid').val();
        files = document.getElementById('imagefilemod').files;
        imgData = $('#img-data').val();

        var edit = imgData ? true : false;
        var file_name = edit ? imgData : files[0].name;        
        
        passData = {
            id: id,
            data: file_name,
            attribution: attr_text,
            description: desc_text,
            allowFullscreen: full_screen,
            showBorder: showBorder,
            title: title_text,
            xmlId: xml_id,
            url: attr_url,
            name: attr_name,
            license: license,
            edit: edit,
            type: "image"
        };

        var img_dlg = $(this);
        divi.upload.call(this, files, img_dlg, passData);
    } catch (err) {
        alert("something went wrong. Please contact system administrator. \n\n Error Message:  \n\n" + err.message);
    } finally {
        divi.hideLoader();
    }
};

divi.audioUpload = function(){
	try {
		divi.showLoader();
        var title_text, attr_text, attr_name, attr_url, desc_text, full_screen, showBorder, license, id, passData, audioData;
        var files = [];
        var xml_id = parseInt($("#audio xml_id").val());
        title_text = $('#audio-title').val();
        attr_text = $('#audio-attr').val();
        attr_name = $('#audio-attr-name').val();
        desc_text = $('#audio-desc').val();
        attr_url = $('#audio-attr-url').val();
        license = $('#audio-attr-lcn').val();
        id = $('#audioid').val();
        files = document.getElementById('audiofilemod').files;
        audioData = $('#img-data').val();
        var edit = (files && files.length > 0) ? false : true;
        var file_name = edit ? audioData : files[0].name;
        passData = {id: id,data: file_name,
            attribution: attr_text,
            description: desc_text,
            allowFullscreen: full_screen,
            showBorder: showBorder,
            title: title_text,
            xmlId: xml_id,
            url: attr_url,
            name: attr_name,
            license: license,
            edit: edit,
            type: "audio"
        };
        var img_dlg = $(this);
        divi.upload.call(this, files, img_dlg, passData);
    } catch (err) {
        alert("something went wrong. Please contact system administrator. \n\n Error Message:  \n\n" + err.message);
    } finally {
        divi.hideLoader();
    }
};


divi.filesUpload = function(files,dlg,data){
	var baseLoc = "/savefile/";
	 var url = divi.imageLocation(baseLoc);
     var deferred = new $.Deferred();
     defArray.push(deferred);
     uploadFilesImage(url, files, deferred);
     $.when.apply($, defArray).then(function (e) {
         divi.contentUploadCallBack(dlg, data);
     });
}


divi.upload = function (files, dlg, passData) {
    if (!passData.edit || passData.update) {
    	var callBack = true;
    	if(!passData.update){
    		callBack = divi.isValidId(dlg,passData);
    	}
    	if(callBack){
    		divi.filesUpload(files,dlg,passData);
    	}
    } else {
        divi.contentUploadCallBack(dlg, passData);
    }
};

divi.saveInlineFormulae = function (data) {
    if (data) {
        var val = data.data;
        var elements = $(val).find('img[src^="' + EQUATION_ENGINE + '"]');
        if (elements && elements.length > 0) {
            var files = [],
                currData;
            for (var i = 0; i < elements.length; i++) {
                currData = elements[i];
                id = currData.id ? currData.id : (guid());
                files.push({
                    name: id + defaultImgExtension,
                    src: currData.src,
                    text: currData.text
                });
            }
            divi.formulaUpload.call(this, divi.imageLocation("/saveformula/"), files, data);
        } else {
            divi.saveInsertHtml.call(this, data);
        }
    }
}

divi.saveInlineImages = function (data) {
    divi.showLoader();
    var files = tinyMCE.activeEditor.files;
    var proceedToHtml = true;
    if (files) {
        var url = divi.imageLocation("/savefile/") + "/htmlimages/";
        var filesList = [],
            currFile;
        for (var key in files) {
            if (files.hasOwnProperty(key)) {
                filesList.push(files[key]);
            }
        }
        var invoke = this;
        if (filesList.length > 0) {
            var deferred = new $.Deferred();

            var deferredArray = [];
            deferredArray.push(deferred);

            uploadFilesImage.call(this, url, filesList, deferred);
            $.when.apply($, deferredArray).then(function (e) {
                divi.saveInlineSucess.call(invoke, data, filesList);
            });
            proceedToHtml = false;
        }
    }
    if (proceedToHtml) {
        divi.saveInlineFormulae.call(this, data);
    }
};

divi.saveInlineSucess = function (data, files) {
    var val = data.data;
    var currLocation = "./htmlimages/";
    var dataQuery = $(val);
    var matchedElem;
    for (var i = 0; i < files.length; i++) {
        currData = files[i];
        matchedElem = dataQuery.find('img[name="' + currData.name + '"]');
        if (matchedElem) {
            $(matchedElem).attr('src', currLocation + currData.name);
        }
    }
    data.data = $("<div/>").append($(dataQuery).clone()).html();
    tinyMCE.activeEditor.files = [];
    divi.saveInlineFormulae.call(this, data);
}

// IMAGE START
$("#dialog-image").dialog({
    autoOpen: false,
    height: 500,
    width: 500,
    modal: true,
    buttons: {
        "Insert Image": divi.imgUpload,
        Cancel: function () {
            $(this).dialog("close");
        }
    },
    close: function () {
        $('#imageid').val('');
        $('#imagefilemod').val('');
        $('#img-attr').val('');
        $('#img-title').val('');
        $('#img-desc').val('');
        $('#img-attr-name').val('');
        $('#img-attr-url').val('');
        $('#dialog-add').dialog("close");
    }
});
// IMAGE END
//AUDIO
$("#dialog-audio").dialog({
    autoOpen: false,
    height: 500,
    width: 500,
    modal: true,
    buttons: {
        "Insert Audio":divi.audioUpload,
         Cancel: function () {
            $(this).dialog("close");
        }
    },
    close: function () {
        $('#audioid').val('');
        $('#audiofilemod').val('');
        $('#audio-attr').val('');
        $('#audio-desc').val('');
        $('#audio-attr-name').val('');
        $('#audio-attr-url').val('');
        $('#audio-attr-url').val('');
        $('#dialog-add').dialog("close");
    }
});

//AUDIO END
var defArray = [];

// VIDEO START
$("#dialog-video").dialog({
    autoOpen: false,
    height: 500,
    width: 500,
    modal: true,
    buttons: {
        "Insert Video": divi.videoUpload,
        Cancel: function () {
            $(this).dialog("close");
        }
    },
    close: function () {
        divi.resetValues(['#videoid', '#video-attr', '#video-desc', '#video-title', '#video-attr-name', '#video-attr-url', '#video_data', '.video_xml_id']);
        $('#dialog-add').dialog("close");
    }
});
// VIDEO END

divi.insertHtml = function (data) {
    try {
        divi.showLoader();
        var val = tinyMCE.activeEditor.getContent();
        var current_topic = topic_json[global_topic];
        var attr_text = $('#html-attr').val();
        var attr_name = $('#html-attr-name').val();
        var attr_url = $('#html-attr-url').val();
        var license = $('#html-attr-lcn').val();
        var box_type = $('#boxtype').val();
        var xml_id = parseInt($(".html.xml_id").attr('xml_id'));
        var box_title = $('#html-box-title').val();
        var data = {
            data: val,
            attribution: attr_text,
            url: attr_url,
            name: attr_name,
            license: license,
            box_type: box_type,
            box_title: box_title,
            xmlId: xml_id,
            type: 'html'
        };
        divi.saveInlineImages.call(this, data);

    } catch (err) {
        alert("something went wrong. Please contact system administrator. \n\n Error Message:  \n\n" + err.message);
    } finally {
        divi.hideLoader();
    }
};

divi.getCurrClicked = function () {
    var clicked = current_clicked;
    var editState = textEdit;
    divi.reseteditStates();
    return {
        index: clicked,
        editState: editState
    };
};

divi.reseteditStates = function () {
    current_clicked = -1;
    textEdit = false;
}

divi.setCurrClicked = function (elem, isAdd) {
    var element = $(elem);
    current_clicked = parseInt($(elem).attr('xml_index'));
    if (current_clicked && !element.hasClass('emptybtn') && isAdd) {
        current_clicked = current_clicked + 1;
    }
    if (isAdd) {
        textEdit = false;
    } else {
        textEdit = true;
    }
};

divi.fileBlock = function(e){
	e.stopPropagation();
	return false;
};

divi.saveInsertHtml = function (data) {
    if (data) {
        data.data = escape(data.data);
    }
    current_topic = divi.insertAt(current_topic, null, data);
    topic_json[global_topic] = current_topic;
    refresh_dom();
    tinyMCE.activeEditor.setContent('');
    $('#html-attr').val('');
    $(this).dialog("close");
    divi.hideLoader();
};

// HTML START
$("#dialog-html").dialog({
    autoOpen: false,
    height: 700,
    width: 800,
    modal: true,
    buttons: {
        "Insert HTML": divi.insertHtml,
        Cancel: function () {
            tinyMCE.activeEditor.setContent('');
            $('#html-attr').val('');
            $('#html-attr-name').val('');
            $('#html-attr-url').val('');
            $('#html-attr-url').val('');
            $(this).dialog("close");
        }
    },
    close: function () {
        tinyMCE.activeEditor.setContent('');
        $('#html-attr').val('');
        $('#html-attr-name').val('');
        $('#html-attr-url').val('');
        $('#html-attr-url').val('');
        $('#dialog-add').dialog("close");
    }
});



// HTML END

function refresh_dom() {

    current_topic = topic_json[global_topic]

    var preview_pane = $('#preview');
    preview_pane.html('');

    var side_bar = $('#sidebar');
    side_bar.html('');

    preview_pane.append("<h1>" + master_json.chapters[global_chapter].topics[global_topic]['id'] + "<small> is being edited </small></h1> <br><hr>");


    // var current_topic=topic_json[global_topic];
    // if (current_topic == undefined) {
    //   break;
    // };
    current_topic.sort(function (obj1, obj2) {
        // Ascending: first age less than the previous
        return parseInt(obj1.xml_id) - parseInt(obj2.xml_id);
    });

    var dom = jsxml.fromString('<?xml version="1.0" encoding="UTF-8"?><topic version="1" id="' + master_json.chapters[global_chapter].topics[global_topic]['id'] + '"/>');

    // child = dom.createElement('topic');
    // child.setAttribute('id', master_json.chapters[global_chapter].topics[global_topic]['id']);
    // dom.documentElement.appendChild(child);
    for (var i = 0, len = current_topic.length; i < len; i++) {
        switch (current_topic[i].type) {
        case "header":
            preview_pane.append("<h3>" + current_topic[i].data + "</h3> <br><hr>");

            var holder = $('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index=' + current_topic[i].xml_id + ' class="add-btn inner-btn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="' + current_topic[i].xml_id + '" class="editable testing1 header-d">HEADING 3</a>&nbsp;<button xml_index=' + current_topic[i].xml_id + ' class="del-btn inner-btn btn btn-danger btn-xs"><span class="glyphicon glyphicon-trash"></span></button>');
            side_bar.append(holder);


            child = dom.createElement('heading3');
            child.setAttribute('id', current_topic[i].id);

            child.textContent = current_topic[i].data;

            dom.documentElement.appendChild(child);


            // side_bar.append('<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable testing1 header-d">HEADING</a>');
            break;
        case "subheader":
            preview_pane.append("<h4>" + current_topic[i].data + "</h4> <br><hr>");

            var holder = $('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index=' + current_topic[i].xml_id + ' class="add-btn inner-btn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="' + current_topic[i].xml_id + '" class="editable editing-subheader header-d">SUB TOPIC</a>&nbsp;<button xml_index=' + current_topic[i].xml_id + ' class="del-btn inner-btn btn btn-danger btn-xs"><span class="glyphicon glyphicon-trash"></span></button>');
            side_bar.append(holder);
            // side_bar.append('<a href="#" xml_index="'+current_topic[i].xml_id+'" class="testing1"> <i class="icon-plus-sign"></i> </a>');
            // side_bar.append('<a href="#" id="header" xml_index="'+current_topic[i].xml_id+'" class="editable plus">SUB HEADING</a>');
            child = dom.createElement('subtopic');
            child.setAttribute('id', current_topic[i].id);

            child.textContent = current_topic[i].data;

            dom.documentElement.appendChild(child);

            break;

        case "html":
            console.log("HTML");
            preview_pane.append("<div>" + divi.UpdateImgContent(unescape(current_topic[i].data)) + "</div> <br>");
            preview_pane.append("Author Name/ID/Organization Name : " + current_topic[i].attribution + " <br> Name/Title : " + current_topic[i].name + " <br> URL : " + current_topic[i].url + " <br> License : " + current_topic[i].license + "<br> Box Title : " + current_topic[i].box_title + "Box Type :" + current_topic[i].box_type + " <br> <hr>");
            // preview_pane.attr('contenteditable','false');
            var holder = $('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index=' + current_topic[i].xml_id + ' class="add-btn inner-btn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="' + current_topic[i].xml_id + '" class="editable editing-html header-d">HTML</a>&nbsp;<button xml_index=' + current_topic[i].xml_id + ' class="del-btn inner-btn btn btn-danger btn-xs"><span class="glyphicon glyphicon-trash"></span></button>');
            side_bar.append(holder);

            child = dom.createElement('html');

            child.setAttribute('boxType', current_topic[i].box_type);
            child.setAttribute('boxTitle', current_topic[i].box_title);

            // child.textContent = unescape(current_topic[i].data);
            data1 = dom.createElement('data');

            cdata = dom.createCDATASection(unescape(current_topic[i].data));
            cdata.data = divi.UpdateImgContent(cdata.data, true);
            data1.appendChild(cdata);
            child.appendChild(data1);

            ref = dom.createElement('references');

            license = dom.createElement('license');
            license.textContent = current_topic[i].license;

            src = dom.createElement('source');
            src.textContent = current_topic[i].attribution;

            name1 = dom.createElement('name');
            name1.textContent = current_topic[i].name;

            url = dom.createElement('url');
            url.textContent = current_topic[i].url;



            child.appendChild(ref);

            ref.appendChild(src);
            ref.appendChild(name1);
            ref.appendChild(url);
            ref.appendChild(license);
            dom.documentElement.appendChild(child);
            break;

        case "image":
            var parent_div = document.createElement("div");
            var span = document.createElement("img");
            var title_text = current_topic[i].title;
            var attr_text = current_topic[i].attribution;
            var full_screen = current_topic[i].allowFullscreen;
            var showBorder = current_topic[i].showBorder;

            span.src = "/getfiles/" + master_json.chapters[global_chapter]['id'] + "/" + master_json.chapters[global_chapter].topics[global_topic]['id'] + "/" + current_topic[i]['data'];
            console.log(span);
            span.width = 320;
            var custom_text = document.createElement("p");
            custom_text.innerHTML = "Title : " + title_text + "<br> Author Name/ID/Organization Name : " + attr_text + " <br> Name/Title : " + current_topic[i].name + " <br> URL : " + current_topic[i].url + " <br> description :" + current_topic[i].description + "<br>Allow fullscreen: " + full_screen + "<br> Show border: " + showBorder + " <br> License : " + current_topic[i].license + "<br><hr>";
            parent_div.appendChild(span);
            parent_div.appendChild(custom_text);

            preview_pane.append(parent_div);

            var holder = $('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index=' + current_topic[i].xml_id + ' class="add-btn inner-btn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="' + current_topic[i].xml_id + '" class="editable editing-image header-d">IMAGE</a>&nbsp;<button xml_index=' + current_topic[i].xml_id + ' class="del-btn inner-btn btn btn-danger btn-xs"><span class="glyphicon glyphicon-trash"></span></button>');
            side_bar.append(holder);


            child = dom.createElement('image');
            child.setAttribute('id', current_topic[i].id);

            child.setAttribute('src', current_topic[i].data);
            child.setAttribute('allowFullscreen', current_topic[i].allowFullscreen);
            child.setAttribute('showBorder', current_topic[i].showBorder);

            title = dom.createElement('title');
            title.textContent = current_topic[i].title;

            desc = dom.createElement('description');
            desc.textContent = current_topic[i].description;

            child.appendChild(title);
            child.appendChild(desc);

            ref = dom.createElement('references');

            license = dom.createElement('license');
            license.textContent = current_topic[i].license;

            src = dom.createElement('source');
            src.textContent = current_topic[i].attribution;

            name1 = dom.createElement('name');
            name1.textContent = current_topic[i].name;

            url = dom.createElement('url');
            url.textContent = current_topic[i].url;



            child.appendChild(ref);

            ref.appendChild(src);
            ref.appendChild(name1);
            ref.appendChild(url);
            ref.appendChild(license);
            dom.documentElement.appendChild(child);
            break;

        case "video":
            var parent_div = document.createElement("div");

            var span = document.createElement("video");

            span.setAttribute('controls', '');

            var title_text = current_topic[i].title;
            var attr_text = current_topic[i].attribution;


            span.src = "/getfiles/" + master_json.chapters[global_chapter]['id'] + "/" + master_json.chapters[global_chapter].topics[global_topic]['id'] + "/" + current_topic[i]['data'];
            console.log(span);
            span.width = 320;
            var custom_text = document.createElement("p");
            custom_text.innerHTML = "Author Name/ID/Organization Name : " + attr_text + " <br> Name/Title : " + current_topic[i].name + " <br> URL : " + current_topic[i].url + "<br>" + "Title : " + current_topic[i].title + "<br> Description :" + current_topic[i].description + " <br> License : " + current_topic[i].license + "<br>";
            parent_div.appendChild(span);
            parent_div.appendChild(custom_text);
            var span1 = document.createElement("img");
            span1.src = "/getfiles/" + master_json.chapters[global_chapter]['id'] + "/" + master_json.chapters[global_chapter].topics[global_topic]['id'] + "/" + current_topic[i]['thumb'];
            span1.width = 100;
            parent_div.appendChild(span1);
            var line_var = document.createElement("hr");
            parent_div.appendChild(line_var);
            // };
            preview_pane.append(parent_div);


            var holder = $('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index=' + current_topic[i].xml_id + ' class="add-btn inner-btn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="' + current_topic[i].xml_id + '" class="editable editing-video header-d">VIDEO</a>&nbsp;<button xml_index=' + current_topic[i].xml_id + ' class="del-btn inner-btn btn btn-danger btn-xs"><span class="glyphicon glyphicon-trash"></span></button>');
            side_bar.append(holder);

            child = dom.createElement('video');
            child.setAttribute('id', current_topic[i].id);

            child.setAttribute('src', current_topic[i].data);

            // img1=dom.createElement('image');
            child.setAttribute('thumb', current_topic[i]['thumb']);

            title = dom.createElement('title');
            title.textContent = current_topic[i].title;

            desc = dom.createElement('description');
            desc.textContent = current_topic[i].description;

            child.appendChild(title);
            child.appendChild(desc);

            ref = dom.createElement('references');

            license = dom.createElement('license');
            license.textContent = current_topic[i].license;

            src = dom.createElement('source');
            src.textContent = current_topic[i].attribution;

            name1 = dom.createElement('name');
            name1.textContent = current_topic[i].name;

            url = dom.createElement('url');
            url.textContent = current_topic[i].url;

            ref.appendChild(src);
            ref.appendChild(name1);
            ref.appendChild(url);
            ref.appendChild(license);

            child.appendChild(ref);

            // child.appendChild(img1);
            dom.documentElement.appendChild(child);


            break;

        case "audio":
            var parent_div = document.createElement("div");

            var span = document.createElement("audio");

            span.setAttribute('controls', '');


            var attr_text = current_topic[i].attribution;
            var title_text = current_topic[i].title;


            span.src = "/getfiles/" + master_json.chapters[global_chapter]['id'] + "/" + master_json.chapters[global_chapter].topics[global_topic]['id'] + "/" + current_topic[i]['data'];
            span.width = 320;

            var custom_text = document.createElement("p");
            custom_text.innerHTML = "Author Name/ID/Organization Name : " + attr_text + " <br> Name/Title : " + current_topic[i].name + " <br> URL : " + current_topic[i].url + "<br> Title : " + current_topic[i].title + "<br>" + "description :" + current_topic[i].description + " <br> License : " + current_topic[i].license + "<br><hr>";
            parent_div.appendChild(span);
            parent_div.appendChild(custom_text);
            preview_pane.append(parent_div);

            var holder = $('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index=' + current_topic[i].xml_id + ' class="add-btn inner-btn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="' + current_topic[i].xml_id + '" class="editable editing-audio header-d">AUDIO</a>&nbsp;<button xml_index=' + current_topic[i].xml_id + ' class="del-btn inner-btn btn btn-danger btn-xs"><span class="glyphicon glyphicon-trash"></span></button>');
            side_bar.append(holder);

            child = dom.createElement('audio');
            child.setAttribute('id', current_topic[i].id);

            child.setAttribute('src', current_topic[i].data);

            title = dom.createElement('title');
            title.textContent = current_topic[i].title;

            child.appendChild(title);

            desc = dom.createElement('description');
            desc.textContent = current_topic[i].description;

            child.appendChild(desc);

            ref = dom.createElement('references');

            license = dom.createElement('license');
            license.textContent = current_topic[i].license;

            src = dom.createElement('source');
            src.textContent = current_topic[i].attribution;

            name1 = dom.createElement('name');
            name1.textContent = current_topic[i].name;

            url = dom.createElement('url');
            url.textContent = current_topic[i].url;

            ref.appendChild(src);
            ref.appendChild(name1);
            ref.appendChild(url);
            ref.appendChild(license);

            child.appendChild(ref);

            dom.documentElement.appendChild(child);


            break;
            // }else{
            // var span1 = document.createElement("img");
            // span1.src=current_topic[i]['thumb1'];
            // span1.width=100;
            // parent_div.appendChild(span1);
        case "formula":

            preview_pane.append('\\[' + current_topic[i].data + '\\]');
            // MathJax.Hub.Queue(['Typeset',MathJax.Hub]);
            var holder = $('<div></div>').addClass('sortable').addClass('well well-sm').html('<button xml_index=' + current_topic[i].xml_id + ' class="add-btn inner-btn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>&nbsp;<a href="#" id="header" xml_index="' + current_topic[i].xml_id + '" class="editable editing-formula header-d">FORMULA</a>&nbsp;<button xml_index=' + current_topic[i].xml_id + ' class="del-btn inner-btn btn btn-danger btn-xs"><span class="glyphicon glyphicon-trash"></span></button>');
            side_bar.append(holder);
            // loadImage('http://latex.codecogs.com/png.latex?'+current_topic[i].data,insert_formula,preview_pane);
            // side_bar.append('<a href="#" xml_index="'+xml_id+'" class="testing1"> <i class="icon-plus-sign"></i> </a>');
            // side_bar.append('<a href="#" id="header" xml_index="'+xml_id+'" class="editable plus">Formula</a>');
            child = dom.createElement('formula');
            child.setAttribute('id', current_topic[i].id);

            child.textContent = current_topic[i].data;



            dom.documentElement.appendChild(child);

            break;

        }
    }
    side_bar.append('<button xml_index="' + current_topic.length + '" class="add-btn emptybtn btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus-sign"></span></button>');

    // $('#side_bar').sortable();
    // $( "#side_bar" ).disableSelection();
    window.URL = window.webkitURL || window.URL;
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
    file = new Blob([jsxml.toXml(dom)]);


    file.name = "topic.xml"
    uploadFiles('/savefile/' + master_json.chapters[global_chapter]['id'] + "/" + master_json.chapters[global_chapter].topics[global_topic]['id'], file);
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
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j]) a.splice(j--, 1);
        }
    }

    return a;
};

function uploadJSON(url, file, name) {
    var formData = new FormData();

    // for (var i = 0, file; file = files[i]; ++i) {
    formData.append(name, file);
    // }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.onload = function (e) {
        console.log(e)
    };

    xhr.send(formData); // multipart/form-data
}



function uploadVideoFiles(url, file) {
    var formData = new FormData();

    // for (var i = 0, file; file = files[i]; ++i) {
    formData.append(file.name, file, file.name);
    // }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.onload = function (e) {
        console.log(e);
    };

    xhr.send(formData); // multipart/form-data
}


divi.imageUploadFileCallback = function (url, formData, deferred) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.onload = function (e) {
        if (this.status == 200) {
            divi.hideLoader();
            deferred.resolve();
        } else {

            divi.hideLoader();
            deferred.reject();
        }
    };
    xhr.send(formData);


}

divi.formulaUpload = function (url, data, mainData) {
    var formData = {
        'data': JSON.stringify(data)
    };
    $.ajax({
        type: "POST",
        async: false,
        data: formData,
        url: url,
        context: this,
        dataType: "json",
        success: function (e) {
            divi.postFormulaUpload.call(this, data, mainData);
        }
    });

}

function uploadFilesImage(url, file, deferred) {
    var formData = new FormData();
    if (file && file.length > 0) {
        for (var i = 0; i < file.length; i++) {
            formData = divi.prepareFile(formData, file[i]);
        }
    } else {
        formData = divi.prepareFile(formData, file);
    }
    divi.imageUploadFileCallback.call(this, url, formData, deferred);
}

divi.prepareFile = function (formData, file) {
    if (formData) {
        formData.append(file.name, file, file.name);
        if (file.src) {
            formData.append(file.src, file.src);
        }
    }
    return formData;
}


function uploadFiles(url, file) {
    var formData = new FormData();
    formData.append(file.name, file, file.name);
    var xhr = new XMLHttpRequest();

    xhr.open('POST', url, true);
    xhr.onload = function (e) {
        console.log(e);
    };

    xhr.send(formData); // multipart/form-data
}