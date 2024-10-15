import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as fs from 'fs';
import * as path from 'path';

export class AwsAmplifyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const buildSpec = fs.readFileSync(path.join(__dirname, '../config/amplify-buildspec.yml'), 'utf8');

    const amplifyRole = new iam.Role(this, 'AmplifyRole', {
      assumedBy: new iam.ServicePrincipal('amplify.amazonaws.com'),
    });

    // Add SSM read permissions to the role
    amplifyRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ssm:GetParameter'],
      resources: ['arn:aws:ssm:*:*:parameter/cdk-bootstrap/*'],
    }));

    amplifyRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:PutObject',
        's3:GetObject',
        's3:ListBucket',
        's3:DeleteObject',
      ],
      resources: [
        `*`
      ],
    }));

    const amplifyApp = new amplify.CfnApp(this, 'MyAmplifyApp', {
      name: 'PortfolioAwsAmplify',
      repository: 'https://github.com/MrAlexJohnston/portfolio-aws-amplify',
      oauthToken: cdk.SecretValue.secretsManager('github-token').unsafeUnwrap(),
      buildSpec: buildSpec,
      iamServiceRole: amplifyRole.roleArn,
    });

    new amplify.CfnBranch(this, 'MainBranch', {
      appId: amplifyApp.attrAppId,
      branchName: 'main',
      enableAutoBuild: true,
    });
  }
}