(async () => {
	class OnOffScheduleWidget extends HTMLElement {
		constructor() {
			super();
			this.sr = this.createShadowRoot();
			this.settings = null;
			this.currentTriggers = [];
			this.connected = false;
		}

		static get observedAttributes() {
			return ['widgetid'];
		}

		connectedCallback() {
			if (this.connected) {
				return;
			}
			this.sr.querySelector('#btn-add-trigger-dropdown').addEventListener('click', e => {
				const dropdown = this.sr.querySelector('#add-trigger-dropdown');
				dropdown.classList.add('show');
				e.stopImmediatePropagation();
				window.addEventListener(
					'click',
					() => {
						dropdown.classList.remove('show');
					},
					{ once: true },
				);
			});
			this.sr.querySelector('#add-time-trigger').addEventListener('click', () => this.addTrigger('TimeTrigger'));
			this.sr
				.querySelector('#add-astro-trigger')
				.addEventListener('click', () => this.addTrigger('AstroTrigger'));
			this.sr.querySelector('.button.edit').addEventListener('click', this.onEditNameClick.bind(this));
			this.sr.querySelector('.button.save').addEventListener('click', this.onSaveNameClick.bind(this));
			this.sr.querySelector('button#manual-off').addEventListener('click', this.onManualClick.bind(this));
			this.sr.querySelector('button#manual-on').addEventListener('click', this.onManualClick.bind(this));
			this.sr.querySelector('#enabled').addEventListener('click', () => {
				this.enabled = !this.enabled;
				vis.binds['time-switch'].sendMessage(this.enabled ? 'enable-schedule' : 'disable-schedule', { dataId: this.settings.dataId});
			});
			this.sr.querySelector('#manual').addEventListener('click', () => {
				const toggle = this.sr.querySelector('#manual');
				toggle.classList.toggle('checked');
				this.onManualClick({
					target: { id: toggle.classList.contains('checked') ? 'manual-on' : 'manual-off' },
				});
			});
			this.connected = true;
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
			this.sr.querySelector('.heading .view h1').textContent = val;
			this.sr.querySelector('.heading .edit input').value = val;
		}

		get enabled() {
			return this.sr.querySelector('#enabled').classList.contains('checked');
		}

		set enabled(val) {
			const toggle = this.sr.querySelector('#enabled');
			if (val) {
				toggle.classList.add('checked');
			} else {
				toggle.classList.remove('checked');
			}
		}

		set manualToggle(val) {
			const toggle = this.sr.querySelector('#manual');
			if (val) {
				toggle.classList.add('checked');
			} else {
				toggle.classList.remove('checked');
			}
		}

		set triggers(triggers) {
			this.currentTriggers = triggers;
			const oldTriggers = this.sr.querySelector('.triggers');
			while (oldTriggers.firstChild) {
				oldTriggers.removeChild(oldTriggers.firstChild);
			}
			triggers.forEach(t => {
				const element = document.createElement('app-trigger-with-action');
				element.setAttribute('widgetid', this.widgetId);
				element.setAttribute('action', JSON.stringify(t.action));
				delete t.action;
				element.setAttribute('trigger', JSON.stringify(t));
				element.setAttribute('id', t.id);
				element.addEventListener('delete', e => this.onTriggerDelete(e.detail.id));
				element.addEventListener('update', e => this.onTriggerUpdate(e.detail.trigger));
				this.sr.querySelector(`.triggers`).appendChild(element);
			});
		}

		set nameEditMode(isEdit) {
			if (isEdit) {
				this.sr.querySelector('.heading div.edit').style.display = null;
				this.sr.querySelector('.heading div.view').style.display = 'none';
			} else {
				this.sr.querySelector('.heading div.edit').style.display = 'none';
				this.sr.querySelector('.heading div.view').style.display = null;
			}
		}

		onWidgetIdChange() {
			console.log('widget id change');
			const newSettings = vis.widgets[this.widgetId].data;
			this.settings = newSettings;
			if (newSettings.showId && newSettings.statesCount === '1') {
				this.sr.querySelector('#switched-oid').textContent = newSettings.stateId1;
			}
			const oldSettings = vis.binds['time-switch'].onOffScheduleWidgets[this.widgetId];
			console.log('old settings');
			console.log(oldSettings);
			this.detectSettingsChanges(oldSettings, newSettings);
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
					this.manualToggle = this.convertToBooleanForManual(vis.states[`${stateIds[0]}.val`]);
					this.sr.querySelector('.manual-container.single').style.display = null;
					vis.states.bind(`${stateIds[0]}.val`, (_, v) => {
						this.manualToggle = this.convertToBooleanForManual(v);
					});
				} else {
					this.sr.querySelector('.manual-container.multiple').style.display = null;
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
			const newName = this.sr.querySelector('.heading .edit input').value;
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
				triggerId: triggerId,
			});
		}

		onTriggerUpdate(trigger) {
			vis.binds['time-switch'].sendMessage('update-trigger', {
				dataId: this.settings.dataId,
				trigger: trigger,
			});
		}

		addTrigger(type) {
			const message = {
				dataId: this.settings.dataId,
				triggerType: type,
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
			console.log('new settings');
			console.log(newSettings);
			const newStateIds = this.getStateIdsFromSettings(newSettings);
			if (
				!oldSettings ||
				newStateIds.length !== oldSettings.stateIds.length ||
				newStateIds.some((value, index) => value !== oldSettings.stateIds[index])
			) {
				console.log('sending change switched oids');
				vis.binds['time-switch'].sendMessage('change-switched-ids', {
					dataId: newSettings.dataId,
					stateIds: newStateIds,
				});
			}
			if (
				!oldSettings ||
				oldSettings.onValue !== newSettings.onValue ||
				oldSettings.offValue !== newSettings.offValue ||
				oldSettings.valueType !== newSettings.valueType
			) {
				console.log('sending change switched values');
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

		convertToBooleanForManual(val) {
			if (this.settings.valueType !== 'boolean') {
				val = val.toString() === this.settings.onValue.toString();
			}
			return val;
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
							<img class="button edit" src="widgets/time-switch/img/edit-24px.svg" width="28px" 
								height="28px" title="${vis.binds['time-switch'].translate('editName')}"/>
						</div>
						<div class="edit" style="display: none;">
							<input type="text">
							<img class="button save" src="widgets/time-switch/img/save-24px.svg" width="28px"
								height="28px"title="${vis.binds['time-switch'].translate('saveName')}"/>
						</div>
					</div>
					<div id="switched-oid"></div>
					
					<div id="enabled" class="md-switch-container">
						<div class="md-switch-track"></div>
						<div class="md-switch-handle"></div>
						<div class="md-switch-label">${vis.binds['time-switch'].translate('automaticSwitchingEnabled')}</div>
					</div>
					<div class="manual-container multiple" style="display: none;">
						<p>${vis.binds['time-switch'].translate('manualSwitching')}</p>
						<button class="material-button" id="manual-on">${vis.binds['time-switch'].translate('allOn')}</button>
						<button class="material-button" id="manual-off">${vis.binds['time-switch'].translate('allOff')}</button>
					</div>
					<div class="manual-container single" style="display: none;">
						<div id="manual" class="md-switch-container">
							<div class="md-switch-track"></div>
							<div class="md-switch-handle"></div>
							<div class="md-switch-label">${vis.binds['time-switch'].translate('currentValue')}</div>
						</div>
					</div>
					<div id="add">
						<div class="dropdown">
						  <img class="button" id="btn-add-trigger-dropdown" src="widgets/time-switch/img/add-24px.svg" width="28px"
							height="28px" title="${vis.binds['time-switch'].translate('addTrigger')}"/>
						  <div id="add-trigger-dropdown" class="dropdown-content">
							<div class="dropdown-btn" id="add-time-trigger">${vis.binds['time-switch'].translate('addTimeTrigger')}</div>
							<div class="dropdown-btn" id="add-astro-trigger">${vis.binds['time-switch'].translate('addAstroTrigger')}</div>
						  </div>
						</div>
					</div>
					<div class="triggers">
				</div>
			`;
			return shadowRoot;
		}
	}
	customElements.define('app-on-off-schedule-widget', OnOffScheduleWidget);
})();
