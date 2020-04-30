(async () => {
	class TimeTrigger extends HTMLElement {
		constructor() {
			super();
			this.sr = this.createShadowRoot();
			this.sr.querySelector('input.hour').addEventListener('input', this.onHourInput.bind(this));
			this.sr.querySelector('input.minute').addEventListener('input', this.onMinuteInput.bind(this));
		}

		static get observedAttributes() {
			return ['data', 'edit'];
		}

		connectedCallback() {}

		attributeChangedCallback(attr, oldValue, newValue) {
			if (attr === 'data') {
				this.onTimeChanged();
			} else if (attr === 'edit') {
				this.onEditChange();
			}
		}

		get hour() {
			return JSON.parse(this.getAttribute('data')).hour;
		}

		set hour(val) {
			const data = JSON.parse(this.getAttribute('data'));
			data.hour = val;
			this.setAttribute('data', JSON.stringify(data));
		}

		get minute() {
			return JSON.parse(this.getAttribute('data')).minute;
		}

		set minute(val) {
			const data = JSON.parse(this.getAttribute('data'));
			data.minute = val;
			this.setAttribute('data', JSON.stringify(data));
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
			this.sr.querySelector('input.hour').value = this.hour;
			this.sr.querySelector('input.minute').value = this.minute;
			const hour = String(this.hour).padStart(2, '0');
			const minute = String(this.minute).padStart(2, '0');
			this.sr.querySelector('.time').textContent = `${hour}:${minute}`;
			this.verify();
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

		onHourInput() {
			this.hour = +this.sr.querySelector('input.hour').value;
			this.verify();
		}

		onMinuteInput() {
			this.minute = +this.sr.querySelector('input.minute').value;
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
			this.sr.dispatchEvent(new CustomEvent('errors', { composed: true }));
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
			return shadowRoot;
		}
	}

	customElements.define('app-time-trigger', TimeTrigger);
})();
