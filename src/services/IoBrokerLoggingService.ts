import { LoggingService } from './LoggingService';

export class IoBrokerLoggingService implements LoggingService {
	constructor(private adapter: ioBroker.Adapter) {}

	public logDebug(message: string): void {
		this.adapter.log.debug(message);
	}

	public logError(message: string): void {
		this.adapter.log.error(message);
	}

	public logInfo(message: string): void {
		this.adapter.log.info(message);
	}

	public logSilly(message: string): void {
		this.adapter.log.silly(message);
	}

	public logWarn(message: string): void {
		this.adapter.log.warn(message);
	}
}
