"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const main_1 = require("../main");
const OnOffSchedule_1 = require("../schedules/OnOffSchedule");
const AstroTime_1 = require("../triggers/AstroTime");
const AstroTriggerBuilder_1 = require("../triggers/AstroTriggerBuilder");
const TimeTriggerBuilder_1 = require("../triggers/TimeTriggerBuilder");
const Weekday_1 = require("../triggers/Weekday");
class MessageService {
    constructor(stateService, logger, scheduleIdToSchedule, createOnOffScheduleSerializer) {
        this.stateService = stateService;
        this.logger = logger;
        this.scheduleIdToSchedule = scheduleIdToSchedule;
        this.createOnOffScheduleSerializer = createOnOffScheduleSerializer;
        this.currentMessage = null;
    }
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentMessage) {
                setTimeout(() => this.handleMessage(message), 50);
                return;
            }
            this.currentMessage = message;
            const data = message.message;
            this.logger.logDebug(`Received ${message.command}`);
            this.logger.logDebug(JSON.stringify(message.message));
            const schedule = this.scheduleIdToSchedule.get(data.dataId);
            if (!schedule) {
                throw new Error('No schedule found for state ' + data.dataId);
            }
            switch (message.command) {
                case 'add-trigger':
                    yield this.addTrigger(schedule, data);
                    break;
                case 'add-one-time-trigger':
                    yield this.addOneTimeTrigger(schedule, data);
                    break;
                case 'update-trigger':
                    yield this.updateTrigger(schedule, JSON.stringify(data.trigger), data.dataId);
                    break;
                case 'delete-trigger':
                    schedule.removeTrigger(data.triggerId);
                    break;
                case 'change-name':
                    schedule.setName(data.name);
                    break;
                case 'enable-schedule':
                    schedule.setEnabled(true);
                    yield this.stateService.setState(main_1.TimeSwitch.getEnabledIdFromScheduleId(data.dataId), true);
                    break;
                case 'disable-schedule':
                    schedule.setEnabled(false);
                    yield this.stateService.setState(main_1.TimeSwitch.getEnabledIdFromScheduleId(data.dataId), false);
                    break;
                case 'change-switched-values':
                    this.changeOnOffSchedulesSwitchedValues(schedule, data);
                    break;
                case 'change-switched-ids':
                    this.changeOnOffSchedulesSwitchedIds(schedule, data.stateIds);
                    break;
                default:
                    throw new Error('Unknown command received');
            }
            if (schedule instanceof OnOffSchedule_1.OnOffSchedule) {
                yield this.stateService.setState(data.dataId, (yield this.createOnOffScheduleSerializer(data.dataId)).serialize(schedule));
            }
            else {
                throw new Error('Cannot update schedule state after message, no serializer found for schedule');
            }
            this.logger.logDebug('Finished message ' + message.command);
            this.currentMessage = null;
        });
    }
    addTrigger(schedule, data) {
        let triggerBuilder;
        if (data.triggerType === 'TimeTrigger') {
            this.logger.logDebug('Wants TimeTrigger');
            triggerBuilder = new TimeTriggerBuilder_1.TimeTriggerBuilder().setHour(0).setMinute(0);
        }
        else if (data.triggerType === 'AstroTrigger') {
            this.logger.logDebug('Wants AstroTrigger');
            triggerBuilder = new AstroTriggerBuilder_1.AstroTriggerBuilder().setAstroTime(AstroTime_1.AstroTime.Sunrise).setShift(0);
        }
        else {
            throw new Error(`Cannot add trigger of type ${data.triggerType}`);
        }
        triggerBuilder.setWeekdays(Weekday_1.AllWeekdays).setId(this.getNextTriggerId(schedule.getTriggers()));
        if (data.actionType === 'OnOffStateAction' && schedule instanceof OnOffSchedule_1.OnOffSchedule) {
            this.logger.logDebug('Wants OnOffStateAction');
            triggerBuilder.setAction(schedule.getOnAction());
        }
        else {
            throw new Error(`Cannot add trigger with action of type ${data.actionType}`);
        }
        schedule.addTrigger(triggerBuilder.build());
    }
    addOneTimeTrigger(schedule, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const t = JSON.parse(data.trigger);
            t.id = this.getNextTriggerId(schedule.getTriggers());
            const trigger = (yield this.createOnOffScheduleSerializer(data.dataId))
                .getTriggerSerializer(schedule)
                .deserialize(JSON.stringify(t));
            schedule.addTrigger(trigger);
        });
    }
    updateTrigger(schedule, triggerString, dataId) {
        return __awaiter(this, void 0, void 0, function* () {
            let updated;
            if (schedule instanceof OnOffSchedule_1.OnOffSchedule) {
                updated = (yield this.createOnOffScheduleSerializer(dataId))
                    .getTriggerSerializer(schedule)
                    .deserialize(triggerString);
            }
            else {
                throw new Error(`Can not deserialize trigger for schedule of type ${typeof schedule}`);
            }
            schedule.updateTrigger(updated);
        });
    }
    changeOnOffSchedulesSwitchedValues(schedule, data) {
        if (!(schedule instanceof OnOffSchedule_1.OnOffSchedule)) {
            throw new Error('Cannot change switched values when schedule type is not OnOffSchedule');
        }
        schedule.setOnAction(this.changeSwitchedValueOfOnOffScheduleAction(schedule.getOnAction(), data));
        schedule.setOffAction(this.changeSwitchedValueOfOnOffScheduleAction(schedule.getOffAction(), data));
    }
    changeOnOffSchedulesSwitchedIds(schedule, stateIds) {
        if (!(schedule instanceof OnOffSchedule_1.OnOffSchedule)) {
            throw new Error('Cannot change switched ids when schedule type is not OnOffSchedule');
        }
        schedule.getOnAction().setIdsOfStatesToSet(stateIds);
        schedule.getOffAction().setIdsOfStatesToSet(stateIds);
    }
    changeSwitchedValueOfOnOffScheduleAction(action, data) {
        switch (data.valueType) {
            case 'boolean':
                return action.toBooleanValueType();
                break;
            case 'number':
                return action.toNumberValueType(data.onValue, data.offValue);
                break;
            case 'string':
                return action.toStringValueType(data.onValue, data.offValue);
                break;
            default:
                throw new Error(`Value Type ${data.valueType} not supported`);
        }
    }
    getNextTriggerId(current) {
        const numbers = current
            .map((t) => t.getId())
            .map((id) => Number.parseInt(id, 10))
            .filter((id) => !Number.isNaN(id))
            .sort((a, b) => a - b);
        let newId = 0;
        for (let i = 0; i < numbers.length; i++) {
            if (numbers[i] > newId) {
                break;
            }
            else {
                newId++;
            }
        }
        return newId.toString();
    }
}
exports.MessageService = MessageService;
