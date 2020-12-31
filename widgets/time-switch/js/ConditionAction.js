(async () => {
	class ConditionAction extends HTMLElement {
		constructor() {
			super();
			this.sr = this.createShadowRoot();
			this.data = '{}';
			this.actionType = '';
			this.sr.querySelector('#withConstant').addEventListener('click', this.onWithConstantClick.bind(this));
			this.sr
				.querySelector('#selectConditionStateId1')
				.addEventListener('change', this.onConditionState1Change.bind(this));
			this.sr
				.querySelector('#selectConditionStateId2')
				.addEventListener('change', this.onConditionState2Change.bind(this));
			this.sr.querySelector('#selectSign').addEventListener('change', this.onSignChange.bind(this));
			this.sr
				.querySelector('#inputConditionConstant')
				.addEventListener('input', this.onConditionConstantInput.bind(this));
			this.sr.querySelector('.button.delete').addEventListener('click', this.onConditionDeleteClick.bind(this));
		}

		connectedCallback() {
			this.createConditionStateSelectOptions('#selectConditionStateId1');
			this.createConditionStateSelectOptions('#selectConditionStateId2');
		}

		static get observedAttributes() {
			return ['data', 'edit'];
		}

		attributeChangedCallback(attr) {
			if (attr === 'data') {
				this.onDataChange();
			} else if (attr === 'edit') {
				this.onEditChange();
			}
		}

		get withConstant() {
			return this.sr.querySelector('#withConstant').classList.contains('checked');
		}

		set withConstant(withConstant) {
			if (withConstant) {
				this.sr.querySelector('#withConstant').classList.add('checked');
			} else {
				this.sr.querySelector('#withConstant').classList.remove('checked');
			}
			this.sr.querySelector(
				`#${this.withConstant ? 'inputConditionConstant' : 'selectConditionStateId2'}`,
			).style.display = null;
			this.sr.querySelector(
				`#${!this.withConstant ? 'inputConditionConstant' : 'selectConditionStateId2'}`,
			).style.display = 'none';
		}

		get parsedData() {
			return JSON.parse(this.data);
		}

		set parsedData(data) {
			this.setAttribute('data', JSON.stringify(data));
			this.sr.dispatchEvent(new CustomEvent('data', { composed: true }));
		}

		get edit() {
			const attrValue = this.getAttribute('edit');
			return attrValue === 'true';
		}

		set edit(value) {
			this.setAttribute('edit', value ? 'true' : 'false');
		}

		onDataChange() {
			const dataAttribute = this.getAttribute('data');
			if (this.data !== this.dataAttribute) {
				this.data = dataAttribute;
				const parsed = JSON.parse(this.data);
				this.actionType = parsed.action.type;
				this.showAction(parsed.action);
				this.showCondition(parsed.condition);
			}
		}

		onActionChanged() {
			const data = JSON.parse(this.getAttribute('data'));
			data.action = JSON.parse(this.getActionElement(true).getAttribute('data'));
			this.setAttribute('data', JSON.stringify(data));
			this.sr.dispatchEvent(new CustomEvent('data', { composed: true }));
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

		onWithConstantClick() {
			const toggle = this.sr.querySelector('#withConstant');
			toggle.classList.toggle('checked');
			const data = this.parsedData;
			if (this.withConstant) {
				data.condition.type = 'StringStateAndConstantCondition';
				data.condition.stateId = data.condition.stateId1;
				data.condition.constant = 'true';
				delete data.condition.stateId1;
				delete data.condition.stateId2;
			} else {
				data.condition.type = 'StringStateAndStateCondition';
				data.condition.stateId1 = data.condition.stateId;
				data.condition.stateId2 = data.condition.stateId;
				delete data.condition.stateId;
				delete data.condition.constant;
			}
			this.parsedData = data;
		}

		onConditionDeleteClick() {
			this.sr.dispatchEvent(new CustomEvent('delete-condition', { composed: true }));
		}

		onConditionState1Change() {
			const data = this.parsedData;
			const select = this.sr.querySelector('#selectConditionStateId1');
			const selectedValue = select.options[select.options.selectedIndex].value;
			if (data.condition.type === 'StringStateAndStateCondition') {
				data.condition.stateId1 = selectedValue;
			} else {
				data.condition.stateId = selectedValue;
			}
			this.parsedData = data;
		}

		onConditionState2Change() {
			const data = this.parsedData;
			const select = this.sr.querySelector('#selectConditionStateId2');
			data.condition.stateId2 = select.options[select.options.selectedIndex].value;
			this.parsedData = data;
		}

		onSignChange() {
			const data = this.parsedData;
			const select = this.sr.querySelector('#selectSign');
			data.condition.sign = select.options[select.options.selectedIndex].value;
			this.parsedData = data;
		}

		onConditionConstantInput() {
			const data = this.parsedData;
			const select = this.sr.querySelector('#inputConditionConstant');
			data.condition.constant = select.value;
			this.parsedData = data;
		}

		getActionElement(edit) {
			return this.sr.querySelector(
				`.container.${edit ? 'edit' : 'view'} .action ${this.getElementNameForActionType(this.actionType)}`,
			);
		}

		showAction(action) {
			const elementName = this.getElementNameForActionType(action.type);
			let actionView = this.sr.querySelector(`.container.view .action ${elementName}`);
			if (!actionView) {
				actionView = document.createElement(elementName);
				actionView.setAttribute('edit', 'false');
				this.sr.querySelector('.container.view .action').appendChild(actionView);
			}
			let actionEdit = this.sr.querySelector(`.container.edit .action ${elementName}`);
			if (!actionEdit) {
				actionEdit = document.createElement(elementName);
				actionEdit.setAttribute('edit', 'true');
				actionEdit.addEventListener('data', this.onActionChanged.bind(this));
				this.sr.querySelector('.container.edit .action').appendChild(actionEdit);
			}
			actionView.setAttribute('data', JSON.stringify(action));
			actionEdit.setAttribute('data', JSON.stringify(action));
		}

		showCondition(condition) {
			// Wait for options of selects to be set
			setTimeout(() => {
				const viewDiv = this.sr.querySelector(`.container.view .condition`);
				if (condition.type === 'StringStateAndConstantCondition') {
					this.withConstant = true;
					this.sr.querySelector('#inputConditionConstant').value = condition.constant;
					this.selectOption('#selectConditionStateId1', condition.stateId);
					viewDiv.textContent = `${
						this.conditionStateIdsAndAlias().find((s) => s.id === condition.stateId)?.alias
					} ${condition.sign} ${condition.constant}`;
				} else {
					this.withConstant = false;
					this.selectOption('#selectConditionStateId1', condition.stateId1);
					this.selectOption('#selectConditionStateId2', condition.stateId2);
					viewDiv.textContent = `${
						this.conditionStateIdsAndAlias().find((s) => s.id === condition.stateId1)?.alias
					} ${condition.sign} ${
						this.conditionStateIdsAndAlias().find((s) => s.id === condition.stateId2)?.alias
					}`;
				}
				this.selectOption('#selectSign', condition.sign);
			}, 100);
		}

		getElementNameForActionType(type) {
			if (type === 'OnOffStateAction') {
				return 'app-on-off-state-action';
			} else if (type === 'ConditionAction') {
				return 'app-condition-action';
			} else {
				throw Error('No widget for action found');
			}
		}

		createConditionStateSelectOptions(id) {
			const selectConditionId = this.sr.querySelector(`.container.edit .condition-body ${id}`);
			while (selectConditionId.firstChild !== null) {
				selectConditionId.removeChild(selectConditionId.firstChild);
			}
			this.conditionStateIdsAndAlias().forEach((e) => {
				const optionElement = document.createElement('option');
				optionElement.text = `${e.alias} ${this.showConditionIds() ? `(${e.id})` : ``}`;
				optionElement.value = e.id;
				selectConditionId.appendChild(optionElement);
			});
		}

		selectOption(id, option) {
			for (const o of this.sr.querySelector(id).options) {
				o.selected = o.value === option;
			}
		}

		showConditionIds() {
			return vis.widgets[this.getAttribute('widgetid')].data.showConditionIds;
		}

		conditionStateIdsAndAlias() {
			return vis.binds['time-switch'].getConditionStateIdsAndAlias(this.getAttribute('widgetid'));
		}

		createShadowRoot() {
			const shadowRoot = this.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML = `
				<link rel="stylesheet" href="widgets/time-switch/css/material-toggle-switch.css" />
				<link rel="stylesheet" href="widgets/time-switch/css/ConditionAction.css" />
				<div class="container view">
					<div class="action"></div>
					<div class="condition"></div>
				</div>
				<div class="container edit" style="display: none">
					<div class="action"></div>
					<div class="condition-header">
						<div>${vis.binds['time-switch'].translate('condition')}</div>
						 <img class="button delete" src="widgets/time-switch/img/delete-24px.svg" width="28px"
							height="28px" title="${vis.binds['time-switch'].translate('removeCondition')}"/>
					</div>
					<div class="condition-body">
						<select id="selectConditionStateId1" required></select>
						<select id="selectSign" required>
							<option value="==">${vis.binds['time-switch'].translate('equals')}</option>
							<option value="!=">${vis.binds['time-switch'].translate('equalsNot')}</option>
						</select>
						<div id="withConstant" class="md-switch-container">
							<div class="md-switch-track"></div>
							<div class="md-switch-handle"></div>
							<div class="md-switch-label">${vis.binds['time-switch'].translate('withConstant')}</div>
						</div>
						<select id="selectConditionStateId2"></select>
						<input id="inputConditionConstant" type="text" style="display: none;"/>
					</div>
				</div>
			`;
			return shadowRoot;
		}
	}

	customElements.define('app-condition-action', ConditionAction);
})();
