(async () => {
	class TimeTrigger extends HTMLElement {
		shadowRoot;

		constructor() {
			super();
			this.createShadowRoot();
			this.shadowRoot.querySelector('input.hour').addEventListener('input', this.onHourInput.bind(this));
			this.shadowRoot.querySelector('input.minute').addEventListener('input', this.onMinuteInput.bind(this));
		}

		static get observedAttributes() {
			return ['hour', 'minute', 'edit'];
		}

		connectedCallback() {}

		attributeChangedCallback(attr, oldValue, newValue) {
			if (attr === 'hour' || attr === 'minute') {
				this.onTimeChanged();
			} else if (attr === 'edit') {
				this.onEditChange();
			}
		}

		get hour() {
			return this.getAttribute('hour');
		}

		set hour(val) {
			this.setAttribute('hour', val);
		}

		get minute() {
			return this.getAttribute('minute');
		}

		set minute(val) {
			this.setAttribute('minute', val);
		}

		get edit() {
			const attrValue = this.getAttribute('edit');
			return attrValue === 'true';
		}

		set edit(value) {
			this.setAttribute('edit', value ? 'true' : 'false');
		}

		set errors(value) {
			if (value.length === 0) {
				this.removeAttribute('errors');
			} else {
				this.setAttribute('errors', JSON.stringify(value));
			}
		}

		onTimeChanged() {
			this.shadowRoot.querySelector('input.hour').value = this.hour;
			this.shadowRoot.querySelector('input.minute').value = this.minute;
			const hour = String(this.hour).padStart(2, '0');
			const minute = String(this.minute).padStart(2, '0');
			this.shadowRoot.querySelector('.time').textContent = `${hour}:${minute}`;
			this.verify();
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

		onHourInput() {
			this.hour = +this.shadowRoot.querySelector('input.hour').value;
			this.verify();
		}

		onMinuteInput() {
			this.minute = +this.shadowRoot.querySelector('input.minute').value;
			this.verify();
		}

		verify() {
			const errors = [];
			const hour = Number.parseInt(this.hour, 10);
			const minute = Number.parseInt(this.minute, 10);
			if (Number.isNaN(hour) || hour < 0 || hour > 23) {
				errors.push('Hour must be >= 0 and <= 23');
			}
			if (Number.isNaN(minute) || minute < 0 || minute > 59) {
				errors.push('Minute must be >= 0 and <= 59');
			}
			this.errors = errors;
			this.shadowRoot.dispatchEvent(new CustomEvent('errors', { composed: true }));
		}

		createShadowRoot() {
			const shadowRoot = this.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML = `
				<link rel="stylesheet" href="widgets/time-switch/css/TimeTrigger.css"/>
				<div class="container view">
						<div class="time"></div>
				</div>
				<div class="container edit" style="display: none">
                    <input type="number" class="hour" min="0" max="23" step="1" required>
                    <span>:</span>
                    <input type="number" class="minute" min="0" max="59" step="1" required>
				</div>
			`;
			this.shadowRoot = shadowRoot;
		}
	}

	customElements.define('app-time-trigger', TimeTrigger);
})();
