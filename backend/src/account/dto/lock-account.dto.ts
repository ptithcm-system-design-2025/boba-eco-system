import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty } from 'class-validator'

/**
 * DTO for locking or unlocking an account.
 * Used to specify the lock status of an account.
 */
export class LockAccountDto {
	@ApiProperty({
		description:
			'The lock status of the account (true = locked, false = unlocked).',
		example: true,
		type: Boolean,
	})
	@IsBoolean({ message: 'is_locked must be a boolean value.' })
	@IsNotEmpty({ message: 'is_locked is required.' })
	is_locked: boolean
}
