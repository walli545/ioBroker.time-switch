import { cancelJob, Job, RecurrenceRule, scheduleJob } from 'node-schedule';
import { TimeTrigger } from '../triggers/TimeTrigger';
import { Trigger } from '../triggers/Trigger';
import { TriggerScheduler } from './TriggerScheduler';
import { LoggingService } from '../services/LoggingService';

export class TimeTriggerScheduler extends TriggerScheduler {
	constructor(private logger?: LoggingService) {
		super();
	}

	private registered: [TimeTrigger, Job][] = [];

	public register(trigger: TimeTrigger): void {
		if (this.getAssociatedJob(trigger)) {
			throw new Error('Trigger is already registered.');
		}
		this.logger?.logDebug(
			`Scheduling trigger at ${trigger.getHour()}:${trigger.getMinute()} on ${trigger.getWeekdays()}`,
		);
		const newJob = scheduleJob(this.createRecurrenceRule(trigger), () => {
			this.logger?.logDebug(`Executing trigger with id ${trigger.getId()}`);
			trigger.getAction().execute();
		});
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

	public getRegistered(): TimeTrigger[] {
		return this.registered.map(r => r[0]);
	}

	public forType(): string {
		return TimeTrigger.prototype.constructor.name;
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
