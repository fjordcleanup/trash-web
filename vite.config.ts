import { fromEnv } from '@bifravst/from-env'
import pJson from './package.json' with { type: 'json' }
import { createConfig } from './vite/config.ts'

const {
	cognitoUserPoolURL,
	cognitoIdentityPoolId,
	cognitoUserPoolClientId,
	awsRegion,
} = fromEnv({
	cognitoUserPoolURL: 'COGNITO_USER_POOL_URL',
	cognitoIdentityPoolId: 'COGNITO_IDENTITY_POOL_ID',
	cognitoUserPoolClientId: 'COGNITO_USER_POOL_CLIENT_ID',
	awsRegion: 'AWS_REGION',
})(process.env)

export default createConfig({
	cognitoUserPoolURL: new URL(cognitoUserPoolURL),
	cognitoUserPoolClientId,
	cognitoIdentityPoolId,
	awsRegion,
	leafletVersion: pJson.dependencies.leaflet,
})
