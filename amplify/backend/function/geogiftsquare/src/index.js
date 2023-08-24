var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";
import crypto from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Request, default as fetch } from "node-fetch";
import { Client, Environment } from "square";
var Sha256 = crypto.Sha256;
var graphQLEndpoint = process.env.API_GEOGIFT_GRAPHQLAPIENDPOINTOUTPUT;
var region = process.env.REGION || "us-east-1";
if (!graphQLEndpoint)
    throw new Error("Environment variable API_GEOGIFT_GRAPHQLAPIENDPOINTOUTPUT is not set.");
var signer = new SignatureV4({
    credentials: defaultProvider(),
    region: region,
    service: "appsync",
    sha256: Sha256
});
var Resolvers = {
    "SquareOAuthConnection": {
        locations: locations,
        merchantName: merchantName
    },
    "Mutation": {
        getOAuthToken: getOAuthToken,
        createGCOrder: createGCOrder
    }
};
/**
 * Handles most things related to OAuth2 and our Square integration.
 *
 * Note that this function is configured to resolve a few different ways based on which GraphQL mutation is calling it;
 * this is intentional so that we don't have to have multiple lambda functions.
 */
export function handler(event) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var resolver;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    resolver = (_a = Resolvers[event.typeName]) === null || _a === void 0 ? void 0 : _a[event.fieldName];
                    if (!resolver)
                        throw new Error("Could not find resolver ".concat(event.typeName, " -> ").concat(event.fieldName));
                    return [4 /*yield*/, resolver(event)];
                case 1: return [2 /*return*/, _b.sent()];
            }
        });
    });
}
/**
 * Using a callback code, get an OAuth token from the Square OAuth API endpoint.
 */
function getOAuthToken(event) {
    return __awaiter(this, void 0, void 0, function () {
        var code, _a, endpoint, clientId, clientSecret, redirectUri, username, environment, squareClient, oauth, _b, accessToken, refreshToken, expiresAt, merchantId, chargeLocationId;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    code = event.arguments.code;
                    return [4 /*yield*/, getConfiguration()];
                case 1:
                    _a = _c.sent(), endpoint = _a.endpoint, clientId = _a.clientId, clientSecret = _a.clientSecret, redirectUri = _a.redirectUri;
                    username = event.identity.username;
                    environment = getSquareEnvironment(endpoint);
                    squareClient = new Client({ environment: environment });
                    oauth = squareClient.oAuthApi;
                    return [4 /*yield*/, oauth.obtainToken({
                            code: code,
                            clientId: clientId,
                            clientSecret: clientSecret,
                            redirectUri: redirectUri,
                            grantType: "authorization_code"
                        })];
                case 2:
                    _b = (_c.sent()).result, accessToken = _b.accessToken, refreshToken = _b.refreshToken, expiresAt = _b.expiresAt, merchantId = _b.merchantId;
                    return [4 /*yield*/, getDefaultLocation(environment, accessToken)];
                case 3:
                    chargeLocationId = _c.sent();
                    return [4 /*yield*/, updateOAuthInformation(username, {
                            chargeLocationId: chargeLocationId,
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                            expiresAt: expiresAt,
                            merchantId: merchantId
                        })];
                case 4:
                    _c.sent();
                    return [2 /*return*/, "Success"];
            }
        });
    });
}
/**
 * Create a gift card order.
 */
