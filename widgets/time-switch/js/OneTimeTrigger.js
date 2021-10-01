(async () => {
	class OneTimeTrigger extends HTMLElement {
		constructor() {
			super();
			this.sr = this.createShadowRoot();
			this.errors = [];
			this.triggerErrors = [];
			this.triedSaving = false;
			this.milliseconds = -1;
			this.noInput = true;
			this.updateTimeUntilTrigger();
		}

		static get observedAttributes() {
			return ['trigger', 'action'];
		}

		connectedCallback() {
			this.triedSaving = false;
			this.sr.querySelector('.button.delete').addEventListener('click', this.onDeleteClick.bind(this));
			this.sr.querySelector('.button.cancel').addEventListener('click', this.onCancelClick.bind(this));
			this.sr.querySelector('.button.save').addEventListener('click', this.onSaveClick.bind(this));
			this.sr.querySelector('.button.add').addEventListener('click', this.onAddConditionClick.bind(this));

			this.sr.querySelector('input.hours').addEventListener('input', this.onTimeInput.bind(this));
			this.sr.querySelector('input.minutes').addEventListener('input', this.onTimeInput.bind(this));
			this.sr.querySelector('input.seconds').addEventListener('input', this.onTimeInput.bind(this));
		}

		updateTimeUntilTrigger() {
			if (this.trigger) {
				this.sr.querySelector('.time').textContent = this.millisecondsToHuman(
					new Date(this.trigger.date) - new Date(),
				);
			}
			setTimeout(() => this.updateTimeUntilTrigger(), 500);
		}

		attributeChangedCallback(attr) {
			if (attr === 'action') {
				this.onActionChange();
			} else if (attr === 'trigger') {
				this.onTriggerChange();
			}
		}

		get trigger() {
			if (this.hasAttribute('trigger')) {
				return JSON.parse(this.getAttribute('trigger'));
			}
			return null;
		}

		get action() {
			return JSON.parse(this.getAttribute('action'));
		}

		onCancelClick() {
			this.sr.dispatchEvent(
				new CustomEvent('cancel-one-time-trigger-creation', {
					detail: {},
					composed: true,
				}),
			);
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

		onSaveClick() {
			this.updateValidationErrors();
			if (this.errors.length === 0) {
				this.sr.dispatchEvent(
					new CustomEvent('create', {
						detail: {
							trigger: {
								type: 'OneTimeTrigger',
								date: new Date(new Date().getTime() + this.milliseconds).toISOString(),
								action: JSON.parse(this.getActionElement(true).getAttribute('data')),
							},
						},
						composed: true,
					}),
				);
				this.sr.dispatchEvent(
					new CustomEvent('cancel-one-time-trigger-creation', {
						detail: {},
						composed: true,
					}),
				);
			} else {
				if (!this.triedSaving) {
					this.getActionElement(true).addEventListener('errors', this.updateValidationErrors.bind(this));
				}
			}
			this.triedSaving = true;
		}

		updateValidationErrors() {
			const errorsAction = JSON.parse(this.getActionElement(true).getAttribute('errors'));
			let errors = [];
			if (this.noInput) {
				errors.push('Enter time when to trigger');
			}
			if (this.triggerErrors) {
				errors = errors.concat(this.triggerErrors);
			}
			if (errorsAction) {
				errors = errors.concat(errorsAction);
			}
			this.errors = errors;
			this.sr.querySelector('.validation-errors-container').style.display = errors.length === 0 ? 'none' : null;

			const validationErrorsList = this.sr.querySelector('#validation-errors');
			while (validationErrorsList.firstChild) {
				validationErrorsList.removeChild(validationErrorsList.firstChild);
			}
			this.errors.forEach((e) => {
				const li = document.createElement('li');
				li.textContent = e;
				validationErrorsList.appendChild(li);
			});
		}

		onTimeInput() {
			this.noInput = false;
			const hours = Number.parseInt(this.sr.querySelector('input.hours').value, 10);
			const minutes = Number.parseInt(this.sr.querySelector('input.minutes').value, 10);
			const seconds = Number.parseInt(this.sr.querySelector('input.seconds').value, 10);
			const errors = [];
			if (Number.isNaN(hours) || hours < 0) {
				errors.push('Hours must be >= 0');
			}
			if (Number.isNaN(minutes) || minutes < 0 || minutes > 59) {
				errors.push('Minutes must be >= 0 and <= 59');
			}
			if (Number.isNaN(seconds) || seconds < 0 || seconds > 59) {
				errors.push('Seconds must be >= 0 and <= 59');
			}
			if (errors.length === 0) {
				this.milliseconds = hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;
			}
			this.triggerErrors = errors;
			if (this.triedSaving) {
				this.updateValidationErrors();
			}
		}

		createShadowRoot() {
			const shadowRoot = this.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML = `
				<link rel="stylesheet" href="widgets/time-switch/css/OneTimeTrigger.css"/>
				<div class="container view" style="display: none">
					<div class="header">
						<div class="action"></div>
						<div class="trigger">
							<div class="time"></div>
						</div>
						<img class="button delete" src="widgets/time-switch/img/delete-24px.svg" width="28px"
							height="28px" title="${vis.binds['time-switch'].translate('removeTrigger')}"/>
					</div>
				</div>
				<div class="container edit">
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
					<div>${vis.binds['time-switch'].translate('oneTimeTriggerInfo')}</div>
					<div class="trigger">
						<input type="number" class="hours" min="0" max="23" step="1" placeholder="h" required value="0">
                    	<span>:</span>
                    	<input type="number" class="minutes" min="0" max="59" step="1" placeholder="mm" required value="0">
                    	<span>:</span>
                    	<input type="number" class="seconds" min="0" max="59" step="1" placeholder="ss" required value="0">
					</div>					
				</div>
			`;
			return shadowRoot;
		}

		getActionElement(edit) {
			const newAction = this.action;
			const elementName = vis.binds['time-switch'].getElementNameForActionType(newAction.type);
			return this.sr.querySelector(`.container.${edit ? 'edit' : 'view'} .action ${elementName}`);
		}

		onTriggerChange() {
			const newTrigger = this.trigger;
			if (newTrigger) {
				this.sr.querySelector('.container.edit').style.display = 'none';
				this.sr.querySelector('.container.view').style.display = null;
			}
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

		millisecondsToHuman(ms) {
			const seconds = Math.floor((ms / 1000) % 60);
			const minutes = Math.floor((ms / 1000 / 60) % 60);
			const hours = Math.floor((ms / 1000 / 3600) % 24);

			const humanized = [hours, minutes, seconds]
				.map((v) => (v < 0 ? 0 : v))
				.map((v) => v.toString().padStart(2, '0'))
				.join(':');

			return `T - ${humanized}`;
		}
	}

	customElements.define('app-one-time-trigger', OneTimeTrigger);
})();
