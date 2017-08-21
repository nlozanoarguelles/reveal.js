// This generator is based in the Bootstrap, jQuery, Rating (http://jsfiddle.net/Phoennix/6Sybq/4/) Frameworks
const cheerio = require('cheerio');

var sectionGenerator = function(questionData) {
    var mainSection = cheerio('<section id="'+questionData.id+'" data-type="'+questionData.type+'"></section>');
    return mainSection;
};

var mainQuestionGenerator = function(questionData) {
    var mainQuestion = cheerio('<div class="main-question" style="text-align:center;"></div>');
    var questionText = cheerio('<h1>'+ questionData.data.mainQuestion +'</h1>');
    mainQuestion.append(questionText);
    return mainQuestion;
};

var responsesGenerator = function() {
    var responses = cheerio('<div class="responses" style="text-align:center;"/>');    
    return responses;
};

var rowGenerator = function(){
	var row = cheerio('<div class="row"></div>');
    return row;
}

var columnGenerator = function(columnSize){
	var column = cheerio('<div class="col-'+ columnSize+'-12"></div>');
    return column;
}

var singleChoiceGenerator = function(questionData){
	var section = sectionGenerator(questionData);
	var mainQuestion = mainQuestionGenerator(questionData);
	section.append('<br>');
	section.append(mainQuestion);
	var responses = responsesGenerator();
	// Three columns set-up or two columns set-up
	var columnSetUp = questionData.data.responses.length > 6 ? 3 : 2;
	var mdValue = 12 / columnSetUp;
	var row = rowGenerator();
	for(var i = 0;i < questionData.data.responses.length; i++){
		var column = columnGenerator(mdValue);
		var buttonContent = cheerio('<button class="btn btn-large btn-primary" style="font-size:0.5em;">' + questionData.data.responses[i].text+ '</button>');
	    column.append(buttonContent);
	    row.append(column);
		if(i%columnSetUp == (columnSetUp - 1) || questionData.data.responses.length-1 == i){
			responses.append(row);
			responses.append('<br>');
			var row = rowGenerator();
		}
	}
	section.append('<br>');
	section.append(responses);
	return section;
}


/*
<section> 
  <div class="container">
  	<div class="main-question" style="text-align:center;">
      <h2>Mi super pregunta que todo el mundo va a contestar!!!</h2>
    </div>
    <br>
    <div class="responses" style="text-align:center;">
      <div class="row" >
      	<div class="col-md-6">
        	<button class="btn btn-large">Mi opcion 1</button>
        </div>
        <div class="col-md-6">
        	<button class="btn btn-large">Mi opcion 2</button>
        </div>
   	  </div>
      <br>
      <div class="row" >
      	<div class="col-md-6">
        	<button class="btn btn-large">Mi opcion 1</button>
        </div>
        <div class="col-md-6">
        	<button class="btn btn-large">Mi opcion 2</button>
        </div>
   	  </div>
    </div>
    
  
  </div>
</section>
*/

/*
<section> 
  <div class="container">
  	<div class="main-question" style="text-align:center;">
      <h2>Mi super pregunta que todo el mundo va a contestar!!!</h2>
    </div>
    <br>
    <div class="responses" style="text-align:center;">
      <div style="font-size:9em;">
		<input type="number" class="rating" id="rating" name="test" data-min="1" data-max="5" value="0">
	  </div>
    </div>
    <br>
    <div class="submit" style="text-align:center;">
      <button class="btn-block btn-success"> Enviar </button>
    </div>
  </div>
</section>
*/

