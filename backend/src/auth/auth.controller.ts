import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
	Post,
	Req,
	Request,
	Res,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common'
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger'
import type { Request as ExpressRequest, Response } from 'express'
import {
	ConflictErrorDto,
	JSendSuccessDto,
	NotFoundErrorDto,
	UnauthorizedErrorDto,
	ValidationErrorDto,
} from '../common/dto/jsend-response.dto'
import type { AuthService } from './auth.service'
import type { AuthTokenService } from './auth-token.service'
import { CurrentUser } from './decorators/current-user.decorator'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import type { JwtPayload } from './interfaces/jwt-payload.interface'

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
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description:
			'Bad Request - Invalid input data format or missing required fields',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - Username, email, or phone number already exists',
		type: ConflictErrorDto,
	})
	/**
	 * Register a new user account.
	 * @param registerDto Registration data transfer object
	 * @returns Created user with account details and tokens
	 */
	async register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto)
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
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request - Missing login credentials',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Incorrect username or password',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Not Found - Account does not exist or has been disabled',
		type: NotFoundErrorDto,
	})
	async login(
		@Body() loginDto: LoginDto,
		@Res({ passthrough: true }) res: Response
	) {
		const result = await this.authService.login(loginDto)

		res.cookie('refresh_token', result.refresh_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})

		const userProfile = await this.authService.getProfile(
			result.user.account_id
		)

		return {
			access_token: result.access_token,
			user: userProfile,
		}
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
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid or expired token',
		type: UnauthorizedErrorDto,
	})
	/**
	 * Logout the currently authenticated user by clearing refresh token cookie.
	 * @param req Express request object
	 * @param res Express response object
	 * @returns A success message
	 */
	async logout(@Request() _req, @Res({ passthrough: true }) res: Response) {
		res.clearCookie('refresh_token')
		return { message: 'Logout successful' }
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
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid or expired token',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'User information not found',
		type: NotFoundErrorDto,
	})
	/**
	 * Get current authenticated user's profile.
	 * @param user Current authenticated user injected by decorator
	 * @returns User profile data
	 */
	async getProfile(@CurrentUser() user: JwtPayload) {
		return this.authService.getProfile(user.sub)
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
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request - Invalid input data format',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid or expired token',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'User information not found',
		type: NotFoundErrorDto,
	})
	@ApiResponse({
		status: 409,
		description:
			'Conflict - Email or phone number is already in use by another account',
		type: ConflictErrorDto,
	})
	/**
	 * Update profile information for the current authenticated user.
	 * @param user Current authenticated user
	 * @param updateProfileDto DTO containing updated profile data
	 * @returns The updated user profile
	 */
	async updateProfile(
		@CurrentUser() user: JwtPayload,
		@Body() updateProfileDto: UpdateProfileDto
	) {
		return this.authService.updateProfile(user.sub, updateProfileDto)
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
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 401,
		description:
			'Cannot refresh token - Refresh token is invalid, expired, or does not exist',
		type: UnauthorizedErrorDto,
	})
	async refreshToken(
		@Req() req: ExpressRequest,
		@Res({ passthrough: true }) res: Response
	) {
		const refresh_token = req.cookies.refresh_token

		if (!refresh_token) {
			throw new UnauthorizedException('Refresh token not found')
		}

		const result = await this.authTokenService.refreshToken(refresh_token)

		res.cookie('refresh_token', result.refresh_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})

		return {
			access_token: result.access_token,
		}
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
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid or expired token',
		type: UnauthorizedErrorDto,
	})
	/**
	 * Revoke the current refresh token forcing the user to re-login.
	 * @param res Express response object
	 * @returns A success message
	 */
	async revokeToken(@Res({ passthrough: true }) res: Response) {
		res.clearCookie('refresh_token')
		return { message: 'Token has been revoked successfully' }
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
		type: JSendSuccessDto,
	})
	/**
	 * Smoke test endpoint for verifying that Auth Controller is working.
	 * @returns A success message
	 */
	async test() {
		return { message: 'Auth controller is working!' }
	}
}
