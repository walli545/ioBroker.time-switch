import { Trigger } from '../triggers/Trigger';

export interface Action {
	execute(): void;

	getId(): string;

	getTrigger(): Trigger;
}
