import {
	Controller,
	Post,
	Body,
	Get,
	Patch,
	UseGuards,
	Request,
	HttpCode,
	HttpStatus,
	Res,
	Req,
	UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request as ExpressRequest } from 'express';
import type { AuthService } from './auth.service';
import type { AuthTokenService } from './auth-token.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBody,
	ApiBearerAuth,
} from '@nestjs/swagger';

/**
 * Controller responsible for handling authentication and user profile operations.
 * Provides endpoints for register, login, logout, refresh token, revoke token, and profile management.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly authTokenService: AuthTokenService
	) {}

	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Register a new account',
		description:
			'Create a new customer account with personal and login information',
	})
	@ApiBody({ type: RegisterDto })
	@ApiResponse({
		status: 201,
		description: 'Registration successful',
		schema: {
			type: 'object',
			properties: {
				message: {
					type: 'string',
					description: 'Success message for registration',
				},
				user: {
					type: 'object',
					properties: {
						account_id: { type: 'number', description: 'Account ID' },
						username: { type: 'string', description: 'Username' },
						email: { type: 'string', description: 'Email' },
						customer_id: { type: 'number', description: 'Customer ID' },
						full_name: { type: 'string', description: 'Full name' },
						phone: { type: 'string', description: 'Phone number' },
					},
				},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description:
			'Bad Request - Invalid input data format or missing required fields',
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - Username, email, or phone number already exists',
	})
	/**
	 * Register a new user account.
	 * @param registerDto Registration data transfer object
	 * @returns Created user with account details and tokens
	 */
	async register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto);
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Login to the system',
		description:
			'Authenticate login credentials and return an access token along with user information',
	})
	@ApiBody({ type: LoginDto })
	@ApiResponse({
		status: 200,
		description: 'Login successful',
		schema: {
			type: 'object',
			properties: {
				access_token: {
					type: 'string',
					description: 'JWT access token for authenticating other APIs',
				},
				user: {
					type: 'object',
					properties: {
						account_id: { type: 'number', description: 'Account ID' },
						username: { type: 'string', description: 'Username' },
						email: { type: 'string', description: 'Email' },
						phone: { type: 'string', description: 'Phone number' },
						role: { type: 'string', description: 'User role' },
						full_name: { type: 'string', description: 'Full name' },
					},
				},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request - Missing login credentials',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Incorrect username or password',
	})
	@ApiResponse({
		status: 404,
		description: 'Not Found - Account does not exist or has been disabled',
	})
	async login(
		@Body() loginDto: LoginDto,
		@Res({ passthrough: true }) res: Response
	) {
		const result = await this.authService.login(loginDto);

		res.cookie('refresh_token', result.refresh_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		const userProfile = await this.authService.getProfile(
			result.user.account_id
		);

		return {
			access_token: result.access_token,
			user: userProfile,
		};
	}

	@Post('logout')
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.OK)
	@ApiBearerAuth('JWT-auth')
	@ApiOperation({
		summary: 'Logout from the system',
		description: 'Clear the refresh token and log the user out',
	})
	@ApiResponse({
		status: 200,
		description: 'Logout successful',
		schema: {
			type: 'object',
			properties: {
				message: {
					type: 'string',
					description: 'Success message for logout',
					example: 'Logout successful',
				},
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid or expired token',
	})
	/**
	 * Logout the currently authenticated user by clearing refresh token cookie.
	 * @param req Express request object
	 * @param res Express response object
	 * @returns A success message
	 */
	async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
		res.clearCookie('refresh_token');
		return { message: 'Logout successful' };
	}

	@Get('profile')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('JWT-auth')
	@ApiOperation({
		summary: 'Get current user profile',
		description:
			'Return detailed information of the currently logged-in user based on the access token',
	})
	@ApiResponse({
		status: 200,
		description: 'User profile information',
		schema: {
			type: 'object',
			properties: {
				account_id: { type: 'number', description: 'Account ID' },
				username: { type: 'string', description: 'Username' },
				email: { type: 'string', description: 'Email' },
				phone: { type: 'string', description: 'Phone number' },
				role: { type: 'string', description: 'User role' },
				full_name: { type: 'string', description: 'Full name' },
				avatar: { type: 'string', description: 'Avatar URL', nullable: true },
				created_at: {
					type: 'string',
					format: 'date-time',
					description: 'Account creation timestamp',
				},
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid or expired token',
	})
	@ApiResponse({
		status: 404,
		description: 'User information not found',
	})
	/**
	 * Get current authenticated user's profile.
	 * @param user Current authenticated user injected by decorator
	 * @returns User profile data
	 */
	async getProfile(@CurrentUser() user: any) {
		return this.authService.getProfile(user.account_id);
	}

	@Patch('profile')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('JWT-auth')
	@ApiOperation({
		summary: 'Update current user profile',
		description:
			'Allows the user to update personal information such as full name, email, phone number, and change password',
	})
	@ApiBody({ type: UpdateProfileDto })
	@ApiResponse({
		status: 200,
		description: 'Profile updated successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', description: 'Success message for update' },
				user: {
					type: 'object',
					properties: {
						account_id: { type: 'number', description: 'Account ID' },
						username: { type: 'string', description: 'Username' },
						email: { type: 'string', description: 'Updated email' },
						phone: { type: 'string', description: 'Updated phone number' },
						full_name: { type: 'string', description: 'Updated full name' },
						updated_at: {
							type: 'string',
							format: 'date-time',
							description: 'Update timestamp',
						},
					},
				},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request - Invalid input data format',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid or expired token',
	})
	@ApiResponse({
		status: 404,
		description: 'User information not found',
	})
	@ApiResponse({
		status: 409,
		description:
			'Conflict - Email or phone number is already in use by another account',
	})
	/**
	 * Update profile information for the current authenticated user.
	 * @param user Current authenticated user
	 * @param updateProfileDto DTO containing updated profile data
	 * @returns The updated user profile
	 */
	async updateProfile(
		@CurrentUser() user: any,
		@Body() updateProfileDto: UpdateProfileDto
	) {
		return this.authService.updateProfile(user.account_id, updateProfileDto);
	}

	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Refresh access token',
		description:
			'Use the refresh token to generate a new access token when the old one has expired',
	})
	@ApiResponse({
		status: 200,
		description: 'Token refreshed successfully',
		schema: {
			type: 'object',
			properties: {
				access_token: {
					type: 'string',
					description: 'New JWT access token for authenticating other APIs',
				},
			},
		},
	})
	@ApiResponse({
		status: 401,
		description:
			'Cannot refresh token - Refresh token is invalid, expired, or does not exist',
	})
	async refreshToken(
		@Req() req: ExpressRequest,
		@Res({ passthrough: true }) res: Response
	) {
		const refresh_token = req.cookies.refresh_token;

		if (!refresh_token) {
			throw new UnauthorizedException('Refresh token not found');
		}

		const result = await this.authTokenService.refreshToken(refresh_token);

		res.cookie('refresh_token', result.refresh_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return {
			access_token: result.access_token,
		};
	}

	@Post('revoke')
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.OK)
	@ApiBearerAuth('JWT-auth')
	@ApiOperation({
		summary: 'Revoke token',
		description:
			'Revoke the current refresh token, forcing the user to log in again',
	})
	@ApiResponse({
		status: 200,
		description: 'Token revoked successfully',
		schema: {
			type: 'object',
			properties: {
				message: {
					type: 'string',
					description: 'Success message for token revocation',
					example: 'Token has been revoked successfully',
				},
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid or expired token',
	})
	/**
	 * Revoke the current refresh token forcing the user to re-login.
	 * @param res Express response object
	 * @returns A success message
	 */
	async revokeToken(@Res({ passthrough: true }) res: Response) {
		res.clearCookie('refresh_token');
		return { message: 'Token has been revoked successfully' };
	}

	@Get('test')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Test Auth Controller',
		description:
			'Endpoint to check if the Auth Controller is working correctly (smoke test)',
	})
	@ApiResponse({
		status: 200,
		description: 'Test successful',
		schema: {
			type: 'object',
			properties: {
				message: {
					type: 'string',
					description: 'Confirmation message that the controller is working',
					example: 'Auth controller is working!',
				},
			},
		},
	})
	/**
	 * Smoke test endpoint for verifying that Auth Controller is working.
	 * @returns A success message
	 */
	async test() {
		return { message: 'Auth controller is working!' };
	}
}
