import { GraphQLResult } from "@aws-amplify/api";
import { Alert, Button, Card, Divider, Flex, Heading, Loader, Placeholder, SelectField, Text, TextField, useAuthenticator, View } from "@aws-amplify/ui-react";
import { API } from "aws-amplify";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../Container";
import SquareConnectionForm from "./SquareConnectionForm";

function SquareManagement() {
    const [loading, setLoading] = useState(true);
    const [locationLoading, setLocationLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [oAuthConnections, setOAuthConnections] = useState<NonNullable<ListSquareOAuthConnectionsQuery["listSquareOAuthConnections"]>["items"]>([]);

    const giftCardPurchaseUrlRef = useRef<any>();

    const navigate = useNavigate();
    const { route } = useAuthenticator(context => [context.route]);

    useEffect(() => {
        fetchOAuthConnections().catch(e => {
            setErrorMessage(`Could not load connections: ${JSON.stringify(e)}`);
        });
    }, []);

    useEffect(() => {
        if (route !== "authenticated")
            navigate("/login");
    }, [route, navigate]);

    async function fetchOAuthConnections() {
        const result = await API.graphql({
            query: listSquareOAuthConnectionsQuery,
        }) as GraphQLResult<ListSquareOAuthConnectionsQuery>;

        const connections = result.data?.listSquareOAuthConnections?.items;
        setOAuthConnections(connections ?? []);
        setLoading(false);
    }

    function copyUrl() {
        giftCardPurchaseUrlRef.current?.select();
        document.execCommand("copy");
    }

    async function deleteConnection(id: string) {
        try {
            const result = await API.graphql({
                query: deleteSquareOAuthConnectionMutation,
                variables: {
                    input: { id }
                }
            }) as GraphQLResult<any>;
            
            if (result.errors) {
                console.error("Error deleting GraphQL object:", result.errors);
            }

            await fetchOAuthConnections();
        }
        catch (e) {
            console.error(e);
        }
    }

    return (
        <View className="SquareManagement">
            <Container>
                <Heading level={2} marginBottom="0.25em">Your Square Account</Heading>
                {errorMessage && <Alert variation="error" marginBottom="1em">{errorMessage}</Alert>}

                <Heading level={3} marginBottom="0.4em">Square Connection</Heading>

                {[1, 2, 3].map(x => <Placeholder key={`placeholder-${x}`} size="large" isLoaded={!loading} marginBottom="1em" />)}
                {oAuthConnections.map((connection, index) => {
                    const isExpired = connection?.expiresAt && new Date(connection.expiresAt) < new Date();
                    const path = `/purchase/${connection?.merchantId}`;
                    const url = `${window.location.protocol}//${window.location.host}${path}`;

                    const locationAddresses = (connection?.locations)?.map(location => formatAddress(location?.address, true));
                    const selectedLocation = (connection?.locations ?? [])
                        .map((location, index) => ({ location, index }))
                        .filter(({ location }) => location?.id === connection?.chargeLocationId)
                        .map(({ index }) => locationAddresses?.[index])
                        [0];
                    
                    const exampleLocation = (connection?.locations ?? [])
                        .filter(location => location?.id === connection?.chargeLocationId)
                        .map(location => `${location?.address?.locality} ${location?.address?.administrativeDistrictLevel1}`)
                        [0] || "Boston MA";

                    return (
                        <Card key={`connection-${connection?.id ?? index}`} variation="outlined" marginBottom="1em" style={{
                            borderColor: isExpired ? "var(--amplify-colors-border-error)" : undefined,
                        }}>
                            <Flex direction="column" gap="1em" alignContent="flex-start">
                                <Flex>
                                    <View style={{ flex: 1 }}>
                                        <Heading level={6} as="h3" marginBottom="0.5em">Merchant {connection?.merchantId}</Heading>
                                        {isExpired && <Text color="var(--amplify-colors-font-error)" fontWeight="bold">
                                            This connection has expired.
                                        </Text>}
                                        <TextField
                                            ref={giftCardPurchaseUrlRef}
                                            label="Gift Card Purchase URL (click to copy)"
                                            value={url}
                                            readOnly={true}
                                            onClick={copyUrl}
                                            style={{ cursor: "pointer" }}
                                            marginBottom="1em"
                                        />
                                        <Flex alignItems="end">
                                            <SelectField
                                                flex={1}
                                                label="Charge Location"
                                                marginBottom="0.75em"
                                                disabled={locationLoading}
                                                options={locationAddresses}
                                                value={selectedLocation}
                                                onChange={async e => {
                                                    try {
                                                        const index = locationAddresses?.indexOf(e.target.value) ?? -1;
                                                        const chargeLocationId = connection?.locations?.[index]?.id;
                                                        const id = connection?.id;
                                                        if (index === -1 || !chargeLocationId || !id)
                                                            return;
                                                        
                                                        setLocationLoading(true);
                                                        await API.graphql({
                                                            query: /* GraphQL */ `
                                                                mutation UpdateSquareOAuthConnection(
                                                                    $input: UpdateSquareOAuthConnectionInput!
                                                                ) {
                                                                    updateSquareOAuthConnection(input: $input) {
                                                                        id
                                                                        chargeLocationId
                                                                    }
                                                                }
                                                            `,
                                                            variables: {
                                                                input: {
                                                                    id: connection?.id,
                                                                    chargeLocationId,
                                                                },
                                                            },
                                                        });

                                                        await fetchOAuthConnections();
                                                    }
                                                    catch (e) {
                                                        console.error("Error", e);
                                                    }
                                                    finally {
                                                        setLocationLoading(false);
                                                    }
                                                }}
                                                />
                                            {locationLoading && <View padding="1em">
                                                <Loader size="large" />
                                            </View>}
                                        </Flex>
                                        <Text fontSize="90%" color="var(--amplify-colors-font-secondary)" marginBottom="1em">
                                            Credit card charges for gift card purchases will reflect the chosen
                                            location, i.e. the location on a customer's credit card statement will{' '}
                                            say <strong>{exampleLocation}</strong>.<br />
                                            Gift cards will be able to be used at any location associated with this
                                            merchant.
                                        </Text>
                                        <Button variation="primary" onClick={() => navigate(path)}>
                                            Go to Purchase Form
                                        </Button>
                                    </View>
                                    <View>
                                        {isExpired
                                            ? <>
                                                <Button variation="link" onClick={() => connection && deleteConnection(connection.id)}>Remove</Button>
                                                {/*<Button variation="primary">Reconnect</Button>*/}
                                            </>
                                            : <Button variation="link" onClick={() => connection && deleteConnection(connection.id)}>Disconnect</Button>}
                                    </View>
                                </Flex>
                            </Flex>
                        </Card>
                    );
                })}
                {!loading && oAuthConnections.length === 0 && <>
                    <Text>No connected Square accounts found.</Text>
                    <Divider marginTop="1em" marginBottom="1em" />
                    <SquareConnectionForm />
                </>}
            </Container>
        </View>
    );
}

function formatAddress(address: any, oneLine: boolean = false): string {
    const cityLine = [address.locality, address.administrativeDistrictLevel1, address.postalCode].join(" ");
    return [
        address.addressLine1,
        address.addressLine2,
        address.addressLine3,
        cityLine
    ]
        .filter(x => !!x)
        .map(x => x.trim())
        .filter(x => !!x)
        .join(oneLine ? ", " : "\n");
}

export default SquareManagement;

/**
 * The query to list OAuth connections.
 */
const listSquareOAuthConnectionsQuery = /* GraphQL */ `
    query ListSquareOAuthConnections {
        listSquareOAuthConnections {
            items {
                merchantId
                expiresAt
                owner
                id
                chargeLocationId
                locations {
                    id
                    name
                    address {
                        firstName
                        lastName
                        addressLine1
                        addressLine2
                        addressLine3
                        administrativeDistrictLevel1
                        administrativeDistrictLevel2
                        administrativeDistrictLevel3
                        country
                        locality
                        sublocality
                        sublocality2
                        sublocality3
                        postalCode
                    }
                }
                createdAt
                updatedAt
            }
            nextToken
        }
    }
`;

/**
 * The query to delete an OAuth connection.
 */
 export const deleteSquareOAuthConnectionMutation = /* GraphQL */ `
    mutation DeleteSquareOAuthConnection(
        $input: DeleteSquareOAuthConnectionInput!
    ) {
        deleteSquareOAuthConnection(input: $input) {
            id
        }
    }
`;

type ListSquareOAuthConnectionsQuery = {
    listSquareOAuthConnections?:  {
      __typename: "ModelSquareOAuthConnectionConnection";
      items:  Array< {
        __typename: "SquareOAuthConnection";
        merchantId: string;
        expiresAt: string;
        locations: Array< {
            id?: string | null;
            name?: string | null;
            address?: {
                firstName?: string | null;
                lastName?: string | null;
                addressLine1?: string | null;
                addressLine2?: string | null;
                addressLine3?: string | null;
                administrativeDistrictLevel1?: string | null;
                administrativeDistrictLevel2?: string | null;
                administrativeDistrictLevel3?: string | null;
                country?: string | null;
                locality?: string | null;
                sublocality?: string | null;
                sublocality2?: string | null;
                sublocality3?: string | null;
                postalCode?: string | null;
            } | null;
        } | null >;
        chargeLocationId?: string | null;
        owner?: string | null;
        id: string;
        createdAt: string;
        updatedAt: string;
      } | null >;
      nextToken?: string | null;
    } | null;
  };