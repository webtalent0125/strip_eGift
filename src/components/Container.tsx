import { View } from "@aws-amplify/ui-react";

function Container(params: Omit<Parameters<typeof View>[0], "width" | "margin" | "marginLeft" | "marginRight">) {
    return (
        <View {...params}
            width={["auto", "auto", 748, 972, 1260, 1496, 1536]}
            marginLeft={[10, 10, "auto"]}
            marginRight={[10, 10, "auto"]}
        />
    );
}

export default Container;