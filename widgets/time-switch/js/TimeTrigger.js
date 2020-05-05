(async () => {
	class TimeTrigger extends HTMLElement {
		constructor() {
			super();
			this.sr = this.createShadowRoot();
			this.hour = 0;
			this.minute = 0;
			this.sr.querySelector('input#time').addEventListener('input', this.onTimeInput.bind(this));
		}

		static get observedAttributes() {
			return ['data', 'edit'];
		}

		connectedCallback() {}

		attributeChangedCallback(attr) {
			if (attr === 'data') {
				this.onDataChanged();
			} else if (attr === 'edit') {
				this.onEditChange();
			}
		}

		get data() {
			return JSON.parse(this.getAttribute('data'));
		}

		set data(data) {
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
			const oldErrors = this.errors;
			if (value.length === 0) {
				this.removeAttribute('errors');
			} else {
				this.setAttribute('errors', JSON.stringify(value));
			}

			if (oldErrors.length !== value.length) {
				this.sr.dispatchEvent(new CustomEvent('errors', { composed: true }));
			}
		}

		get errors() {
			const errors = this.getAttribute('errors');
			return errors ? JSON.parse(errors) : [];
		}

		onDataChanged() {
			if (this.data.hour !== this.hour || this.data.minute !== this.minute) {
				this.hour = this.data.hour;
				this.minute = this.data.minute;
				const hour = this.hour.toString().padStart(2, '0');
				const minute = this.minute.toString().padStart(2, '0');
				const formattedTime = `${hour}:${minute}`;
				this.sr.querySelector('.time').textContent = formattedTime;
				this.sr.querySelector('input#time').value = formattedTime;
			}
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
				const data = this.data;
				data.hour = this.hour;
				data.minute = this.minute;
				this.data = data;
			}
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
