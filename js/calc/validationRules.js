$(document).ready(function(){

  (function(){
    $('#calcFormInner input').on('keyup blur', function () {
      if ($('#calcFormInner').valid()) {
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
  	var calcFormInner = $('#calcFormInner');
  	calcFormInner.validate({
  		rules: {
  			"billetDiameterInitial": {
  				required: true,
  				range: function(elem){
  					if($('.millSelect').val() == 'mill_8_15'){
  						return [9, 17]
  					}
            if($('.millSelect').val() == 'mill_15_30'){
              return [16, 33]
            }
            if($('.millSelect').val() == 'mill_30_60'){
              return [31.5, 65]
            }
            if($('.millSelect').val() == 'mill_60_120'){
              return [62, 168]
            }
  				}
  			},
  			"billetDiameterFinal": {
  				required: true,
  				range: function(elem){
  					if($('.millSelect').val() == 'mill_8_15'){
  						return [8, 15]
  					}
            if($('.millSelect').val() == 'mill_15_30'){
              return [15, 30]
            }
            if($('.millSelect').val() == 'mill_30_60'){
              return [30, 60]
            }
            if($('.millSelect').val() == 'mill_60_120'){
              return [60, 120]
            }
  				}
  			},
  			"billetWallThicknessInitial": {
  				required: true,
  				range: function(elem){
  					if($('.millSelect').val() == 'mill_8_15'){
  						return [0.08, 1.5]
  					}
            if($('.millSelect').val() == 'mill_15_30'){
              return [0.15, 1.5]
            }
            if($('.millSelect').val() == 'mill_30_60'){
              return [0.3, 4]
            }
            if($('.millSelect').val() == 'mill_60_120'){
              return [0.6, 6]
            }
  				}
  			},
  			"billetWallThicknessFinal": {
  				required: true,
  				range: function(elem){
  					if($('.millSelect').val() == 'mill_8_15'){
  						return [0.08, 1.5]
  					}
            if($('.millSelect').val() == 'mill_15_30'){
              return [0.15, 1.5]
            }
            if($('.millSelect').val() == 'mill_30_60'){
              return [0.3, 4]
            }
            if($('.millSelect').val() == 'mill_60_120'){
              return [0.6, 6]
            }
  				}
  			},
  			"billetLengthInitial": {
  				required: true,
          range: function(elem){
            if($('.millSelect').val() == 'mill_8_15'){
              return [1, 4]
            }
            if($('.millSelect').val() == 'mill_15_30'){
              return [2.5, 5]
            }
            if($('.millSelect').val() == 'mill_30_60'){
              return [2.5, 5]
            }
            if($('.millSelect').val() == 'mill_60_120'){
              return [2.5, 5]
            }
          }
  			},
  			pauseTime: {
  				required: true
  			}
  		}
  	})
  }());
});