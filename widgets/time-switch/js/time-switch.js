/*
	ioBroker.vis time-switch Widget-Set

	version: "0.0.1"

	Copyright 2019 walli545 walli5446@gmail.com
*/
'use strict';

import {ScheduleWidget} from "./ScheduleWidget.js";

// add translations for edit mode
$.get('adapter/time-switch/words.js', function(script) {
	let translation = script.substring(script.indexOf('{'), script.length);
	translation = translation.substring(0, translation.lastIndexOf(';'));
	$.extend(systemDictionary, JSON.parse(translation));
});

// export vis binds for widget
vis.binds['time-switch'] = {
	version: '0.0.17',
	showVersion: showVersion,
	createWidget: createWidget,
	scheduleWidgets: [],
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

	if(!data.dataId) {
		console.error(`Can not create widget ${widgetId} because dataId not set!`);
		return;
	}
	const widget = new ScheduleWidget(widgetId, data.dataId, vis);
	widget.subscribeOnDelete(onDeleteAction);
	getInitialData(widget);
	subscribeToChanges(widget);
	vis.binds['time-switch'].scheduleWidgets.push(widget);
}

function onDeleteAction(widget, actionId) {
    console.log('delete action' + actionId);
    const currentActions = widget.scheduledActions;
    const newActions = currentActions.filter(a => a.id != actionId);
    vis.conn.setState(`${widget.scheduleDataId}.actions`, JSON.stringify(newActions));
}

function getInitialData(widget) {
	widget.setSwitchedStateId(vis.states[`${widget.scheduleDataId}.id.val`]);
	widget.setScheduledActions(JSON.parse(vis.states[`${widget.scheduleDataId}.actions.val`]));
	// if(vis.conn.gettingStates && vis.conn.gettingStates > 0) {
	// 	console.log('wait for getting of states (from ' + widget.scheduleDataId + ')');
	// 	return setTimeout(function() {
	// 		getInitialData(widget);
	// 	}, 100);
	// }
	//
	// vis.conn.getStates([
	// 	`${widget.scheduleDataId}.id`,
	// 	`${widget.scheduleDataId}.actions`
	// ], (_, states) => {
	// 	widget.setSwitchedStateId(states[`${widget.scheduleDataId}.id`].val);
	// 	widget.setScheduledActions(JSON.parse(states[`${widget.scheduleDataId}.actions`].val));
	// 	console.log('Initial widget data: ');
	// 	console.log(widget);
	// });
}

function subscribeToChanges(widget) {
	vis.states.bind(`${widget.scheduleDataId}.actions.val`, function(e, newVal, oldVal) {
		console.log('actions change');
		widget.setScheduledActions(JSON.parse(newVal));
	});
	vis.states.bind(`${widget.scheduleDataId}.id.val`, function(e, newVal, oldVal) {
		console.log('id change: ' + newVal);
        widget.setSwitchedStateId(newVal);
	});
}

