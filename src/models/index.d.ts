import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";



export declare class SquareLocation {
  readonly id?: string | null;
  readonly name?: string | null;
  readonly address?: string | null;
  constructor(init: ModelInit<SquareLocation>);
}

type SquareOAuthConnectionMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class SquareOAuthConnection {
  readonly id: string;
  readonly merchantId: string;
  readonly expiresAt: string;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly owner?: string | null;
  readonly locations?: (SquareLocation | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<SquareOAuthConnection, SquareOAuthConnectionMetaData>);
  static copyOf(source: SquareOAuthConnection, mutator: (draft: MutableModel<SquareOAuthConnection, SquareOAuthConnectionMetaData>) => MutableModel<SquareOAuthConnection, SquareOAuthConnectionMetaData> | void): SquareOAuthConnection;
}