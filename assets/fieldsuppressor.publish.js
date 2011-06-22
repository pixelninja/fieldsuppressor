/*--------------------------------
	Hides fields on edit pages
--------------------------------*/
jQuery(function($){
	var field = $('#contents').find('div.field:not(.field-publish_tabs)');
	var data = Symphony.Context.get('fieldsuppressor');
	var user = Symphony.Context.get('user_type');
	
	if(data != undefined) {
		field.each(function() {
			self = $(this);
			var id = self.attr('id').substr(6);

			if(data[id]['field_id'] == undefined) return;
			
			if(data[id]['suppress'] == 'yes') {
				self.addClass('hide-field suppressed');
			}
		});
		
		var hidden = $('#contents').find("div.suppressed");
		
		if(hidden.length != 0 && user == 'developer') {
			$('#contents h2')
				.append(
					$('<a />')
						.attr('class', 'toggle-fields')
						.text('Toggle hidden fields')
				);
				
			$('a.toggle-fields').live('click', function() {
				field.filter(".suppressed").toggleClass('hide-field');
			});
		}
	}
});