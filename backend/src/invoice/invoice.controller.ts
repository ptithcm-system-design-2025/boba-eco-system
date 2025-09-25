import {
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Res,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ROLES } from '../auth/constants/roles.constant';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { InvoiceService } from './invoice.service';

@ApiTags('Invoice')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoice')
/**
 * Handles invoice-related requests.
 */
export class InvoiceController {
	/**
	 * @param invoiceService The invoice service.
	 */
	constructor(private readonly invoiceService: InvoiceService) {}

	/**
	 * Retrieves the invoice as an HTML page.
	 * @param orderId The ID of the order.
	 * @param res The HTTP response object.
	 */
	@Get(':orderId/html')
	@Roles(ROLES.CUSTOMER)
	@ApiOperation({ summary: 'Get invoice as HTML' })
	@ApiParam({
		name: 'orderId',
		description: 'The ID of the order',
		type: 'number',
	})
	@ApiResponse({ status: 200, description: 'Invoice HTML' })
	@ApiResponse({ status: 404, description: 'Order not found' })
	async getInvoiceHTML(
		@Param('orderId', ParseIntPipe) orderId: number,
		@Res() res: Response
	) {
		const invoiceData = await this.invoiceService.getInvoiceData(orderId);
		const html = this.invoiceService.generateInvoiceHTML(invoiceData);

		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		res.send(html);
	}

	/**
	 * Generates and returns the invoice as a PDF file.
	 * @param orderId The ID of the order.
	 * @param res The HTTP response object.
	 */
	@Get(':orderId/pdf')
	@Roles(ROLES.STAFF)
	@ApiOperation({ summary: 'Export invoice as PDF' })
	@ApiParam({
		name: 'orderId',
		description: 'The ID of the order',
		type: 'number',
	})
	@ApiResponse({ status: 200, description: 'Invoice PDF' })
	@ApiResponse({ status: 404, description: 'Order not found' })
	async getInvoicePDF(
		@Param('orderId', ParseIntPipe) orderId: number,
		@Res() res: Response
	) {
		const pdfBuffer = await this.invoiceService.generateInvoicePDF(orderId);

		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="invoice-${orderId}.pdf"`
		);
		res.setHeader('Content-Length', pdfBuffer.length);

		res.send(pdfBuffer);
	}

	/**
	 * Retrieves the raw invoice data.
	 * @param orderId The ID of the order.
	 * @returns The invoice data.
	 */
	@Get(':orderId/data')
	@Roles(ROLES.STAFF)
	@ApiOperation({ summary: 'Get invoice data' })
	@ApiParam({
		name: 'orderId',
		description: 'The ID of the order',
		type: 'number',
	})
	@ApiResponse({ status: 200, description: 'Invoice data' })
	@ApiResponse({ status: 404, description: 'Order not found' })
	async getInvoiceData(@Param('orderId', ParseIntPipe) orderId: number) {
		return await this.invoiceService.getInvoiceData(orderId);
	}
}
