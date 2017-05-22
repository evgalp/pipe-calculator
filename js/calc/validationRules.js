$(document).ready(function(){

  (function(){
    $('#calcForm input').on('keyup blur', function () {
      if ($('#calcForm').valid()) {
          $('button.calc-btn').prop('disabled', false);
      } else {
          $('button.calc-btn').prop('disabled', 'disabled');
      }
    });
  })()

	$.validator.setDefaults({
    errorClass: 'help-block',
    highlight: function(element) {
      $(element)
        .closest('input')
        .addClass('uk-form-danger');
    },
    unhighlight: function(element) {
      $(element)
        .closest('input')
        .removeClass('uk-form-danger');
    },
    errorPlacement: function (error, element) {
      if (element.prop('type') === 'checkbox') {
        error.insertAfter(element.parent());
      } else {
        error.insertAfter(element);
      }
    }
  });

  (function millBasedValidation(){
  	var calcForm = $('#calcForm');
  	calcForm.validate({
  		rules: {
  			"billetDiameterInitial": {
  				required: true,
  				range: function(elem){
  					if($('.millSelect').val() == 'mill_8_15'){
  						return [9, 17]
  					}
  				}
  			},
  			"billetDiameterFinal": {
  				required: true,
  				range: function(elem){
  					if($('.millSelect').val() == 'mill_8_15'){
  						return [8, 15]
  					}
  				}
  			},
  			"billetWallThicknessInitial": {
  				required: true,
  				range: function(elem){
  					if($('.millSelect').val() == 'mill_8_15'){
  						return [0.08, 1.5]
  					}
  				}
  			},
  			"billetWallThicknessFinal": {
  				required: true,
  				range: function(elem){
  					if($('.millSelect').val() == 'mill_8_15'){
  						return [0.08, 1.5]
  					}
  				}
  			},
  			"billetLengthInitial": {
  				required: true
  			},
  			pauseTime: {
  				required: true
  			}
  		}
  	})
  }());

});