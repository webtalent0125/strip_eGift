import { Button, Flex, Heading, Text, useAuthenticator, View } from '@aws-amplify/ui-react';
import Container from './components/Container';
import { Route, Routes, useNavigate } from 'react-router-dom';

import SquareManagement from './components/square/SquareManagement';
import SquareCallbackHandler from './components/square/SquareCallbackHandler';
import SignInMenu from './components/SignInButton';
import LoginForm from './components/LoginForm';
import PurchaseForm from './components/PurchaseForm';

import './App.css';
import PurchaseSuccess from './components/PurchaseSuccess';

function App() {
    const navigate = useNavigate();
    const { route } = useAuthenticator(context => [context.route]);

    const isAuthenticated = route === "authenticated";

    return (
        <View className="App">
            <View className="header">
                <Container>
                    <Flex>
                        <Heading level={1} className="logo" onClick={() => navigate("/")}>GeoGift</Heading>
                        <View style={{ flex: 1 }}></View>
                        <Routes>
                            <Route path="purchase/*" element={<></>} />
                            <Route path="*" element={<SignInMenu />} />
                        </Routes>
                    </Flex>
                </Container>
            </View>

            <Routes>
                <Route path="/" element={
                    <Container>
                        <Heading level={2} marginBottom="0.25em">Get Started</Heading>
                        <Text marginBottom="0.75em">
                            Ready to get started?{' '}
                            {isAuthenticated ? "Connect your Square account." : "Sign in to your account"}
                        </Text>
                        {isAuthenticated
                            ? <Button size="large" variation="primary" onClick={() => navigate("/square")}>
                                Get Started
                            </Button>
                            : <Button size="large" variation="primary" onClick={() => navigate("/login")}>
                                Sign In or Sign Up
                            </Button>}
                    </Container>
                } />
                <Route path="login" element={<LoginForm />} />
                <Route path="square" element={<SquareManagement />} />
                <Route path="square-callback" element={<SquareCallbackHandler />} />
                <Route path="purchase/:merchantId" element={<PurchaseForm />} />
                <Route path="purchase/:merchantId/success" element={<PurchaseSuccess />} />
                <Route path="*" element={<Container><Heading level={2}>Not Found</Heading></Container>} />
            </Routes>
        </View>
    );
}

export default App;
