#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';

const vpcName = 'CdkVpc';

const app = new cdk.App();
new VpcStack(app, vpcName, {
  vpcName,
}, {});