(function(window){

    var OFlyCode = (function(window){
        var OFlyCode = {
            CONSTANTS : {
                editor: window.ace.edit("editor"),
                range:  window.ace.require("ace/range").Range,
                sessionSetted: false
            }
        };
        return OFlyCode;
    })(window);

    (function(OFlyCode){

        //onfly code constructor
        var OFC;
        var editor = OFlyCode.CONSTANTS.editor;
        var sessionSetted = OFlyCode.CONSTANTS.sessionSetted;
        var Range = OFlyCode.CONSTANTS.range;

        //create a connection with socket, by default io variable is sponsor by socket lib
        var socket = io.connect('http://localhost:3000');

        OFC = function(config){

            var self = this;
            this.roomId = config.roomId;
            this.userAvatar = config.userAvatar;
            this.userName = config.userName;
            this.userEmail = config.userEmail;
            this.markers = [];

            this.init = function(){
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
                var self = this;
                //join room and update content,
                //roomId gotten from template
                socket.emit('create', self.roomId, self.userEmail);

                //detects any change on editor and update it
                socket.on('editor_broadcast', function(data){
                    var newText = ' ';

                    editor.silence = true;

                    var cursorPos = editor.getCursorPosition();
                    editor.setValue(data.newText, 1);
                    editor.moveCursorToPosition(cursorPos);

                    editor.silence = false;
                    editor.getSession().addGutterDecoration(0,"error_line");

                    //setting markers
                    if(data.marker && data.marker.row){
                        var dM = data.marker;
                        //delete self.markers[data.marker.key];
                        editor.session.removeMarker(self.markers[dM.key]);
                        self.markers[dM.key] = editor.session.addMarker(new Range(dM.row, 0, dM.row, 100), "foreign-marker", "fullLine");
                    }

                });

                //detects any message sent by others users and update chat
                socket.on('message_broadcast', function(data){
                    var source = $('#tpl-chat-message').html();
                    var template = Handlebars.compile(source);

                    var context = data;
                    context.bubblePosition = 'left';
                    var html = template(context);
                    $('#chat-box .chat-list').append(html);

                    //scrolltop
                    $('#chat-box').scrollTop($('#chat-box')[0].scrollHeight);
                });

                //set document, first time
                socket.on('set_document', function(data){
                    if(sessionSetted === false){
                        if(data.content.length > 0){
                            editor.setValue(data.content, 1);
                            editor.session.setMode("ace/mode/" + data.mode);
                        }
                        sessionSetted = true;
                    }
                });

                //set messages on chat, first time
                socket.on('set_chat_messages', function(data){
                    var source = $('#tpl-chat-message').html();
                    var template = Handlebars.compile(source);
                    var context = null;

                    for(var i in data){
                        context = {
                           userName: data[i].user.name,
                           userAvatar: data[i].user.avatar,
                           message: data[i].message.content
                        };

                        context.bubblePosition = (self.userEmail === data[i].user.email) ? 'right' : 'left';

                        var html = template(context);
                        $('#chat-box .chat-list').append(html);
                    }

                    //scrolltop
                    $('#chat-box').scrollTop($('#chat-box')[0].scrollHeight);

                });

                //when editor change, fire an emit to info all users something has changed
                editor.getSession().on('change', function(e) {
                    var marker = {};
                    var mode = $('#l-mode').val();

                    if(sessionSetted){
                        if (editor.curOp && editor.curOp.command.name || !editor.silence){

                            marker = editor.getCursorPosition();
                            marker.key = self.userEmail;

                            socket.emit('editor_change',
                                {
                                  roomId: self.roomId,
                                  newText: editor.getValue(),
                                  marker: marker,
                                  mode: mode
                                });
                        }
                    }
                });

                //set language mode
                socket.on('set_mode', function(data){
                    console.info(data);
                    $('#l-mode').val(data.mode);
                    editor.session.setMode("ace/mode/" + data.mode);
                })

                //if invalid session redirects
                socket.on('invalid_session', function(){
                    window.location.href = '/home/invalid_session';
                });

            }; //end initSocketEvents


            this.initJqueryEvents = function(){

                var textArea = $('#text-area');

                textArea.keyup(function(e){
                    if(e.keyCode === 13){
                        self.sendMessage(this);
                        textArea.val('');
                    }
                });

                $('#send').click(function(){
                    self.sendMessage(textArea);
                    textArea.val('');
                });

                $('#l-mode').change(function(e){
                    var mode = $(this).val();
                    var data = { mode: mode, roomId: self.roomId}
                    editor.session.setMode("ace/mode/" + mode);
                    socket.emit('mode_change', data);
                });
            };

            this.sendMessage = function(el){
                var self = this;
                var source = $('#tpl-chat-message').html();
                var template = Handlebars.compile(source);
                var textArea = $('#text-area');

                var context = {
                    roomId: self.roomId,
                    userName: self.userName,
                    userEmail: self.userEmail,
                    userAvatar: self.userAvatar,
                    message: $(el).val()
                };

                context.bubblePosition = 'right';
                var html = template(context);

                $('#chat-box .chat-list').append(html);

                //scroll top
                $('#chat-box').scrollTop($('#chat-box')[0].scrollHeight);

                //emit message to all users
                socket.emit('message_send', context);
            };

            this.init();
            return this;
        }; //end OFC

        OFlyCode.OFC = OFC; //OFlyCode aware of OFC

    })(OFlyCode);

    window.OFlyCode = OFlyCode; //window aware of OFlycode

})(window);

var params = { userName : userName, userEmail: userEmail, userAvatar : userAvatar, roomId: roomId};
new OFlyCode.OFC(params);



