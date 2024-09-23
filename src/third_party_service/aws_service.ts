import s3 from '../config/aws_config';

// Define Multer's File type for the file parameter
export const uploadImageToS3 = async (S3Location: string, file: Express.Multer.File): Promise<string> => {
    // Ensure S3 bucket name is available in the environment variables
    if (!process.env.S3_BUCKET_NAME) {
        throw new Error("S3_BUCKET_NAME is not defined in environment variables");
    }

    const params = {
        Bucket: process.env.S3_BUCKET_NAME as string,
        Key: S3Location + `/${Date.now()}_${file.originalname}`, // Generate unique file name with timestamp
        // Key: `userProfiles/${Date.now()}_${file.originalname}`, // Generate unique file name with timestamp
        Body: file.buffer, // File buffer from Multer
        ContentType: file.mimetype, // MIME type of the file
    };

    try {
        // Upload file to S3
        const data = await s3.upload(params).promise();
        return data.Location; // Return the S3 URL of the uploaded image
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw new Error('File upload failed');
    }
};