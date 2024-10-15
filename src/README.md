# Portfolio AWS CDK Project

This project showcases the use of AWS CDK (Cloud Development Kit) to define cloud infrastructure in code using TypeScript. The goal of this project is to build and manage AWS resources using CDK.

## Project Structure

- **bin/**: Entry point for the CDK app.
- **lib/**: Contains the CDK stacks for deploying AWS resources.
  - `aws-sam-pipeline-stack.ts`: Defines the AWS SAM pipeline stack.
  - `nginx-ecs-stack.ts`: Creates an Nginx container deployed on ECS Fargate.
  - `vpc-stack.ts`: Defines a VPC for use within the application.
- **test/**: Unit tests for the CDK constructs.

## Useful Commands

- `npm run build` – Compile TypeScript to JavaScript.
- `npm run watch` – Watch for changes and recompile.
- `npm run test` – Run unit tests using Jest.
- `npx cdk deploy` – Deploy the CDK stack to your default AWS account/region.
- `npx cdk diff` – Compare the deployed stack with the local state.
- `npx cdk synth` – Synthesize and print the generated CloudFormation template.

## Deployment Instructions

1. **Install Dependencies**  
   Run `npm install` to install all necessary dependencies.

2. **Build the Project**  
   Run `npm run build` to compile the TypeScript code into JavaScript.

3. **Deploy to AWS**  
   Use `npx cdk deploy` to deploy the infrastructure to your AWS account. Ensure you have the right AWS credentials configured.

4. **Testing**  
   Use `npm run test` to execute unit tests and validate your code.

## Stacks Overview

- **VPC Stack**  
  The VPC stack creates a custom VPC with private and public subnets across multiple Availability Zones. It is designed to host the ECS and Lambda resources securely.

- **Nginx ECS Stack**  
  This stack deploys an Nginx container running in Fargate, using the private subnets from the VPC created in the VPC stack. The application is exposed through a load balancer.

- **AWS SAM Pipeline Stack**  
  This stack defines a CI/CD pipeline using AWS SAM to deploy Lambda functions in private subnets. The application itself consists of
  - API Gateway
  - Lambda for each HTTP method type
  - DynamoDB table

## Future Work

- Website deployment - AWS Amplify?
- EKS
- Serverless event-driven architecture
- High availability database cluster
- Machine learning inference pipeline
- Disaster recovery solution

## Requirements

- AWS CLI
- AWS CDK Toolkit (`npm install -g aws-cdk`)
- Node.js
- TypeScript