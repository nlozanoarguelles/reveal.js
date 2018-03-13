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
    socket.emit('reboot-data',{uuid: getCookie("uuid")});
    socket.on('pollResults', function(pollResults) {
        _self.pollResults = pollResults;
        console.log(pollResults);
        for (var questionId in pollResults) {
            Highcharts.chart(questionId + '-results-chart', {

                chart: {
                    type: 'solidgauge',
                    height: '80%',
                    backgroundColor: '#00ADDA'
                },
                title: {
                    text: 'Resultados',
                    style: {
                        fontSize: '45px',
                        color: '#fff'
                    },
                    enable: false
                },
                tooltip: {
                    borderWidth: 0,
                    backgroundColor: 'none',
                    shadow: false,
                    style: {
                        fontSize: '30px',
                    },
                    pointFormat: '<span style="color:#fff;">{series.name}</span><br><span style="font-size:2.5em; color: {point.color}; font-weight: bold">{point.y}</span>',
                    positioner: function(labelWidth) {
                        return {
                            x: (this.chart.chartWidth - labelWidth) / 2,
                            y: (this.chart.plotHeight / 2) + 15
                        };
                    }
                },

                pane: {
                    startAngle: 0,
                    endAngle: 360,
                    background: [{ // Track for Move
                            outerRadius: '112%',
                            innerRadius: '88%',
                            backgroundColor: Highcharts.Color('#7ED085')
                                .setOpacity(0.4)
                                .get(),
                            borderWidth: 0
                        }, { // Track for Exercise
                            outerRadius: '87%',
                            innerRadius: '63%',
                            backgroundColor: Highcharts.Color('#D9DBAA')
                                .setOpacity(0.4)
                                .get(),
                            borderWidth: 0
                        },

                        { // Track for Stand
                            outerRadius: '62%',
                            innerRadius: '38%',
                            backgroundColor: Highcharts.Color('#D94B3B')
                                .setOpacity(0.4)
                                .get(),
                            borderWidth: 0
                        }
                    ]
                },

                yAxis: {
                    min: 0,
                    max: 100,
                    lineWidth: 0,
                    tickPositions: []
                },

                plotOptions: {
                    solidgauge: {
                        dataLabels: {
                            enabled: false
                        },
                        linecap: 'round',
                        stickyTracking: false,
                        rounded: true
                    }
                },

                series: [{
                        name: 'Tu',
                        data: [{
                            color: '#7ED085',
                            radius: '112%',
                            innerRadius: '88%',
                            y: Math.round(pollResults[questionId].ownResponse)
                        }]
                    }, {
                        name: 'Sala',
                        data: [{
                            color: '#D9DBAA',
                            radius: '87%',
                            innerRadius: '63%',
                            y: Math.round(pollResults[questionId].responseValue / pollResults[questionId].numResponses)
                        }]
                    },
                    {
                        name: 'España',
                        data: [{
                            color: '#D94B3B',
                            radius: '62%',
                            innerRadius: '38%',
                            y: _self.answerManager.barometroResults[questionId]
                        }]
                    }
                ]
            });

        }
    });
}