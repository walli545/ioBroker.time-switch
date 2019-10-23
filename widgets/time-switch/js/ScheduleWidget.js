export class ScheduleWidget {
	widgetId = null;
	scheduleDataId = null;
	vis = null;

	scheduledActions = [];
	switchedStateId = null;

	deleteSubscribers = [];

	constructor(widgetId, scheduleDataId, vis) {
		this.widgetId = widgetId;
		this.scheduleDataId = scheduleDataId;
		this.vis = vis;
	}

	setSwitchedStateId(switchedStateId) {
		this.switchedStateId = switchedStateId;
		document.querySelector(`#${this.widgetId} .state-id`).textContent = switchedStateId;
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
			document.querySelector(`#${this.widgetId} .actions`).appendChild(element);
		});
	}

	subscribeOnDelete(callback) {
		this.deleteSubscribers.push(callback);
	}

	clearScheduledActions() {
		const actionContainer = document.querySelector(`#${this.widgetId} .actions`);
		while (actionContainer.firstChild) {
			actionContainer.removeChild(actionContainer.firstChild);
		}
	}
}
