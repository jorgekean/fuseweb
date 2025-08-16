// NO LONGER NEEDED since we using back-end API to access Cosmos DB

import { CosmosClient } from "@azure/cosmos";

const endpoint = "https://fuse-cosmos.documents.azure.com:443/"; // Replace with your endpoint
const key = "TidyNbraqxLZThfepHxN75jFIezNjUbGOsq05BA4Z1iIjvoaPM5iz29sKtKrkMoZ7p7iPIIiezCDACDbxpNpSA=="; // Replace with your key
const databaseId = "FuseWeb";
const containerId = "Timesheets";

const client = new CosmosClient({ endpoint, key });

export const getContainer = () => {
  const database = client.database(databaseId);
  return database.container(containerId);
};
