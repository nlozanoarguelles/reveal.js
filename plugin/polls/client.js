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
                singleChoiceElement.find('.response-btn').each(function() {
                    jQuery(this).on('click', function() {
                        var $clickedResponse = jQuery(this);
                        _self.sendResponse({
                            id: questionId,
                            type: "singleChoice",
                            responseChoice: jQuery(this).text()
                        });
                        $clickedResponse.parent().addClass('active');
                        $clickedResponse.attr('cursor', 'not-allowed');
                        $clickedResponse.off();
                        singleChoiceElement.find('.response-btn').each(function() {
                            if (jQuery(this)[0] != $clickedResponse[0]) {
                                disableClick(jQuery(this));
                            }
                        });
                    })
                });
            },
            rating: function(ratingElement) {
                var questionId = ratingElement.attr('id');
                ratingElement.find('.submit').on('click', function() {
                    var $clickedResponse = jQuery(this);
                    var ratingIndex = parseInt(jQuery('.rating-input input').val());
                    var ratingMin = jQuery('.rating-input span:first-child').data('value');
                    var ratingMax = ratingMin + jQuery('.rating-input span').length;
                    if (isNaN(ratingIndex) || ratingIndex > ratingMax || ratingIndex < ratingMin) {
                        ratingIndex = ratingMin;
                    }
                    _self.sendResponse({
                        id: questionId,
                        type: "rating",
                        responseChoice: 'rating-' + ratingIndex
                    });
                    $clickedResponse.parent().addClass('active');
                    $clickedResponse.attr('cursor', 'not-allowed');
                    $clickedResponse.off();
                    jQuery('.rating-input').off();
                });
            },
            multipleText: function(multiTextElement) {
                var questionId = multiTextElement.attr('id');
                multiTextElement.find('.submit').on('click', function() {
                    var $clickedResponse = jQuery(this);
                    var responses = [];
                    multiTextElement.find('.response-text-input input').each(function() {
                        var $currentElement = jQuery(this);
                        var responseData = {
                            "text": $currentElement.data('text'),
                            "responseText": $currentElement.val(),
                        };
                        responses.push(responseData);
                    });
                    _self.sendResponse({
                        id: questionId,
                        type: "multipleText",
                        responses: responses
                    });
                    $clickedResponse.parent().addClass('active');
                    $clickedResponse.attr('cursor', 'not-allowed');
                    $clickedResponse.off();
                    jQuery('#' + questionId + ' .response-text-input input').each(function() { jQuery(this).prop('disabled', true); });
                });
            },
            multipleChoice: function(multiChoiceElement) {
                var questionId = multiChoiceElement.attr('id');

                multiChoiceElement.find('.response-btn').each(function() {
                    jQuery(this).on('click', function() {
                        var $clickedResponse = jQuery(this);

                        $clickedResponse.parent().toggleClass('active');
                    })
                });


                multiChoiceElement.find('.submit').on('click', function() {
                    var $clickedResponse = jQuery(this);
                    var responses = [];
                    multiChoiceElement.find('.active').each(function() {
                        var $currentElement = jQuery(this);
                        var responseData = {
                            "text": $currentElement.data('text')
                        };
                        responses.push(responseData);
                    });
                    _self.sendResponse({
                        id: questionId,
                        type: "multipleChoice",
                        responses: responses
                    });
                    $clickedResponse.parent().addClass('active');
                    $clickedResponse.attr('cursor', 'not-allowed');
                    $clickedResponse.off();
                    multiChoiceElement.find('.response-btn').each(function() {
                        disableClick(jQuery(this));
                    });
                });
            },
            freeText: function(questionData) {

            }
        }
    }

    function disableClick(anchorTag) {
        anchorTag.attr('cursor', 'not-allowed');
        anchorTag.parent().addClass('disabled');
        anchorTag.off();

    }

    function getCookie(c_name) {
        //cambiar la parte [a-zA-Z0-9] por el diccionario de caracteres valido
        //Nota: los espacios estan puestos tal cual no como \s
        var string = " ?" + c_name + "=( *[a-zA-Z0-9\-\_]*)*";
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
            data.uuid = getCookie("uuid");
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