/*--------------------------------
	Hides fields on edit pages
--------------------------------*/
jQuery(document).ready(function() {
	var field = jQuery('#contents').find('div.field');
	var data = Symphony.Context.get('fieldsuppressor');
	
	if(data != undefined) {
		field.each(function() {
			self = jQuery(this);
			var id = self.attr('id').substr(6);
			
			if(data[id]['field_id'] == undefined) return;
			
			if(data[id]['suppress'] == 'yes') {
				self.hide();
			}
		});
	}
});