import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document } from './entities/document.entity';
import { Folder } from './entities/folder.entity';
import { DocumentPermission } from './entities/document-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Folder, DocumentPermission]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
