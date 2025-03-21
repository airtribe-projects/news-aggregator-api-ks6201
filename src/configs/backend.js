"use strict";

export const protocol = 'http';

export const domain = `localhost:${process.env.PORT ?? 3000}`;

export const backendUrl = `${protocol}://${domain}`;