function createGCOrder(event) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function () {
        var _f, value, email, merchantId, connectionResult, connection, environment, squareClient, paymentLink;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _f = event.arguments, value = _f.value, email = _f.email, merchantId = _f.merchantId;
                    if (!value || !Number.isFinite(value) || value < 0) {
                        return [2 /*return*/, {
                                url: null,
                                orderId: null,
                                error: "Invalid value passed to API."
                            }];
                    }
                    if (!email || !/@/.test(email)) {
                        return [2 /*return*/, {
                                url: null,
                                orderId: null,
                                error: "Invalid email passed to API."
                            }];
                    }
                    if (!merchantId) {
                        return [2 /*return*/, {
                                url: null,
                                orderId: null,
                                error: "Invalid merchant ID passed to API."
                            }];
                    }
                    return [4 /*yield*/, makeGraphQLRequest({
                            query: /* GraphQL */ "\n            query SquareOAuthConnectionByMerchantId(\n                $merchantId: String!\n                $limit: Int\n            ) {\n                squareOAuthConnectionByMerchantId(\n                    merchantId: $merchantId,\n                    limit: $limit\n                ) {\n                    items {\n                        merchantId\n                        accessToken\n                        refreshToken\n                        expiresAt\n                        chargeLocationId\n                    }\n                }\n            }\n        ",
                            variables: {
                                merchantId: merchantId,
                                limit: 1
                            }
                        })];
                case 1:
                    connectionResult = _g.sent();
                    connection = (_c = (_b = (_a = connectionResult.data) === null || _a === void 0 ? void 0 : _a.squareOAuthConnectionByMerchantId) === null || _b === void 0 ? void 0 : _b.items) === null || _c === void 0 ? void 0 : _c[0];
                    if (!connection) {
                        return [2 /*return*/, {
                                url: null,
                                orderId: null,
                                error: "Could not find merchant connection to create order"
                            }];
                    }
                    environment = getSquareEnvironment(process.env["SQUARE_ENDPOINT"]);
                    squareClient = new Client({ environment: environment, accessToken: connection.accessToken });
                    return [4 /*yield*/, squareClient.checkoutApi.createPaymentLink({
                            checkoutOptions: {
                                redirectUrl: "http://localhost:3000/purchase/".concat(merchantId, "/success?") + new URLSearchParams({
                                    email: email
                                }).toString(),
                                // Only charge a fee for the service in production.
                                appFeeMoney: environment === Environment.Production ? {
                                    amount: BigInt(value),
                                    currency: "USD"
                                } : undefined
                            },
                            order: {
                                locationId: connection.chargeLocationId,
                                lineItems: [
                                    {
                                        name: "$".concat(value.toFixed(2), " GeoGift Gift Card"),
                                        quantity: "1",
                                        basePriceMoney: {
                                            amount: BigInt(value * 100),
                                            currency: "USD"
                                        },
                                        note: "Electronic delivery to ".concat(email)
                                    }
                                ]
                            }
                        })];
                case 2:
                    paymentLink = _g.sent();
                    if (paymentLink.result.errors && paymentLink.result.errors.length > 0) {
                        return [2 /*return*/, {
                                url: null,
                                orderId: null,
                                error: paymentLink.result.errors.join("\n")
                            }];
                    }
                    return [2 /*return*/, {
                            url: (_d = paymentLink.result.paymentLink.url) !== null && _d !== void 0 ? _d : null,
                            orderId: (_e = paymentLink.result.paymentLink.orderId) !== null && _e !== void 0 ? _e : null
                        }];
            }
        });
    });
}
/**
 * Get the locations associated with a merchant ID
 */
function locations(event) {
    return __awaiter(this, void 0, void 0, function () {
        var oAuthConnection, environment, squareClient, response, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    oAuthConnection = event.source;
                    environment = getSquareEnvironment(process.env["SQUARE_ENDPOINT"]);
                    squareClient = new Client({ environment: environment, accessToken: oAuthConnection.accessToken });
                    return [4 /*yield*/, squareClient.locationsApi.listLocations()];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.result.locations.map(function (location) { return ({
                            id: location.id,
                            name: location.name,
                            address: location.address
                        }); })];
                case 2:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get the merchant name associated with a merchant ID
 */
function merchantName(event) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var oAuthConnection, environment, squareClient, response, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    oAuthConnection = event.source;
                    environment = getSquareEnvironment(process.env["SQUARE_ENDPOINT"]);
                    squareClient = new Client({ environment: environment, accessToken: oAuthConnection.accessToken });
                    return [4 /*yield*/, squareClient.merchantsApi.retrieveMerchant(oAuthConnection.merchantId)];
                case 1:
                    response = _b.sent();
                    return [2 /*return*/, (_a = response.result.merchant) === null || _a === void 0 ? void 0 : _a.businessName];
                case 2:
                    e_2 = _b.sent();
                    console.error(e_2);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get the default (first returned by the API) location.
 */
function getDefaultLocation(environment, accessToken) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var squareClient, response, e_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    squareClient = new Client({ environment: environment, accessToken: accessToken });
                    return [4 /*yield*/, squareClient.locationsApi.listLocations()];
                case 1:
                    response = _b.sent();
                    return [2 /*return*/, (_a = response.result.locations[0].id) !== null && _a !== void 0 ? _a : null];
                case 2:
                    e_3 = _b.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get relevant secrets out of AWS SSM and environment variables out of `process.env`.
 */
function getConfiguration() {
    return __awaiter(this, void 0, void 0, function () {
        var ssmClient, command, result, applicationSecret, config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ssmClient = new SSMClient({ region: region });
                    command = new GetParametersCommand({
                        Names: ["SQUARE_APPLICATION_SECRET"].map(function (secretName) { return process.env[secretName]; }),
                        WithDecryption: true
                    });
                    return [4 /*yield*/, ssmClient.send(command)];
                case 1:
                    result = _a.sent();
                    if (!(result === null || result === void 0 ? void 0 : result.Parameters))
                        throw new Error("Could not load secrets");
                    applicationSecret = result.Parameters[0].Value;
                    config = {
                        endpoint: process.env["SQUARE_ENDPOINT"],
                        clientId: process.env["SQUARE_APPLICATION_ID"],
                        clientSecret: applicationSecret,
                        redirectUri: process.env["SQUARE_REDIRECT_URI"]
                    };
                    if (!config.endpoint)
                        throw new Error("Could not find environment variable SQUARE_ENDPOINT");
                    if (!config.clientId)
                        throw new Error("Could not find environment variable SQUARE_APPLICATION_ID");
                    if (!config.clientSecret)
                        throw new Error("Could not find secret SQUARE_APPLICATION_SECRET");
                    if (!config.redirectUri)
                        throw new Error("Could not find environment variable SQUARE_REDIRECT_URI");
                    return [2 /*return*/, config];
            }
        });
    });
}
/**
 * Get the environment that Square is configured for.
 */
