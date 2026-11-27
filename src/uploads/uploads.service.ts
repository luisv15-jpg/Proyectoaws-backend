import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { randomUUID } from 'crypto';
import { PresignUploadDto } from './dto/presign-upload.dto';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const EXPIRES_SECONDS = 300;

@Injectable()
export class UploadsService {
  private readonly region: string;
  private readonly bucket?: string;
  private readonly s3: S3Client;

  constructor(configService: ConfigService) {
    this.region = configService.get<string>('AWS_REGION') || 'us-east-1';
    this.bucket = configService.get<string>('S3_BUCKET_NAME');
    // Las credenciales se toman de la cadena por defecto de AWS:
    // variables AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_SESSION_TOKEN o el rol IAM del servidor.
    this.s3 = new S3Client({ region: this.region });
  }

  async createPresignedUpload(
    user: { id: string; role: string },
    dto: PresignUploadDto,
  ) {
    if (!this.bucket) {
      throw new InternalServerErrorException(
        'S3_BUCKET_NAME no está configurado',
      );
    }
    if (dto.folder === 'products' && user.role !== 'admin') {
      throw new ForbiddenException(
        'Solo un administrador puede subir imágenes de productos',
      );
    }

    const safeName = dto.fileName
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .slice(-80);
    const key = `${dto.folder}/${Date.now()}-${randomUUID().slice(0, 8)}-${safeName}`;

    // S3 rechaza la subida si el archivo pesa más de 2 MB o si el tipo no coincide.
    const { url, fields } = await createPresignedPost(this.s3, {
      Bucket: this.bucket,
      Key: key,
      Conditions: [
        ['content-length-range', 1, MAX_BYTES],
        ['eq', '$Content-Type', dto.contentType],
        { acl: 'public-read' },
      ],
      Fields: {
        acl: 'public-read',
        'Content-Type': dto.contentType,
      },
      Expires: EXPIRES_SECONDS,
    });

    return {
      url,
      fields,
      publicUrl: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
    };
  }
}
