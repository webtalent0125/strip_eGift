/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getSquareOAuthConnection = /* GraphQL */ `
  query GetSquareOAuthConnection($id: ID!) {
    getSquareOAuthConnection(id: $id) {
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
export const listSquareOAuthConnections = /* GraphQL */ `
  query ListSquareOAuthConnections(
    $filter: ModelSquareOAuthConnectionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSquareOAuthConnections(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        merchantId
        expiresAt
        accessToken
        refreshToken
        owner
        merchantName
        chargeLocationId
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const squareOAuthConnectionByMerchantId = /* GraphQL */ `
  query SquareOAuthConnectionByMerchantId(
    $merchantId: String!
    $sortDirection: ModelSortDirection
    $filter: ModelSquareOAuthConnectionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    squareOAuthConnectionByMerchantId(
      merchantId: $merchantId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        merchantId
        expiresAt
        accessToken
        refreshToken
        owner
        merchantName
        chargeLocationId
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const squareOAuthConnectionByOwner = /* GraphQL */ `
  query SquareOAuthConnectionByOwner(
    $owner: String!
    $sortDirection: ModelSortDirection
    $filter: ModelSquareOAuthConnectionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    squareOAuthConnectionByOwner(
      owner: $owner
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        merchantId
        expiresAt
        accessToken
        refreshToken
        owner
        merchantName
        chargeLocationId
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
