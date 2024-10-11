import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface CustomProps {
  vpcName: string;
}

export class VpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, customProps: CustomProps, props?: cdk.StackProps) {
    super(scope, id, props);

    const { vpcName } = customProps;

    // Create a VPC with public and private subnets
    const vpc = new ec2.Vpc(this, vpcName, {
      maxAzs: 3,
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

    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      description: 'VPC ID',
      exportName: `${vpcName}Id`,
    });

    // Output and export Public Subnet IDs
    vpc.publicSubnets.forEach((subnet, index) => {
      new cdk.CfnOutput(this, `PublicSubnet${index + 1}Id`, {
        value: subnet.subnetId,
        description: `Public Subnet ${index + 1} ID`,
        exportName: `${vpcName}PublicSubnet${index + 1}Id`,
      });
    });

    // Output and export Private Subnet IDs
    vpc.privateSubnets.forEach((subnet, index) => {
      new cdk.CfnOutput(this, `PrivateSubnet${index + 1}Id`, {
        value: subnet.subnetId,
        description: `Private Subnet ${index + 1} ID`,
        exportName: `${vpcName}PrivateSubnet${index + 1}Id`,
      });
    });

    // Collect public subnet IDs
    const publicSubnetIds = vpc.publicSubnets.map(subnet => subnet.subnetId);

    // Collect private subnet IDs
    const privateSubnetIds = vpc.privateSubnets.map(subnet => subnet.subnetId);

    // Output list of Public Subnet IDs
    new cdk.CfnOutput(this, 'PublicSubnetIds', {
      value: publicSubnetIds.join(','),
      description: 'Comma-separated list of Public Subnet IDs',
      exportName: `${vpcName}PublicSubnetIds`,
    });

    // Output list of Private Subnet IDs
    new cdk.CfnOutput(this, 'PrivateSubnetIds', {
      value: privateSubnetIds.join(','),
      description: 'Comma-separated list of Private Subnet IDs',
      exportName: `${vpcName}PrivateSubnetIds`,
    });


  }
}
