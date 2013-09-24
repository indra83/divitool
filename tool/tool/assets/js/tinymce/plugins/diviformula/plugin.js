tinymce.PluginManager.add('diviformula', function(editor, url) {
    // Add a button that opens a window
    editor.addButton('diviformula', {
        text: ' Divi Formula ',
        icon: false,
        onclick: function() {
            // Open window
            editor.windowManager.open({
                title: 'diviformula plugin',
                body: [
                    {type: 'textbox', name: 'title', label: 'Title', multiline: true}
                ],
                onsubmit: function(e) {
                    // Insert content when the window form is submitted
                    editor.insertContent('\\['+e.data.title+'\\]');
                }
            });
        }
    });
});