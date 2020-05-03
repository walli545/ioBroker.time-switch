export interface LoggingService {
	logInfo(message: string): void;
	logError(message: string): void;
	logDebug(message: string): void;
	logSilly(message: string): void;
	logWarn(message: string): void;
}
