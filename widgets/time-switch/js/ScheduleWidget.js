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
        this.clearScheduledActions()
        this.scheduledActions = scheduledActions;
        this.scheduledActions.forEach(action => {
            const actionListElement = document.createElement('div');
            const deleteButton = document.createElement('button');
            deleteButton.setAttribute('type', 'button');
            deleteButton.classList.add('delete-button', 'material-button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click' , () => {
                this.deleteSubscribers.forEach(sub => sub(this, action.id));
            });
            const textElement = document.createElement('div');
            textElement.textContent = action.text;
            textElement.classList.add('action-text');
            actionListElement.classList.add('action');
            actionListElement.appendChild(textElement);
            actionListElement.appendChild(deleteButton);
            document.querySelector(`#${this.widgetId} .actions`).appendChild(actionListElement);
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