import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";
import crypto from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Request, default as fetch } from "node-fetch";
import { Client, Environment } from "square";

const { Sha256 } = crypto;

const graphQLEndpoint = process.env.API_GEOGIFT_GRAPHQLAPIENDPOINTOUTPUT;
const region = process.env.REGION || "us-east-1";

if (!graphQLEndpoint)
    throw new Error("Environment variable API_GEOGIFT_GRAPHQLAPIENDPOINTOUTPUT is not set.");

const signer = new SignatureV4({
    credentials: defaultProvider(),
    region,
    service: "appsync",
    sha256: Sha256,
});

interface GraphQLLambdaArguments {
    typeName: string;
    fieldName: string;
    arguments: any;
    identity: any;
    source: any;
    request: any;
    prev: any;
}

const Resolvers = {
    "SquareOAuthConnection": {
        locations,
        merchantName,
    },
    "Mutation": {
        getOAuthToken,
        createGCOrder,
    },
};

/**
 * Handles most things related to OAuth2 and our Square integration.
 * 
 * Note that this function is configured to resolve a few different ways based on which GraphQL mutation is calling it;
 * this is intentional so that we don't have to have multiple lambda functions.
 */
export async function handler(event: GraphQLLambdaArguments) {
    const resolver = Resolvers[event.typeName]?.[event.fieldName];
    if (!resolver)
        throw new Error(`Could not find resolver ${event.typeName} -> ${event.fieldName}`);
    return await resolver(event);
}

/**
 * Using a callback code, get an OAuth token from the Square OAuth API endpoint.
 */
async function getOAuthToken(event: GraphQLLambdaArguments) {
    const { code } = event.arguments;
    const { endpoint, clientId, clientSecret, redirectUri } = await getConfiguration();
    const username = event.identity.username;

    const environment = getSquareEnvironment(endpoint);
    const squareClient = new Client({ environment });
    const oauth = squareClient.oAuthApi;

    const { result: { accessToken, refreshToken, expiresAt, merchantId } } = await oauth.obtainToken({
        code,
        clientId,
        clientSecret,
        redirectUri,
        grantType: "authorization_code",
    });

    // Save the default location using the new token.
    const chargeLocationId = await getDefaultLocation(environment, accessToken);

    await updateOAuthInformation(username, {
        chargeLocationId,
        accessToken,
        refreshToken,
        expiresAt,
        merchantId
    });

    return "Success";
}

/**
 * Create a gift card order.
 */
async function createGCOrder(
    event: GraphQLLambdaArguments
): Promise<{ url: string | null, orderId: string | null, error?: string }> {
    const { value, email, merchantId } = event.arguments;

    if (!value || !Number.isFinite(value) || value < 0) {
        return {
            url: null,
            orderId: null,
            error: "Invalid value passed to API.",
        };
    }
    if (!email || !/@/.test(email)) {
        return {
            url: null,
            orderId: null,
            error: "Invalid email passed to API.",
        };
    }
    if (!merchantId) {
        return {
            url: null,
            orderId: null,
            error: "Invalid merchant ID passed to API.",
        };
    }

    const connectionResult = await makeGraphQLRequest({
        query: /* GraphQL */ `
            query SquareOAuthConnectionByMerchantId(
                $merchantId: String!
                $limit: Int
            ) {
                squareOAuthConnectionByMerchantId(
                    merchantId: $merchantId,
                    limit: $limit
                ) {
                    items {
                        merchantId
                        accessToken
                        refreshToken
                        expiresAt
                        chargeLocationId
                    }
                }
            }
        `,
        variables: {
            merchantId,
            limit: 1
        }
    });

    const connection = connectionResult.data?.squareOAuthConnectionByMerchantId?.items?.[0];
    if (!connection) {
        return {
            url: null,
            orderId: null,
            error: "Could not find merchant connection to create order",
        };
    }

    const environment = getSquareEnvironment(process.env["SQUARE_ENDPOINT"]);
    const squareClient = new Client({ environment, accessToken: connection.accessToken });
    const paymentLink = await squareClient.checkoutApi.createPaymentLink({
        checkoutOptions: {
            redirectUrl: `https://staging.d3d404q5cwiwko.amplifyapp.com/purchase/${merchantId}/success?` + new URLSearchParams({
                email,
            }).toString(),

            // Only charge a fee for the service in production.
            appFeeMoney: environment === Environment.Production ? {
                amount: BigInt(value),
                currency: "USD",
            } : undefined,
        },
        order: {
            locationId: connection.chargeLocationId,
            lineItems: [
                {
                    name: `$${value.toFixed(2)} GeoGift Gift Card`,
                    quantity: "1",
                    basePriceMoney: {
                        amount: BigInt(value * 100),
                        currency: "USD",
                    },
                    note: `Electronic delivery to ${email}`,
                }
            ]
        }
    });

    if (paymentLink.result.errors && paymentLink.result.errors.length > 0) {
        return {
            url: null,
            orderId: null,
            error: paymentLink.result.errors.join("\n"),
        };
    }

    return {
        url: paymentLink.result.paymentLink.url ?? null,
        orderId: paymentLink.result.paymentLink.orderId ?? null,
    };
}

/**
 * Get the locations associated with a merchant ID
 */
