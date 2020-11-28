export interface Condition {
	evaluate(): Promise<boolean>;
}
