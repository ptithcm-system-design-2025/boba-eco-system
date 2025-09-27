import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface StripePaymentRequest {
	orderId: number;
	amount: number;
	currency: string;
	orderInfo: string;
	customerEmail?: string;
}

export interface StripeWebhookData {
	id: string;
	object: string;
	type: string;
	data: {
		object: Stripe.PaymentIntent;
	};
	[key: string]: unknown;
}

/**
 * Service for handling Stripe integration.
 */
@Injectable()
export class StripeService {
	private stripe: Stripe;

	constructor(private configService: ConfigService) {
		const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
		if (!secretKey) {
			throw new Error('STRIPE_SECRET_KEY is required');
		}

		this.stripe = new Stripe(secretKey, {
			apiVersion: '2024-12-18.acacia',
		});
	}

	async createPaymentIntent(paymentRequest: StripePaymentRequest): Promise<{
		clientSecret: string;
		paymentIntentId: string;
	}> {
		try {
			const { orderId, amount, currency, orderInfo, customerEmail } =
				paymentRequest;

			// Convert amount to cents for Stripe
			const amountInCents = Math.round(amount * 100);

			const paymentIntent = await this.stripe.paymentIntents.create({
				amount: amountInCents,
				currency: currency.toLowerCase(),
				metadata: {
					orderId: orderId.toString(),
					orderInfo,
				},
				receipt_email: customerEmail,
				description: orderInfo,
			});

			if (!paymentIntent.client_secret) {
				throw new InternalServerErrorException(
					'Payment intent client secret is missing.'
				);
			}

			return {
				clientSecret: paymentIntent.client_secret,
				paymentIntentId: paymentIntent.id,
			};
		} catch (error) {
			console.error('Error creating Stripe payment intent:', error);
			throw new InternalServerErrorException(
				'Could not create Stripe payment intent.'
			);
		}
	}

	async verifyWebhook(
		payload: string,
		signature: string
	): Promise<{
		isValid: boolean;
		event?: Stripe.Event;
	}> {
		try {
			const webhookSecret = this.configService.get<string>(
				'STRIPE_WEBHOOK_SECRET'
			);
			if (!webhookSecret) {
				throw new Error('STRIPE_WEBHOOK_SECRET is required');
			}

			const event = this.stripe.webhooks.constructEvent(
				payload,
				signature,
				webhookSecret
			);

			return {
				isValid: true,
				event,
			};
		} catch (error) {
			console.error('Error verifying Stripe webhook:', error);
			return { isValid: false };
		}
	}

	async retrievePaymentIntent(
		paymentIntentId: string
	): Promise<Stripe.PaymentIntent> {
		try {
			return await this.stripe.paymentIntents.retrieve(paymentIntentId);
		} catch (error) {
			console.error('Error retrieving payment intent:', error);
			throw new InternalServerErrorException(
				'Could not retrieve payment intent.'
			);
		}
	}

	isPaymentSuccessful(paymentIntent: Stripe.PaymentIntent): boolean {
		return paymentIntent.status === 'succeeded';
	}

	extractOrderIdFromMetadata(paymentIntent: Stripe.PaymentIntent): number {
		try {
			const orderId = paymentIntent.metadata?.orderId;
			if (!orderId) {
				throw new Error(
					'Order ID not found in payment intent metadata'
				);
			}
			return parseInt(orderId, 10);
		} catch {
			throw new BadRequestException('Invalid payment intent metadata.');
		}
	}

	getAmountFromPaymentIntent(paymentIntent: Stripe.PaymentIntent): number {
		// Convert from cents back to main currency unit
		return paymentIntent.amount / 100;
	}
}
