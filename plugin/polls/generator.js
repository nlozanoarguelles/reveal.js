// This generator is based in the jQuery, Rating (http://jsfiddle.net/Phoennix/6Sybq/4/) Frameworks
const cheerio = require('cheerio');
module.exports = function() {
    var _self = this;
    var sectionGenerator = function(questionId, questionType, backgroundImage) {
        var classBlock = "";
        if (questionType != "separator" && questionType != "results") {
            classBlock = "class=\"quiz-question\"";
        }
        var backgroundImage = backgroundImage || "";
        var mainSection = cheerio('<section ' + classBlock + ' id="' + questionId + '" data-type="' + questionType + '" data-background-image="' + backgroundImage + '"></section>');
        return mainSection;
    };



    var headerGenerator = function() {
        var header = cheerio('<div class="dsd-header"><img src="./res/header_logo.png"></div><h3 class="header-separator"><span>#BAROMETROQUIZ</span></h3>');
        return header;
    }

    var mainQuestionGenerator = function(mainQuestionText) {
        var mainQuestion = cheerio('<div class="dsd-main-question"></div>');
        var questionText = cheerio('<h1>' + mainQuestionText + '</h1>');
        mainQuestion.append(questionText);
        return mainQuestion;
    };

    var responsesGenerator = function() {
        var responses = cheerio('<div class="dsd-responses"/>');
        return responses;
    };

    var rowGenerator = function() {
        var row = cheerio('<div class="grid"></div>');
        return row;
    }

    var columnGenerator = function(columnSize) {
        var column = cheerio('<div class="col-' + columnSize + '-12 mobile-col-1-1"><div class="response response-single-choice"></div></div>');
        return column;
    }

    var columnWithTextGenerator = function(columnSize, fieldText) {
        var column = cheerio('<div class="col-' + columnSize + '-12 mobile-col-1-1" ><div class="response response-single-choice" data-text="' + fieldText + '" ></div></div>');
        return column;
    }

    var starsInputGenerator = function(starsNumber) {
        var starsBlock = cheerio('<div style="font-size:7em;"> <input type="number" class="rating" id="rating" name="test" data-min="1" data-max="' + starsNumber + '" value="0"> </div>');
        return starsBlock;
    }

    var submitGenerator = function() {
        var submitBlock = cheerio('<div class="response submit" style="text-align:center;"> <a href="#" class="response-btn submit"> Enviar   <i class="fa fa-play" aria-hidden="true"></i> </a> </div>');
        return submitBlock;
    }

    var textInputGenerator = function(size, fieldText) {
        var textInput = cheerio('<div class="col-' + size + '-12 mobile-col-1-1"> <div class="grid response-text-input"> <div class="col-4-12 mobile-col-4-12 response-label"> <span>' + fieldText + '</span> </div> <div class="col-8-12 mobile-col-8-12"> <input type="text" class="response" data-text="' + fieldText + '" placeholder="RESPUESTA" /> </div> </div> </div>');
        return textInput;
    }

    _self.singleChoiceGenerator = function(questionData) {
        var section = sectionGenerator(questionData.id, questionData.type);
        var header = headerGenerator();
        section.append(header);
        var mainQuestion = mainQuestionGenerator(questionData.data.mainQuestion);
        section.append(mainQuestion);
        var responses = responsesGenerator();
        // Three columns set-up or two columns set-up
        var columnSetUp = questionData.data.responses.length > 6 ? 3 : 2;
        var mdValue = 12 / columnSetUp;
        var row = rowGenerator();
        for (var i = 0; i < questionData.data.responses.length; i++) {
            var column = columnGenerator(mdValue);
            var buttonContent = cheerio('<a href="#" class="response-btn">' + questionData.data.responses[i].text + '</a>');
            column.find('.response').append(buttonContent);
            row.append(column);
            if (i % columnSetUp == (columnSetUp - 1) || questionData.data.responses.length - 1 == i) {
                row.append('<div class="grid-break mobile-col-1-1 col-1-1"></div>');
            } else {
                row.append('<div class="grid-break mobile-col-1-1"></div>');
            }
        }
        responses.append(row);
        section.append('<br>');
        section.append(responses);
        var submitBlock = submitGenerator();
        section.append(submitBlock);
        return section;
    }

    _self.multipleChoiceGenerator = function(questionData) {
        var section = sectionGenerator(questionData.id, questionData.type);
        var header = headerGenerator();
        section.append(header);
        var mainQuestion = mainQuestionGenerator(questionData.data.mainQuestion);
        section.append(mainQuestion);
        var responses = responsesGenerator();
        // Three columns set-up or two columns set-up
        var columnSetUp = questionData.data.responses.length > 6 ? 3 : 2;
        var mdValue = 12 / columnSetUp;
        var row = rowGenerator();
        for (var i = 0; i < questionData.data.responses.length; i++) {
            var column = columnWithTextGenerator(mdValue, questionData.data.responses[i].text);
            var buttonContent = cheerio('<a href="#" class="response-btn">' + questionData.data.responses[i].text + '</a>');
            column.find('.response').append(buttonContent);
            row.append(column);
            if (i % columnSetUp == (columnSetUp - 1) || questionData.data.responses.length - 1 == i) {
                row.append('<div class="grid-break mobile-col-1-1 col-1-1"></div>');
            } else {
                row.append('<div class="grid-break mobile-col-1-1"></div>');
            }
        }
        responses.append(row);
        section.append('<br>');
        section.append(responses);
        var submitBlock = submitGenerator();
        section.append(submitBlock);
        return section;
    }



    _self.ratingGenerator = function(questionData) {
        var section = sectionGenerator(questionData.id, questionData.type);
        var header = headerGenerator();
        section.append(header);
        var mainQuestion = mainQuestionGenerator(questionData.data.mainQuestion);
        section.append(mainQuestion);
        var responses = responsesGenerator();
        var starsInput = starsInputGenerator(questionData.data.responses.length);
        responses.append(starsInput);
        section.append('<br>');
        section.append(responses);
        var submitBlock = submitGenerator();
        section.append('<br>');
        section.append('<br>');
        section.append(submitBlock);
        return section;
    }

    _self.multipleTextGenerator = function(questionData) {
        var section = sectionGenerator(questionData.id, questionData.type);
        var header = headerGenerator();
        section.append(header);
        var mainQuestion = mainQuestionGenerator(questionData.data.mainQuestion);
        section.append(mainQuestion);
        var responses = responsesGenerator();
        // Three columns set-up or two columns set-up
        var columnSetUp = questionData.data.responses.length >= 6 ? 3 : 2;
        var mdValue = 12 / columnSetUp;
        var row = rowGenerator();
        var maxInputs = questionData.data.responses.length > 6 ? 6 : questionData.data.responses.length;
        for (var i = 0; i < maxInputs; i++) {
            var textInput = textInputGenerator(mdValue, questionData.data.responses[i].text);
            row.append(textInput);
            if (i % columnSetUp == (columnSetUp - 1) || maxInputs - 1 == i) {
                row.append('<div class="grid-break mobile-col-1-1 col-1-1"></div>');
            } else {
                row.append('<div class="grid-break mobile-col-1-1"></div>');
            }
        }
        responses.append(row);
        section.append('<br>');
        section.append(responses);
        section.append('<br>');
        var submitBlock = submitGenerator();
        section.append(submitBlock);
        return section;
    }

    _self.separatorGenerator = function(questionData) {
        var section = sectionGenerator(questionData.id, questionData.type, questionData.data.background);
        var title = cheerio('<h1>' + questionData.data.title + '</h1>');
        var subTitle = cheerio('<h3>' + questionData.data.subtitle + '</h3>');
        section.append(title);
        section.append('<br>');
        section.append(subTitle);
        return section;
    }

    _self.resultsGenerator = function(questionData) {
        var section = sectionGenerator(questionData.id, questionData.type, questionData.data.background);
        var canvas = cheerio('<div id="' + questionData.id + '-chart" width="300" height="300"></div');
        section.append(canvas);
        section.append('<br>');
        return section;
    }

    _self.completeGenerator = function(examConfig) {
        var container = "";
        for (var i = 0; i < examConfig.length; i++) {
            switch (examConfig[i].type) {
                case "singleChoice":
                    container += _self.singleChoiceGenerator(examConfig[i]).toString();
                    break;
                case "multipleChoice":
                    container += _self.multipleChoiceGenerator(examConfig[i]).toString();
                    break;
                case "multipleText":
                    container += _self.multipleTextGenerator(examConfig[i]).toString();
                    break;
                case "rating":
                    container += _self.ratingGenerator(examConfig[i]).toString();
                    break;
                case "separator":
                    container += _self.separatorGenerator(examConfig[i]).toString();
                    break;
                case "results":
                    container += _self.resultsGenerator(examConfig[i]).toString();
                    break;
            }
        }
        return container;
    }
}