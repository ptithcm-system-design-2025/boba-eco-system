import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { FirebaseStorageController } from './firebase-storage.controller'
import { FirebaseStorageService } from './firebase-storage.service'

@Module({
	imports: [ConfigModule],
	controllers: [FirebaseStorageController],
	providers: [FirebaseStorageService],
	exports: [FirebaseStorageService],
})
export class FirebaseStorageModule {}
