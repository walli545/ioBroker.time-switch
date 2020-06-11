import { TriggerScheduler } from './TriggerScheduler';
import { Trigger } from '../triggers/Trigger';

export class UniversalTriggerScheduler {
	private readonly schedulers: TriggerScheduler[];

	constructor(schedulers: TriggerScheduler[]) {
		this.schedulers = schedulers;
	}

	public register(trigger: Trigger): void {
		const scheduler = this.schedulers.find((s) => s.forType() === trigger.constructor.name);
		if (scheduler) {
			return scheduler.register(trigger);
		} else {
			throw new Error(`No scheduler for trigger of type ${trigger.constructor.name} found`);
		}
	}

	public unregister(trigger: Trigger): void {
		const scheduler = this.schedulers.find((s) => s.forType() === trigger.constructor.name);
		if (scheduler) {
			return scheduler.unregister(trigger);
		} else {
			throw new Error(`No scheduler for trigger of type ${trigger.constructor.name} found`);
		}
	}

	public getRegistered(): Trigger[] {
		let registered: Trigger[] = [];
		this.schedulers.forEach((s) => {
			registered = registered.concat(s.getRegistered());
		});
		return registered;
	}

	public unregisterAll(): void {
		this.getRegistered().forEach((t) => {
			this.unregister(t);
		});
	}
}
