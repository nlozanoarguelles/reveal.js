// This plugin requires the multiplex module
function PollClient(ioInstance) {

    var _self = this;
    var socketURL = Reveal.getConfig().multiplex.url;
    var socket = io.connect(socketURL);
    _self.answerManager = {
        answeredQuestions: [],
        answerListener: {
            singleChoice: function(singleChoiceElement) {
                var questionId = singleChoiceElement.attr('id');
                singleChoiceElement.find('button').each(function() {
                    jQuery(this).on('click', function() {
                        _self.sendResponse({
                            id: questionId,
                            type: "singleChoice",
                            responseChoice: jQuery(this).text()
                        });
                        jQuery(this).removeClass('btn-primary');
                        jQuery(this).addClass('btn-warning');
                        singleChoiceElement.find('button').each(function() {
                            jQuery(this).addClass('disabled');
                        })
                    })
                });
            },
            rating: function(questionData) {

            },
            multiText: function(questionData) {

            },
            freeText: function(questionData) {

            }
        }
    }

    function getCookie(c_name) {
        //cambiar la parte [a-zA-Z0-9] por el diccionario de caracteres valido
        //Nota: los espacios estan puestos tal cual no como \s
        var string = " ?" + c_name + "=( *[a-zA-Z0-9]*)*";
        var regex = new RegExp(string);
        //var c_value = document.cookie;
        var c_value = document.cookie;
        //Cambiar el valor '' por el deseado cuando no exista cookie
        c_value = c_value.match(regex) != null ? c_value.match(regex)[0] : '';
        console.log(c_value);
        if (c_value != null) {
            c_value = c_value.substring(c_value.indexOf("=") + 1, c_value.length);
        }
        return c_value;
    }

    _self.setAnsweredQuestions = function(answeredQuestions) {
        answerManager.answeredQuestions = answeredQuestions;

    }

    _self.sendResponse = function(data, callback) {
        if (!_self.answerManager.answeredQuestions.filter(function(obj) { return obj.id === data.id; })[0]) {
            data.uuid =  getCookie("uuid");
            socket.emit("pollResponse", data);
            console.log(data);
            _self.answerManager.answeredQuestions.push(data);
            if (callback) {
                callback(true);
            }
        }
        if (callback) {
            callback(false);
        }
    }
}