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
	onOnValueChange: onOnValueChange,
	onOffValueChange: onOffValueChange,
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
		console.error(`Can not create widget ${widgetId} because dataId is not set!`);
		return;
	}
	const widget = new ScheduleWidget(widgetId, data.dataId, vis);
	widget.subscribeOnDelete(onDeleteAction);
	widget.subscribeOnUpdate(onUpdateAction);
	getInitialData(widget, data);
	subscribeToChanges(widget, data);
	vis.binds['time-switch'].scheduleWidgets.push(widget);
	widgetElement.querySelector('.button.add').addEventListener('click', () => {
		addAction(widget, data.stateId);
	});
	widgetElement.querySelector('#enabled').addEventListener('click', () => {
		widget.setEnabled(!widget.enabled);
		changeEnabled(widget, widget.enabled);
	});
	widgetElement.querySelector('#current-value').addEventListener('click', () => {
		const toggle = widgetElement.querySelector('#current-value');
		toggle.classList.toggle('checked');
		vis.conn.setState(data.attr('stateId'), toggle.classList.contains('checked') ? data.onValue : data.offValue);
	});
}

/**
 * Gets triggered by vis editor when dataId value changes.
 */
function onDataIdChange(widgetId, view, newId, attr, isCss, oldId) {
	console.log(`onDataIdChange ${widgetId} ${view} ${newId} ${oldId}`);
	vis.views[view].widgets[widgetId].data.oid1 = newId;
}

/**
 * Gets triggered by vis editor when stateId value changes.
 */
function onStateIdChange(widgetId, view, newId, attr, isCss, oldId) {
	console.log(`onStateIdChange ${widgetId} ${view} ${newId} ${oldId}`);
	vis.views[view].widgets[widgetId].data.oid2 = newId;
	if (oldId === newId) return;
	const widget = vis.binds['time-switch'].scheduleWidgets.find(w => w.widgetId === widgetId);
	const scheduleData = JSON.parse(vis.states[`${widget.scheduleDataId}.val`]);
	const actions = scheduleData.actions;
	for (let i = 0; i < actions.length; i++) {
		actions[i].idOfStateToSet = newId;
	}
	vis.conn.setState(`${widget.scheduleDataId}`, JSON.stringify(scheduleData));
}

/**
 * Gets triggered by vis editor when offValue value changes.
 */
function onOffValueChange(widgetId, view, newValue, attr, isCss, oldValue) {
	console.log(`onOffValueChange ${widgetId} ${view} ${newValue} ${oldValue}`);
	updateSwitchedValues(newValue, oldValue, widgetId);
}

/**
 * Gets triggered by vis editor when onValue value changes.
 */
function onOnValueChange(widgetId, view, newValue, attr, isCss, oldValue) {
	console.log(`onOnValueChange ${widgetId} ${view} ${newValue} ${oldValue}`);
	updateSwitchedValues(newValue, oldValue, widgetId);
}

/**
 * Updates valueToSet of actions when onValue or offValue changes.
 */
function updateSwitchedValues(newValue, oldValue, widgetId) {
	if (oldValue === newValue) return;
	const widget = vis.binds['time-switch'].scheduleWidgets.find(w => w.widgetId === widgetId);
	const scheduleData = JSON.parse(vis.states[`${widget.scheduleDataId}.val`]);
	const actions = scheduleData.actions;
	for (let i = 0; i < actions.length; i++) {
		if (actions[i].valueToSet === oldValue) {
			actions[i].valueToSet = newValue;
		}
	}
	vis.conn.setState(`${widget.scheduleDataId}`, JSON.stringify(scheduleData));
}

/**
 * Gets triggered by an actions delete button.
 */
function onDeleteAction(widget, actionId) {
	const currentActions = widget.scheduledActions;
	const newActions = currentActions.filter(a => a.id != actionId);
	changeActions(widget, newActions);
}

/**
 * Gets triggered by an actions safe button.
 */
function onUpdateAction(widget, action) {
	const actions = widget.scheduledActions;
	const index = actions.findIndex(a => a.id === action.id);
	actions[index] = action;
	changeActions(widget, actions);
}

function addAction(widget, stateId) {
	const currentActions = widget.scheduledActions;
	let id = Math.max(...currentActions.map(a => Number.parseInt(a.id))) + 1;
	if (!Number.isFinite(id)) {
		id = 0;
	}
	currentActions.push({
		type: 'setStateValueAction',
		id: String(id),
		valueType: 'string',
		idOfStateToSet: stateId,
		valueToSet: false,
		trigger: {
			type: 'time',
			hour: '0',
			minute: '0',
			weekdays: [0, 1, 2, 3, 4, 5, 6],
		},
	});
	changeActions(widget, currentActions);
}

function changeActions(widget, newActions) {
	vis.conn.setState(
		`${widget.scheduleDataId}`,
		JSON.stringify({
			actions: mapSwitchedValuesToCustomValues(newActions, widget.widgetId),
			enabled: widget.enabled,
			alias: widget.alias,
		}),
	);
}

function changeEnabled(widget, enabled) {
	vis.conn.setState(
		`${widget.scheduleDataId}`,
		JSON.stringify({
			actions: mapSwitchedValuesToCustomValues(widget.scheduledActions, widget.widgetId),
			enabled: enabled,
			alias: widget.alias,
		}),
	);
}

function mapSwitchedValuesToCustomValues(actions, widgetId) {
	for (let i = 0; i < actions.length; i++) {
		actions[i].valueToSet =
			actions[i].valueToSet === true ? vis.widgets[widgetId].data.onValue : vis.widgets[widgetId].data.offValue;
	}
	return actions;
}

function mapSwitchedValuesToBooleans(actions, widgetId) {
	for (let i = 0; i < actions.length; i++) {
		actions[i].valueToSet = actions[i].valueToSet === vis.widgets[widgetId].data.onValue;
	}
	return actions;
}

function getInitialData(widget, data) {
	const scheduleData = JSON.parse(vis.states[`${widget.scheduleDataId}.val`]);
	widget.setScheduledActions(mapSwitchedValuesToBooleans(scheduleData.actions, widget.widgetId));
	widget.setAlias(scheduleData.alias);
	widget.setEnabled(scheduleData.enabled);
	const stateVal = vis.states[data.attr('stateId') + '.val'] === data.onValue;
	document
		.querySelector(`#${widget.widgetId}`)
		.querySelector('#current-value')
		.classList.toggle('checked', stateVal);
}

function subscribeToChanges(widget, data) {
	vis.states.bind(`${widget.scheduleDataId}.val`, function(e, newVal) {
		const scheduleData = JSON.parse(newVal);
		widget.setScheduledActions(mapSwitchedValuesToBooleans(scheduleData.actions, widget.widgetId));
		widget.setAlias(scheduleData.alias);
		widget.setEnabled(scheduleData.enabled);
	});
	vis.states.bind(data.attr('stateId') + '.val', function(ev, newValue) {
		document
			.querySelector(`#${widget.widgetId}`)
			.querySelector('#current-value')
			.classList.toggle('checked', newValue === data.onValue);
	});
}
