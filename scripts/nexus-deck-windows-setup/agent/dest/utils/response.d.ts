export declare function ok<T>(data: T): {
    success: boolean;
    data: T;
    error: null;
    timestamp: string;
};
export declare function fail(code: string, message: string): {
    success: boolean;
    data: null;
    error: {
        code: string;
        message: string;
    };
    timestamp: string;
};
//# sourceMappingURL=response.d.ts.map