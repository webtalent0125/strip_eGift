// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { SquareOAuthConnection, SquareLocation } = initSchema(schema);

export {
  SquareOAuthConnection,
  SquareLocation
};