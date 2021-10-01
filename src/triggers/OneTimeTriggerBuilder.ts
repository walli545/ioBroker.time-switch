import { Action } from '../actions/Action';
import { Builder } from '../Builder';
import { OneTimeTrigger } from './OneTimeTrigger';

export class OneTimeTriggerBuilder implements Builder<OneTimeTrigger> {
	private action: Action | null = null;
	private id = '0';
	private date: Date | null = null;
	private onDestroy: (() => void) | null = null;

	public setAction(action: Action): OneTimeTriggerBuilder {
		this.action = action;
		return this;
	}

	public setId(id: string): OneTimeTriggerBuilder {
		this.id = id;
		return this;
	}

	public setDate(date: Date): OneTimeTriggerBuilder {
		this.date = date;
		return this;
	}

	public setOnDestroy(onDestroy: () => void): OneTimeTriggerBuilder {
		this.onDestroy = onDestroy;
		return this;
	}

	public build(): OneTimeTrigger {
		return new OneTimeTrigger(this.id, this.action as any, this.date as any, this.onDestroy);
	}
}
