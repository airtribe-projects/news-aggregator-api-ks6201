"use strict";

import { makeReadOnly } from "./utils.js";

export const HttpInformational = makeReadOnly({
    Continue: 100,
    Processing: 102,
    EarlyHints: 103,
    SwitchingProtocols: 101,
});

export const HttpSuccess = makeReadOnly({
    OK: 200,
    IMUsed: 226,
    Created: 201,
    Accepted: 202,
    NoContent: 204,
    MultiStatus: 207,
    ResetContent: 205,
    PartialContent: 206,
    AlreadyReported: 208,
    NonAuthoritativeInformation: 203,
});

export const HttpRedirection = makeReadOnly({
    Found: 302,
    SeeOther: 303,
    UseProxy: 305,
    NotModified: 304,
    MultipleChoices: 300,
    MovedPermanently: 301,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
});

export const HttpClientError = makeReadOnly({
    Gone: 410,
    Locked: 423,
    NotFound: 404,
    Conflict: 409,
    TooEarly: 425,
    Forbidden: 403,
    BadRequest: 400,
    URITooLong: 414,
    IAmATeapot: 418,
    Unauthorized: 401,
    NotAcceptable: 406,
    RequestTimeout: 408,
    LengthRequired: 411,
    PaymentRequired: 402,
    PayloadTooLarge: 413,
    TooManyRequests: 429,
    UpgradeRequired: 426,
    MethodNotAllowed: 405,
    FailedDependency: 424,
    ExpectationFailed: 417,
    PreconditionFailed: 412,
    MisdirectedRequest: 421,
    RangeNotSatisfiable: 416,
    UnprocessableEntity: 422,
    UnsupportedMediaType: 415,
    PreconditionRequired: 428,
    UnavailableForLegalReasons: 451,
    RequestHeaderFieldsTooLarge: 431,
    ProxyAuthenticationRequired: 407,
});

export const HttpServerError = makeReadOnly({
    BadGateway: 502,
    NotExtended: 510,
    LoopDetected: 508,
    GatewayTimeout: 504,
    NotImplemented: 501,
    ServiceUnavailable: 503,
    InternalServerError: 500,
    InsufficientStorage: 507,
    VariantAlsoNegotiates: 506,
    HTTPVersionNotSupported: 505,
    NetworkAuthenticationRequired: 511,
});