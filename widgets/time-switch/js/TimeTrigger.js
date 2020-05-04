(async () => {
	class TimeTrigger extends HTMLElement {
		constructor() {
			super();
			this.sr = this.createShadowRoot();
			this.sr.querySelector('input#time').addEventListener('input', this.onTimeInput.bind(this));
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
			const hour = this.hour.toString().padStart(2, '0');
			const minute = this.minute.toString().padStart(2, '0');
			const formattedTime = `${hour}:${minute}`;
			this.sr.querySelector('input#time').value = formattedTime;
			this.sr.querySelector('.time').textContent = formattedTime;
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

		onTimeInput() {
			const value = this.sr.querySelector('input#time').value;
			if (value === '') {
				this.errors = ['No time selected'];
			} else {
				this.errors = [];
				const split = value.split(':');
				this.hour = Number.parseInt(split[0], 10);
				this.minute = Number.parseInt(split[1], 10);
			}
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
                    <input type="time" id="time" required/>
				</div>
			`;
			return shadowRoot;
		}
	}

	customElements.define('app-time-trigger', TimeTrigger);
})();
