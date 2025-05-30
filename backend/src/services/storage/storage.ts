import logger from "../../logger";
import { FilebaseS3Service } from "./filebase/filebase";

import type { FilebaseS3Config } from "./filebase/filebase";

let storageService: FilebaseS3Service | null = null;

export const initializeStorageService = (): FilebaseS3Service => {
  if (storageService) {
    return storageService;
  }

  // Validate environment variables
  const requiredEnvVars = [
    'FILEBASE_ACCESS_KEY',
    'FILEBASE_SECRET_KEY',
    'FILEBASE_ENDPOINT',
    'FILEBASE_REGION',
    'FILEBASE_BUCKET_NAME',
  ];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  const config: FilebaseS3Config = {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY!,
    secretAccessKey: process.env.FILEBASE_SECRET_KEY!,
    endpoint: process.env.FILEBASE_ENDPOINT!,
    region: process.env.FILEBASE_REGION!,
    bucketName: process.env.FILEBASE_BUCKET_NAME!,
  };

  storageService = new FilebaseS3Service(config);
  logger.info(`Filebase S3 service initialized successfully`);
  return storageService;
};


export const getS3Service = (): FilebaseS3Service => {
  if (!storageService) {
    logger.error('S3 service not initialized. Call initializeStorageService() first.');
    throw new Error('S3 service not initialized. Call initializeStorageService() first.');
  }
  return storageService;
};


export const closeS3Connection = (): void => {
  if (storageService) {
    storageService.destroy();
    storageService = null;
    logger.info('S3 service connection closed successfully');
  }
};
