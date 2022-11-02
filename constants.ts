export const FLATFILE_GRAPHQL_URL="https://api.us.flatfile.io/graphql"
export const FLATFILE_TEAM = process.env.FLATFILE_TEAM_ID as string;
export const FLATFILE_ENVS = {
  PROD: "64c7b20f-9d95-41ba-a582-e811f37dc619",
  TEST: "d3b7a781-b741-4b82-b028-10cc03321f85"
}
export const ACTIVE_FLATFILE_ENV = FLATFILE_ENVS.TEST;

export const SKYLARK_API = (process.env.NEXT_PUBLIC_SKYLARK_API_URL ||
  process.env.SKYLARK_API_URL) as string;

export const SAAS_API_ENDPOINT = (process.env.NEXT_PUBLIC_SAAS_API_ENDPOINT ||
  process.env.SAAS_API_ENDPOINT) as string;
export const SAAS_API_KEY = (process.env.NEXT_PUBLIC_SAAS_API_KEY ||
  process.env.SAAS_API_KEY) as string;
export const SAAS_ACCOUNT_ID = (process.env.NEXT_PUBLIC_SAAS_ACCOUNT_ID ||
  process.env.SAAS_ACCOUNT_ID) as string;
