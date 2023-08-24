export type AmplifyDependentResourcesAttributes = {
    "auth": {
        "geogift691d6458": {
            "IdentityPoolId": "string",
            "IdentityPoolName": "string",
            "UserPoolId": "string",
            "UserPoolArn": "string",
            "UserPoolName": "string",
            "AppClientIDWeb": "string",
            "AppClientID": "string"
        }
    },
    "api": {
        "geogift": {
            "GraphQLAPIKeyOutput": "string",
            "GraphQLAPIIdOutput": "string",
            "GraphQLAPIEndpointOutput": "string"
        }
    },
    "geo": {
        "geogiftmap": {
            "Name": "string",
            "Style": "string",
            "Region": "string",
            "Arn": "string"
        },
        "geogiftplaceindex": {
            "Name": "string",
            "Region": "string",
            "Arn": "string"
        }
    },
    "function": {
        "geogiftsquare": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "geogiftoauthrefresh": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string",
            "CloudWatchEventRule": "string"
        }
    }
}