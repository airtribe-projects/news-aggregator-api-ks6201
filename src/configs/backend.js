"use strict";

import { makeReadOnly } from "../libs/utils.js";


export const BACKEND = makeReadOnly({
    PROTOCOL: 'http',
    PORT: Number(process.env.PORT) || 3000,
    get DOMAIN() {
        return `localhost:${this.PORT}`
    },
    get URL() {
        return `${this.PROTOCOL}://${this.DOMAIN}`
    }
});