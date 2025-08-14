# Fjord CleanUP · Report and view trash in the Oslo fjord and in Akerselva.

[![GitHub Actions](https://github.com/fjordcleanup/trash-web/actions/workflows/test-and-release.yaml/badge.svg)](https://github.com/fjordcleanup/trash-web/actions/workflows/test-and-release.yaml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![@commitlint/config-conventional](https://img.shields.io/badge/%40commitlint-config--conventional-brightgreen)](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier/)
[![ESLint: TypeScript](https://img.shields.io/badge/ESLint-TypeScript-blue.svg)](https://github.com/typescript-eslint/typescript-eslint)

This is the web application that is served on
[trash.fjordcleanup.org](https://trash.fjordcleanup.org/).

The backend source can be found in
[trash](https://github.com/fjordcleanup/trash)

## Setup

Install the dependencies:

```bash
npm ci
```

## Provide these environment variables

- `COGNITO_USER_POOL_URL`
- `COGNITO_IDENTITY_POOL_ID`
- `COGNITO_USER_POOL_CLIENT_ID`
- `MAP_API_KEY`
- `AWS_REGION`

The production values can be seen in the
[`production` environment on GitHub](https://github.com/fjordcleanup/trash-web/settings/environments).

## Run

```bash
npm start
```

## Continuous Deployment with GitHub Actions

Create a GitHub environment `production`.

Store the account ID as a variable:

```bash
gh secret set ACCOUNT_ID --env production --body "<account id>"
```

Provide these environment variables from the backend:

- For the stack
  - `STACK_PREFIX` (e.g. `fjordcleanup-trash`)
  - `AWS_REGION` (e.g. `eu-north-1`)

- For the map resources an
  [AWS Location Maps API Key](https://docs.aws.amazon.com/location/latest/developerguide/using-apikeys.html)
  - `MAP_API_KEY`

- For Cognito
  - `COGNITO_USER_POOL_CLIENT_ID`
  - `COGNITO_USER_POOL_URL`
  - `COGNITO_IDENTITY_POOL_ID`

```bash
gh variable set "<name>" --env production --body "<value>"
```
