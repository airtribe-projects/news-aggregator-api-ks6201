"use strict";

import { makeReadOnly } from "../libs/utils";


export const BACKEND = makeReadOnly({
    PROTOCOL: 'http',
    PORT: Number(process.env.PORT),
    get DOMAIN() {
        return `localhost:${this.PORT ?? 3000}`
    },
    get URL() {
        return `${this.PROTOCOL}://${this.DOMAIN}`
    }
});