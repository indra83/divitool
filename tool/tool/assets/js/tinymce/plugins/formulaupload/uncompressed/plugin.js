(function() {
    tinymce.create('tinymce.plugins.FormulaUploadPlugin', {
        init : function(ed, url) {
            url = tinyMCE.activeEditor.getParam('formulaupload_rel') || url;
            var formulaUploadUrl = tinyMCE.activeEditor.getParam('formulaupload_url');
            var head = document.getElementsByTagName('body')[0];
            var css = document.createElement('link');                       
            css.type = 'text/css';
            css.rel = 'stylesheet';
            css.href = url + '/css/style.css';
            head.appendChild(css);
            
            // Register commands
            ed.addCommand('mceImageUpload', function() {
                $('#image_upload_type').val('tinymce'); 
                $('body').append('<div class="formulaUploadBg"></div>');
                
                var showImageUploadError = function(msg) {
                    $('.formulaUploadError').html(msg).show();
                    removeForeground();
                };
                
                var removeForeground = function() {
                    $('.formulaUploadFg').remove();
                    $('.formulaUploadFgLoading').remove();
                };
                
                var removeBackground = function() {
                    $('.formulaUploadBg').remove();
                    $('.formulaUploadContainer').remove();
                };

                var container = '\
					<div class="formulaUploadContainer mce-container" hidefocus="1" tabindex="-1"><div class="mce-container-body"> \
                        <textarea type="formula" name="formula" id="image-upload-area" class="mce-textbox mce-placeholder" hidefocus="true"></textarea></div>\
                             <div class="previewContainer">\
                                <div class="header" >Formula Preview</div>\
                                <div class="formulapreview"></div>\
                            </div></div>\
                            <div class="formulaUploadConfirmCase mce-panel">\
                                <div class="mce-btn mce-primary">\
                                    <button role="presentation" class="formulaUploadSubmit">Upload</button>\
                                </div>\
                                <div class="mce-btn">\
                                    <button role="presentation" class="formulaUploadClose">Close</button>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                ';
                
                $('body').append(container);
                
                $('.formulaUploadBg, .formulaUploadContainer .formulaUploadClose, .mce-close').on('click', function(){
                    removeForeground();
                    removeBackground();
                });
                
                $('#uploadImageForm').iframePostForm({
                    json: true,
                    post: function(){
                        // Sending.
                    },
                    complete: function(response){

                        if (typeof response != "object" || response == null || typeof response.error == 'undefined') {
                            removeForeground();
                            showImageUploadError('An error occurred while uploading your image.');
                        } else {
                            if (response.error != false) {
                                switch (response.error) {
                                    case ("filetype"):
                                        showImageUploadError('Please select a valid image and try again.');
                                        break;
                                    default:
                                        showImageUploadError('An unknown error occurred.');
                                        break;
                                }
                            } else {
                                if (typeof response.path != 'undefined') {
                                    var tpl = '<img src="%s" />';
                                    ed.insertContent(tpl.replace('%s', response.path));
                                    ed.focus();
                                    removeForeground();
                                    removeBackground();
                                } else {
                                    showImageUploadError('An unknown error occurred.');
                                }
                            }
                        }
                    }
                });
                
                $('.formulaUploadSubmit').on('click', function(){
                    
                    $('.formulaUploadError').html('').hide();
                    
                    if ($('#image-upload-area').val() != '') {
                        $('body').append('<div class="formulaUploadFg"></div>');
                        $('body').append('<div class="formulaUploadFgLoading"></div>');
                        $('#uploadImageForm').submit();
                    } else {
                        showImageUploadError('Please select an image to upload.');
                    }
                    
                });
            });

            // Register buttons
            ed.addButton('formulaupload', {
                title : 'Image Upload',
                cmd : 'mceImageUpload',
                image : url + '/img/icon.png'
            });
        },

        getInfo : function() {
            return {
                longname : 'Image Upload',
                author : 'BoxUK',
                authorurl : 'https://github.com/boxuk/tinymce-formulaupload',
                infourl : 'https://github.com/boxuk/tinymce-formulaupload/blob/master/README.md',
                version : '1.0.0'
            };
        }
    });
    
    tinymce.PluginManager.add('formulaupload', tinymce.plugins.FormulaUploadPlugin);
})();
