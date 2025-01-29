import { Octokit } from '@octokit/core';
declare const MyOctokitWithPlugins: typeof Octokit & import("@octokit/core/types").Constructor<{
    paginate: import("@octokit/plugin-paginate-rest").PaginateInterface;
}> & import("@octokit/core/types").Constructor<import("@octokit/plugin-rest-endpoint-methods").Api> & import("@octokit/core/types").Constructor<{}>;
export interface MyOctokitOptions {
    auth?: string;
    baseUrl?: string;
}
export declare class MyOctokit extends MyOctokitWithPlugins {
    constructor(options?: MyOctokitOptions);
}
export {};
