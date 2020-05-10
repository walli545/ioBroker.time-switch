import { OnOffStateAction } from '../actions/OnOffStateAction';
import { Schedule } from './Schedule';
import { UniversalTriggerScheduler } from '../scheduler/UniversalTriggerScheduler';

export class OnOffSchedule extends Schedule {
	private onAction: OnOffStateAction<string | boolean | number>;
	private offAction: OnOffStateAction<string | boolean | number>;

	constructor(
		onAction: OnOffStateAction<string | boolean | number>,
		offAction: OnOffStateAction<string | boolean | number>,
		triggerScheduler: UniversalTriggerScheduler,
	) {
		super(triggerScheduler);
		if (onAction == null) {
			throw new Error(`onAction may not be null or undefined`);
		}
		if (offAction == null) {
			throw new Error(`offAction may not be null or undefined`);
		}
		this.onAction = onAction;
		this.offAction = offAction;
	}

	public setOnAction(onAction: OnOffStateAction<string | boolean | number>): void {
		if (onAction == null) {
			throw new Error(`onAction may not be null or undefined`);
		}
		this.onAction = onAction;
		this.getTriggers().forEach(t => {
			const action = t.getAction();
			if (action instanceof OnOffStateAction) {
				if (action.getBooleanValue()) {
					t.setAction(onAction);
				}
			}
		});
	}

	public setOffAction(offAction: OnOffStateAction<string | boolean | number>): void {
		if (offAction == null) {
			throw new Error(`offAction may not be null or undefined`);
		}
		this.offAction = offAction;
		this.getTriggers().forEach(t => {
			const action = t.getAction();
			if (action instanceof OnOffStateAction) {
				if (!action.getBooleanValue()) {
					t.setAction(offAction);
				}
			}
		});
	}

	public getOnAction(): OnOffStateAction<string | boolean | number> {
		return this.onAction;
	}

	public getOffAction(): OnOffStateAction<string | boolean | number> {
		return this.offAction;
	}
}
