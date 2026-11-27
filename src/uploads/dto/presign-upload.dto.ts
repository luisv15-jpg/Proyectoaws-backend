import {
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export const UPLOAD_FOLDERS = ['products', 'avatars'] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export class PresignUploadDto {
  @IsNotEmpty({ message: 'El nombre del archivo es requerido' })
  @IsString({ message: 'El nombre del archivo debe ser texto' })
  @MaxLength(200, { message: 'El nombre del archivo es demasiado largo' })
  fileName!: string;

  @Matches(/^image\/(jpeg|png|webp|gif|avif)$/, {
    message: 'Solo se permiten imágenes JPG, PNG, WEBP, GIF o AVIF',
  })
  contentType!: string;

  @IsIn(UPLOAD_FOLDERS, { message: 'Carpeta no permitida' })
  folder!: UploadFolder;
}
