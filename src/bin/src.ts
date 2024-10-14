#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { NginxEcsStack } from '../lib/nginx-ecs-stack';

const vpcName = 'CdkVpc';

const app = new cdk.App();

new VpcStack(app, vpcName, {
  vpcName,
});

new NginxEcsStack(app, "NginxEcsStack", {
  vpcName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});