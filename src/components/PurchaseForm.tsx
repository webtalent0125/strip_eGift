import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "aws-amplify";
import { Button, Flex, Heading, Link, Loader, Text, TextField, View } from "@aws-amplify/ui-react";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import Container from "./Container";
import DenominationPicker from "./DenominationPicker";
import LocationPicker from "./LocationPicker";

import "./PurchaseForm.css";

function PurchaseForm() {
    let { merchantId } = useParams();

    const [merchantName, setMerchantName] = useState<string | null>();
    const [cardValue, setCardValue] = useState<number>();
    const [email, setEmail] = useState<string>("");
    const [coordinates, setCoordinates] = useState<any>({ latitude: 42.3493, longitude: -71.0782 });
    const [payClicked, setPayClicked] = useState(false);
    const [paymentLink, setPaymentLink] = useState<string | null>(null);

    const authMode = "API_KEY";

    useEffect(() => {
        (async () => {
            const result = await API.graphql({
                query: /* GraphQL */ `
                    query GetSquareOAuthConnectionByMerchantID(
                        $merchantId: String!
                        $limit: Int
                    ) {
                        squareOAuthConnectionByMerchantId(
                            merchantId: $merchantId
                            limit: $limit
                        ) {
                            items {
                                merchantName
                            }
                        }
                    }
                `,
                variables: {
                    merchantId
                },
                authMode,
            }) as GraphQLResult<any>;

            console.log(result);

            if (!result.errors || result.errors.length === 0)
                setMerchantName(result.data?.squareOAuthConnectionByMerchantId.items[0]?.merchantName ?? null);
        })().catch(console.error);
    }, [merchantId]);

    async function onContinueToPay() {
        try {
            setPayClicked(true);

            const result = await API.graphql({
                query: /* GraphQL */ `
                    mutation CreateGCOrder(
                        $value: Float!
                        $email: String!
                        $merchantId: String!
                    ) {
                        createGCOrder(
                            value: $value
                            email: $email
                            merchantId: $merchantId
                        ) {
                            url
                            orderId
                            error
                        }
                    }
                `,
                variables: {
                    value: cardValue,
                    email,
                    merchantId,
                },
                authMode,
            }) as GraphQLResult<any>;

            const { url } = result.data?.createGCOrder;
            if (!url) {
                console.error("GraphQL Result", result);
                throw new Error("Did not get URL from result.");
            }

            setTimeout(() => {
                setPaymentLink(url);
            }, 2500);

            document.location.href = url;
        }
        catch (e) {
            console.error("Error", e);
        }
    }

    const validCardValue = cardValue && cardValue > 0 && Number.isFinite(cardValue);
    const validEmail = email && email.includes("@");

    return (
        <View className="PurchaseForm">
            <Container>
                <Flex alignItems="flex-start" marginBottom="2em">
                    <Heading level={2} flex={1}>
                        {merchantName ? `Buy Gift Card for ${merchantName}` : "Buy Gift Card"}
                    </Heading>
                    {paymentLink
                        ? <Link className="amplify-button amplify-field-group__control amplify-button--primary amplify-button--large" color="white" href={paymentLink}>
                            Click Here if You are not Redirected &rarr;
                        </Link>
                        : <Button
                            variation="primary"
                            size="large"
                            disabled={!validCardValue || !validEmail || (payClicked && !paymentLink)}
                            onClick={onContinueToPay}>
                            {!payClicked
                                ? <>Continue to Pay &rarr;</>
                                : <>
                                    <Loader marginRight="1em" />
                                    Please Wait&hellip;
                                </>}
                        </Button>}
                </Flex>

                <View marginBottom="1.5em">
                    <Text className="PurchaseForm-Label">Denomination</Text>
                    <DenominationPicker 
                        disabled={payClicked}
                        value={cardValue ?? null}
                        onValueChange={setCardValue} />
                </View>

                <View marginBottom="1.5em">
                    <TextField
                        label="Deliver To"
                        size="large"
                        placeholder="special.some@example.com"
                        type="email"
                        inputMode="email"
                        disabled={payClicked}
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
                </View>

                <View marginBottom="1.5em">
                    <LocationPicker 
                        disabled={payClicked}
                        initialCoordinates={coordinates}
                        onCoordinatesChange={setCoordinates} />
                </View>

                <Flex justifyContent="flex-end" marginBottom="2em">
                    {paymentLink
                        ? <Link className="amplify-button amplify-field-group__control amplify-button--primary amplify-button--large" color="white" href={paymentLink}>
                            Click Here if You are not Redirected &rarr;
                        </Link>
                        : <Button
                            variation="primary"
                            size="large"
                            disabled={!validCardValue || !validEmail || (payClicked && !paymentLink)}
                            onClick={onContinueToPay}>
                            {!payClicked
                                ? <>Continue to Pay &rarr;</>
                                : <>
                                    <Loader marginRight="1em" />
                                    Please Wait&hellip;
                                </>}
                        </Button>}
                </Flex>
            </Container>
        </View>
    );
}

export default PurchaseForm;
