(async () => {
	class OnOffStateAction extends HTMLElement {
		shadowRoot;

		constructor() {
			super();
			this.createShadowRoot();
		}

		connectedCallback() {
			this.shadowRoot.querySelector('#radio-on').addEventListener('input', this.onValueInput.bind(this));
			this.shadowRoot.querySelector('#radio-off').addEventListener('input', this.onValueInput.bind(this));
		}

		static get observedAttributes() {
			return ['data', 'edit'];
		}

		attributeChangedCallback(attr) {
			if (attr === 'data') {
				this.onValueChanged();
			} else if (attr === 'edit') {
				this.onEditChange();
			}
		}

		get value() {
			return JSON.parse(this.getAttribute('data')).booleanValue;
		}

		set value(val) {
			const data = JSON.parse(this.getAttribute('data'));
			data.booleanValue = val;
			this.setAttribute('data', JSON.stringify(data));
		}

		get edit() {
			const attrValue = this.getAttribute('edit');
			return attrValue === 'true';
		}

		set edit(value) {
			this.setAttribute('edit', value ? 'true' : 'false');
		}

		onValueChanged() {
			const newValue = this.value;
			const text = newValue ? 'ON' : 'OFF';
			this.shadowRoot.querySelector('.view .value').textContent = text;
			this.shadowRoot.querySelector(`#radio-${newValue ? 'on' : 'off'}`).checked = true;
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

		onValueInput() {
			this.value = this.shadowRoot.querySelector('#radio-on').checked;
		}

		createShadowRoot() {
			const shadowRoot = this.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML = `
				<link rel="stylesheet" href="widgets/time-switch/css/OnOffStateAction.css"/>
				<link rel="stylesheet" href="widgets/time-switch/css/material-radio-button.css"/>
				<div class="container view">
						<div class="value"></div>
				</div>
				<div class="container edit" style="display: none">
                    <div class="md-radio md-radio-inline">
						<input id="radio-on" type="radio" name="switched-value-group">
						<label for="radio-on">On</label>
					</div>
					<div class="md-radio md-radio-inline">
						<input id="radio-off" type="radio" name="switched-value-group">
						<label for="radio-off">Off</label>
					</div>
				</div>
			`;
			this.shadowRoot = shadowRoot;
		}
	}

	customElements.define('app-on-off-state-action', OnOffStateAction);
})();
