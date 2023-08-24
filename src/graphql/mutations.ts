/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getOAuthToken = /* GraphQL */ `
  mutation GetOAuthToken($code: String!) {
    getOAuthToken(code: $code)
  }
`;
export const createSquareOAuthConnection = /* GraphQL */ `
  mutation CreateSquareOAuthConnection(
    $input: CreateSquareOAuthConnectionInput!
    $condition: ModelSquareOAuthConnectionConditionInput
  ) {
    createSquareOAuthConnection(input: $input, condition: $condition) {
      id
      merchantId
      expiresAt
      accessToken
      refreshToken
      owner
      merchantName
      chargeLocationId
      locations {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;
export const updateSquareOAuthConnection = /* GraphQL */ `
  mutation UpdateSquareOAuthConnection(
    $input: UpdateSquareOAuthConnectionInput!
    $condition: ModelSquareOAuthConnectionConditionInput
  ) {
    updateSquareOAuthConnection(input: $input, condition: $condition) {
      id
      merchantId
      expiresAt
      accessToken
      refreshToken
      owner
      merchantName
      chargeLocationId
      locations {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;
export const deleteSquareOAuthConnection = /* GraphQL */ `
  mutation DeleteSquareOAuthConnection(
    $input: DeleteSquareOAuthConnectionInput!
    $condition: ModelSquareOAuthConnectionConditionInput
  ) {
    deleteSquareOAuthConnection(input: $input, condition: $condition) {
      id
      merchantId
      expiresAt
      accessToken
      refreshToken
      owner
      merchantName
      chargeLocationId
      locations {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;
export const createGCOrder = /* GraphQL */ `
  mutation CreateGCOrder(
    $value: Float!
    $email: String!
    $merchantId: String!
  ) {
    createGCOrder(value: $value, email: $email, merchantId: $merchantId) {
      url
      orderId
      error
    }
  }
`;
