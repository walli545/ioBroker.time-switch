import { StateService } from './StateService';

export class IoBrokerStateService implements StateService {
	private adapter: ioBroker.Adapter;

	constructor(adapter: ioBroker.Adapter) {
		if (!adapter) {
			throw new Error('adapter may not be null.');
		}
		this.adapter = adapter;
	}

	setState(id: string, value: string | number) {
		if (id == null || id.length === 0) {
			throw new Error('id may not be null or empty.');
		}
		this.adapter.setState(id, value);
	}
}
