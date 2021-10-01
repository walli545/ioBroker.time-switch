(async () => {
	class TriggerWithAction extends HTMLElement {
		constructor() {
			super();
			this.sr = this.createShadowRoot();
			this.validationErrors = [];
			this.triedSaving = false;
			this.actionBeforeEdit = '';
			this.triggerBeforeEdit = '';
		}

		static get observedAttributes() {
			return ['trigger', 'action', 'edit'];
		}

		connectedCallback() {
			this.triedSaving = false;
			this.sr.querySelector('.button.delete').addEventListener('click', this.onDeleteClick.bind(this));
			this.sr.querySelector('.button.cancel').addEventListener('click', this.toggleEdit.bind(this));
			this.sr.querySelector('.button.edit').addEventListener('click', this.toggleEdit.bind(this));
			this.sr.querySelector('.button.save').addEventListener('click', this.onSaveClick.bind(this));
			this.sr.querySelector('.button.add').addEventListener('click', this.onAddConditionClick.bind(this));
		}

		attributeChangedCallback(attr, oldValue, newValue) {
			if (attr === 'action') {
				this.onActionChange();
			} else if (attr === 'trigger') {
				this.onTriggerChange();
			} else if (attr === 'edit') {
				this.onEditChange();
			}
		}

		get trigger() {
			return JSON.parse(this.getAttribute('trigger'));
		}

		get action() {
			return JSON.parse(this.getAttribute('action'));
		}

		get edit() {
			const attrValue = this.getAttribute('edit');
			return attrValue === 'true';
		}

		set edit(value) {
			this.setAttribute('edit', value ? 'true' : 'false');
		}

		onEditChange() {
			if (this.edit) {
				this.sr.querySelector('.container.edit').style.display = null;
				this.sr.querySelector('.container.view').style.display = 'none';
			} else {
				this.sr.querySelector('.container.edit').style.display = 'none';
				this.sr.querySelector('.container.view').style.display = null;
			}
		}

		onDeleteClick() {
			this.sr.dispatchEvent(
				new CustomEvent('delete', {
					detail: { id: this.trigger.id },
					composed: true,
				}),
			);
		}

		onDeleteConditionClick() {
			if (this.action.type === 'ConditionAction') {
				this.setAttribute('action', JSON.stringify(this.action.action));
			}
		}

		onAddConditionClick() {
			const conditionAction = vis.binds['time-switch'].addConditionToAction(
				this.action,
				this.getAttribute('widgetid'),
			);
			if (conditionAction) {
				this.setAttribute('action', JSON.stringify(conditionAction));
			}
		}

		updateValidationErrors() {
			const errorsWeekdays = JSON.parse(this.getWeekdaysElement().getAttribute('errors'));
			const errorsTimeTrigger = JSON.parse(this.getTriggerElement(true).getAttribute('errors'));
			const errorsAction = JSON.parse(this.getActionElement(true).getAttribute('errors'));
			let errors = [];
			if (errorsTimeTrigger) {
				errors = errors.concat(errorsTimeTrigger);
			}
			if (errorsWeekdays) {
				errors = errors.concat(errorsWeekdays);
			}
			if (errorsAction) {
				errors = errors.concat(errorsAction);
			}
			this.validationErrors = errors;
			this.sr.querySelector('.validation-errors-container').style.display = errors.length === 0 ? 'none' : null;

			const validationErrorsList = this.sr.querySelector('#validation-errors');
			while (validationErrorsList.firstChild) {
				validationErrorsList.removeChild(validationErrorsList.firstChild);
			}
			this.validationErrors.forEach((e) => {
				const li = document.createElement('li');
				li.textContent = e;
				validationErrorsList.appendChild(li);
			});
		}

		onSaveClick() {
			this.updateValidationErrors();
			if (this.validationErrors.length === 0) {
				const selectedWeekdays = JSON.parse(
					this.sr.querySelector('.edit app-weekdays').getAttribute('selected'),
				);
				const newTrigger = JSON.parse(this.getTriggerElement(true).getAttribute('data'));
				newTrigger.weekdays = selectedWeekdays;
				newTrigger.action = JSON.parse(this.getActionElement(true).getAttribute('data'));
				this.sr.dispatchEvent(
					new CustomEvent('update', {
						detail: {
							trigger: newTrigger,
						},
						composed: true,
					}),
				);
			} else {
				if (!this.triedSaving) {
					this.getTriggerElement(true).addEventListener('errors', this.updateValidationErrors.bind(this));
					this.getActionElement(true).addEventListener('errors', this.updateValidationErrors.bind(this));
					this.getWeekdaysElement().addEventListener('errors', this.updateValidationErrors.bind(this));
				}
			}
			this.triedSaving = true;
		}

		toggleEdit() {
			this.edit = !this.edit;
			if (this.edit) {
				this.triggerBeforeEdit = JSON.stringify(this.trigger);
				this.actionBeforeEdit = JSON.stringify(this.action);
			} else {
				this.setAttribute('action', this.actionBeforeEdit);
				this.setAttribute('trigger', this.triggerBeforeEdit);
			}
		}

		createShadowRoot() {
			const shadowRoot = this.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML = `
					<link rel="stylesheet" href="widgets/time-switch/css/TriggerWithAction.css"/>
					<div class="container view">
						<div class="header">
							<div class="action"></div>
							<div class="trigger"></div>
							<img class="button edit" src="widgets/time-switch/img/edit-24px.svg" width="28px"
								height="28px" title="${vis.binds['time-switch'].translate('editTrigger')}"/>
							<img class="button delete" src="widgets/time-switch/img/delete-24px.svg" width="28px"
								height="28px" title="${vis.binds['time-switch'].translate('removeTrigger')}"/>
						</div>
						<app-weekdays edit="false"></app-weekdays>
					</div>
					<div class="container edit" style="display: none">
						<div class="header">
							<img class="button save" src="widgets/time-switch/img/save-24px.svg" width="28px"
								height="28px" title="${vis.binds['time-switch'].translate('saveChanges')}"/>
							<img class="button cancel" src="widgets/time-switch/img/cancel-24px.svg" width="28px"
								height="28px" title="${vis.binds['time-switch'].translate('cancelEdit')}"/>
						</div>
						<div class="validation-errors-container" style="display: none;">
							<ul id="validation-errors"></ul>
						</div>
						<div>${vis.binds['time-switch'].translate('switchedValue')}</div>
						<div class="action"></div>
						<div class="condition">
							<div>${vis.binds['time-switch'].translate('condition')}</div>
						 	<img class="button add" src="widgets/time-switch/img/add-24px.svg" width="28px"
								height="28px" title="${vis.binds['time-switch'].translate('addCondition')}"/>
						</div>
						<div>${vis.binds['time-switch'].translate('trigger')}</div>
						<div class="trigger"></div>
						<app-weekdays edit="true"></app-weekdays>
					</div>
				`;
			return shadowRoot;
		}

		getActionElement(edit) {
			const newAction = this.action;
			const elementName = vis.binds['time-switch'].getElementNameForActionType(newAction.type);
			return this.sr.querySelector(`.container.${edit ? 'edit' : 'view'} .action ${elementName}`);
		}

		getTriggerElement(edit) {
			const newTrigger = this.trigger;
			const elementName = vis.binds['time-switch'].getElementNameForTriggerType(newTrigger.type);
			return this.sr.querySelector(`.container.${edit ? 'edit' : 'view'} .trigger ${elementName}`);
		}

		getWeekdaysElement() {
			return this.sr.querySelector('.edit app-weekdays');
		}

		onTriggerChange() {
			const newTrigger = this.trigger;
			const elementName = vis.binds['time-switch'].getElementNameForTriggerType(newTrigger.type);
			let triggerView = this.sr.querySelector(`.container.view .trigger ${elementName}`);
			if (!triggerView) {
				triggerView = document.createElement(elementName);
				triggerView.setAttribute('widgetid', this.getAttribute('widgetid'));
				triggerView.setAttribute('edit', 'false');
				this.sr.querySelector('.container.view .trigger').appendChild(triggerView);
			}
			let triggerEdit = this.sr.querySelector(`.container.edit .trigger ${elementName}`);
			if (!triggerEdit) {
				triggerEdit = document.createElement(elementName);
				triggerEdit.setAttribute('widgetid', this.getAttribute('widgetid'));
				triggerEdit.setAttribute('edit', 'true');
				this.sr.querySelector('.container.edit .trigger').appendChild(triggerEdit);
			}
			triggerView.setAttribute('data', JSON.stringify(newTrigger));
			triggerEdit.setAttribute('data', JSON.stringify(newTrigger));
			this.sr.querySelectorAll('app-weekdays').forEach((w) => {
				w.setAttribute('selected', JSON.stringify(newTrigger.weekdays));
			});
		}

		onActionChange() {
			const newAction = this.action;
			const elementName = vis.binds['time-switch'].getElementNameForActionType(newAction.type);
			const viewAction = this.sr.querySelector('.container.view .action');
			if (viewAction.firstChild) {
				viewAction.removeChild(viewAction.firstChild);
			}
			const actionView = document.createElement(elementName);
			actionView.setAttribute('widgetid', this.getAttribute('widgetid'));
			actionView.setAttribute('edit', 'false');
			viewAction.appendChild(actionView);
			const editAction = this.sr.querySelector('.container.edit .action');
			if (editAction.firstChild) {
				editAction.removeChild(editAction.firstChild);
			}
			const actionEdit = document.createElement(elementName);
			actionEdit.setAttribute('widgetid', this.getAttribute('widgetid'));
			actionEdit.setAttribute('edit', 'true');
			actionEdit.addEventListener('delete-condition', this.onDeleteConditionClick.bind(this));
			editAction.appendChild(actionEdit);
			actionView.setAttribute('data', JSON.stringify(newAction));
			actionEdit.setAttribute('data', JSON.stringify(newAction));
			this.sr.querySelector('.condition').style.display = newAction.type === 'ConditionAction' ? 'none' : null;
		}
	}
	customElements.define('app-trigger-with-action', TriggerWithAction);
})();
