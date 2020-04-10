import { cancelJob, Job, RecurrenceRule, scheduleJob } from 'node-schedule';
import { TimeTrigger } from '../triggers/TimeTrigger';
import { Trigger } from '../triggers/Trigger';
import { TriggerScheduler } from './TriggerScheduler';

export class TimeTriggerScheduler extends TriggerScheduler {
	private registered: [TimeTrigger, Job][] = [];

	public register(trigger: TimeTrigger): void {
		if (this.getAssociatedJob(trigger)) {
			throw new Error('Trigger is already registered.');
		}
		const newJob = scheduleJob(this.createRecurrenceRule(trigger), trigger.getAction().execute);
		this.registered.push([trigger, newJob]);
	}

	public unregister(trigger: TimeTrigger): void {
		const job = this.getAssociatedJob(trigger)
		if (job) {
			cancelJob(job);
			this.removeTrigger(trigger);
		} else {
			throw new Error('Trigger is not registered.');
		}
	}

	private getAssociatedJob(trigger: TimeTrigger): Job | null {
		const entry = this.registered.find(r => r[0] === trigger);
		if (entry) {
			return entry[1];
		} else {
			return null;
		}
	}

	private removeTrigger(trigger: Trigger): void {
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