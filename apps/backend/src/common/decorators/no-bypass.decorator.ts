import { SetMetadata } from "@nestjs/common";

export const NO_BYPASS_KEY = "no_bypass";
export const NoBypass = () => SetMetadata(NO_BYPASS_KEY, true);
