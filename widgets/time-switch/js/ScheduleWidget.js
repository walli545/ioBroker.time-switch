export class ScheduleWidget {
	widgetId = null;
	scheduleDataId = null;
	switchedStateId = null;
	vis = null;

	scheduledActions = [];
	enabled = true;
	alias = '';

	deleteSubscribers = [];
	updateSubscribers = [];
	aliasChangeSubscribers = [];

	constructor(widgetId, scheduleDataId, vis) {
		this.widgetId = widgetId;
		this.scheduleDataId = scheduleDataId;
		this.vis = vis;
		this.getWidgetDiv()
			.querySelector('.button.edit')
			.addEventListener('click', this.onEditAliasClick.bind(this));
		this.getWidgetDiv()
			.querySelector('.button.save')
			.addEventListener('click', this.onSaveAliasClick.bind(this));
	}

	setSwitchedStateId(switchedStateId) {
		this.switchedStateId = switchedStateId;
		document.querySelector(`#${this.widgetId} .state-id`).textContent = switchedStateId;
	}

	setEnabled(enabled) {
		this.enabled = enabled;
		const toggle = this.getWidgetDiv().querySelector('#enabled');
		if (enabled) {
			toggle.classList.add('checked');
		} else {
			toggle.classList.remove('checked');
		}
	}

	setAlias(alias) {
		this.alias = alias;
		this.getWidgetDiv().querySelector('.heading .view h1').textContent = alias;
		this.getWidgetDiv().querySelector('.heading .edit input').value = alias;
	}

	setScheduledActions(scheduledActions) {
		this.clearScheduledActions();
		this.scheduledActions = scheduledActions;
		this.scheduledActions.forEach(action => {
			const element = document.createElement('app-set-state-value-action');
			element.setAttribute('value-to-set', action.valueToSet);
			element.setAttribute('trigger', JSON.stringify(action.trigger));
			element.setAttribute('id', action.id);
			element.addEventListener('delete', e => {
				this.deleteSubscribers.forEach(s => s(this, e.detail));
			});
			element.addEventListener('update', e => {
				action.valueToSet = e.detail.valueToSet;
				action.trigger.weekdays = e.detail.weekdays;
				action.trigger.hour = e.detail.hour;
				action.trigger.minute = e.detail.minute;
				this.updateSubscribers.forEach(s => s(this, action));
			});
			document.querySelector(`#${this.widgetId} .actions`).appendChild(element);
		});
	}

	subscribeOnDelete(callback) {
		this.deleteSubscribers.push(callback);
	}

	subscribeOnUpdate(callback) {
		this.updateSubscribers.push(callback);
	}

	subscribeOnAliasChange(callback) {
		this.aliasChangeSubscribers.push(callback);
	}

	clearScheduledActions() {
		const actionContainer = document.querySelector(`#${this.widgetId} .actions`);
		while (actionContainer.firstChild) {
			actionContainer.removeChild(actionContainer.firstChild);
		}
	}

	onEditAliasClick() {
		this.setAliasEditMode(true);
	}

	onSaveAliasClick() {
		const newAlias = this.getWidgetDiv().querySelector('.heading .edit input').value;
		this.aliasChangeSubscribers.forEach(s => s(this, newAlias));
		this.setAliasEditMode(false);
	}

	setAliasEditMode(isEdit) {
		if (isEdit) {
			this.getWidgetDiv().querySelector('.heading div.edit').style.display = null;
			this.getWidgetDiv().querySelector('.heading div.view').style.display = 'none';
		} else {
			this.getWidgetDiv().querySelector('.heading div.edit').style.display = 'none';
			this.getWidgetDiv().querySelector('.heading div.view').style.display = null;
		}
	}

	getWidgetDiv() {
		return document.querySelector(`#${this.widgetId}`);
	}
}
