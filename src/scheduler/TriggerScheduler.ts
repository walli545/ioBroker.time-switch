import { Trigger } from '../triggers/Trigger';
import { Destroyable } from '../Destroyable';

export abstract class TriggerScheduler implements Destroyable {
	abstract register(trigger: Trigger): void;

	abstract unregister(trigger: Trigger): void;

	abstract forType(): string;

	abstract destroy(): void;
}
