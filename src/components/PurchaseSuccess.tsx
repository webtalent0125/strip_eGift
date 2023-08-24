import { Button, Heading, Text, View } from "@aws-amplify/ui-react";
import { useNavigate, useParams } from "react-router-dom";

import "./PurchaseSuccess.css";

function PurchaseSuccess() {
    const navigate = useNavigate();
    const { merchantId } = useParams();
    const searchParams = new URLSearchParams(window.location.search);
    const email = searchParams.get("email");

    return (
        <View className="PurchaseSuccess">
            <View style={{ textAlign: "center" }}>
                <View width={250} height={250}>
                    <svg viewBox="0 0 100 100" className="SuccessCheck animate">
                        <filter id="dropshadow" height="100%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                            <feFlood floodColor="rgba(76, 175, 80, 1)" floodOpacity="0.5" result="color" />
                            <feComposite in="color" in2="blur" operator="in" result="blur" />
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        <circle cx="50" cy="50" r="46.5" fill="none" stroke="rgba(76, 175, 80, 0.5)" strokeWidth="5" />

                        <path d="M67,93 A46.5,46.5 0,1,0 7,32 L43,67 L88,19" fill="none" stroke="rgba(76, 175, 80, 1)" strokeWidth="5" strokeLinecap="round" strokeDasharray="80 1000" strokeDashoffset="-220" style={{ filter: "url(#dropshadow)" }} />
                    </svg>
                </View>

                <Heading level={1} marginBottom="0.1em">Purchase Successful</Heading>
                <View style={{ maxWidth: 500 }} marginLeft="auto" marginRight="auto" marginBottom="1em">
                    <Text>We will send an email with your GeoGift to <strong>{email}</strong>.</Text>
                </View>
                <Button variation="primary" onClick={() => navigate(`/purchase/${merchantId}`)}>Buy Another</Button>
            </View>
        </View>
    )
}

export default PurchaseSuccess;
