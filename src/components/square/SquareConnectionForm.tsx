import { Button, Text, useAuthenticator, View } from "@aws-amplify/ui-react";
import Container from "../Container";

import SquareOAuth2 from "../../squareOAuthConfig.json";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function SquareConnectionForm() {

    const navigate = useNavigate();
    const { route } = useAuthenticator(context => [context.route]);

    useEffect(() => {
        if (route !== "authenticated")
            navigate("/login");
    }, [route, navigate]);
    
    function authorize() {
        const state = generateAuthState();
        localStorage.setItem("geogift_auth_state", state);

        const params = new URLSearchParams({
            "client_id": SquareOAuth2.applicationId,
            "scope": [
                "GIFTCARDS_READ",
                "GIFTCARDS_WRITE",
                "MERCHANT_PROFILE_READ",
                "ORDERS_READ",
                "ORDERS_WRITE",
                "PAYMENTS_READ",
                "PAYMENTS_WRITE",
                "PAYMENTS_WRITE_ADDITIONAL_RECIPIENTS"
            ].join(" "),
            "session": "false",
            "redirect_uri": SquareOAuth2.redirectUri,
            "state": state,
        });
        const url = `${SquareOAuth2.endpoint}/oauth2/authorize?${params.toString()}`;

        window.location.href = url;
    }

    return (
        <View className="SquareConnectionForm">
            <Container>
                <Text marginBottom="0.75em">
                    Press the button below to be redirected to Square's login page. You will be asked to authorize{' '}
                    <strong>GeoGift</strong> to access your Square account.
                </Text>
                <Button variation="primary" onClick={authorize}>Login to Square</Button>
            </Container>
        </View>
    );
}

function generateAuthState(): string {
    const nonce = new Uint32Array(32);
    crypto.getRandomValues(nonce);
    return Array.from(nonce, x => ('0' + x.toString(16)).substring(-2)).join('');
}

export default SquareConnectionForm;
