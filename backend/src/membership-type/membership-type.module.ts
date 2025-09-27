import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MembershipTypeController } from './membership-type.controller';
import { MembershipTypeService } from './membership-type.service';

@Module({
	imports: [PrismaModule],
	controllers: [MembershipTypeController],
	providers: [MembershipTypeService],
	exports: [MembershipTypeService], // Export service nếu cần sử dụng ở module khác
})
export class MembershipTypeModule {}
