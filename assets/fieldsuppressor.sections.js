/*-----------------------------------------------------------------------------
	Language strings
-----------------------------------------------------------------------------*/
	Symphony.Language.add({
		' Hide this field from the backend edit page': false
	});

/*-----------------------------------------------------------------------------
	Section Editor
-----------------------------------------------------------------------------*/
	jQuery(document).ready(function() {
		var $duplicator = jQuery('#fields-duplicator');
		$fields = $duplicator.find('.instance');

		// Get JSON data for the fields
		data = Symphony.Context.get('fieldsuppressor');

		// Template to clone for each field instance
		field_template = jQuery('<label />')
			.text(Symphony.Language.get(' Hide this field from the backend edit page'))
			.prepend(
				jQuery('<input />')
				.attr({ type: 'checkbox', value: 'yes'})
			);

		// Inject the template into current $field
		addField = function($field, template) {
			$field.find('div.content > :last-child').after(template);
		};
		
		// Initially run over the all the existing fields
		$fields.each(function(i) {
			var $field = jQuery(this);
			var field_id = $field.find(':hidden[name*=id]').val();
			//var required = $field.find('input[name*=required]:not(:hidden)');
			var template = field_template.clone();
			
			if(data != undefined) {
				if(data[field_id]['suppress'] == 'yes') {
					template.find('input').attr('checked', 'checked');
				}
			}

			template.find('input').attr({name: 'fields[' + i + '][fieldsuppressor]'})
			
			//if(required.attr('checked') != true) {
				addField($field, template);
			//}

			// Check when the required status changes
			/*required.bind('click', function() {
				if(required.attr('checked') != true) {
					var template = field_template.clone();
	
					template.find('input').attr({name: 'fields[' + ($field.index() - 1) + '][fieldsuppressor]', value: 'yes'})
	
					addField($field, template);
				} else {
					$field.find('input[name*=fieldsuppressor]').parent().remove();
				}
			});*/
		});

		// Listen for when the duplicator changes
		$duplicator.bind('click.duplicator', function() {
			var $field = $duplicator.find('.instance:last');

			// If the field doesn't have a suppress field already, add one
			if($field.filter(':has(input[name*=fieldsuppressor])').length == 0) {
				var template = field_template.clone();

				template.find('input').attr({name: 'fields[' + ($field.index() - 1) + '][fieldsuppressor]', value: 'yes'})

				addField($field, template);
			}
		});
	});