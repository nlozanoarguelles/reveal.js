// This plugin requires the multiplex module
function PollClient(ioInstance) {

    var _self = this;
    var socketURL = Reveal.getConfig().multiplex.url;
    var socket = io.connect(socketURL);
    _self.answerManager = {
        answeredQuestions: [],
        pollResutls: {},
        answerListener: {
            singleChoice: function(singleChoiceElement) {
                var questionId = singleChoiceElement.attr('id');
                singleChoiceElement.find('.response-btn:not(.submit)').each(function() {
                    jQuery(this).on('click', function(e) {
                        e.preventDefault();
                        var $clickedResponse = jQuery(this);
                        $clickedResponse.parent().addClass('active');
                        singleChoiceElement.find('.response-btn').each(function() {
                            if (jQuery(this)[0] != $clickedResponse[0]) {
                                jQuery(this).parent().removeClass('active');
                            }
                        });
                    })
                });
                singleChoiceElement.find('.submit').on('click', function(e) {
                    e.preventDefault();
                    if (singleChoiceElement.find('.active .response-btn').length > 0) {
                        var $clickedResponse = singleChoiceElement.find('.active .response-btn');
                        _self.sendResponse({
                            id: questionId,
                            type: "singleChoice",
                            responseChoice: $clickedResponse.text()
                        });
                        $clickedResponse.attr('cursor', 'not-allowed');
                        $clickedResponse.off();
                        $clickedResponse.on('click', function(e) { e.preventDefault(); });
                        singleChoiceElement.find('.response-btn').each(function() {
                            if (jQuery(this)[0] != $clickedResponse[0]) {
                                disableClick(jQuery(this));
                            }
                        });
                    }
                });
            },
            rating: function(ratingElement) {
                var questionId = ratingElement.attr('id');
                ratingElement.find('.submit').on('click', function(e) {
                    e.preventDefault();
                    var $clickedResponse = jQuery(this);
                    var ratingIndex = parseInt(ratingElement.find('.rating-input input').val());
                    var ratingMin = ratingElement.find('.rating-input span:first-child').data('value');
                    var ratingMax = ratingMin + ratingElement.find('.rating-input span').length;
                    if (isNaN(ratingIndex) || ratingIndex > ratingMax || ratingIndex < ratingMin) {
                        ratingIndex = ratingMin;
                    }
                    _self.sendResponse({
                        id: questionId,
                        type: "rating",
                        responseChoice: 'rating-' + ratingIndex
                    });

                    $clickedResponse.attr('cursor', 'not-allowed');
                    $clickedResponse.off();
                    disableClick($clickedResponse);
                    $clickedResponse.on('click', function(e) { e.preventDefault(); });
                    ratingElement.find('.rating-input').off();
                });
            },
            multipleText: function(multiTextElement) {
                var questionId = multiTextElement.attr('id');
                multiTextElement.find('.submit').on('click', function(e) {
                    e.preventDefault();
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
                    $clickedResponse.attr('cursor', 'not-allowed');
                    $clickedResponse.off();
                    $clickedResponse.on('click', function(e) { e.preventDefault(); });
                    jQuery('#' + questionId + ' .response-text-input input').each(function() {
                        jQuery(this).prop('disabled', true);
                    });
                });
            },
            multipleChoice: function(multiChoiceElement) {
                var questionId = multiChoiceElement.attr('id');

                multiChoiceElement.find('.response-btn:not(.submit)').each(function() {
                    jQuery(this).on('click', function(e) {
                        e.preventDefault();
                        var $clickedResponse = jQuery(this);

                        $clickedResponse.parent().toggleClass('active');
                    })
                });


                multiChoiceElement.find('.submit').on('click', function(e) {
                    e.preventDefault();
                    var $clickedResponse = jQuery(this);
                    var responses = [];
                    multiChoiceElement.find('.active').each(function() {
                        var $currentElement = jQuery(this);
                        var responseData = {
                            "text": $currentElement.data('text')
                        };
                        responses.push(responseData);
                        $currentElement.attr('cursor', 'not-allowed');
                        $currentElement.off();
                        $currentElement.on('click', function(e) { e.preventDefault(); });
                    });
                    _self.sendResponse({
                        id: questionId,
                        type: "multipleChoice",
                        responses: responses
                    });
                    $clickedResponse.attr('cursor', 'not-allowed');
                    $clickedResponse.off();
                    $clickedResponse.on('click', function(e) { e.preventDefault(); });
                    multiChoiceElement.find('.response-btn').each(function() {
                        if (!jQuery(this).parent().hasClass('active')) {
                            disableClick(jQuery(this));
                        }

                    });
                });
            },
            freeText: function(questionData) {

            }
        },
        barometroResults: {
            "question1": 55,
            "question2": 48,
            "question3": 52,
            "question4": 38,
            "question5": 59,
            "question6": 64,
            "question7": 42,
            "question8": 47,
            "question9": 41,
            "question10": 49,
            "question11": 44,
            "question12": 51,
            "question13": 50,
            "question14": 50,
            "question15": 50,
            "question16": 51
        }
    }

    function disableClick(anchorTag) {
        anchorTag.attr('cursor', 'not-allowed');
        anchorTag.parent().addClass('disabled');
        anchorTag.off();
        anchorTag.on('click', function(e) { e.preventDefault(); });

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
        _self.answerManager.answeredQuestions = answeredQuestions;

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

    socket.on('pollResults', function(pollResults) {
        _self.pollResults = pollResults;
        console.log(pollResults);
        for (var questionId in pollResults) {
            var ctx = document.getElementById(questionId + '-results-chart').getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    datasets: [{
                        label: 'barometro',
                        data: [_self.answerManager.barometroResults[questionId]],
                        backgroundColor: [
                            'rgba(68, 80, 154, 1)',

                        ],
                        borderColor: [
                            'rgba(68,80,154,1)',

                        ],
                        borderWidth: 1
                    }, {
                        label: 'DIVISADERO',
                        data: [pollResults[questionId].responseValue / pollResults[questionId].numResponses],
                        backgroundColor: [
                            'rgba(239, 106, 39, 1)'
                        ],
                        borderColor: [
                            'rgba(239, 106, 39, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }
    });
}