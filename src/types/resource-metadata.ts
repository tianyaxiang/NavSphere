export type ResourceMetadata = {
    commit: string;
    generated: string;
    metadata: Array<{
        commit: string;
        hash: string;
        path: string;
    }>;
}; 