import {
    DeleteObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
    HeadBucketCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import logger from "../../../logger";
import { generateUniqueFileReference } from "../support";
import { PrismaClient } from "@prisma/client";

export interface FilebaseS3Config {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
    region?: string;
    bucketName: string;
}

const prisma = new PrismaClient();

export class FilebaseS3Service {
    private s3Client: S3Client;
    private bucketName: string;
    private config: any;

    constructor(config: FilebaseS3Config) {
        // Validate required configuration
        if (!config.accessKeyId || !config.secretAccessKey || !config.bucketName || !config.endpoint) {
            logger.error('accessKeyId, secretAccessKey, config and bucketname are required for Filebase S3 service');
            throw new Error('accessKeyId, secretAccessKey, config and bucketname are required');
        }

        this.config = {
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey
            },
            endpoint: config.endpoint,
            region: config.region,
            forcePathStyle: true // Required for Filebase
        };

        // Initialize S3 client
        this.s3Client = new S3Client(this.config);
        this.bucketName = config.bucketName;
    }
    // /**
    //  * Upload a file to a bucket
    //  */
    // async uploadFile(key: string, filePath: string, options: { contentType?: string; metadata?: Record<string, string>; acl?: "private" | "public-read" | "public-read-write" | "authenticated-read" | "aws-exec-read" | "bucket-owner-read" | "bucket-owner-full-control" } = {}) {
    //     try {
    //         const fileContent = readFileSync(filePath);

    //         const command = new PutObjectCommand({
    //             Bucket: this.bucketName,
    //             Key: key,
    //             Body: fileContent,
    //             ContentType: options.contentType || this.getContentType(filePath),
    //             Metadata: options.metadata || {},
    //             ACL: options.acl || 'private',
    //         });

    //         const result = await this.s3Client.send(command);
    //         logger.info(`File uploaded successfully to ${this.bucketName}/${key}`);
    //         return result;
    //     } catch (error: any) {
    //         logger.error(`Error uploading file to ${this.bucketName}/${key}:`, error?.message || error);
    //         throw error;
    //     }
    // }

    /**
    * Upload buffer
    */
    async uploadData(data: any, options: { metadata?: Record<string, string>; acl?: "private" | "public-read" | "public-read-write" | "authenticated-read" | "aws-exec-read" | "bucket-owner-read" | "bucket-owner-full-control" } = {}): Promise<any> {
        try {
             const uuid = await generateUniqueFileReference();
             const reference = `${uuid}.${data.originalname.split('.').pop() || ''}`;
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: reference,
                Body: data.buffer,
                ContentType: data.mimetype || 'application/octet-stream',
                Metadata: options.metadata || {},
                ACL: options.acl || 'private'
            });

            // upload to S3
            await this.s3Client.send(command);

            logger.info(`Uploaded data to ${this.bucketName}/${reference}`);

            //  save to db
            const savedData = await prisma.file.create({
                data: {
                    reference: reference,
                    filename: data.originalname,
                    mimetype: data.mimetype || 'application/octet-stream',
                }
            });
            logger.info(`File metadata saved to database with ID: ${savedData.id}`);
            return savedData;
        } catch (error: any) {
            logger.error(`Error uploading data :`, error?.message || error);
            throw error;
        }
    }


    /**
     * Download a file from a bucket
     */
    async downloadFile(key: string, downloadPath: string) {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });

            const result = await this.s3Client.send(command);

            // Ensure directory exists
            const dir = path.dirname(downloadPath);
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }

            // Convert stream to buffer and write to file
            if (!result.Body || typeof (result.Body as any)[Symbol.asyncIterator] !== 'function') {
                logger.error('Result body is not a readable stream');
                throw new Error('Result body is not a readable stream');
            }
            const chunks: Buffer[] = [];
            for await (const chunk of result.Body as any as AsyncIterable<any>) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            const buffer = Buffer.concat(chunks);

            writeFileSync(downloadPath, buffer);
            logger.info(`File downloaded successfully to: ${downloadPath}`);
            return result;
        } catch (error: any) {
            logger.error(`Error downloading file from ${this.bucketName}/${key}:`, error?.message || error);
            throw error;
        }
    }

    /**
     * Get object data as buffer
     */
    async getObject(key: string): Promise<any> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });

            const result = await this.s3Client.send(command);

            if (!result.Body || typeof (result.Body as any)[Symbol.asyncIterator] !== 'function') {
                logger.error('Result body is not a readable stream');
                throw new Error('Result body is not a readable stream');
            }
            // Convert stream to buffer
            const chunks: Buffer[] = [];
            for await (const chunk of result.Body as any as AsyncIterable<any>) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }

            return {
                ...result,
                Body: Buffer.concat(chunks)
            };
        } catch (error: any) {
            logger.error(`Error getting object from ${this.bucketName}/${key}:`, error?.message || error);
            throw error;
        }
    }

    /**
     * Get object as stream
     */
    async getObjectStream(key: string): Promise<any> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });

            const result = await this.s3Client.send(command);
            return result;
        } catch (error: any) {
            logger.error(`Error getting object stream from ${this.bucketName}/${key}:`, error?.message || error);
            throw error;
        }
    }

    /**
     * Delete an object
     */
    async deleteObject(key: string): Promise<any> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });

            const result = await this.s3Client.send(command);
            logger.info(`Object '${key}' deleted successfully from ${this.bucketName}`);
            return result;
        } catch (error: any) {
            logger.error(`Error deleting object '${key}' from ${this.bucketName}:`, error?.message || error);
            throw error;
        }
    }

    /**
     * Delete multiple objects
     */
    async deleteObjects(keys: string[]): Promise<any> {
        try {
            const command = new DeleteObjectsCommand({
                Bucket: this.bucketName,
                Delete: {
                    Objects: keys.map(key => ({ Key: key })),
                    Quiet: false
                }
            });

            const result = await this.s3Client.send(command);
            logger.info(`Deleted ${result.Deleted?.length || 0} objects from ${this.bucketName}`);
            return result;
        } catch (error: any) {
            logger.error('Error deleting objects:', error?.message || error);
            throw error;
        }
    }

    /**
     * Get object metadata
     */
    async getObjectMetadata(key: string): Promise<any> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });

            const result = await this.s3Client.send(command);
            return result;
        } catch (error: any) {
            logger.error(`Error getting object metadata for ${this.bucketName}/${key}:`, error?.message || error);
            throw error;
        }
    }

    /**
     * Generate a presigned URL for object access
     */
    async getPresignedUrl(key: string, expiresIn: number = 3600, operation: string = 'GET'): Promise<string> {
        try {
            let command;

            switch (operation.toLowerCase()) {
                case 'get':
                case 'getobject':
                    command = new GetObjectCommand({
                        Bucket: this.bucketName,
                        Key: key
                    });
                    break;
                case 'put':
                case 'putobject':
                    command = new PutObjectCommand({
                        Bucket: this.bucketName,
                        Key: key
                    });
                    break;
                default:
                    logger.error(`Unsupported operation: ${operation}`);
                    throw new Error(`Unsupported operation: ${operation}`);
            }

            const url = await getSignedUrl(this.s3Client, command, {
                expiresIn
            });

            return url;
        } catch (error: any) {
            logger.error(`Error generating presigned URL for ${this.bucketName}/${key}:`, error?.message || error);
            throw error;
        }
    }

    /**
     * Check if bucket exists
     */
    async bucketExists(bucketName: string): Promise<boolean> {
        try {
            const command = new HeadBucketCommand({ Bucket: bucketName });
            await this.s3Client.send(command);
            return true;
        } catch (error: any) {
            if (error?.name === 'NotFound' || error?.$metadata?.httpStatusCode === 404) {
                logger.warn(`Bucket ${bucketName} does not exist`);
                return false;
            }
            throw error;
        }
    }

    /**
     * Check if object exists
     */
    async objectExists(bucketName: string, key: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: bucketName,
                Key: key
            });
            await this.s3Client.send(command);
            return true;
        } catch (error: any) {
            if (error?.name === 'NotFound' || error?.$metadata?.httpStatusCode === 404) {
                logger.warn(`Object ${key} does not exist in bucket ${bucketName}`);
                return false;
            }
            logger.error(`Error checking existence of object ${key} in bucket ${bucketName}:`, error?.message || error);
            throw error;
        }
    }

    /**
     * Get content type based on file extension
     */
    getContentType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
            '.pdf': 'application/pdf',
            '.txt': 'text/plain',
            '.html': 'text/html',
            '.htm': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.xml': 'application/xml',
            '.zip': 'application/zip',
            '.tar': 'application/x-tar',
            '.gz': 'application/gzip',
            '.mp4': 'video/mp4',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
        return contentTypes[ext] || 'application/octet-stream';
    }

    /**
     * Close the S3 client connection
     */
    destroy(): void {
        if (this.s3Client) {
            this.s3Client.destroy();
        }
    }
}