// utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

export default cloudinary;

/*
Usage example in controllers:

import cloudinary from '../utils/cloudinary.js';

const uploaded = await cloudinary.uploader.upload(filePath, { folder: 'recruiter' });
*/
