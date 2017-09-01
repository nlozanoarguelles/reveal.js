module.exports = function(examConfig) {
    var _self = this;
    _self.examConfig = examConfig;

    /**
     * Functions for comparing strings
     */

    function similarity(s1, s2) {
        var longer = s1;
        var shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        var longerLength = longer.length;
        if (longerLength == 0) {
            return 1.0;
        }
        return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    }

    function editDistance(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        var costs = new Array();
        for (var i = 0; i <= s1.length; i++) {
            var lastValue = i;
            for (var j = 0; j <= s2.length; j++) {
                if (i == 0)
                    costs[j] = j;
                else {
                    if (j > 0) {
                        var newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue),
                                costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0)
                costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    _self.getQuestionValue = function(responseData) {
        var currentQuestion = examConfig.filter(function(obj) { return obj.id === responseData.id; })[0];
        if (currentQuestion) {
            console.log(responseData);
            switch (responseData.type) {
                case "singleChoice":
                case "rating":
                    var responseChoice = currentQuestion.data.responses.filter(function(obj) { return obj.text === responseData.responseChoice; })[0];
                    return responseChoice.value || 0;
                    break;
                case "multipleText":
                    var value = 0;
                    for (var i = 0; i < currentQuestion.data.responses.length; i++) {
                        var optionToEvaluate = responseData.responses.filter(function(obj) { return obj.text === currentQuestion.data.responses[i].text; })[0];
                        if (optionToEvaluate) {
                            console.log('EVALUANDO.....');
                            console.log(optionToEvaluate);
                            console.log('SIMILARIDAD:' + similarity(optionToEvaluate.responseText, currentQuestion.data.responses[i].responseText));
                            console.log('FIN EVALUANDO.....')
                            if (optionToEvaluate && similarity(optionToEvaluate.responseText, currentQuestion.data.responses[i].responseText) > 0.85) {
                                value += currentQuestion.data.responses[i].value;
                            }
                        }

                    }
                    return value;
                    break;
            }
        }
        return 0;
    };
}