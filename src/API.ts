/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateSquareOAuthConnectionInput = {
  id?: string | null,
  merchantId: string,
  expiresAt: string,
  accessToken: string,
  refreshToken: string,
  owner?: string | null,
  merchantName?: string | null,
  chargeLocationId?: string | null,
  locations?: Array< SquareLocationInput | null > | null,
};

export type SquareLocationInput = {
  id?: string | null,
  name?: string | null,
  address?: SquareLocationAddressInput | null,
};

export type SquareLocationAddressInput = {
  firstName?: string | null,
  lastName?: string | null,
  addressLine1?: string | null,
  addressLine2?: string | null,
  addressLine3?: string | null,
  administrativeDistrictLevel1?: string | null,
  administrativeDistrictLevel2?: string | null,
  administrativeDistrictLevel3?: string | null,
  country?: string | null,
  locality?: string | null,
  sublocality?: string | null,
  sublocality2?: string | null,
  sublocality3?: string | null,
  postalCode?: string | null,
};

export type ModelSquareOAuthConnectionConditionInput = {
  merchantId?: ModelStringInput | null,
  expiresAt?: ModelStringInput | null,
  accessToken?: ModelStringInput | null,
  refreshToken?: ModelStringInput | null,
  owner?: ModelStringInput | null,
  merchantName?: ModelStringInput | null,
  chargeLocationId?: ModelStringInput | null,
  and?: Array< ModelSquareOAuthConnectionConditionInput | null > | null,
  or?: Array< ModelSquareOAuthConnectionConditionInput | null > | null,
  not?: ModelSquareOAuthConnectionConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type SquareOAuthConnection = {
  __typename: "SquareOAuthConnection",
  id: string,
  merchantId: string,
  expiresAt: string,
  accessToken: string,
  refreshToken: string,
  owner?: string | null,
  merchantName?: string | null,
  chargeLocationId?: string | null,
  locations?:  Array<SquareLocation | null > | null,
  createdAt: string,
  updatedAt: string,
};

export type SquareLocation = {
  __typename: "SquareLocation",
  id?: string | null,
  name?: string | null,
  address?: SquareLocationAddress | null,
};

export type SquareLocationAddress = {
  __typename: "SquareLocationAddress",
  firstName?: string | null,
  lastName?: string | null,
  addressLine1?: string | null,
  addressLine2?: string | null,
  addressLine3?: string | null,
  administrativeDistrictLevel1?: string | null,
  administrativeDistrictLevel2?: string | null,
  administrativeDistrictLevel3?: string | null,
  country?: string | null,
  locality?: string | null,
  sublocality?: string | null,
  sublocality2?: string | null,
  sublocality3?: string | null,
  postalCode?: string | null,
};

export type UpdateSquareOAuthConnectionInput = {
  id: string,
  merchantId?: string | null,
  expiresAt?: string | null,
  accessToken?: string | null,
  refreshToken?: string | null,
  owner?: string | null,
  merchantName?: string | null,
  chargeLocationId?: string | null,
  locations?: Array< SquareLocationInput | null > | null,
};

export type DeleteSquareOAuthConnectionInput = {
  id: string,
};

export type CreateGCOrderResult = {
  __typename: "CreateGCOrderResult",
  url?: string | null,
  orderId?: string | null,
  error?: string | null,
};

export type ModelSquareOAuthConnectionFilterInput = {
  id?: ModelIDInput | null,
  merchantId?: ModelStringInput | null,
  expiresAt?: ModelStringInput | null,
  accessToken?: ModelStringInput | null,
  refreshToken?: ModelStringInput | null,
  owner?: ModelStringInput | null,
  merchantName?: ModelStringInput | null,
  chargeLocationId?: ModelStringInput | null,
  and?: Array< ModelSquareOAuthConnectionFilterInput | null > | null,
  or?: Array< ModelSquareOAuthConnectionFilterInput | null > | null,
  not?: ModelSquareOAuthConnectionFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelSquareOAuthConnectionConnection = {
  __typename: "ModelSquareOAuthConnectionConnection",
  items:  Array<SquareOAuthConnection | null >,
  nextToken?: string | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type GetOAuthTokenMutationVariables = {
  code: string,
};

export type GetOAuthTokenMutation = {
  getOAuthToken?: string | null,
};

export type CreateSquareOAuthConnectionMutationVariables = {
  input: CreateSquareOAuthConnectionInput,
  condition?: ModelSquareOAuthConnectionConditionInput | null,
};

export type CreateSquareOAuthConnectionMutation = {
  createSquareOAuthConnection?:  {
    __typename: "SquareOAuthConnection",
    id: string,
    merchantId: string,
    expiresAt: string,
    accessToken: string,
    refreshToken: string,
    owner?: string | null,
    merchantName?: string | null,
    chargeLocationId?: string | null,
    locations?:  Array< {
      __typename: "SquareLocation",
      id?: string | null,
      name?: string | null,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateSquareOAuthConnectionMutationVariables = {
  input: UpdateSquareOAuthConnectionInput,
  condition?: ModelSquareOAuthConnectionConditionInput | null,
};

export type UpdateSquareOAuthConnectionMutation = {
  updateSquareOAuthConnection?:  {
    __typename: "SquareOAuthConnection",
    id: string,
    merchantId: string,
    expiresAt: string,
    accessToken: string,
    refreshToken: string,
    owner?: string | null,
    merchantName?: string | null,
    chargeLocationId?: string | null,
    locations?:  Array< {
      __typename: "SquareLocation",
      id?: string | null,
      name?: string | null,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteSquareOAuthConnectionMutationVariables = {
  input: DeleteSquareOAuthConnectionInput,
  condition?: ModelSquareOAuthConnectionConditionInput | null,
};

export type DeleteSquareOAuthConnectionMutation = {
  deleteSquareOAuthConnection?:  {
    __typename: "SquareOAuthConnection",
    id: string,
    merchantId: string,
    expiresAt: string,
    accessToken: string,
    refreshToken: string,
    owner?: string | null,
    merchantName?: string | null,
    chargeLocationId?: string | null,
    locations?:  Array< {
      __typename: "SquareLocation",
      id?: string | null,
      name?: string | null,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateGCOrderMutationVariables = {
  value: number,
  email: string,
  merchantId: string,
};

export type CreateGCOrderMutation = {
  createGCOrder?:  {
    __typename: "CreateGCOrderResult",
    url?: string | null,
    orderId?: string | null,
    error?: string | null,
  } | null,
};

export type GetSquareOAuthConnectionQueryVariables = {
  id: string,
};

export type GetSquareOAuthConnectionQuery = {
  getSquareOAuthConnection?:  {
    __typename: "SquareOAuthConnection",
    id: string,
    merchantId: string,
    expiresAt: string,
    accessToken: string,
    refreshToken: string,
    owner?: string | null,
    merchantName?: string | null,
    chargeLocationId?: string | null,
    locations?:  Array< {
      __typename: "SquareLocation",
      id?: string | null,
      name?: string | null,
    } | null > | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListSquareOAuthConnectionsQueryVariables = {
  filter?: ModelSquareOAuthConnectionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListSquareOAuthConnectionsQuery = {
  listSquareOAuthConnections?:  {
    __typename: "ModelSquareOAuthConnectionConnection",
    items:  Array< {
      __typename: "SquareOAuthConnection",
      id: string,
      merchantId: string,
      expiresAt: string,
      accessToken: string,
      refreshToken: string,
      owner?: string | null,
      merchantName?: string | null,
      chargeLocationId?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type SquareOAuthConnectionByMerchantIdQueryVariables = {
  merchantId: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelSquareOAuthConnectionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type SquareOAuthConnectionByMerchantIdQuery = {
  squareOAuthConnectionByMerchantId?:  {
    __typename: "ModelSquareOAuthConnectionConnection",
    items:  Array< {
      __typename: "SquareOAuthConnection",
      id: string,
      merchantId: string,
      expiresAt: string,
      accessToken: string,
      refreshToken: string,
      owner?: string | null,
      merchantName?: string | null,
      chargeLocationId?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type SquareOAuthConnectionByOwnerQueryVariables = {
  owner: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelSquareOAuthConnectionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type SquareOAuthConnectionByOwnerQuery = {
  squareOAuthConnectionByOwner?:  {
    __typename: "ModelSquareOAuthConnectionConnection",
    items:  Array< {
      __typename: "SquareOAuthConnection",
      id: string,
      merchantId: string,
      expiresAt: string,
      accessToken: string,
      refreshToken: string,
      owner?: string | null,
      merchantName?: string | null,
      chargeLocationId?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};
