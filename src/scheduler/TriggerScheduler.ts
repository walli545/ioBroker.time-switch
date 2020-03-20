import { Trigger } from '../triggers/Trigger';

export abstract class TriggerScheduler {
	abstract register(trigger: Trigger, onTrigger: () => void): void;

	abstract unregister(trigger: Trigger): void;
}
