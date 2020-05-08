import { Trigger } from '../triggers/Trigger';
import { UniversalTriggerScheduler } from '../scheduler/UniversalTriggerScheduler';

export abstract class Schedule {
	private enabled = false;
	private name = 'New Schedule';
	private triggers: Trigger[] = [];
	private readonly triggerScheduler: UniversalTriggerScheduler;

	protected constructor(triggerScheduler: UniversalTriggerScheduler) {
		if (triggerScheduler == null) {
			throw new Error(`triggerScheduler may not be null or undefined`);
		}
		this.triggerScheduler = triggerScheduler;
	}

	public setEnabled(enabled: boolean): void {
		if (enabled !== this.enabled) {
			if (enabled) {
				this.getTriggers().forEach(t => this.triggerScheduler.register(t));
			} else {
				this.triggerScheduler.unregisterAll();
			}
			this.enabled = enabled;
		}
	}

	public setName(name: string): void {
		if (name == null) {
			throw new Error(`name may not be null or undefined`);
		}
		this.name = name;
	}

	public isEnabled(): boolean {
		return this.enabled;
	}

	public getName(): string {
		return this.name;
	}

	public getTriggers(): Trigger[] {
		return this.triggers;
	}

	public addTrigger(trigger: Trigger): void {
		if (this.findTriggerById(trigger.getId())) {
			throw new Error(`Cannot add trigger, trigger id ${trigger.getId()} exists already`);
		} else {
			this.triggers.push(trigger);
			if (this.isEnabled()) {
				this.triggerScheduler.register(trigger);
			}
		}
	}

	public updateTrigger(trigger: Trigger): void {
		const index = this.getTriggers().findIndex(t => t.getId() === trigger.getId());
		if (index == -1) {
			throw new Error(`Cannot update trigger, trigger id ${trigger.getId()} not found`);
		} else {
			if (this.isEnabled()) {
				this.triggerScheduler.unregister(this.getTriggers()[index]);
				this.triggerScheduler.register(trigger);
			}
			this.triggers[index] = trigger;
		}
	}

	public removeTrigger(triggerId: string): void {
		const trigger = this.triggers.find(t => t.getId() === triggerId);
		if (trigger) {
			this.removeTriggerAndUnregister(trigger);
		} else {
			throw new Error(`Cannot delete trigger, trigger id ${triggerId} not found`);
		}
	}

	public removeAllTriggers(): void {
		if (this.isEnabled()) {
			this.triggerScheduler.unregisterAll();
		}
		this.triggers = [];
	}

	private removeTriggerAndUnregister(trigger: Trigger): void {
		if (this.isEnabled()) {
			this.triggerScheduler.unregister(trigger);
		}
		this.triggers = this.triggers.filter(t => t.getId() !== trigger.getId());
	}

	private findTriggerById(id: string): Trigger | undefined {
		return this.getTriggers().find(t => t.getId() === id);
	}
}
