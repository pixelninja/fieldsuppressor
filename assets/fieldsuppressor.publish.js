/*--------------------------------
	Hides fields on edit pages
--------------------------------*/
jQuery(function($){
	var field = $('#contents').find('div.field:not(.field-publish_tabs)'),
		data = Symphony.Context.get('fieldsuppressor'),
		user = Symphony.Context.get('user_type');
	
	if(data != undefined) {
		field.each(function() {
			var self = $(this),
				id = self.attr('id').substr(6);

			if(data[id]['field_id'] == undefined) return;
			
			if(data[id]['suppress'] == 'yes') {
				self.addClass('hide-field suppressed');
			}
		});
		
		var hidden = $('#contents').find("div.suppressed");
		
		if(hidden.length != 0 && user == 'developer') {
			$('#context ul.actions')
				.append($('<li />')
						.attr('class', 'toggle-fields button')
						.text('Toggle hidden fields'));
				
			$('ul.actions').on('click', 'li.toggle-fields', function() {
				field.filter(".suppressed").toggleClass('hide-field');
			});
		}
	}
});