import { Matches } from './types/common/main.d';
export declare const saveReport: (reportPath: string, content: string) => void;
export declare const generateReport: (matches: Matches[], originalRepository: string, targetRepository: string, originalEndpoint: string, targetEndpoint: string, dryRun: boolean, alertTypes: string[], matchingLevel: string, timestamp: string) => string;
