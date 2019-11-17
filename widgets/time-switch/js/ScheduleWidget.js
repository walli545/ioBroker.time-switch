export class ScheduleWidget {
	widgetId = null;
	scheduleDataId = null;
	switchedStateId = null;
	vis = null;

	scheduledActions = [];
	switchedStateId = null;
	enabled = true;
	alias = '';

	deleteSubscribers = [];
	updateSubscribers = [];

	constructor(widgetId, scheduleDataId, vis) {
		this.widgetId = widgetId;
		this.scheduleDataId = scheduleDataId;
		this.vis = vis;
	}

	setSwitchedStateId(switchedStateId) {
		this.switchedStateId = switchedStateId;
		document.querySelector(`#${this.widgetId} .state-id`).textContent = switchedStateId;
	}

	setEnabled(enabled) {
		this.enabled = enabled;
		const toggle = document.querySelector(`#${this.widgetId}`).querySelector('#enabled');
		if (enabled) {
			toggle.classList.add('checked');
		} else {
			toggle.classList.remove('checked');
		}
	}

	setAlias(alias) {
		this.alias = alias;
		document.querySelector(`#${this.widgetId}`).querySelector('h1').textContent = alias;
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

	clearScheduledActions() {
		const actionContainer = document.querySelector(`#${this.widgetId} .actions`);
		while (actionContainer.firstChild) {
			actionContainer.removeChild(actionContainer.firstChild);
		}
	}
}
