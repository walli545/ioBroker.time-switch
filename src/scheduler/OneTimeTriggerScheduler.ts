import { Job, JobCallback } from 'node-schedule';
import { LoggingService } from '../services/LoggingService';
import { OneTimeTrigger } from '../triggers/OneTimeTrigger';
import { TriggerScheduler } from './TriggerScheduler';

export class OneTimeTriggerScheduler extends TriggerScheduler {
	private registered: [OneTimeTrigger, Job][] = [];

	constructor(
		private scheduleJob: (date: Date, callback: JobCallback) => Job,
		private cancelJob: (job: Job) => boolean,
		private logger: LoggingService,
	) {
		super();
	}

	public forType(): string {
		return OneTimeTrigger.prototype.constructor.name;
	}

	public register(trigger: OneTimeTrigger): void {
		if (this.getAssociatedJob(trigger)) {
			throw new Error('Trigger is already registered.');
		}
		this.logger.logDebug(`Scheduling trigger ${trigger}`);
		const newJob = this.scheduleJob(trigger.getDate(), () => {
			this.logger.logDebug(`Executing trigger ${trigger}`);
			trigger.getAction().execute();
		});
		this.registered.push([trigger, newJob]);
	}

	public unregister(trigger: OneTimeTrigger): void {
		const job = this.getAssociatedJob(trigger);
		if (job) {
			this.cancelJob(job);
			this.removeTrigger(trigger);
		} else {
			throw new Error('Trigger is not registered.');
		}
	}

	public destroy(): void {
		this.registered.forEach((r) => this.unregister(r[0]));
	}

	private getAssociatedJob(trigger: OneTimeTrigger): Job | null {
		const entry = this.registered.find((r) => r[0] === trigger);
		if (entry) {
			return entry[1];
		} else {
			return null;
		}
	}

	private removeTrigger(trigger: OneTimeTrigger): void {
		this.registered = this.registered.filter((r) => r[0] !== trigger);
	}
}
