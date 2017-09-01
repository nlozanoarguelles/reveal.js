// This generator is based in the jQuery, Rating (http://jsfiddle.net/Phoennix/6Sybq/4/) Frameworks
const cheerio = require('cheerio');
module.exports = function() {
    var _self = this;
    var sectionGenerator = function(questionId, questionType) {
        var mainSection = cheerio('<section id="' + questionId + '" data-type="' + questionType + '"></section>');
        return mainSection;
    };

    var headerGenerator = function() {
        var header = cheerio('<div class="dsd-header"><img src="./res/header_logo.png"></div>');
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
        var column = cheerio('<div class="col-' + columnSize + '-12 mobile-col-1-1 response"></div>');
        return column;
    }

    var starsInputGenerator = function(starsNumber) {
        var starsBlock = cheerio('<div style="font-size:9em;"> <input type="number" class="rating" id="rating" name="test" data-min="1" data-max="' + starsNumber + '" value="0"> </div>');
        return starsBlock;
    }

    var submitGenerator = function() {
        var submitBlock = cheerio('<div class="response submit" style="text-align:center;"> <a href="#" class="response-btn submit"> Enviar </a> </div>');
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
        section.append('<br>');
        section.append(mainQuestion);
        var responses = responsesGenerator();
        // Three columns set-up or two columns set-up
        var columnSetUp = questionData.data.responses.length > 6 ? 3 : 2;
        var mdValue = 12 / columnSetUp;
        var row = rowGenerator();
        for (var i = 0; i < questionData.data.responses.length; i++) {
            var column = columnGenerator(mdValue);
            var buttonContent = cheerio('<a href="#" class="response-btn">' + questionData.data.responses[i].text + '</a>');
            column.append(buttonContent);
            row.append(column);
            if (i % columnSetUp == (columnSetUp - 1) || questionData.data.responses.length - 1 == i) {
                responses.append(row);
                responses.append('<br>');
                var row = rowGenerator();
            }
        }
        section.append('<br>');
        section.append(responses);
        return section;
    }



    _self.ratingGenerator = function(questionData) {
        var section = sectionGenerator(questionData.id, questionData.type);
        var header = headerGenerator();
        section.append(header);
        var mainQuestion = mainQuestionGenerator(questionData.data.mainQuestion);
        section.append('<br>');
        section.append(mainQuestion);
        var responses = responsesGenerator();
        var starsInput = starsInputGenerator(questionData.data.responses.length);
        responses.append(starsInput);
        section.append('<br>');
        section.append(responses);
        var submitBlock = submitGenerator();
        section.append(submitBlock);
        return section;
    }

    _self.multipleTextGenerator = function(questionData) {
        var section = sectionGenerator(questionData.id, questionData.type);
        var header = headerGenerator();
        section.append(header);
        var mainQuestion = mainQuestionGenerator(questionData.data.mainQuestion);
        section.append('<br>');
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
                responses.append(row);
                responses.append('<br>');
                var row = rowGenerator();
            }
        }
        section.append('<br>');
        section.append(responses);
        section.append('<br>');
        var submitBlock = submitGenerator();
        section.append(submitBlock);
        return section;
    }

    _self.completeGenerator =  function(examConfig){
        var container = "";
        for(var i = 0; i < examConfig.length; i++){
            switch(examConfig[i].type){
                case "singleChoice":
                    container += _self.singleChoiceGenerator(examConfig[i]).toString();
                    break;
                case "multipleText":
                    container += _self.multipleTextGenerator(examConfig[i]).toString();
                    break;
                case "rating":
                    container += _self.ratingGenerator(examConfig[i]).toString();
                    break;
            }
        }
        return container;
    }
}