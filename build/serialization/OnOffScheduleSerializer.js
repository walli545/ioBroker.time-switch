"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnOffScheduleSerializer = void 0;
const OnOffSchedule_1 = require("../schedules/OnOffSchedule");
const OnOffStateAction_1 = require("../actions/OnOffStateAction");
const ActionReferenceSerializer_1 = require("./ActionReferenceSerializer");
class OnOffScheduleSerializer {
    constructor(triggerScheduler, actionSerializer, triggerSerializer) {
        this.triggerScheduler = triggerScheduler;
        this.actionSerializer = actionSerializer;
        this.triggerSerializer = triggerSerializer;
    }
    deserialize(stringToDeserialize) {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== this.getType()) {
            throw new Error(`Can not deserialize object of type ${json.type}`);
        }
        const onAction = this.actionSerializer.deserialize(JSON.stringify(json.onAction));
        const offAction = this.actionSerializer.deserialize(JSON.stringify(json.offAction));
        if (onAction instanceof OnOffStateAction_1.OnOffStateAction && offAction instanceof OnOffStateAction_1.OnOffStateAction) {
            const schedule = new OnOffSchedule_1.OnOffSchedule(onAction, offAction, this.triggerScheduler);
            schedule.setName(json.name);
            const oldActionSerializer = this.replaceActionSerializerWithReference(schedule);
            json.triggers.forEach((t) => {
                schedule.addTrigger(this.triggerSerializer.deserialize(JSON.stringify(t)));
            });
            this.actionSerializer.replaceSerializer(oldActionSerializer);
            return schedule;
        }
        else {
            throw new Error('Actions are not OnOffStateActions');
        }
    }
    serialize(schedule) {
        const json = {
            type: this.getType(),
            name: schedule.getName(),
            onAction: JSON.parse(this.actionSerializer.serialize(schedule.getOnAction())),
            offAction: JSON.parse(this.actionSerializer.serialize(schedule.getOffAction())),
        };
        const oldActionSerializer = this.replaceActionSerializerWithReference(schedule);
        json.triggers = schedule.getTriggers().map((t) => JSON.parse(this.triggerSerializer.serialize(t)));
        this.actionSerializer.replaceSerializer(oldActionSerializer);
        return JSON.stringify(json);
    }
    getType() {
        return 'OnOffSchedule';
    }
    replaceActionSerializerWithReference(schedule) {
        return this.actionSerializer.replaceSerializer(new ActionReferenceSerializer_1.ActionReferenceSerializer(OnOffStateAction_1.OnOffStateAction.prototype.constructor.name, new Map([
            ['On', schedule.getOnAction()],
            ['Off', schedule.getOffAction()],
        ])));
    }
}
exports.OnOffScheduleSerializer = OnOffScheduleSerializer;