function getSquareEnvironment(endpoint) {
    if (endpoint === "https://connect.squareup.com")
        return Environment.Production;
    else if (endpoint === "https://connect.squareupsandbox.com")
        return Environment.Sandbox;
    throw new Error("Unknown endpoint configured.");
}
/**
 * Update the OAuth information in the GraphQL data store.
 *
 * This works by querying the data store for if a value for this user exists; if it does it updates it, otherwise it
 * creates it.
 *
 * @param input The values to update.
 */
function updateOAuthInformation(owner, input) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var existingConnection, existingObject;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, makeGraphQLRequest({
                        query: squareOAuthConnectionByOwnerQuery,
                        variables: {
                            owner: owner,
                            limit: 1
                        }
                    })];
                case 1:
                    existingConnection = _d.sent();
                    existingObject = (_c = (_b = (_a = existingConnection.data) === null || _a === void 0 ? void 0 : _a.squareOAuthConnectionByOwner) === null || _b === void 0 ? void 0 : _b.items) === null || _c === void 0 ? void 0 : _c[0];
                    if (!existingObject) return [3 /*break*/, 3];
                    console.log("Updating existing square oauth connection record...");
                    return [4 /*yield*/, makeGraphQLRequest({
                            query: updateSquareOAuthConnectionMutation,
                            variables: {
                                input: {
                                    id: existingObject.id,
                                    accessToken: input.accessToken,
                                    refreshToken: input.refreshToken,
                                    expiresAt: input.expiresAt,
                                    merchantId: input.merchantId,
                                    chargeLocationId: input.chargeLocationId
                                }
                            }
                        })];
                case 2:
                    _d.sent();
                    return [3 /*break*/, 5];
                case 3:
                    console.log("Creating new square oauth connection record...");
                    return [4 /*yield*/, makeGraphQLRequest({
                            query: createSquareOAuthConnectionMutation,
                            variables: {
                                input: {
                                    owner: owner,
                                    accessToken: input.accessToken,
                                    refreshToken: input.refreshToken,
                                    expiresAt: input.expiresAt,
                                    merchantId: input.merchantId,
                                    chargeLocationId: input.chargeLocationId
                                }
                            }
                        })];
                case 4:
                    _d.sent();
                    _d.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function makeGraphQLRequest(body) {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, rawRequest, signedRequest, request, response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endpoint = new URL(graphQLEndpoint);
                    rawRequest = new HttpRequest({
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Host": endpoint.host
                        },
                        hostname: endpoint.host,
                        body: JSON.stringify(body),
                        path: endpoint.pathname
                    });
                    return [4 /*yield*/, signer.sign(rawRequest)];
                case 1:
                    signedRequest = _a.sent();
                    request = new Request(endpoint, signedRequest);
                    return [4 /*yield*/, fetch(request)];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (result.errors)
                        throw "Errors from GraphQL: " + JSON.stringify(result);
                    return [2 /*return*/, result];
            }
        });
    });
}
var squareOAuthConnectionByOwnerQuery = /* GraphQL */ "\n  query SquareOAuthConnectionByOwner(\n    $owner: String!\n    $limit: Int\n  ) {\n    squareOAuthConnectionByOwner(\n      owner: $owner\n      limit: $limit\n    ) {\n      items {\n        id\n        merchantId\n        accessToken\n        refreshToken\n        expiresAt\n        chargeLocationId\n        owner\n        createdAt\n        updatedAt\n      }\n      nextToken\n    }\n  }\n";
export var createSquareOAuthConnectionMutation = /* GraphQL */ "\n  mutation CreateSquareOAuthConnection(\n    $input: CreateSquareOAuthConnectionInput!\n    $condition: ModelSquareOAuthConnectionConditionInput\n  ) {\n    createSquareOAuthConnection(input: $input, condition: $condition) {\n      id\n      merchantId\n      accessToken\n      refreshToken\n      expiresAt\n      chargeLocationId\n      owner\n      createdAt\n      updatedAt\n    }\n  }\n";
export var updateSquareOAuthConnectionMutation = /* GraphQL */ "\n  mutation UpdateSquareOAuthConnection(\n    $input: UpdateSquareOAuthConnectionInput!\n    $condition: ModelSquareOAuthConnectionConditionInput\n  ) {\n    updateSquareOAuthConnection(input: $input, condition: $condition) {\n      id\n      merchantId\n      accessToken\n      refreshToken\n      expiresAt\n      chargeLocationId\n      owner\n      createdAt\n      updatedAt\n    }\n  }\n";
