import { MyOctokit } from './MyOctokit';
import { SecretScanningAlert, Matches } from './types/common/main.d';
import { ErrorTracker } from './ErrorTracker';
export declare const fetchSecretScanningAlerts: (octokit: InstanceType<typeof MyOctokit>, owner: string, repo: string, errorTracker: ErrorTracker) => Promise<SecretScanningAlert[]>;
export declare const mapSecretScanningAlerts: (originalAlerts: SecretScanningAlert[], targetAlerts: SecretScanningAlert[], matchingLevel: string) => Matches[];
export declare const updateSecretScanningAlerts: (matches: Matches[], targetOctokit: InstanceType<typeof MyOctokit>, owner: string, repo: string, dryRun: boolean, errorTracker: ErrorTracker) => Promise<void>;
