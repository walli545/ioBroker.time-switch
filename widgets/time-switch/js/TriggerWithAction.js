(async () => {
	class TriggerWithAction extends HTMLElement {
		shadowRoot;
		validationErrors = [];
		triedSaving = false;

		constructor() {
			super();
			this.createShadowRoot();
		}

		static get observedAttributes() {
			return ['trigger', 'action', 'edit'];
		}

		connectedCallback() {
			this.triedSaving = false;
			this.shadowRoot.querySelector('.button.delete').addEventListener('click', this.onDeleteClick.bind(this));
			this.shadowRoot.querySelector('.button.cancel').addEventListener('click', this.toggleEdit.bind(this));
			this.shadowRoot.querySelector('.button.edit').addEventListener('click', this.toggleEdit.bind(this));
			this.shadowRoot.querySelector('.button.save').addEventListener('click', this.onSaveClick.bind(this));
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
				this.shadowRoot.querySelector('.container.edit').style.display = null;
				this.shadowRoot.querySelector('.container.view').style.display = 'none';
			} else {
				this.shadowRoot.querySelector('.container.edit').style.display = 'none';
				this.shadowRoot.querySelector('.container.view').style.display = null;
			}
		}

		onDeleteClick() {
			this.shadowRoot.dispatchEvent(
				new CustomEvent('delete', {
					detail: { id: this.trigger.id },
					composed: true,
				}),
			);
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
			this.shadowRoot.querySelector('.validation-errors-container').style.display =
				errors.length === 0 ? 'none' : null;

			const validationErrorsList = this.shadowRoot.querySelector('#validation-errors');
			while (validationErrorsList.firstChild) {
				validationErrorsList.removeChild(validationErrorsList.firstChild);
			}
			this.validationErrors.forEach(e => {
				const li = document.createElement('li');
				li.textContent = e;
				validationErrorsList.appendChild(li);
			});
		}

		onSaveClick() {
			this.updateValidationErrors();
			if (this.validationErrors.length === 0) {
				const selectedWeekdays = JSON.parse(
					this.shadowRoot.querySelector('.edit app-weekdays').getAttribute('selected'),
				);
				const newTrigger = JSON.parse(this.getTriggerElement(true).getAttribute('data'));
				newTrigger.weekdays = selectedWeekdays;
				newTrigger.action = JSON.parse(this.getActionElement(true).getAttribute('data'));
				this.shadowRoot.dispatchEvent(
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
		}

		createShadowRoot() {
			const shadowRoot = this.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML = `
					<link rel="stylesheet" href="widgets/time-switch/css/TriggerWithAction.css"/>
					<div class="container view">
						<div class="header">
							<div class="action"></div>
							<div class="trigger"></div>
							<img class="button edit" src="widgets/time-switch/img/edit-24px.svg" width="28px" height="28px"/>
							<img class="button delete" src="widgets/time-switch/img/delete-24px.svg" width="28px" height="28px"/>
						</div>
						<app-weekdays edit="false"></app-weekdays>
					</div>
					<div class="container edit" style="display: none">
						<div class="header">
							<img class="button save" src="widgets/time-switch/img/save-24px.svg" width="28px" height="28px"/>
							<img class="button cancel" src="widgets/time-switch/img/cancel-24px.svg" width="28px" height="28px"/>
						</div>
						<div class="validation-errors-container" style="display: none;">
							<ul id="validation-errors"></ul>
						</div>
						<div>Switched value</div>
						<div class="action"></div>
						<div>Trigger</div>
						<div class="trigger"></div>
						<app-weekdays edit="true"></app-weekdays>
					</div>
				`;
			this.shadowRoot = shadowRoot;
		}

		getActionElement(edit) {
			const newAction = this.action;
			const elementName = this.getElementNameForActionType(newAction.type);
			return this.shadowRoot.querySelector(`.container.${edit ? 'edit' : 'view'} .action ${elementName}`);
		}

		getTriggerElement(edit) {
			const newTrigger = this.trigger;
			const elementName = this.getElementNameForTriggerType(newTrigger.type);
			return this.shadowRoot.querySelector(`.container.${edit ? 'edit' : 'view'} .trigger ${elementName}`);
		}

		getWeekdaysElement() {
			return this.shadowRoot.querySelector('.edit app-weekdays');
		}

		onTriggerChange() {
			const newTrigger = this.trigger;
			const elementName = this.getElementNameForTriggerType(newTrigger.type);
			let triggerView = this.shadowRoot.querySelector(`.container.view .trigger ${elementName}`);
			if (!triggerView) {
				triggerView = document.createElement(elementName);
				triggerView.setAttribute('edit', 'false');
				this.shadowRoot.querySelector('.container.view .trigger').appendChild(triggerView);
			}
			let triggerEdit = this.shadowRoot.querySelector(`.container.edit .trigger ${elementName}`);
			if (!triggerEdit) {
				triggerEdit = document.createElement(elementName);
				triggerEdit.setAttribute('edit', 'true');
				this.shadowRoot.querySelector('.container.edit .trigger').appendChild(triggerEdit);
			}
			triggerView.setAttribute('data', JSON.stringify(newTrigger));
			triggerEdit.setAttribute('data', JSON.stringify(newTrigger));
			this.shadowRoot.querySelectorAll('app-weekdays').forEach(w => {
				w.setAttribute('selected', JSON.stringify(newTrigger.weekdays));
			});
		}

		onActionChange() {
			const newAction = this.action;
			const elementName = this.getElementNameForActionType(newAction.type);
			let actionView = this.shadowRoot.querySelector(`.container.view .action ${elementName}`);
			if (!actionView) {
				actionView = document.createElement(elementName);
				actionView.setAttribute('edit', 'false');
				this.shadowRoot.querySelector('.container.view .action').appendChild(actionView);
			}
			let actionEdit = this.shadowRoot.querySelector(`.container.edit .action ${elementName}`);
			if (!actionEdit) {
				actionEdit = document.createElement(elementName);
				actionEdit.setAttribute('edit', 'true');
				this.shadowRoot.querySelector('.container.edit .action').appendChild(actionEdit);
			}
			actionView.setAttribute('data', JSON.stringify(newAction));
			actionEdit.setAttribute('data', JSON.stringify(newAction));
		}

		getElementNameForTriggerType(type) {
			if (type === 'TimeTrigger') {
				return 'app-time-trigger';
			} else {
				throw Error('No widget for trigger found');
			}
		}

		getElementNameForActionType(type) {
			if (type === 'OnOffStateAction') {
				return 'app-on-off-state-action';
			} else {
				throw Error('No widget for action found');
			}
		}
	}
	customElements.define('app-trigger-with-action', TriggerWithAction);
})();