async function locations(event: GraphQLLambdaArguments) {
    try {
        const oAuthConnection = event.source;

        const environment = getSquareEnvironment(process.env["SQUARE_ENDPOINT"]);
        const squareClient = new Client({ environment, accessToken: oAuthConnection.accessToken });
        
        const response = await squareClient.locationsApi.listLocations();
        return response.result.locations.map(location => ({
            id: location.id,
            name: location.name,
            address: location.address,
        }));
    }
    catch (e) {
        console.error(e);
        return [];
    }
}

/**
 * Get the merchant name associated with a merchant ID
 */
async function merchantName(event: GraphQLLambdaArguments): Promise<string | null> {
    try {
        const oAuthConnection = event.source;

        const environment = getSquareEnvironment(process.env["SQUARE_ENDPOINT"]);
        const squareClient = new Client({ environment, accessToken: oAuthConnection.accessToken });
        
        const response = await squareClient.merchantsApi.retrieveMerchant(oAuthConnection.merchantId);
        return response.result.merchant?.businessName;
    }
    catch (e) {
        console.error(e);
        return null;
    }
}

/**
 * Get the default (first returned by the API) location.
 */
async function getDefaultLocation(environment: Environment, accessToken: string): Promise<string | null> {
    try {
        const squareClient = new Client({ environment, accessToken });
        const response = await squareClient.locationsApi.listLocations();
        return response.result.locations[0].id ?? null;
    }
    catch (e) {
        return null;
    }
}

/**
 * Get relevant secrets out of AWS SSM and environment variables out of `process.env`.
 */
async function getConfiguration() {
    const ssmClient = new SSMClient({ region });
    const command = new GetParametersCommand({
        Names: ["SQUARE_APPLICATION_SECRET"].map(secretName => process.env[secretName]),
        WithDecryption: true,
    });
    const result = await ssmClient.send(command);

    if (!result?.Parameters)
        throw new Error("Could not load secrets");
    
    const applicationSecret = result.Parameters[0].Value;

    const config = {
        endpoint: process.env["SQUARE_ENDPOINT"],
        clientId: process.env["SQUARE_APPLICATION_ID"],
        clientSecret: applicationSecret,
        redirectUri: process.env["SQUARE_REDIRECT_URI"],
    };

    if (!config.endpoint)
        throw new Error("Could not find environment variable SQUARE_ENDPOINT");
    if (!config.clientId)
        throw new Error("Could not find environment variable SQUARE_APPLICATION_ID");
    if (!config.clientSecret)
        throw new Error("Could not find secret SQUARE_APPLICATION_SECRET");
    if (!config.redirectUri)
        throw new Error("Could not find environment variable SQUARE_REDIRECT_URI");

    return config;
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

/**
 * Update the OAuth information in the GraphQL data store.
 * 
 * This works by querying the data store for if a value for this user exists; if it does it updates it, otherwise it
 * creates it.
 * 
 * @param input The values to update.
 */
async function updateOAuthInformation(
    owner: string,
    input: { chargeLocationId: string, accessToken: string, refreshToken: string, expiresAt: string, merchantId: string }
) {
    const existingConnection = await makeGraphQLRequest({
        query: squareOAuthConnectionByOwnerQuery,
        variables: {
            owner,
            limit: 1,
        },
    });

    const existingObject = existingConnection.data?.squareOAuthConnectionByOwner?.items?.[0];

    if (existingObject)
    {
        console.log("Updating existing square oauth connection record...");
        await makeGraphQLRequest({
            query: updateSquareOAuthConnectionMutation,
            variables: {
                input: {
                    id: existingObject.id,
                    accessToken: input.accessToken,
                    refreshToken: input.refreshToken,
                    expiresAt: input.expiresAt,
                    merchantId: input.merchantId,
                    chargeLocationId: input.chargeLocationId,
                },
            },
        });
    }
    else
    {
        console.log("Creating new square oauth connection record...");
        await makeGraphQLRequest({
            query: createSquareOAuthConnectionMutation,
            variables: {
                input: {
                    owner,
                    accessToken: input.accessToken,
                    refreshToken: input.refreshToken,
                    expiresAt: input.expiresAt,
                    merchantId: input.merchantId,
                    chargeLocationId: input.chargeLocationId,
                },
            },
        });
    }
}

async function makeGraphQLRequest(body: any) {
    const endpoint = new URL(graphQLEndpoint);

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

const squareOAuthConnectionByOwnerQuery = /* GraphQL */ `
  query SquareOAuthConnectionByOwner(
    $owner: String!
    $limit: Int
  ) {
    squareOAuthConnectionByOwner(
      owner: $owner
      limit: $limit
    ) {
      items {
        id
        merchantId
        accessToken
        refreshToken
        expiresAt
        chargeLocationId
        owner
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const createSquareOAuthConnectionMutation = /* GraphQL */ `
  mutation CreateSquareOAuthConnection(
    $input: CreateSquareOAuthConnectionInput!
    $condition: ModelSquareOAuthConnectionConditionInput
  ) {
    createSquareOAuthConnection(input: $input, condition: $condition) {
      id
      merchantId
      accessToken
      refreshToken
      expiresAt
      chargeLocationId
      owner
      createdAt
      updatedAt
    }
  }
`;

export const updateSquareOAuthConnectionMutation = /* GraphQL */ `
  mutation UpdateSquareOAuthConnection(
    $input: UpdateSquareOAuthConnectionInput!
    $condition: ModelSquareOAuthConnectionConditionInput
  ) {
    updateSquareOAuthConnection(input: $input, condition: $condition) {
      id
      merchantId
      accessToken
      refreshToken
      expiresAt
      chargeLocationId
      owner
      createdAt
      updatedAt
    }
  }
`;
