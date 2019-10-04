/*
	ioBroker.vis time-switch Widget-Set

	version: "0.0.1"

	Copyright 2019 walli545 walli5446@gmail.com
*/
'use strict';

import {TobiTest} from "./Tesclass.js";

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
	actionsByWidgetId: new can.List([]),
};
vis.binds['time-switch'].showVersion();

let deviceId = null;
let actions = [];
let stateId = null;
let stateValue = null;
let stateType = null;
let dataRef = null;

function showVersion() {
	if (vis.binds['time-switch'].version) {
		console.log('Version time-switch: ' + vis.binds['time-switch'].version);
	}
}

function createWidget(widgetID, view, data, style) {
	console.debug(`Create widget ${widgetID}`);
	const widgetElement = document.querySelector(`#${widgetID}`);
	if (!widgetElement) {
		console.warn('Widget not found, waiting ...');
		return setTimeout(function() {
			vis.binds['time-switch'].createWidget(widgetID, view, data, style);
		}, 100);
	}

	if(!data.oid) {
		console.error('Oid not set');
		return;
	}
	dataRef = data;
	deviceId = data.oid;
	getInitialData();
	subscribeToChanges();
	// vis.conn.getStates(data.oid + '.id', (c, b) => {
	// 	console.log('got state ');
	// 	console.log(b[data.oid + '.id']);
	// 	vis.states.bind(b[data.oid + '.id'].val + '.val', function(e, newVal, oldVal) {
	// 		console.log('val change: ' + newVal);
	// 	});
	// });
}

function getInitialData() {
	vis.conn.getStates([
		`${deviceId}.id`,
		`${deviceId}.actions`
	], (_, states) => {
		stateId = states[`${deviceId}.id`].val;
		actions = JSON.parse(states[`${deviceId}.actions`].val);
		dataRef.attr('stateId', stateId);
		actions.forEach(a => vis.binds['time-switch'].actions.push(a));
		console.log('Initial stateId: ' + stateId);
		console.log('Initial actions: ' + actions);
	});
}

function subscribeToChanges() {
	vis.states.bind(`${deviceId}.actions.val`, function(e, newVal, oldVal) {
		console.log('actions change');
		actions = JSON.parse(newVal);
		clearActions();
		actions.forEach(a => vis.binds['time-switch'].actions.push(a));
		dataRef.attr('actions', actions);
	});
	vis.states.bind(`${deviceId}.id.val`, function(e, newVal, oldVal) {
		console.log('id change: ' + newVal);
		stateId = newVal;
		dataRef.attr('stateId', stateId);
	});
}

function clearActions() {
	const length = vis.binds['time-switch'].actions.attr("length");
	for (let i = 0; i < length; i++) {
		vis.binds['time-switch'].actions.pop();
	}
}