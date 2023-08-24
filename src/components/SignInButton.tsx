import { Button, useAuthenticator } from "@aws-amplify/ui-react";
import { useNavigate } from "react-router-dom";

export default function SignInButton() {
    const navigate = useNavigate();
    const { route, signOut } = useAuthenticator(context => [context.route]);

    const isAuthenticated = route === "authenticated";
    return isAuthenticated
        ? <Button onClick={() => signOut()} size="small" variation="link">Sign Out</Button>
        : <Button onClick={() => navigate("/login")} size="small" variation="link">Sign In or Sign Up</Button>
}
