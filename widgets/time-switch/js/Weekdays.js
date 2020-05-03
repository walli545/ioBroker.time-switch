(async () => {
	class Weekdays extends HTMLElement {
		constructor() {
			super();
			this.sr = this.createShadowRoot();
			this.WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
			this.addWeekdayElements();
		}

		static get observedAttributes() {
			return ['selected', 'edit'];
		}

		connectedCallback() {}

		attributeChangedCallback(attr, oldValue, newValue) {
			if (attr === 'selected') {
				this.onSelectedChange();
			} else if (attr === 'edit') {
				this.onEditChange();
			}
		}

		get selected() {
			return JSON.parse(this.getAttribute('selected'));
		}

		set selected(val) {
			this.setAttribute('selected', JSON.stringify(val));
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

		onSelectedChange() {
			this.sr.querySelectorAll('.view span').forEach((e, i) => {
				const correctIndex = i % 7 === 6 ? 0 : i + 1;
				if (this.selected.indexOf(correctIndex) !== -1) {
					e.classList.add('active');
				} else {
					e.classList.remove('active');
				}
			});
			this.sr.querySelectorAll('.edit label input').forEach((c, i) => {
				const correctIndex = i % 7 === 6 ? 0 : i + 1;
				c.checked = this.selected.indexOf(correctIndex) !== -1;
			});
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

		onWeekdayClick() {
			const selected = [];
			this.sr.querySelectorAll('.edit label input').forEach((c, i) => {
				if (c.checked) {
					selected.push(i % 7 === 6 ? 0 : i + 1);
				}
			});
			this.selected = selected;
		}

		verify() {
			const errors = [];
			if (this.selected.length === 0) {
				errors.push('One or more weekdays must be selected');
			}
			this.errors = errors;
			this.sr.dispatchEvent(new CustomEvent('errors', { composed: true }));
		}

		createShadowRoot() {
			const shadowRoot = this.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML = `
				<link rel="stylesheet" href="widgets/time-switch/css/Weekdays.css"/>
				<link rel="stylesheet" href="widgets/time-switch/css/material-checkbox.css" />
				<div class="container view">
				</div>
				<div class="container edit" style="display: none">
				</div>
			`;
			return  shadowRoot;
		}

		addWeekdayElements() {
			if (!this.sr.querySelector('.container.edit span')) {
				this.WEEKDAYS.forEach(day => {
					const span = document.createElement('span');
					span.textContent = ` ${day} `;
					this.sr.querySelector('.container.view').appendChild(span);

					const label = document.createElement('label');
					label.classList.add('pure-material-checkbox');
					const input = document.createElement('input');
					input.type = 'checkbox';
					input.onclick = this.onWeekdayClick.bind(this);
					const text = document.createElement('span');
					text.textContent = `${day}`;
					label.appendChild(input);
					label.appendChild(text);
					this.sr.querySelector('.container.edit').appendChild(label);
				});
			}
		}
	}

	customElements.define('app-weekdays', Weekdays);
})();
