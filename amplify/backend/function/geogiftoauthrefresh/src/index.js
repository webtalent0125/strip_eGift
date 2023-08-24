/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["SQUARE_APPLICATION_SECRET"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/
/* Amplify Params - DO NOT EDIT
    ENV
    REGION
    API_GEOGIFT_GRAPHQLAPIIDOUTPUT
    API_GEOGIFT_GRAPHQLAPIENDPOINTOUTPUT
    API_GEOGIFT_GRAPHQLAPIKEYOUTPUT
    SQUARE_ENDPOINT
    SQUARE_APPLICATION_ID
Amplify Params - DO NOT EDIT */
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
var BATCH_SIZE = 50;
// Check for the necessary environment variables.
var awsRegion = process.env.REGION || "us-east-1";
var signer = new SignatureV4({
    credentials: defaultProvider(),
    region: awsRegion,
    service: "appsync",
    sha256: Sha256
});
var graphQLEndpoint = process.env.API_GEOGIFT_GRAPHQLAPIENDPOINTOUTPUT;
if (!graphQLEndpoint)
    throw new Error("Environment variable API_GEOGIFT_GRAPHQLAPIENDPOINTOUTPUT is not set.");
var squareEndpoint = process.env["SQUARE_ENDPOINT"];
if (!squareEndpoint)
    throw new Error("Environment variable SQUARE_ENDPOINT is not set.");
var squareApplicationId = process.env["SQUARE_APPLICATION_ID"];
if (!squareApplicationId)
    throw new Error("Environment variable SQUARE_APPLICATION_ID is not set.");
/**
 * Refresh OAuth tokens stored in GraphQL.
 */
export function handler() {
    return __awaiter(this, void 0, void 0, function () {
        var clientSecret, environment, squareClient, oauth;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSquareApplicationSecret()];
                case 1:
                    clientSecret = _a.sent();
                    environment = getSquareEnvironment(squareEndpoint);
                    squareClient = new Client({ environment: environment });
                    oauth = squareClient.oAuthApi;
                    return [4 /*yield*/, forEachOutdatedConnection(function (connection) { return __awaiter(_this, void 0, void 0, function () {
                            var result, accessToken, refreshToken, expiresAt, e_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 3, , 4]);
                                        console.debug("Attempting to refresh token...");
                                        return [4 /*yield*/, oauth.obtainToken({
                                                clientId: squareApplicationId,
                                                clientSecret: clientSecret,
                                                refreshToken: connection.refreshToken,
                                                grantType: "refresh_token"
                                            })];
                                    case 1:
                                        result = (_a.sent()).result;
                                        accessToken = result.accessToken, refreshToken = result.refreshToken, expiresAt = result.expiresAt;
                                        console.debug("Refresh successful.");
                                        if (connection.accessToken === accessToken && connection.refreshToken === refreshToken && connection.expiresAt === expiresAt) {
                                            console.debug("Skipping update due to identical values.");
                                            return [2 /*return*/];
                                        }
                                        console.debug("Updating data store...");
                                        return [4 /*yield*/, makeGraphQLRequest({
                                                query: /* GraphQL */ "\n                    mutation UpdateSquareOAuthConnection(\n                        $input: UpdateSquareOAuthConnectionInput!\n                    ) {\n                        updateSquareOAuthConnection(input: $input) {\n                            id\n                            accessToken\n                            refreshToken\n                            expiresAt\n                        }\n                    }\n                ",
                                                variables: {
                                                    input: {
                                                        id: connection.id,
                                                        accessToken: accessToken,
                                                        refreshToken: refreshToken,
                                                        expiresAt: expiresAt
                                                    }
                                                }
                                            })];
                                    case 2:
                                        _a.sent();
                                        console.debug("Update successful");
                                        return [3 /*break*/, 4];
                                    case 3:
                                        e_1 = _a.sent();
                                        console.error("Error refreshing token: ", e_1);
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function forEachOutdatedConnection(callback) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function () {
        var cutoff, nextToken, result, expiringConnections, _i, expiringConnections_1, connection;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    cutoff = new Date();
                    cutoff.setUTCDate(cutoff.getUTCDate() + 15);
                    cutoff.setUTCHours(0);
                    cutoff.setUTCMinutes(0);
                    cutoff.setUTCSeconds(0);
                    cutoff.setUTCMilliseconds(0);
                    nextToken = null;
                    _j.label = 1;
                case 1:
                    console.debug("Getting batch for next token ".concat(nextToken !== null && nextToken !== void 0 ? nextToken : "(null)"));
                    return [4 /*yield*/, makeGraphQLRequest({
                            query: /* GraphQL */ "\n                query ListSquareOAuthConnections(\n                    $limit: Int\n                    $nextToken: String\n                ) {\n                    listSquareOAuthConnections(\n                        limit: $limit\n                        nextToken: $nextToken\n                    ) {\n                        items {\n                            id\n                            accessToken\n                            refreshToken\n                            expiresAt\n                        }\n                        nextToken\n                    }\n                }\n            ",
                            variables: {
                                limit: BATCH_SIZE,
                                nextToken: nextToken
                            }
                        })];
                case 2:
                    result = _j.sent();
                    console.debug("Got ".concat((_d = (_c = (_b = (_a = result.data) === null || _a === void 0 ? void 0 : _a.listSquareOAuthConnections) === null || _b === void 0 ? void 0 : _b.items) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : "(unknown)", " results."));
                    nextToken = (_f = (_e = result.data) === null || _e === void 0 ? void 0 : _e.listSquareOAuthConnections) === null || _f === void 0 ? void 0 : _f.nextToken;
                    expiringConnections = (_h = (_g = result.data) === null || _g === void 0 ? void 0 : _g.listSquareOAuthConnections) === null || _h === void 0 ? void 0 : _h.items.filter(function (_a) {
                        var expiresAt = _a.expiresAt;
                        return new Date(expiresAt) < cutoff;
                    });
                    _i = 0, expiringConnections_1 = expiringConnections;
                    _j.label = 3;
                case 3:
                    if (!(_i < expiringConnections_1.length)) return [3 /*break*/, 6];
                    connection = expiringConnections_1[_i];
                    return [4 /*yield*/, callback(connection)];
                case 4:
                    _j.sent();
                    _j.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    if (nextToken) return [3 /*break*/, 1];
                    _j.label = 7;
                case 7: return [2 /*return*/];
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
function getSquareApplicationSecret() {
    return __awaiter(this, void 0, void 0, function () {
        var ssmClient, command, result, applicationSecret;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ssmClient = new SSMClient({ region: awsRegion });
                    command = new GetParametersCommand({
                        Names: ["SQUARE_APPLICATION_SECRET"].map(function (secretName) { return process.env[secretName]; }),
                        WithDecryption: true
                    });
                    return [4 /*yield*/, ssmClient.send(command)];
                case 1:
                    result = _a.sent();
                    if (!(result === null || result === void 0 ? void 0 : result.Parameters))
                        throw new Error("Could not load secrets.");
                    applicationSecret = result.Parameters[0].Value;
                    if (!applicationSecret)
                        throw new Error("Square application secret was not returned by SSM.");
                    return [2 /*return*/, applicationSecret];
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
