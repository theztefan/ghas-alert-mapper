import { Octokit } from '@octokit/core';
declare const MyOctokitWithPlugins: typeof Octokit & import("@octokit/core/dist-types/types").Constructor<{
    paginate: import("@octokit/plugin-paginate-rest").PaginateInterface;
}> & import("@octokit/core/dist-types/types").Constructor<import("@octokit/plugin-rest-endpoint-methods").Api> & import("@octokit/core/dist-types/types").Constructor<{}>;
export interface MyOctokitOptions {
    auth?: string;
    baseUrl?: string;
}
export declare class MyOctokit extends MyOctokitWithPlugins {
    constructor(options?: MyOctokitOptions);
}
export {};
