(async () => {
	class SetStateValueActionWidget extends HTMLElement {
		WEEKDAYS = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];
		shadowRoot;

		constructor() {
			super();
			this.createShadowRoot();
			this.addWeekdaySpans();
		}

		static get observedAttributes() {
			return ['trigger', 'value-to-set'];
		}

		connectedCallback() {
			console.log('connected');
			this.shadowRoot.querySelector('.button.delete').addEventListener('click', this.onDeleteClick.bind(this));
			this.shadowRoot.querySelector('.button.edit').addEventListener('click', this.onEditClick.bind(this));
		}

		attributeChangedCallback(attr, oldValue, newValue) {
			if (attr === 'value-to-set') {
				this.onValueToSetChange(newValue);
			} else if (attr === 'trigger') {
				this.onTriggerChange(JSON.parse(newValue));
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

		onValueToSetChange(newValueToSet) {
			const text = newValueToSet === 'true' ? 'AN' : 'AUS';
			this.shadowRoot.querySelector('.value-to-set').textContent = text;
		}

		onTriggerChange(newTrigger) {
			if (newTrigger.type === 'time') {
				const hour = String(newTrigger.hour).padStart(2, '0');
				const minute = String(newTrigger.minute).padStart(2, '0');
				this.shadowRoot.querySelector('.trigger').textContent = `${hour}:${minute}`;
				this.shadowRoot.querySelectorAll('.weekdays span').forEach((e, i) => {
					const correctIndex = i === 6 ? 0 : i + 1;
					if (newTrigger.weekdays.indexOf(correctIndex) !== -1) {
						e.classList.add('active');
					} else {
						e.classList.remove('active');
					}
				});
			} else {
				throw new Error('Trigger type not supported!');
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

		onEditClick() {
			console.log('on edit click');
		}

		createShadowRoot() {
			const shadowRoot = this.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML = `
				<link rel="stylesheet" href="widgets/time-switch/css/SetStateValueActionWidget.css"/>
				<div class="container">
					<div class="header">
						<div class="value-to-set"></div>
						<div class="trigger"></div>
						<img class="button edit" src="widgets/time-switch/img/edit-24px.svg" width="28px" height="28px"/>
						<img class="button delete" src="widgets/time-switch/img/remove_circle_outline-24px.svg" width="28px" height="28px"/>
					</div>
					<div class="weekdays"></div>
				</div>
			`;
			this.shadowRoot = shadowRoot;
		}

		addWeekdaySpans() {
			if (!this.shadowRoot.querySelector('.weekdays span')) {
				this.WEEKDAYS.forEach(day => {
					const span = document.createElement('span');
					span.textContent = ` ${day} `;
					this.shadowRoot.querySelector('.weekdays').appendChild(span);
				});
			}
		}
	}

	customElements.define('app-set-state-value-action', SetStateValueActionWidget);
})();
