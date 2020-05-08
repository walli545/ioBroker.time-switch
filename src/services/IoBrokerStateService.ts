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

	setState(id: string, value: string | number | boolean): void {
		if (id == null || id.length === 0) {
			throw new Error('id may not be null or empty.');
		}
		this.adapter.setState(id, value, false);
	}

	setForeignState(id: string, value: string | number | boolean): void {
		if (id == null || id.length === 0) {
			throw new Error('id may not be null or empty.');
		}
		this.logger?.logDebug(`Setting state ${id} with value ${value?.toString()}`);
		this.adapter.setForeignState(id, value, false);
	}
}
