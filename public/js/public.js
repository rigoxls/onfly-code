(function(window){

    var OFlyCode = (function(window){
        var OFlyCode = {
            CONSTANTS : {
                editor: window.ace.edit("editor"),
                range:  window.ace.require("ace/range").Range,
                sessionSetted: false,
                roomId: window.roomId
            }
        };
        return OFlyCode;
    })(window);

    (function(OFlyCode){

        //onfly code constructor
        var OFC;
        var editor = OFlyCode.CONSTANTS.editor;
        var sessionSetted = OFlyCode.CONSTANTS.sessionSetted;
        //create a connection with socket, by default io variable is sponsor by socket lib
        var socket = io.connect('http://localhost:3000');

        OFC = function(config){

            var self = this;

            this.init = function(config){
                self.params = config;
                self.initEditor();
                self.initSocketEvents();
                self.initJqueryEvents();
            };

            this.initEditor = function(){
                editor.setTheme("ace/theme/monokai");
                editor.getSession().setMode("ace/mode/javascript");
                document.getElementById('editor').style.fontSize='14px';
                editor.silence = false;
            };

            this.initSocketEvents = function(){
                //join room and update content,
                //roomId gotten from template
                socket.emit('create', OFlyCode.CONSTANTS.roomId);

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

                //set document, stored data
                socket.on('set_session', function(data){
                    if(sessionSetted === false){
                        editor.setValue(data.content, 1);
                        sessionSetted = true;
                    }
                });

                editor.getSession().on('change', function(e) {
                    if(sessionSetted){
                        if (editor.curOp && editor.curOp.command.name || !editor.silence){
                            console.info('editor change sent');
                            console.info(e);
                            socket.emit('editor_change',
                                {
                                  newText: editor.getValue(),
                                  roomId: roomId
                                });
                        }
                    }
                });

            }; //end initSocketEvents


            this.initJqueryEvents = function(){
                $('#text-area').keyup(function(e){
                    if(e.keyCode === 13){
                        self.sendMessage(this);
                    }
                });
            };

            this.sendMessage = function(el){
                var source = $('#tpl-chat-message').html();
                var template = Handlebars.compile(source);

                var context = { userName: 'rigo', message: $(el).val() };
                var html = template(context);

                $('#chat-box .chat-list').append(html);

            };

            this.init(config);
            return this;
        }; //end OFC

        OFlyCode.OFC = OFC; //OFlyCode aware of OFC

    })(OFlyCode);

    window.OFlyCode = OFlyCode; //window aware of OFlycode

})(window);


var onflyCode = new OFlyCode.OFC({});



