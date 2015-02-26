(function(win){

    var editor = ace.edit("editor");
    var Range = ace.require("ace/range").Range

    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
    document.getElementById('editor').style.fontSize='14px';

    editor.silence = false;

    //create a connection with socket, by default io variable is sponsor by socket lib
    var socket = io.connect('http://localhost:3000');

    //join room, roomId gotten from template
    socket.emit('create', roomId);

    socket.on('editor_broadcast', function(data){

        var newText = ' ';
        console.info('editor broadcast gotten');
        console.info(data.newText);

        editor.silence = true;

        var cursorPos = editor.getCursorPosition();
        editor.setValue(data.newText, 1);
        editor.moveCursorToPosition(cursorPos);

        editor.silence = false;

    });

    editor.getSession().on('change', function(e) {
        if (editor.curOp && editor.curOp.command.name || !editor.silence){
                console.info('editor change sent');
                console.info(e);
                socket.emit('editor_change',
                    {
                      newText: editor.getValue(),
                      roomId: roomId
                    });
        }
    });

    //autosave after 1 mins
    setInterval(function(){
        socket.emit('save_document',
            {
                roomId: roomId
            });
    },60000);

})(window)



