// import s3 from "../config/aws_config";
// import { File } from 'multer';  // Import Multer's File type

// export const uploadFileToS3 = async (file: File): Promise<string> => {
//     const params = {
//       Bucket: process.env.S3_BUCKET_NAME,
//       Key: `images/${Date.now()}_${file.originalname}`, // Define file path
//       Body: file.buffer,
//       ContentType: file.mimetype,
//     };
  
//     const data = await s3.upload(params).promise();
//     return data.Location; // S3 URL of the uploaded image
// };