/*
	ioBroker.vis time-switch Widget-Set

	version: "1.1.0"

	Copyright 2019 walli545 walli5446@gmail.com
*/
'use strict';

// add translations for edit mode
$.get('../time-switch.admin/words.js', function(script) {
	let translation = script.substring(script.indexOf('{'), script.length);
	translation = translation.substring(0, translation.lastIndexOf(';'));
	$.extend(systemDictionary, JSON.parse(translation));
});

// export vis binds for widget
vis.binds['time-switch'] = {
	version: '1.1.0',
	showVersion: showVersion,
	createOnOffWidget: createOnOffWidget,
	onOffScheduleWidgets: {},
	onDataIdChange: onDataIdChange,
	onStateIdChange: onStateIdChange,
	sendMessage: sendMessage,
};
vis.binds['time-switch'].showVersion();

function showVersion() {
	if (vis.binds['time-switch'].version) {
		console.log('Version time-switch: ' + vis.binds['time-switch'].version);
	}
}

function sendMessage(cmd, data) {
	servConn._socket.emit('sendTo', 'time-switch', cmd, data);
}

function createOnOffWidget(widgetId, view, data, style) {
	console.debug(`Create on/off widget ${widgetId}`);
	console.log(data);
	const widgetElement = document.querySelector(`#${widgetId}`);
	if (!widgetElement) {
		console.warn('Widget not found, waiting ...');
		return setTimeout(function() {
			vis.binds['time-switch'].createOnOffWidget(widgetId, view, data, style);
		}, 100);
	}

	if (!validateOnOffWidgetSettings(widgetElement, data)) {
		return;
	}
	const element = document.createElement('app-on-off-schedule-widget');
	element.setAttribute('widgetid', widgetId);
	widgetElement.appendChild(element);
}

function validateOnOffWidgetSettings(widgetElement, data) {
	if (!data.dataId) {
		showWarningInWidget(widgetElement, 'Select a schedule data id to use the widget!');
		return false;
	}
	if (!(data.dataId.startsWith('time-switch.0.onoff') && data.dataId.endsWith('data'))) {
		showWarningInWidget(
			widgetElement,
			"Select a valid schedule data id (with pattern 'time-switch.0.onoff.*.data')!",
		);
		return false;
	}
	if (!data.stateId1) {
		showWarningInWidget(widgetElement, 'Set at least one switched state id to use the widget!');
		return false;
	}
	if (data.valueType === 'number') {
		if (Number.isNaN(Number.parseFloat(data.onValue))) {
			showWarningInWidget(widgetElement, 'Enter a valid number for switched on value when type is number!');
			return false;
		}
		if (Number.isNaN(Number.parseFloat(data.offValue))) {
			showWarningInWidget(widgetElement, 'Enter a valid number for switched off value when type is number!');
			return false;
		}
	} else if (data.valueType === 'string') {
		if (data.onValue === '' || data.offValue === '') {
			showWarningInWidget(widgetElement, 'On/Offvalue cannot be empty when type is string');
			return false;
		}
	}
	return true;
}

function showWarningInWidget(widgetElement, warning) {
	const p = document.createElement('p');
	p.textContent = warning;
	while (widgetElement.firstChild) {
		widgetElement.removeChild(widgetElement.firstChild);
	}
	widgetElement.appendChild(p);
}

/**
 * Gets triggered by vis editor when dataId value changes.
 */
function onDataIdChange(widgetId, view, newId, attr, isCss, oldId) {
	console.log(`onDataIdChange ${widgetId} ${view} ${newId} ${oldId}`);
	vis.views[view].widgets[widgetId].data.oid1 = newId;
	if (newId) {
		vis.views[view].widgets[widgetId].data.oid3 = newId.replace('data', 'enabled');
	}
}

/**
 * Gets triggered by vis editor when stateId value changes.
 */
function onStateIdChange(widgetId, view, newId, attr, isCss, oldId) {
	console.log(`onStateIdChange ${widgetId} ${view} ${newId} ${oldId}`);
	vis.views[view].widgets[widgetId].data.oid2 = newId;
}
