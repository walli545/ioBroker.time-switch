import { StateService } from './StateService';
import { LoggingService } from './LoggingService';

export class IoBrokerStateService implements StateService {
	private adapter: ioBroker.Adapter;

	constructor(adapter: ioBroker.Adapter, private logger?: LoggingService) {
		if (!adapter) {
			throw new Error('adapter may not be null.');
		}
		this.adapter = adapter;
	}

	setState(id: string, value: string | number | boolean, ack = true): void {
		this.checkId(id);
		this.adapter.setState(id, value, ack);
	}

	setForeignState(id: string, value: string | number | boolean): void {
		this.checkId(id);
		this.logger?.logDebug(`Setting state ${id} with value ${value?.toString()}`);
		this.adapter.setForeignState(id, value, false);
	}

	async getForeignState(id: string): Promise<any> {
		return new Promise((resolve, _) => {
			this.checkId(id);
			this.adapter.getForeignState(id, (err, state) => {
				if (err || state == null) {
					throw new Error(err || `Requested state ${id} returned null/undefined!`);
				}
				resolve(state.val);
			});
		});
	}

	private checkId(id: string): void {
		if (id == null || id.length === 0) {
			throw new Error('id may not be null or empty.');
		}
	}
}
