// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

import { getFinalDatabaseView } from "../../lib/flatfile/get";
import {
  createTemplate,
  createEmbed,
  updateTemplate,
  updateEmbed,
} from "../../lib/flatfile/mutations";
import { FlatfileTemplate } from "../../interfaces/template";
import { exchangeFlatfileAccessKey } from "../../lib/flatfile/auth";
import { getEmbeds, getTemplates } from "../../lib/flatfile/get";
import { SAAS_ACCOUNT_ID } from "../../constants";
import { getSkylarkProperties } from "../../hooks/useSkylarkProperties";
import { jsonToGraphQLQuery } from "json-to-graphql-query";
import { skylarkGraphQLClient } from "../../lib/graphqlClient";

interface Data {
  embedId: string;
  token: string;
}

interface FlatfileRow {
  id: number;
  status: string;
  valid: boolean;
  data: {
    [key: string]: string | boolean | null;
  };
  info: [];
}

export type GraphQLMediaObjectTypes =
  | "Brand"
  | "Season"
  | "Episode"
  | "Movie"
  | "Asset";

export type GraphQLObjectTypes =
  | GraphQLMediaObjectTypes
  | "Theme"
  | "Genre"
  | "Rating"
  | "Person"
  | "Role"
  | "Tag"
  | "Credit"
  | "Set"
  | "Dimension"
  | "DimensionValue"
  | "Availability"
  | "Image";

export const createSkylarkObjects = async (
  objectType: GraphQLObjectTypes,
  flatfileBatchId: string,
  flatfileRows: FlatfileRow[]
): Promise<any> => {
  const method = `create${objectType}`;
  const mutationPrefix = `${method}_${flatfileBatchId}`.replaceAll("-", "_");

  const dateProperties = await getSkylarkProperties("Person").then((data) =>
    data
      .filter((property) => property.type.name === "AWSDateTime")
      .map((property) => property.name)
  );

  const operations = flatfileRows.reduce((previousOperations, { id, data }) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v != null)
    );

    const secondFilteredData = Object.fromEntries(
      Object.entries(filteredData).filter(
        ([k, v]) => !(dateProperties.includes(k) && v === "")
      )
    );

    const operation = {
      __aliasFor: method,
      __args: {
        [objectType.toLowerCase()]: secondFilteredData,
      },
      uid: true,
      external_id: true,
    };

    const updatedOperations = {
      ...previousOperations,
      [`${mutationPrefix}_${id}`]: {
        ...operation,
      },
    };
    return updatedOperations;
  }, {} as { [key: string]: object });

  const mutation = {
    mutation: {
      __name: mutationPrefix,
      ...operations,
    },
  };

  const graphQLMutation = jsonToGraphQLQuery(mutation);

  const data = await skylarkGraphQLClient.request<{
    [key: string]: { uid: string; external_id: string };
  }>(graphQLMutation);

  return data;
};

const propertiesToRemove = (
  originalFields: { [key: string]: any },
  properties: string[]
) => {
  return Object.keys(originalFields).filter((property) =>
    properties.includes(property)
  );
};

export const getValidFields = (
  fields: {
    [key: string]: any;
  },
  validProperties: string[]
): { [key: string]: any } => {
  const validObjectFields = validProperties.filter((property) =>
    Object.keys(fields).includes(property)
  );

  const validFields = validObjectFields.reduce((obj, property) => {
    return {
      ...obj,
      [property]: obj[property],
    };
  }, {} as { [key: string]: string | number | boolean });

  return validFields;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  if (req.method !== "POST") {
    return res.status(501).end();
  }

  if (!process.env.FLATFILE_ACCESS_KEY_ID || !process.env.FLATFILE_SECRET_KEY) {
    return res
      .status(500)
      .send("No Flatfile Access Key ID or Flatfile Secret supplied");
  }

  const org = { id: 39821, name: "Skylark" };
  let user = { id: 0, name: "", email: "" };
  let flatfileAccessToken = "";

  try {
    const data = await exchangeFlatfileAccessKey(
      process.env.FLATFILE_ACCESS_KEY_ID,
      process.env.FLATFILE_SECRET_KEY
    );

    user = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
    };
    flatfileAccessToken = data.accessToken;
  } catch (err) {
    if ((err as Error).message) {
      res.status(500).send((err as Error).message);
    }
    return res.status(500).send("Error exchanging Flatfile token");
  }

  const batchId = "2ca28f49-bc3d-41a4-b40a-06ef57cea65d";
  const data = await getFinalDatabaseView(flatfileAccessToken, batchId);
  const flatfileRows = data?.getFinalDatabaseView?.rows.filter(
    (item) => item.status === "accepted" && item.valid
  );
  const skylarkObjects = await createSkylarkObjects(
    "Person",
    batchId,
    flatfileRows
  );

  return res.status(200).send(skylarkObjects);
}
