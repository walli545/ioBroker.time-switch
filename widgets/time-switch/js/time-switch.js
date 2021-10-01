/*
	ioBroker.vis time-switch Widget-Set

	version: "2.3.0-pre.1"

	Copyright 2019-2020 walli545 walli5446@gmail.com
*/
'use strict';

// add translations for edit mode
const iobSystemDic = systemDictionary;
let timeSwitchDic;
$.get('../time-switch.admin/words.js', function (script) {
	let translation = script.substring(script.indexOf('{'), script.length);
	translation = translation.substring(0, translation.lastIndexOf(';'));
	timeSwitchDic = JSON.parse(translation);
	$.extend(systemDictionary, iobSystemDic);
	$.extend(systemDictionary, timeSwitchDic);
});

// export vis binds for widget
vis.binds['time-switch'] = {
	version: '2.3.0-pre.1',
	showVersion: showVersion,
	createOnOffWidget: createOnOffWidget,
	onOffScheduleWidgets: {},
	onDataIdChange: onDataIdChange,
	onStateIdChange: onStateIdChange,
	onConditionStateIdChange: onConditionStateIdChange,
	getConditionStateIdsAndAlias: getConditionStateIdsAndAlias,
	getElementNameForTriggerType: getElementNameForTriggerType,
	getElementNameForActionType: getElementNameForActionType,
	sendMessage: sendMessage,
	translate: translate,
	addConditionToAction: addConditionToAction,
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

function translate(word) {
	return translateWord(word, systemLang, timeSwitchDic);
}

function createOnOffWidget(widgetId, view, data, style) {
	console.debug(`Create on/off widget ${widgetId}`);
	console.log(data);
	const widgetElement = document.querySelector(`#${widgetId}`);
	if (!widgetElement) {
		console.warn('Widget not found, waiting ...');
		return setTimeout(function () {
			vis.binds['time-switch'].createOnOffWidget(widgetId, view, data, style);
		}, 100);
	}

	if (!validateOnOffWidgetSettings(widgetElement, data)) {
		return;
	}
	const element = document.createElement('app-on-off-schedule-widget');
	element.setAttribute('widgetid', widgetId);
	element.style.setProperty('--ts-widget-astro-icon-display', data.useAstroIcons ? 'inline' : 'none');
	element.style.setProperty('--ts-widget-astro-text-display', data.useAstroIcons ? 'none' : 'inline');
	widgetElement.appendChild(element);
}

function validateOnOffWidgetSettings(widgetElement, data) {
	if (!data.dataId) {
		showWarningInWidget(widgetElement, 'needToSelectDataId');
		return false;
	}
	if (!(data.dataId.startsWith('time-switch.0.onoff') && data.dataId.endsWith('data'))) {
		showWarningInWidget(widgetElement, 'needToSelectValidDataId');
		return false;
	}
	if (!data.stateId1) {
		showWarningInWidget(widgetElement, 'needToSelectStateId');
		return false;
	}
	if (data.valueType === 'number') {
		if (Number.isNaN(Number.parseFloat(data.onValue))) {
			showWarningInWidget(widgetElement, 'needToEnterValidNumberOn');
			return false;
		}
		if (Number.isNaN(Number.parseFloat(data.offValue))) {
			showWarningInWidget(widgetElement, 'needToEnterValidNumberOff');
			return false;
		}
	} else if (data.valueType === 'string') {
		if (data.onValue === undefined || data.offValue === undefined || data.onValue === '' || data.offValue === '') {
			showWarningInWidget(widgetElement, 'needToEnterValidStringValue');
			return false;
		}
	}
	return true;
}

function showWarningInWidget(widgetElement, warning) {
	const p = document.createElement('p');
	p.textContent = vis.binds['time-switch'].translate(warning);
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

function onConditionStateIdChange(widgetId, view, newId, attr, isCss, oldId) {
	const conditionStateIds = getConditionStateIdsAndAlias(widgetId, view).map((i) => i.id);
	for (let i = 0; i < conditionStateIds.length; i++) {
		vis.views[view].widgets[widgetId].data[`oid${i + 4}`] = conditionStateIds[i];
	}
}

function getConditionStateIdsAndAlias(widgetId) {
	const data = vis.widgets[widgetId].data;
	const count = Number.parseInt(data.conditionStatesCount, 10);
	const ids = [];
	for (let i = 1; i <= count; i++) {
		const id = data[`conditionStateId${i}`];
		if (id !== undefined && id !== '') {
			ids.push({ id: id, alias: data[`conditionStateAlias${i}`] });
		}
	}
	return ids;
}

function addConditionToAction(action, widgetId) {
	if (action.type === 'OnOffStateAction') {
		const conditionAction = {
			type: 'ConditionAction',
			condition: {
				type: 'StringStateAndConstantCondition',
				constant: 'true',
				stateId: getConditionStateIdsAndAlias(widgetId)[0].id,
				sign: '==',
			},
			action: action,
		};
		return conditionAction;
	}
	return null;
}

function getElementNameForTriggerType(type) {
	if (type === 'TimeTrigger') {
		return 'app-time-trigger';
	} else if (type === 'AstroTrigger') {
		return 'app-astro-trigger';
	} else {
		throw Error('No widget for trigger found');
	}
}

function getElementNameForActionType(type) {
	if (type === 'OnOffStateAction') {
		return 'app-on-off-state-action';
	} else if (type === 'ConditionAction') {
		return 'app-condition-action';
	} else {
		throw Error('No widget for action found');
	}
}
