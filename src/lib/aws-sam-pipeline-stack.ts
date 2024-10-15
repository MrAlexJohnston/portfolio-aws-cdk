import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class AwsSamPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const artifactBucket = new s3.Bucket(this, 'ArtifactBucket', {
      bucketName: `portfolio-aws-sam-bucket-${this.account}-${this.region}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create a CodePipeline
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'MyServerlessPipeline',
    });

    // Add source stage
    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner: 'MrAlexJohnston',
      repo: 'portfolio-aws-sam',
      oauthToken: cdk.SecretValue.secretsManager('github-token'),
      output: sourceOutput,
      branch: 'main',
    });
    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction],
    });

    // Add build stage
    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_4,
      },
      environmentVariables: {
        'PACKAGE_BUCKET': {
          value: artifactBucket.bucketName,
        },
        'AWS_REGION': {
          value: 'eu-west-2'
        }
      },
    });

    buildProject.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
      actions: [
        's3:PutObject',
      ],
      resources: ['*'],
    }));

    const buildOutput = new codepipeline.Artifact();
    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild',
      project: buildProject,
      input: sourceOutput,
      outputs: [buildOutput],
    });

    pipeline.addStage({
      stageName: 'Build',
      actions: [buildAction],
    });

    // Add deploy stage
    const deployAction = new codepipeline_actions.CloudFormationCreateUpdateStackAction({
      actionName: 'Deploy',
      templatePath: buildOutput.atPath('packaged.yaml'),
      stackName: 'portfolio-aws-sam',
      adminPermissions: true,
      cfnCapabilities: [
        cdk.CfnCapabilities.AUTO_EXPAND,
        cdk.CfnCapabilities.NAMED_IAM
      ]
    });

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [deployAction],
    });
  }
}