<?php

	Class Extension_FieldSuppressor extends Extension {

		public function about() {
			return array(
				'name' => 'Field Suppressor',
				'version' => '0.1a',
				'release-date' => '2011-06-02',
				'author' => array(
			 		'name' => 'Phill Gray',
					'email' => 'phill@randb.com.au'
				),
				'description' => 'Hide or show fields on the edit pages.'
			);
		}

		public function getSubscribedDelegates() {
			return array(
				array(
					'page' => '/backend/',
					'delegate' => 'AdminPagePreGenerate',
					'callback' => '__appendAssets'
				),
				array(
					'page' => '/blueprints/sections/',
					'delegate' => 'FieldPostCreate',
					'callback' => '__saveSuppressToField'
				),
				array(
					'page' => '/blueprints/sections/',
					'delegate' => 'FieldPostEdit',
					'callback' => '__saveSuppressToField'
				),
				array(
					'page' => '/blueprints/sections/',
					'delegate' => 'SectionPostEdit',
					'callback' => '__cleanUp'
				)
			);
		}

		public function install(){
			return Symphony::Database()->query('
				CREATE TABLE IF NOT EXISTS tbl_fieldsuppressor (
					`field_id` INT(4) UNSIGNED DEFAULT NULL,
					`section_id` INT(4) UNSIGNED DEFAULT NULL,
					`suppress` ENUM("yes","no") DEFAULT NULL,
					PRIMARY KEY (`field_id`),
					UNIQUE KEY field_id_section_id (`field_id`, `section_id`)
				) ENGINE=MyISAM
			');
		}

		public function uninstall() {
			Symphony::Database()->query('DROP TABLE IF EXISTS tbl_fieldsuppressor');
		}

	/*-------------------------------------------------------------------------
		Utilities:
	-------------------------------------------------------------------------*/
		private function addContextToPage(Array $data = array()) {
			if(!empty($data)) {
				// Get current value and inject into Symphony Context
				Administration::instance()->Page->addElementToHead(
					new XMLElement(
						'script',
						"Symphony.Context.add('fieldsuppressor', " . json_encode($data) . ");",
						array('type' => 'text/javascript')
					), 10000
				);
			}
		}
		
		public function getSuppressedFieldsForSection($section_id = null) {
			if(!is_null($section_id) && !is_numeric($section_id)) {
				$section_id = Symphony::Database()->fetchVar('id', 0, "SELECT `id` FROM `tbl_sections` WHERE `handle` = '$section_id' LIMIT 1");
			}

			if(is_null($section_id)) return array();

			return Symphony::Database()->fetch("
				SELECT field_id, suppress
				FROM tbl_fieldsuppressor
				WHERE section_id = " . $section_id,
				'field_id'
			);
		}

	/*-------------------------------------------------------------------------
		Delegate Callbacks
	-------------------------------------------------------------------------*/
		public function __appendAssets(&$context) {
			if(class_exists('Administration')
				&& Administration::instance() instanceof Administration
				&& Administration::instance()->Page instanceof HTMLPage
			) {
				$callback = Administration::instance()->getPageCallback();

				// Section Editor
				if($context['oPage'] instanceof contentBlueprintsSections) {
					$data = $this->getSuppressedFieldsForSection($callback['context'][1]);
					$this->addContextToPage($data);
					
					Administration::instance()->Page->addScriptToHead(URL . '/extensions/fieldsuppressor/assets/fieldsuppressor.sections.js', 10001, false);
				}

				// Publish Page
				else if($context['oPage'] instanceof contentPublish) {
					$data = $this->getSuppressedFieldsForSection($callback['context']['section_handle']);
					$this->addContextToPage($data);

					Administration::instance()->Page->addScriptToHead(URL . '/extensions/fieldsuppressor/assets/fieldsuppressor.publish.js', 10001, false);
				}
			}
		}

		public function __saveSuppressToField(&$context) {
			$field = $context['field'];
			
			$data = array(
				'field_id' => $field->get('id'),
				'section_id' => $field->get('parent_section'),
				'suppress' => $field->get('fieldsuppressor')
			);
			
			// Save suppressor against this field
			return Symphony::Database()->insert($data, 'tbl_fieldsuppressor', true);
		}

		public function __cleanUp(&$context) {
			$section_id = $context['section_id'];

			$section_field_ids = Symphony::Database()->fetchCol("id", "SELECT id FROM tbl_fields WHERE parent_section = " . $section_id);
			$suppress_field_ids = Symphony::Database()->fetchCol("field_id", "SELECT field_id FROM tbl_fieldsuppressor WHERE section_id = " . $section_id);

			// If we have any Field ID's that tbl_fields doesn't have
			// remove them, as they have been deleted from the section
			$field_ids = array_diff($suppress_field_ids, $section_field_ids);

			if(!empty($field_ids)) {
				Symphony::Database()->delete('`tbl_fieldsuppressor`', 'field_id IN (' . implode(',', $field_ids) . ');');
			}
		}

	}