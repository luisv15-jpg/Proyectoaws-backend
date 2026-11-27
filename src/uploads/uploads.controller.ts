import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { UploadsService } from './uploads.service';

@Controller('uploads')
@UseGuards(AuthGuard('jwt'))
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * Devuelve una URL firmada para que el navegador suba la imagen directo a S3,
   * sin tener las credenciales de AWS.
   */
  @Post('presign')
  async presign(
    @Request() req: { user: { id: string; role: string } },
    @Body() dto: PresignUploadDto,
  ) {
    return this.uploadsService.createPresignedUpload(req.user, dto);
  }
}
