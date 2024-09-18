// src/config/aws-config.ts
import AWS from 'aws-sdk';

// Configure AWS SDK
const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
};

// Initialize the AWS SDK for services like S3
AWS.config.update(awsConfig);

// Export S3 instance
const s3 = new AWS.S3();

export default s3;
