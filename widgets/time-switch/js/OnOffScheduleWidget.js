(async () => {
	class OnOffScheduleWidget extends HTMLElement {
		shadowRoot;
		currentTriggers;
		settings;

		constructor() {
			super();
			this.createShadowRoot();
		}

		static get observedAttributes() {
			return ['widgetid'];
		}

		connectedCallback() {
			this.shadowRoot.querySelector('.button.add').addEventListener('click', this.addTimeTrigger.bind(this));
			this.shadowRoot.querySelector('.button.edit').addEventListener('click', this.onEditNameClick.bind(this));
			this.shadowRoot.querySelector('.button.save').addEventListener('click', this.onSaveNameClick.bind(this));
			this.shadowRoot.querySelector('button#manual-off').addEventListener('click', this.onManualClick.bind(this));
			this.shadowRoot.querySelector('button#manual-on').addEventListener('click', this.onManualClick.bind(this));
			this.shadowRoot.querySelector('#enabled').addEventListener('click', () => {
				this.enabled = !this.enabled;
			});
			this.shadowRoot.querySelector('#manual').addEventListener('click', () => {
				const toggle = this.shadowRoot.querySelector('#manual');
				toggle.classList.toggle('checked');
				this.onManualClick({
					target: { id: toggle.classList.contains('checked') ? 'manual-on' : 'manual-off' },
				});
			});
		}

		attributeChangedCallback(attr) {
			if (attr === 'widgetid') {
				this.onWidgetIdChange();
			}
		}

		get widgetId() {
			return this.getAttribute('widgetid');
		}

		set name(val) {
			this.shadowRoot.querySelector('.heading .view h1').textContent = val;
			this.shadowRoot.querySelector('.heading .edit input').value = val;
		}

		get enabled() {
			return this.shadowRoot.querySelector('#enabled').classList.contains('checked');
		}

		set enabled(val) {
			const toggle = this.shadowRoot.querySelector('#enabled');
			if (val) {
				toggle.classList.add('checked');
				vis.binds['time-switch'].sendMessage('enable-schedule', this.settings.dataId);
			} else {
				toggle.classList.remove('checked');
				vis.binds['time-switch'].sendMessage('disable-schedule', this.settings.dataId);
			}
		}

		set manualToggle(val) {
			const toggle = this.shadowRoot.querySelector('#manual');
			if (val) {
				toggle.classList.add('checked');
			} else {
				toggle.classList.remove('checked');
			}
		}

		set triggers(triggers) {
			this.currentTriggers = triggers;
			const oldTriggers = this.shadowRoot.querySelector('.triggers');
			while (oldTriggers.firstChild) {
				oldTriggers.removeChild(oldTriggers.firstChild);
			}
			triggers.forEach(t => {
				const element = document.createElement('app-trigger-with-action');
				element.setAttribute('action', JSON.stringify(t.action));
				delete t.action;
				element.setAttribute('trigger', JSON.stringify(t));
				element.setAttribute('id', t.id);
				element.addEventListener('delete', e => this.onTriggerDelete(e.detail.id));
				element.addEventListener('update', e => this.onTriggerUpdate(e.detail.trigger));
				this.shadowRoot.querySelector(`.triggers`).appendChild(element);
			});
		}

		set nameEditMode(isEdit) {
			if (isEdit) {
				this.shadowRoot.querySelector('.heading div.edit').style.display = null;
				this.shadowRoot.querySelector('.heading div.view').style.display = 'none';
			} else {
				this.shadowRoot.querySelector('.heading div.edit').style.display = 'none';
				this.shadowRoot.querySelector('.heading div.view').style.display = null;
			}
		}

		onWidgetIdChange() {
			console.log('widget id change');
			const newSettings = vis.widgets[this.widgetId].data;
			this.settings = newSettings;
			if (newSettings.showId && newSettings.statesCount === '1') {
				this.shadowRoot.querySelector('#switched-oid').textContent = newSettings.stateId1;
			}

			const oldSettings = vis.binds['time-switch'].onOffScheduleWidgets[this.widgetId];
			if (oldSettings) {
				this.detectSettingsChanges(oldSettings, newSettings);
			}
			this.updateStoredSettings(newSettings);

			this.onScheduleDataChange(JSON.parse(vis.states[`${this.settings.dataId}.val`]));
			const enabledId = this.settings.dataId.replace('data', 'enabled');
			this.enabled = vis.states[`${enabledId}.val`];
			vis.states.bind(`${newSettings.dataId}.val`, (e, newVal) => {
				const scheduleData = JSON.parse(newVal);
				this.onScheduleDataChange(scheduleData);
			});
			vis.states.bind(`${enabledId}.val`, (e, newVal) => (this.enabled = newVal));
			if (this.settings.showManualSwitch) {
				const stateIds = this.getStateIdsFromSettings(this.settings);
				if (stateIds.length === 1) {
					this.shadowRoot.querySelector('.manual-container.single').style.display = null;
					vis.states.bind(`${stateIds[0]}.val`, (e, newVal) => {
						let val = newVal;
						if (this.settings.valueType !== 'boolean') {
							val = newVal.toString() === this.settings.onValue.toString();
						}
						this.manualToggle = val;
					});
				} else {
					this.shadowRoot.querySelector('.manual-container.multiple').style.display = null;
				}
			}
		}

		onScheduleDataChange(newData) {
			this.name = newData.name;
			this.triggers = newData.triggers;
		}

		onEditNameClick() {
			this.nameEditMode = true;
		}

		onSaveNameClick() {
			const newName = this.shadowRoot.querySelector('.heading .edit input').value;
			vis.binds['time-switch'].sendMessage('change-name', {
				dataId: this.settings.dataId,
				name: newName,
			});
			this.nameEditMode = false;
		}

		onManualClick(e) {
			const stateIds = this.getStateIdsFromSettings(this.settings);
			const valueType = this.settings.valueType;
			const isOnClick = e.target.id === 'manual-on';
			let val = isOnClick ? this.settings.onValue : this.settings.offValue;
			if (valueType === 'number') {
				val = Number.parseFloat(val);
			} else if (valueType === 'boolean') {
				val = isOnClick;
			}
			stateIds.forEach(i => vis.conn.setState(i, val));
		}

		onTriggerDelete(triggerId) {
			vis.binds['time-switch'].sendMessage('delete-trigger', {
				dataId: this.settings.dataId,
				id: triggerId,
			});
		}

		onTriggerUpdate(trigger) {
			vis.binds['time-switch'].sendMessage('update-trigger', {
				dataId: this.settings.dataId,
				trigger: trigger,
			});
		}

		addTimeTrigger() {
			const message = {
				dataId: this.settings.dataId,
				triggerType: 'TimeTrigger',
				actionType: 'OnOffValueAction',
				valueType: this.settings.valueType,
				stateIds: this.getStateIdsFromSettings(this.settings),
			};
			if (this.settings.valueType === 'number') {
				message.onValue = Number.parseFloat(this.settings.onValue);
				message.offValue = Number.parseFloat(this.settings.offValue);
			} else if (this.settings.valueType === 'string') {
				message.onValue = this.settings.onValue;
				message.offValue = this.settings.offValue;
			}
			vis.binds['time-switch'].sendMessage('add-trigger', message);
		}

		updateStoredSettings(newSettings) {
			vis.binds['time-switch'].onOffScheduleWidgets[this.widgetId] = {
				onValue: newSettings.onValue,
				offValue: newSettings.offValue,
				stateIds: this.getStateIdsFromSettings(newSettings),
				valueType: newSettings.valueType,
			};
		}

		detectSettingsChanges(oldSettings, newSettings) {
			const newStateIds = this.getStateIdsFromSettings(newSettings);
			if (
				newStateIds.length !== oldSettings.stateIds.length ||
				newStateIds.some((value, index) => value !== oldSettings.stateIds[index])
			) {
				vis.binds['time-switch'].sendMessage('change-switched-ids', {
					dataId: newSettings.dataId,
					stateIds: newStateIds,
				});
			}
			if (
				oldSettings.onValue !== newSettings.onValue ||
				oldSettings.offValue !== newSettings.offValue ||
				oldSettings.valueType !== newSettings.valueType
			) {
				vis.binds['time-switch'].sendMessage('change-switched-values', {
					dataId: newSettings.dataId,
					valueType: newSettings.valueType,
					onValue:
						newSettings.valueType === 'number'
							? Number.parseFloat(newSettings.onValue)
							: newSettings.onValue,
					offValue:
						newSettings.valueType === 'number'
							? Number.parseFloat(newSettings.offValue)
							: newSettings.offValue,
				});
			}
		}

		getStateIdsFromSettings(settings) {
			const count = Number.parseInt(settings.statesCount, 10);
			const ids = [];
			for (let i = 1; i <= count; i++) {
				const id = settings['stateId' + i];
				if (id !== undefined && id !== '') {
					ids.push(id);
				}
			}
			return ids;
		}

		createShadowRoot() {
			const shadowRoot = this.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML = `
				<link rel="stylesheet" href="widgets/time-switch/css/material-toggle-switch.css" />
				<link rel="stylesheet" href="widgets/time-switch/css/material-button.css" />
				<link rel="stylesheet" href="widgets/time-switch/css/OnOffScheduleWidget.css" />
				<div class="widget">
					<div class="heading">
						<div class="view">
							<h1></h1>
							<img class="button edit" src="widgets/time-switch/img/edit-24px.svg" width="28px" height="28px"/>
						</div>
						<div class="edit" style="display: none;">
							<input type="text">
							<img class="button save" src="widgets/time-switch/img/save-24px.svg" width="28px" height="28px"/>
						</div>
					</div>
					<div id="switched-oid"></div>
					
					<div id="enabled" class="md-switch-container">
						<div class="md-switch-track"></div>
						<div class="md-switch-handle"></div>
						<div class="md-switch-label">Automatic switching enabled</div>
					</div>
					<div class="manual-container multiple" style="display: none;">
						<p>Manual switching</p>
						<button class="material-button" id="manual-on">All on</button>
						<button class="material-button" id="manual-off">All off</button>
					</div>
					<div class="manual-container single" style="display: none;">
						<div id="manual" class="md-switch-container">
							<div class="md-switch-track"></div>
							<div class="md-switch-handle"></div>
							<div class="md-switch-label">Current value</div>
						</div>
					</div>
					<div id="add">
						<img class="button add" src="widgets/time-switch/img/add-24px.svg" width="28px" height="28px"/>
					</div>
					<div class="triggers">
				</div>
			`;
			this.shadowRoot = shadowRoot;
		}
	}
	customElements.define('app-on-off-schedule-widget', OnOffScheduleWidget);
})();
