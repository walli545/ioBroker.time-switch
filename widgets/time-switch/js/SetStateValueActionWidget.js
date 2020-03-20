(async () => {
	class SetStateValueActionWidget extends HTMLElement {
		shadowRoot;
		validationErrors = [];
		triedSaving = false;

		constructor() {
			super();
			this.createShadowRoot();
		}

		static get observedAttributes() {
			return ['trigger', 'value-to-set', 'edit'];
		}

		connectedCallback() {
			this.triedSaving = false;
			this.shadowRoot.querySelector('.button.delete').addEventListener('click', this.onDeleteClick.bind(this));
			this.shadowRoot.querySelector('.button.cancel').addEventListener('click', this.toggleEdit.bind(this));
			this.shadowRoot.querySelector('.button.edit').addEventListener('click', this.toggleEdit.bind(this));
			this.shadowRoot.querySelector('.button.save').addEventListener('click', this.onSaveClick.bind(this));
		}

		attributeChangedCallback(attr, oldValue, newValue) {
			if (attr === 'value-to-set') {
				this.onValueToSetChange(newValue);
			} else if (attr === 'trigger') {
				this.onTriggerChange(JSON.parse(newValue));
			} else if (attr === 'edit') {
				this.onEditChange();
			}
		}

		get id() {
			return this.getAttribute('id');
		}

		get trigger() {
			return this.getAttribute('trigger');
		}

		get valueToSet() {
			return this.getAttribute('value-to-set');
		}

		get edit() {
			const attrValue = this.getAttribute('edit');
			return attrValue === 'true';
		}

		set edit(value) {
			this.setAttribute('edit', value ? 'true' : 'false');
		}

		onValueToSetChange(newValueToSet) {
			const text = newValueToSet === 'true' ? 'ON' : 'OFF';
			this.shadowRoot.querySelector('.value-to-set').textContent = text;
			this.shadowRoot.querySelector(`#radio-${newValueToSet === 'true' ? 'on' : 'off'}`).checked = true;
		}

		onTriggerChange(newTrigger) {
			if (newTrigger.type === 'time') {
				this.shadowRoot.querySelectorAll('app-time-trigger').forEach(t => {
					t.setAttribute('hour', newTrigger.hour);
					t.setAttribute('minute', newTrigger.minute);
				});
				this.shadowRoot.querySelectorAll('app-weekdays').forEach(w => {
					w.setAttribute('selected', JSON.stringify(newTrigger.weekdays));
				});
			} else {
				throw new Error('Trigger type not supported!');
			}
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
					detail: this.id,
					composed: true,
				}),
			);
		}

		updateValidationErrors() {
			const timeTriggerWidget = this.shadowRoot.querySelector('.edit div app-time-trigger');
			const weekdaysWidget = this.shadowRoot.querySelector('.edit app-weekdays');
			const errorsTimeTrigger = JSON.parse(timeTriggerWidget.getAttribute('errors'));
			const errorsWeekdays = JSON.parse(weekdaysWidget.getAttribute('errors'));
			let errors = [];
			if (errorsTimeTrigger) {
				errors = errors.concat(errorsTimeTrigger);
			}
			if (errorsWeekdays) {
				errors = errors.concat(errorsWeekdays);
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
				const timeTriggerWidget = this.shadowRoot.querySelector('.edit div app-time-trigger');
				const valueToSet = this.shadowRoot.querySelector('#radio-on').checked;
				this.shadowRoot.dispatchEvent(
					new CustomEvent('update', {
						detail: {
							valueToSet: valueToSet,
							weekdays: selectedWeekdays,
							hour: timeTriggerWidget.getAttribute('hour'),
							minute: timeTriggerWidget.getAttribute('minute'),
						},
						composed: true,
					}),
				);
			} else {
				if (!this.triedSaving) {
					console.log('subscribing to errors');
					this.shadowRoot.querySelector('.edit div app-time-trigger').addEventListener('errors', () => {
						this.updateValidationErrors();
					});
					this.shadowRoot.querySelector('.edit app-weekdays').addEventListener('errors', () => {
						this.updateValidationErrors();
					});
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
				<link rel="stylesheet" href="widgets/time-switch/css/SetStateValueActionWidget.css"/>
				<link rel="stylesheet" href="widgets/time-switch/css/material-radio-button.css" />
				<div class="container view">
					<div class="header">
						<div class="value-to-set"></div>
						<app-time-trigger edit="false"></app-time-trigger>
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
						<div id="container-switched-value">
							<div class="md-radio md-radio-inline">
							  <input id="radio-on" type="radio" name="switched-value-group">
								<label for="radio-on">On</label>
							</div>
							<div class="md-radio md-radio-inline">
							  <input id="radio-off" type="radio" name="switched-value-group">
							  <label for="radio-off">Off</label>
							</div>
						</div>
					<div>Trigger time</div>
						<div id="container-switched-time">
							<app-time-trigger edit="true"></app-time-trigger>
						</div>
					<app-weekdays edit="true"></app-weekdays>
				</div>
			`;
			this.shadowRoot = shadowRoot;
		}
	}

	customElements.define('app-set-state-value-action', SetStateValueActionWidget);
})();
