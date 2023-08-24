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

import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";
import crypto from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Request, default as fetch } from "node-fetch";
import { Client, Environment } from "square";

const { Sha256 } = crypto;

const BATCH_SIZE = 50;

// Check for the necessary environment variables.
const awsRegion = process.env.REGION || "us-east-1";

const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: awsRegion,
    service: "appsync",
    sha256: Sha256,
});

const graphQLEndpoint = process.env.API_GEOGIFT_GRAPHQLAPIENDPOINTOUTPUT;
if (!graphQLEndpoint)
    throw new Error("Environment variable API_GEOGIFT_GRAPHQLAPIENDPOINTOUTPUT is not set.");

const squareEndpoint = process.env["SQUARE_ENDPOINT"];
if (!squareEndpoint)
    throw new Error("Environment variable SQUARE_ENDPOINT is not set.");

const squareApplicationId = process.env["SQUARE_APPLICATION_ID"];
if (!squareApplicationId)
    throw new Error("Environment variable SQUARE_APPLICATION_ID is not set.");

/**
 * Refresh OAuth tokens stored in GraphQL.
 */
export async function handler() {
    const clientSecret = await getSquareApplicationSecret();
    
    const environment = getSquareEnvironment(squareEndpoint!);
    const squareClient = new Client({ environment });
    const oauth = squareClient.oAuthApi;

    await forEachOutdatedConnection(async connection => {
        try {
            console.debug("Attempting to refresh token...");
            const { result } = await oauth.obtainToken({
                clientId: squareApplicationId!,
                clientSecret,
                refreshToken: connection.refreshToken,
                grantType: "refresh_token",
            });
            const { accessToken, refreshToken, expiresAt } = result;

            console.debug("Refresh successful.");
            if (connection.accessToken === accessToken && connection.refreshToken === refreshToken && connection.expiresAt === expiresAt) {
                console.debug("Skipping update due to identical values.");
                return;
            }

            console.debug("Updating data store...");

            await makeGraphQLRequest({
                query: /* GraphQL */ `
                    mutation UpdateSquareOAuthConnection(
                        $input: UpdateSquareOAuthConnectionInput!
                    ) {
                        updateSquareOAuthConnection(input: $input) {
                            id
                            accessToken
                            refreshToken
                            expiresAt
                        }
                    }
                `,
                variables: {
                    input: {
                        id: connection.id,
                        accessToken,
                        refreshToken,
                        expiresAt,
                    }
                }
            });

            console.debug("Update successful");
        }
        catch (e) {
            console.error("Error refreshing token: ", e);
        }
    });
}

async function forEachOutdatedConnection(callback: (connection: any) => unknown | Promise<unknown>) {

    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() + 15);
    cutoff.setUTCHours(0);
    cutoff.setUTCMinutes(0);
    cutoff.setUTCSeconds(0);
    cutoff.setUTCMilliseconds(0);

    let nextToken: string | null = null;
    do {
        console.debug(`Getting batch for next token ${nextToken ?? "(null)"}`)
        const result = await makeGraphQLRequest({
            query: /* GraphQL */ `
                query ListSquareOAuthConnections(
                    $limit: Int
                    $nextToken: String
                ) {
                    listSquareOAuthConnections(
                        limit: $limit
                        nextToken: $nextToken
                    ) {
                        items {
                            id
                            accessToken
                            refreshToken
                            expiresAt
                        }
                        nextToken
                    }
                }
            `,
            variables: {
                limit: BATCH_SIZE,
                nextToken,
            },
        });
        console.debug(`Got ${result.data?.listSquareOAuthConnections?.items?.length ?? "(unknown)"} results.`);

        nextToken = result.data?.listSquareOAuthConnections?.nextToken;
        
        // Call the callback for each connection
        const expiringConnections = result.data?.listSquareOAuthConnections?.items
            .filter(({ expiresAt }) => new Date(expiresAt) < cutoff);
        
        for (const connection of expiringConnections) {
            await callback(connection);
        }

    } while (nextToken);
}

async function makeGraphQLRequest(body: any) {
    const endpoint = new URL(graphQLEndpoint!);

    const rawRequest = new HttpRequest({
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Host": endpoint.host,
        },
        hostname: endpoint.host,
        body: JSON.stringify(body),
        path: endpoint.pathname,
    });

    const signedRequest = await signer.sign(rawRequest);
    const request = new Request(endpoint, signedRequest);

    const response = await fetch(request);
    const result = await response.json();

    if (result.errors)
        throw "Errors from GraphQL: " + JSON.stringify(result);
    
    return result;
}

async function getSquareApplicationSecret(): Promise<string> {
    const ssmClient = new SSMClient({ region: awsRegion });
    const command = new GetParametersCommand({
        Names: ["SQUARE_APPLICATION_SECRET"].map(secretName => process.env[secretName]!),
        WithDecryption: true,
    });
    const result = await ssmClient.send(command);

    if (!result?.Parameters)
        throw new Error("Could not load secrets.");
    
    const applicationSecret = result.Parameters[0].Value;
    if (!applicationSecret)
        throw new Error("Square application secret was not returned by SSM.");
    
    return applicationSecret;
}

/**
 * Get the environment that Square is configured for.
 */
function getSquareEnvironment(endpoint: string) {
    if (endpoint === "https://connect.squareup.com")
        return Environment.Production;
    else if (endpoint === "https://connect.squareupsandbox.com")
        return Environment.Sandbox;
    throw new Error("Unknown endpoint configured.");
}
