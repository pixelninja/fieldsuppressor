/*--------------------------------
	Hides fields on edit pages
--------------------------------*/
jQuery(document).ready(function() {
	var field = jQuery('#contents').find('div.field:not(.field-publish_tabs');
	var data = Symphony.Context.get('fieldsuppressor');
	var user = Symphony.Context.get('user_type');
	
	if(data != undefined) {
		if(user == 'developer') {
			jQuery('#contents h2')
				.append(
					jQuery('<a />')
						.attr('class', 'toggle-fields')
						.text('Toggle hidden fields')
				);
				
			jQuery('a.toggle-fields').live('click', function() {
				field.filter(".suppressed").toggleClass('hide-field');
			});
		}
		
		field.each(function() {
			self = jQuery(this);
			var id = self.attr('id').substr(6);

			if(data[id]['field_id'] == undefined) return;
			
			if(data[id]['suppress'] == 'yes') {
				self.addClass('hide-field suppressed');
			}
		});
	}
});