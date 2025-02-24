import { MyOctokit } from './MyOctokit';
import { SecretScanningAlert, Matches } from './types/common/main.d';
export declare const fetchSecretScanningAlerts: (octokit: InstanceType<typeof MyOctokit>, owner: string, repo: string) => Promise<SecretScanningAlert[]>;
export declare const mapSecretScanningAlerts: (originalAlerts: SecretScanningAlert[], targetAlerts: SecretScanningAlert[], matchingLevel: string) => Matches[];
export declare const updateSecretScanningAlerts: (matches: Matches[], targetOctokit: InstanceType<typeof MyOctokit>, owner: string, repo: string, dryRun: boolean) => Promise<void>;
