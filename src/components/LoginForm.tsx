import { Authenticator, Button, Flex, useAuthenticator, View } from "@aws-amplify/ui-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function LoginForm() {
    const { route } = useAuthenticator((context) => [context.route]);
    const location = useLocation();
    const navigate = useNavigate();

    let from = (location.state as any)?.from?.pathname || "/";

    useEffect(() => {
        if (route === "authenticated")
            navigate(from, { replace: true });
    }, [route, navigate, from]);

    return (
        <View className="auth-wrapper">
            <Authenticator />
            <Flex justifyContent="center" marginTop="1.5em">
                <Button backgroundColor="white" onClick={() => navigate("/")}>Back</Button>
            </Flex>
        </View>
    );
}
