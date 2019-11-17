export interface StateService {
	setState(id: string, value: string | number | boolean): void;
	setForeignState(id: string, value: string | number | boolean): void;
}
