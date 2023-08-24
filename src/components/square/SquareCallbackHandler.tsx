import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API } from "aws-amplify";
import { Alert, Heading, Loader, Text, useAuthenticator } from "@aws-amplify/ui-react";
import { GraphQLResult } from "@aws-amplify/api-graphql";

import Container from "../Container";
import { getOAuthToken } from "../../graphql/mutations";
import { GetOAuthTokenMutation } from "../../API";

function SquareCallbackHandler() {
    const [params] = useSearchParams();

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const navigate = useNavigate();
    const { route } = useAuthenticator(context => [context.route]);
    
    const apiRequest = useRef<Promise<unknown> | null>(null);

    if (route !== "authenticated")
        navigate("/login");

    const code = params.get("code");
    const responseType = params.get("response_type");
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    const authState = localStorage.getItem("geogift_auth_state");
    if (!authState)
        errorMessages.push("Auth state not found.");
    
    if (error === "access_denied" && errorDescription === "user_denied")
        errorMessages.push("You chose to deny access to your square account.");
    else if (error)
        errorMessages.push(`An error was returned by the Square API: ${error}, description: ${errorDescription}`);
    else if (responseType !== "code")
        errorMessages.push(`A response type that this app could not handle was returned (${responseType})`);

    useEffect(() => {
        if (errorMessages.length > 0 || !authState || apiRequest.current)
            return;

        apiRequest.current = (async () => {
            console.log("Making API request");
            const result = await API.graphql({
                query: getOAuthToken,
                variables: { code },
            }) as GraphQLResult<GetOAuthTokenMutation>;
            console.log("Result", result);

            if (result.data?.getOAuthToken === "Success")
                navigate("/square");

            setErrorMessages(result.errors?.map(e => e.message) ?? ["An error occurred."]);
        })().catch(e => {
            console.error(e);
            setErrorMessages(e.errors?.map((e0: any) => e0?.message ?? "Unknown Error") ?? ["Unknown Error"]);
        });
    }, [code, errorMessages, authState, navigate]);

    return (
        <Container className="SquareCallbackHandler">
            {errorMessages.length > 0
                ? errorMessages.map(message => <Alert variation="error" marginBottom="0.25em">{message}</Alert>)
                : <>
                    <Heading level={2} marginBottom="0.25em">Square Account Authorized</Heading>
                    <Text marginBottom="0.75em">Please wait while we get set up the connection&hellip;</Text>
                    <Loader variation="linear" margin="0.5em" />
                </>
            }
        </Container>
    );
}

export default SquareCallbackHandler;