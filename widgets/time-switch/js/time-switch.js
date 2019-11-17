/*
	ioBroker.vis time-switch Widget-Set

	version: "0.0.1"

	Copyright 2019 walli545 walli5446@gmail.com
*/
'use strict';

import { ScheduleWidget } from './ScheduleWidget.js';

// add translations for edit mode
$.get('adapter/time-switch/words.js', function(script) {
	let translation = script.substring(script.indexOf('{'), script.length);
	translation = translation.substring(0, translation.lastIndexOf(';'));
	$.extend(systemDictionary, JSON.parse(translation));
});

// export vis binds for widget
vis.binds['time-switch'] = {
	version: '0.0.1',
	showVersion: showVersion,
	createWidget: createWidget,
	scheduleWidgets: [],
	onDataIdChange: onDataIdChange,
	onStateIdChange: onStateIdChange,
};
vis.binds['time-switch'].showVersion();

function showVersion() {
	if (vis.binds['time-switch'].version) {
		console.log('Version time-switch: ' + vis.binds['time-switch'].version);
	}
}

function createWidget(widgetId, view, data, style) {
	console.debug(`Create widget ${widgetId}`);
	const widgetElement = document.querySelector(`#${widgetId}`);
	if (!widgetElement) {
		console.warn('Widget not found, waiting ...');
		return setTimeout(function() {
			vis.binds['time-switch'].createWidget(widgetId, view, data, style);
		}, 100);
	}

	if (!data.dataId) {
		console.error(`Can not create widget ${widgetId} because dataId not set!`);
		return;
	}
	const widget = new ScheduleWidget(widgetId, data.dataId, vis);
	widget.subscribeOnDelete(onDeleteAction);
	widget.subscribeOnUpdate(onUpdateAction);
	getInitialData(widget, data);
	subscribeToChanges(widget, data);
	vis.binds['time-switch'].scheduleWidgets.push(widget);
	widgetElement.querySelector('.button.add').addEventListener('click', () => {
		const currentActions = widget.scheduledActions;
		let id = Math.max(...currentActions.map(a => Number.parseInt(a.id))) + 1;
		if (!Number.isFinite(id)) {
			id = 0;
		}
		currentActions.push({
			type: 'setStateValueAction',
			id: String(id),
			valueType: 'boolean',
			idOfStateToSet: data.stateId,
			valueToSet: false,
			trigger: {
				type: 'time',
				hour: '0',
				minute: '0',
				weekdays: [0, 1, 2, 3, 4, 5, 6],
			},
		});
		changeActions(widget, currentActions);
	});
	widgetElement.querySelector('#enabled').addEventListener('click', () => {
		widget.setEnabled(!widget.enabled);
		changeEnabled(widget, widget.enabled);
	});
	widgetElement.querySelector('#current-value').addEventListener('click', () => {
		const toggle = widgetElement.querySelector('#current-value');
		toggle.classList.toggle('checked');
		vis.conn.setState(data.attr('stateId'), toggle.classList.contains('checked'));
	});
}

function onDataIdChange(widgetId, view, newId, attr, isCss, oldId) {
	console.log(`onDataIdChange ${widgetId} ${view} ${newId} ${oldId}`);
	vis.views[view].widgets[widgetId].data.oid1 = newId;
}

function onStateIdChange(widgetId, view, newId, attr, isCss, oldId) {
	console.log(`onStateIdChange ${widgetId} ${view} ${newId} ${oldId}`);
	vis.views[view].widgets[widgetId].data.oid2 = newId;
}

function onDeleteAction(widget, actionId) {
	const currentActions = widget.scheduledActions;
	const newActions = currentActions.filter(a => a.id != actionId);
	changeActions(widget, newActions);
}

function onUpdateAction(widget, action) {
	const actions = widget.scheduledActions;
	const index = actions.findIndex(a => a.id === action.id);
	actions[index] = action;
	changeActions(widget, actions);
}

function changeActions(widget, newActions) {
	vis.conn.setState(
		`${widget.scheduleDataId}`,
		JSON.stringify({
			actions: newActions,
			enabled: widget.enabled,
			alias: widget.alias,
		}),
	);
}

function changeEnabled(widget, enabled) {
	vis.conn.setState(
		`${widget.scheduleDataId}`,
		JSON.stringify({
			actions: widget.scheduledActions,
			enabled: enabled,
			alias: widget.alias,
		}),
	);
}

function getInitialData(widget, data) {
	const scheduleData = JSON.parse(vis.states[`${widget.scheduleDataId}.val`]);
	widget.setScheduledActions(scheduleData.actions);
	widget.setAlias(scheduleData.alias);
	widget.setEnabled(scheduleData.enabled);
	const stateVal = vis.states[data.attr('stateId') + '.val'];
	document
		.querySelector(`#${widget.widgetId}`)
		.querySelector('#current-value')
		.classList.toggle('checked', stateVal);
}

function subscribeToChanges(widget, data) {
	vis.states.bind(`${widget.scheduleDataId}.val`, function(e, newVal) {
		const scheduleData = JSON.parse(newVal);
		widget.setScheduledActions(scheduleData.actions);
		widget.setAlias(scheduleData.alias);
		widget.setEnabled(scheduleData.enabled);
	});
	vis.states.bind(data.attr('stateId') + '.val', function(ev, newValue) {
		document
			.querySelector(`#${widget.widgetId}`)
			.querySelector('#current-value')
			.classList.toggle('checked', newValue);
	});
}
