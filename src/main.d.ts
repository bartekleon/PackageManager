export declare class PackageManager {
    private readonly argv?;
    private config;
    constructor(argv?: string[] | undefined);
    run(): Promise<void>;
    private readonly checkPackage;
    private readonly checkDependencies;
}
declare const Run: () => Promise<void>;
export { Run };
