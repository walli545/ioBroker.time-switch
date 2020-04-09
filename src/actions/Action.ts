export interface Action {
	execute(): void;

	getId(): string;
}
