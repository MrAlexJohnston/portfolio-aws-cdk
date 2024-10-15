import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface VpcStackProps extends cdk.StackProps {
  vpcName: string;
}

export class VpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    const { vpcName } = props;

    // Create a VPC with public and private subnets
    const vpc = new ec2.Vpc(this, vpcName, {
      availabilityZones: ['eu-west-2a', 'eu-west-2b', 'eu-west-2c'],
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        }
      ]
    });

    const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc,
      description: 'Allow Lambda to access resources in the VPC',
      allowAllOutbound: true,
    });

    // Outputs
    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      description: 'VPC ID',
      exportName: `${vpcName}Id`,
    });

    vpc.publicSubnets.forEach((subnet, index) => {
      new cdk.CfnOutput(this, `PublicSubnet${index + 1}Id`, {
        value: subnet.subnetId,
        description: `Public Subnet ${index + 1} ID`,
        exportName: `${vpcName}PublicSubnet${index + 1}Id`,
      });
    });

    vpc.privateSubnets.forEach((subnet, index) => {
      new cdk.CfnOutput(this, `PrivateSubnet${index + 1}Id`, {
        value: subnet.subnetId,
        description: `Private Subnet ${index + 1} ID`,
        exportName: `${vpcName}PrivateSubnet${index + 1}Id`,
      });
    });

    const publicSubnetIds = vpc.publicSubnets.map(subnet => subnet.subnetId);
    const privateSubnetIds = vpc.privateSubnets.map(subnet => subnet.subnetId);

    new cdk.CfnOutput(this, 'PublicSubnetIds', {
      value: publicSubnetIds.join(','),
      description: 'Comma-separated list of Public Subnet IDs',
      exportName: `${vpcName}PublicSubnetIds`,
    });

    new cdk.CfnOutput(this, 'PrivateSubnetIds', {
      value: privateSubnetIds.join(','),
      description: 'Comma-separated list of Private Subnet IDs',
      exportName: `${vpcName}PrivateSubnetIds`,
    });

    new cdk.CfnOutput(this, 'LambdaSecurityGroupId', {
      value: lambdaSecurityGroup.securityGroupId,
      description: 'The Security Group ID for the Lambda function',
      exportName: `${vpcName}LambdaSecurityGroupId`,
    });
    
  }
}
