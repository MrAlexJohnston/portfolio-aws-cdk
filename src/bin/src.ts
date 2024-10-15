#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { NginxEcsStack } from '../lib/nginx-ecs-stack';
import { AwsSamPipelineStack } from '../lib/aws-sam-pipeline-stack';

const vpcName = 'CdkVpc';

const app = new cdk.App();

new VpcStack(app, vpcName, {
  vpcName,
});

new NginxEcsStack(app, "NginxEcs", {
  vpcName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new AwsSamPipelineStack(app, "AwsSamPipeline", {
  vpcName,
});