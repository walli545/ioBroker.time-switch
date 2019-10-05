/*
	ioBroker.vis time-switch Widget-Set

	version: "0.0.1"

	Copyright 2019 walli545 walli5446@gmail.com
*/
'use strict';

import {Schedule} from "./Schedule.js";

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
	scheduleByWidgetId: new Map(),
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

	if(!data.oid) {
		console.error('Oid not set');
		return;
	}
	const deviceId = data.oid;
	const schedule = {
		widgetId: widgetId,
    	deviceId: deviceId,
        stateId: null,
        actions: []
	};
	console.log(schedule);
	console.log(vis.binds['time-switch'].scheduleByWidgetId);
    vis.binds['time-switch'].scheduleByWidgetId.set(widgetId, schedule)
	getInitialData(schedule);
	subscribeToChanges(schedule);
}

function extractDeviceName(deviceId) {
	const indexOfLastDot = deviceId.lastIndexOf('.');
	return deviceId.substr(indexOfLastDot + 1);
}

function getInitialData(schedule) {
	if(vis.conn.gettingStates && vis.conn.gettingStates > 0) {
		console.log('wait for getting of states (from ' + schedule.deviceId + ')');
		return setTimeout(function() {
			getInitialData(schedule);
		}, 100);
	}

	vis.conn.getStates([
		`${schedule.deviceId}.id`,
		`${schedule.deviceId}.actions`
	], (_, states) => {
		console.group('getInitial Data');
		console.log(states);
		console.log(schedule.deviceId);
		console.groupEnd();
		schedule.stateId = states[`${schedule.deviceId}.id`].val;
		const actions = JSON.parse(states[`${schedule.deviceId}.actions`].val);
		actions.forEach(a => {
			schedule.actions.push(a)
			const actionListElement = document.createElement('li');
			actionListElement.textContent = a.text;
			document.querySelector(`#${schedule.widgetId} .actions`).appendChild(actionListElement);
		});
		console.log('Initial schedule: ');
		console.log(schedule);
		document.querySelector(`#${schedule.widgetId} .state-id`).textContent = schedule.stateId;
	});
}

function subscribeToChanges(schedule) {
	vis.states.bind(`${schedule.deviceId}.actions.val`, function(e, newVal, oldVal) {
		console.log('actions change');
		clearActions(schedule);
		const actions = JSON.parse(newVal);
		actions.forEach(a => {
			schedule.actions.push(a);
			const actionListElement = document.createElement('li');
			actionListElement.textContent = a.text;
			document.querySelector(`#${schedule.widgetId} .actions`).appendChild(actionListElement);
		});
	});
	vis.states.bind(`${schedule.deviceId}.id.val`, function(e, newVal, oldVal) {
		console.log('id change: ' + newVal);
        schedule.stateId = newVal;
		document.querySelector(`#${schedule.widgetId} .state-id`).textContent = schedule.stateId;
	});
}

function clearActions(schedule) {
    schedule.actions = [];
	const actionContainer = document.querySelector(`#${schedule.widgetId} .actions`);
	while (actionContainer.firstChild) {
		actionContainer.removeChild(actionContainer.firstChild);
	}
}