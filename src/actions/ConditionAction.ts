import { Action } from './Action';
import { Condition } from './conditions/Condition';
import { LoggingService } from '../services/LoggingService';

export class ConditionAction implements Action {
	private readonly condition: Condition;
	private readonly action: Action;

	constructor(condition: Condition, action: Action, private logger?: LoggingService) {
		if (condition == null) {
			throw new Error('condition may not be null or undefined');
		}
		if (action == null) {
			throw new Error('action may not be null or undefined');
		}
		this.condition = condition;
		this.action = action;
	}

	public execute(): void {
		this.condition
			.evaluate()
			.then((result) => {
				if (result) {
					this.logger?.logDebug(`Executing action because condition ${this.condition} evaluated to true`);
					this.action.execute();
				} else {
					this.logger?.logDebug(
						`Not executing action because condition ${this.condition} evaluated to false`,
					);
				}
			})
			.catch((e) => {
				this.logger?.logError(`Error while evaluating condition: ${this.condition}, ${e}`);
			});
	}
}
