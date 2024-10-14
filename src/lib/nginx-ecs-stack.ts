import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';

interface NginxEcsStackProps extends cdk.StackProps {
    vpcName: string;
}

export class NginxEcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: NginxEcsStackProps) {
    super(scope, id, props);

    const { vpcName } = props;

    const vpcId = cdk.Fn.importValue(`${vpcName}Id`);

    // Lookup the existing VPC by its name
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'ImportedVPC', {
        vpcId: vpcId,
        availabilityZones: ['eu-west-2a', 'eu-west-2b', 'eu-west-2c'], // Adjust as needed
        publicSubnetIds: [
          cdk.Fn.importValue(`${vpcName}PublicSubnet1Id`),
          cdk.Fn.importValue(`${vpcName}PublicSubnet2Id`),
          cdk.Fn.importValue(`${vpcName}PublicSubnet3Id`)
        ],
        privateSubnetIds: [
          cdk.Fn.importValue(`${vpcName}PrivateSubnet1Id`),
          cdk.Fn.importValue(`${vpcName}PrivateSubnet2Id`),
          cdk.Fn.importValue(`${vpcName}PrivateSubnet3Id`)
        ]
      });

    // Create an ECS cluster in the discovered VPC
    const cluster = new ecs.Cluster(this, 'EcsCluster', {
      vpc,
    });

    // Define a Fargate task definition for NGINX
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'NginxTaskDef', {
      memoryLimitMiB: 512, // Adjust this value based on your needs
      cpu: 256,            // Adjust this value based on your needs
    });

    // Add NGINX container to the task definition
    const container = taskDefinition.addContainer('NginxContainer', {
      image: ecs.ContainerImage.fromRegistry('nginx'),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'nginx' }),
    });

    // Expose container port 80
    container.addPortMappings({
      containerPort: 80,
    });

    // Create a Fargate service with a public-facing load balancer
    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'NginxFargateService', {
      cluster,
      taskDefinition,
      publicLoadBalancer: true, // This creates a public-facing ALB
      listenerPort: 80,
      desiredCount: 1, // Number of Fargate tasks to run
    });

    // Output the load balancer DNS name
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: fargateService.loadBalancer.loadBalancerDnsName,
      description: 'DNS name of the load balancer',
    });
  }
}
