import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { resolveDemoRequest } from "./mock-api";

export const demoAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const data = resolveDemoRequest(config);

    return {
        data,
        status: 200,
        statusText: "OK",
        headers: {},
        config,
    };
};
