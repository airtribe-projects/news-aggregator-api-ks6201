"use strict";
import { Validator } from "@d3vtool/utils";
import { CONSTANTS } from "../configs/constants.js";


export const newsIdValidator = Validator.object({
    id: Validator.string().requiredLength(CONSTANTS.newsIdLength),
});

export const newsKeywordValidator = Validator.object({
    keyword: Validator.string().minLength(1),
});