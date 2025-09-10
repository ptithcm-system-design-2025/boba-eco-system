import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException,} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {payment, payment_status_enum, Prisma,} from '../generated/prisma/client';
import {CreatePaymentDto} from './dto/create-payment.dto';
import {UpdatePaymentDto} from './dto/update-payment.dto';
import {PaginatedResult, PaginationDto} from '../common/dto/pagination.dto';
import {VNPayPaymentRequest, VNPayService} from './vnpay.service';
import {InvoiceService} from '../invoice/invoice.service';
import {Decimal} from '@prisma/client/runtime/library';

type PaymentWithRelations = Prisma.paymentGetPayload<{
  include: {
    order: true;
    payment_method: true;
  };
}>;
/**
 * Defines constants for payment method IDs.
 */
export const PAYMENT_METHOD = {
  CASH: 1,
  VNPAY: 2,
} as const;
/**
 * Service for managing payments.
 */
@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private vnpayService: VNPayService,
    private invoiceService: InvoiceService,
  ) {}
  async create(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentWithRelations> {
    const { order_id, payment_method_id, amount_paid, payment_time } =
      createPaymentDto;

    const order = await this.prisma.order.findUnique({
      where: { order_id },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${order_id} not found.`);
    }

    const paymentMethod = await this.prisma.payment_method.findUnique({
      where: { payment_method_id },
    });
    if (!paymentMethod) {
      throw new NotFoundException(
        `Payment method with ID ${payment_method_id} not found.`,
      );
    }

    const orderFinalAmount = new Decimal(
      order.final_amount || order.total_amount || 0,
    );
    const paidAmount = new Decimal(amount_paid);
    let changeAmount = new Decimal(0);

    if (paidAmount.greaterThan(orderFinalAmount)) {
      changeAmount = paidAmount.minus(orderFinalAmount);
    }

    let paymentStatus: payment_status_enum = payment_status_enum.PROCESSING;
    if (payment_method_id === PAYMENT_METHOD.CASH) {
      paymentStatus = payment_status_enum.PAID;
    }

    const paymentData: Prisma.paymentCreateInput = {
      status: paymentStatus,
      amount_paid: paidAmount,
      change_amount: changeAmount,
      payment_time: payment_time ? new Date(payment_time) : new Date(),
      order: {
        connect: { order_id },
      },
      payment_method: {
        connect: { payment_method_id },
      },
    };

    try {
      const newPayment = await this.prisma.payment.create({
        data: paymentData,
        include: { order: true, payment_method: true },
      });

      return newPayment;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Failed to create payment. Related order or payment method not found.`,
          );
        }
      }
      console.error('Error creating payment:', error);
      throw new InternalServerErrorException('Could not create payment.');
    }
  }

  async createVNPayPaymentUrl(
    orderId: number,
    orderInfo?: string,
    returnUrl?: string,
    ipAddr: string = '127.0.0.1',
  ): Promise<string> {
    const order = await this.prisma.order.findUnique({
      where: { order_id: orderId },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    }

    const amount = Number(order.final_amount || order.total_amount || 0);

    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0.');
    }

    const paymentRequest: VNPayPaymentRequest = {
      orderId,
      amount,
      orderInfo: orderInfo || `Payment for order #${orderId}`,
      returnUrl:
        returnUrl ||
        process.env.VNPAY_RETURN_URL ||
        `${process.env.API_BASE_URL || 'http://localhost:3000'}/payments/vnpay/callback`,
      ipAddr,
    };

    return this.vnpayService.createPaymentUrl(paymentRequest);
  }

  async processVNPayCallback(callbackData: any): Promise<{
    success: boolean;
    message: string;
    payment?: PaymentWithRelations;
  }> {
    try {
      const verification = await this.vnpayService.verifyCallback(callbackData);

      if (!verification.isValid) {
        return {
          success: false,
          message: 'Invalid signature.',
        };
      }

      const { orderId, amount, responseCode, transactionStatus } = verification;

      if (!orderId || !amount) {
        return {
          success: false,
          message: 'Incomplete transaction information.',
        };
      }

      const isSuccessful = this.vnpayService.isPaymentSuccessful(
        responseCode!,
        transactionStatus!,
      );

      const payment = await this.createOrUpdateVNPayPayment(
        orderId,
        amount,
        isSuccessful ? payment_status_enum.PAID : payment_status_enum.CANCELLED,
        callbackData.vnp_TxnRef,
      );

      if (isSuccessful && payment.status === payment_status_enum.PAID) {
        try {
          const invoiceData = await this.invoiceService.getInvoiceData(orderId);
          const invoiceHTML =
            this.invoiceService.generateInvoiceHTML(invoiceData);
          console.log(`VNPay invoice created for order #${orderId}`);
        } catch (invoiceError) {
          console.error(
            `Error creating VNPay invoice for order #${orderId}:`,
            invoiceError,
          );
        }
      }

      return {
        success: isSuccessful,
        message: isSuccessful ? 'Payment successful.' : 'Payment failed.',
        payment,
      };
    } catch (error) {
      console.error('Error processing VNPay callback:', error);
      return {
        success: false,
        message: 'Error processing callback.',
      };
    }
  }

  private async createOrUpdateVNPayPayment(
    orderId: number,
    amount: number,
    status: payment_status_enum,
    txnRef: string,
  ): Promise<PaymentWithRelations> {
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        order_id: orderId,
        payment_method_id: PAYMENT_METHOD.VNPAY,
      },
      include: { order: true, payment_method: true },
    });

    if (existingPayment) {
      return this.prisma.payment.update({
        where: { payment_id: existingPayment.payment_id },
        data: {
          status,
          amount_paid: new Decimal(amount),
          payment_time: new Date(),
        },
        include: { order: true, payment_method: true },
      });
    } else {
      return this.prisma.payment.create({
        data: {
          order_id: orderId,
          payment_method_id: PAYMENT_METHOD.VNPAY,
          status,
          amount_paid: new Decimal(amount),
          change_amount: new Decimal(0),
          payment_time: new Date(),
        },
        include: { order: true, payment_method: true },
      });
    }
  }

  async findAll(
    paginationDto: PaginationDto,
    orderId?: number,
  ): Promise<PaginatedResult<PaymentWithRelations>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where = orderId ? { order_id: orderId } : {};

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        where,
        include: { order: true, payment_method: true },
        orderBy: { payment_time: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: number): Promise<PaymentWithRelations> {
    const payment = await this.prisma.payment.findUnique({
      where: { payment_id: id },
      include: { order: true, payment_method: true },
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found.`);
    }
    return payment;
  }

  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentWithRelations> {
    const existingPayment = await this.findOne(id);

    const { amount_paid, payment_time } = updatePaymentDto;

    const dataToUpdate: Prisma.paymentUpdateInput = {};

    if (payment_time) dataToUpdate.payment_time = new Date(payment_time);

    let newPaidAmount: Decimal | undefined;
    if (amount_paid !== undefined) {
      newPaidAmount = new Decimal(amount_paid);
      dataToUpdate.amount_paid = newPaidAmount;

      const orderFinalAmount = new Decimal(
        existingPayment.order.final_amount ||
          existingPayment.order.total_amount ||
          0,
      );
      let newChangeAmount = new Decimal(0);
      if (newPaidAmount.greaterThan(orderFinalAmount)) {
        newChangeAmount = newPaidAmount.minus(orderFinalAmount);
      }
      dataToUpdate.change_amount = newChangeAmount;
    }

    try {
      const updatedPayment = await this.prisma.payment.update({
        where: { payment_id: id },
        data: dataToUpdate,
        include: { order: true, payment_method: true },
      });
      return updatedPayment;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(
          `Prisma error updating payment ${id}:`,
          error.code,
          error.meta,
        );
      } else {
        console.error(`Error updating payment ${id}:`, error);
      }
      throw new InternalServerErrorException('Could not update payment.');
    }
  }

  /**
   * Deletes a payment by its ID.
   * @param id - The ID of the payment to delete.
   * @returns The deleted payment record.
   */
  async remove(id: number): Promise<PaymentWithRelations> {
    const paymentToDelete = await this.findOne(id);
    try {
      await this.prisma.payment.delete({
        where: { payment_id: id },
      });
      return paymentToDelete;
    } catch (error) {
      console.error(`Error deleting payment ${id}:`, error);
      throw new InternalServerErrorException('Could not delete payment.');
    }
  }

  /**
   * Finds payments by a specific payment method.
   * @param payment_method_id - The ID of the payment method.
   * @param paginationDto - Pagination options.
   * @returns A paginated result of payments.
   */
  async findByPaymentMethod(
    payment_method_id: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<payment>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { payment_method_id },
        skip,
        take: limit,
        orderBy: { payment_id: 'desc' },
      }),
      this.prisma.payment.count({
        where: { payment_method_id },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