/*
<section> 
  <div class="container">
  	<div class="main-question" style="text-align:center;">
      <h2>Mi super pregunta que todo el mundo va a contestar!!!</h2>
    </div>
    <br>
    <div class="responses" style="text-align:center;">
      <div class="row" >
      	<div class="col-md-6">
        	<div class="input-group">
			  <span class="input-group-addon" id="basic-addon1">DMP</span>
			  <input type="text" class="form-control" placeholder="Text" aria-describedby="basic-addon1">
		  </div>
        </div>
        <div class="col-md-6">
        	<div class="input-group">
			  <span class="input-group-addon" id="basic-addon2">CDP</span>
			  <input type="text" class="form-control" placeholder="Text" aria-describedby="basic-addon2">
		  </div>
        </div>
   	  </div>
    </div>
    <br>
    <div class="submit" style="text-align:center;">
      <button class="btn-block btn-success"> Enviar </button>
    </div>
  </div>
</section>
*/


(function($) {

    $.fn.rating = function() {

        var element;

        // A private function to highlight a star corresponding to a given value
        function _paintValue(ratingInput, value) {
            var selectedStar = $(ratingInput).find('[data-value=' + value + ']');
            selectedStar.removeClass('glyphicon-star-empty').addClass('glyphicon-star');
            selectedStar.prevAll('[data-value]').removeClass('glyphicon-star-empty').addClass('glyphicon-star');
            selectedStar.nextAll('[data-value]').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
        }

        // A private function to remove the selected rating
        function _clearValue(ratingInput) {
            var self = $(ratingInput);
            self.find('[data-value]').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
            self.find('.rating-clear').hide();
            self.find('input').val('').trigger('change');
        }

        // Iterate and transform all selected inputs
        for (element = this.length - 1; element >= 0; element--) {

            var el, i, ratingInputs,
                originalInput = $(this[element]),
                max = originalInput.data('max') || 5,
                min = originalInput.data('min') || 0,
                clearable = originalInput.data('clearable') || null,
                stars = '';

            // HTML element construction
            for (i = min; i <= max; i++) {
                // Create <max> empty stars
                stars += ['<span class="glyphicon glyphicon-star-empty" data-value="', i, '"></span>'].join('');
            }
            // Add a clear link if clearable option is set
            if (clearable) {
                stars += [
                    ' <a class="rating-clear" style="display:none;" href="javascript:void">',
                    '<span class="glyphicon glyphicon-remove"></span> ',
                    clearable,
                    '</a>'
                ].join('');
            }

            el = [
                // Rating widget is wrapped inside a div
                '<div class="rating-input">',
                stars,
                // Value will be hold in a hidden input with same name and id than original input so the form will still work
                '<input type="hidden" name="',
                originalInput.attr('name'),
                '" value="',
                originalInput.val(),
                '" id="',
                originalInput.attr('id'),
                '" />',
                '</div>'
            ].join('');

            // Replace original inputs HTML with the new one
            originalInput.replaceWith(el);

        }

        // Give live to the newly generated widgets
        $('.rating-input')
            // Highlight stars on hovering
            .on('mouseenter', '[data-value]', function() {
                var self = $(this);
                _paintValue(self.closest('.rating-input'), self.data('value'));
            })
            // View current value while mouse is out
            .on('mouseleave', '[data-value]', function() {
                var self = $(this);
                var val = self.siblings('input').val();
                if (val) {
                    _paintValue(self.closest('.rating-input'), val);
                } else {
                    _clearValue(self.closest('.rating-input'));
                }
            })
            // Set the selected value to the hidden field
            .on('click', '[data-value]', function(e) {
                var self = $(this);
                var val = self.data('value');
                self.siblings('input').val(val).trigger('change');
                self.siblings('.rating-clear').show();
                e.preventDefault();
                false
            })
            // Remove value on clear
            .on('click', '.rating-clear', function(e) {
                _clearValue($(this).closest('.rating-input'));
                e.preventDefault();
                false
            })
            // Initialize view with default value
            .each(function() {
                var val = $(this).find('input').val();
                if (val) {
                    _paintValue(this, val);
                    $(this).find('.rating-clear').show();
                }
            });

    };

    // Auto apply conversion of number fields with class 'rating' into rating-fields
    $(function() {
        if ($('input.rating[type=number]').length > 0) {
            $('input.rating[type=number]').rating();
        }
    });

}(jQuery));