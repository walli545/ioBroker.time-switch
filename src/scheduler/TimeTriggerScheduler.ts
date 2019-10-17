import { cancelJob, Job, RecurrenceRule, scheduleJob } from 'node-schedule';
import { TimeTrigger } from '../triggers/TimeTrigger';
import { Trigger } from '../triggers/Trigger';
import { TriggerScheduler } from './TriggerScheduler';

export class TimeTriggerScheduler extends TriggerScheduler {
	private registered: [TimeTrigger, Job][] = [];

	public register(trigger: TimeTrigger, onTrigger: () => void): void {
		if (this.isRegistered(trigger)) {
			throw new Error('Trigger is already registered.');
		}
		const newJob = scheduleJob(this.createRecurrenceRule(trigger), () => {
			onTrigger();
		});
		this.registered.push([trigger, newJob]);
	}

	public unregister(trigger: TimeTrigger): void {
		if (this.isRegistered(trigger)) {
			const job = this.getAssociatedJob(trigger);
			cancelJob(job);
			this.removeTrigger(trigger);
		} else {
			throw new Error('Trigger is not registered.');
		}
	}

	private isRegistered(trigger: TimeTrigger): boolean {
		return this.registered.find(r => r[0] === trigger) != undefined;
	}

	private getAssociatedJob(trigger: TimeTrigger): Job {
		const entry = this.registered.find(r => r[0] === trigger);
		if (entry) {
			return entry[1];
		} else {
			throw new Error('Trigger not found.');
		}
	}

	private removeTrigger(trigger: Trigger) {
		this.registered = this.registered.filter(r => r[0] !== trigger);
	}

	private createRecurrenceRule(trigger: TimeTrigger): RecurrenceRule {
		const rule = new RecurrenceRule();
		rule.dayOfWeek = trigger.getWeekdays();
		rule.hour = trigger.getHour();
		rule.minute = trigger.getMinute();
		return rule;
	}
}
