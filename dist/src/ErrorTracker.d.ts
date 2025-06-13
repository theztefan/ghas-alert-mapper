export declare class ErrorTracker {
    private errors;
    addError(error: string): void;
    hasErrors(): boolean;
    getErrors(): string[];
    getErrorCount(): number;
    getErrorMessages(): string;
    setOutputs(): void;
}
