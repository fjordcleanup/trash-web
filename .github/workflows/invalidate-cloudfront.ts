import { CloudFormationClient } from '@aws-sdk/client-cloudformation'
import {
	CloudFrontClient,
	CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront'
import { stackOutput } from '@bifravst/cloudformation-helpers'
import { fromEnv } from '@bifravst/from-env'
import chalk from 'chalk'
import { glob } from 'glob'
import { randomUUID } from 'node:crypto'
import path, { parse } from 'node:path'

const { hostingStackName } = fromEnv({
	hostingStackName: 'HOSTING_STACK_NAME',
})(process.env)

const cloudFront = new CloudFrontClient({})
const cloudFormation = new CloudFormationClient({})

const buildDir = path.join(process.cwd(), 'build', 'client')

const htmlFiles = await glob('*/**/*.html', {
	cwd: buildDir,
})
const pathesToInvalidate = [
	'/',
	'/.well-known/release',
	...htmlFiles.map((f) => `/${encodeURIComponent(f)}`),
	...htmlFiles.map((f) => `/${encodeURIComponent(parse(f).dir)}/`),
]

console.log(chalk.yellow('Stack name:'), chalk.blue(hostingStackName))

const { distributionId } = await stackOutput(cloudFormation)<{
	distributionId: string
}>(hostingStackName)

console.log(chalk.yellow('Distribution ID:'), chalk.blue(distributionId))

console.log(chalk.yellow('Pathes to invalidate:'))
pathesToInvalidate.map((s) => console.log(chalk.gray('-'), chalk.blue(s)))

const { Invalidation } = await cloudFront.send(
	new CreateInvalidationCommand({
		DistributionId: distributionId,
		InvalidationBatch: {
			Paths: {
				Quantity: pathesToInvalidate.length,
				Items: pathesToInvalidate,
			},
			CallerReference: randomUUID(),
		},
	}),
)

console.log(chalk.green('Invalidation created!'))
console.log(chalk.yellow('Invalidation ID:'), chalk.blue(Invalidation?.Id))
