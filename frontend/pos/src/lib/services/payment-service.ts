import { apiClient } from "@/lib/api-client";

export interface CreatePaymentDto {
  order_id: number;
  payment_method_id: number;
  amount_paid: number;
  payment_time?: string;
}

export interface UpdatePaymentDto {
  amount_paid?: number;
  payment_time?: string;
}

export interface Payment {
  payment_id: number;
  order_id: number;
  payment_method_id: number;
  status: 'PROCESSING' | 'PAID' | 'CANCELLED';
  amount_paid: number;
  change_amount: number;
  payment_time: string;
  order: {
    order_id: number;
    total_amount: number;
    final_amount?: number;
    status: string;
  };
  payment_method: {
    payment_method_id: number;
    name: string;
    description?: string;
  };
}

export interface CreateStripePaymentDto {
  orderId: number;
  currency?: string;
  orderInfo?: string;
  customerEmail?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Payment Service
 * Xử lý tất cả API calls liên quan đến thanh toán
 */
export class PaymentService {
  private static readonly BASE_URL = '/payments';

  // Payment Method IDs (phải khớp với backend)
  static readonly PAYMENT_METHODS = {
    CASH: 1,
    STRIPE: 2,
  } as const;

  /**
   * Tạo thanh toán mới (chủ yếu cho tiền mặt)
   */
  async createPayment(paymentData: CreatePaymentDto): Promise<Payment> {
    return apiClient.post<Payment>(PaymentService.BASE_URL, paymentData);
  }

  /**
   * Lấy danh sách thanh toán với pagination
   */
  async getPayments(page: number = 1, limit: number = 10, orderId?: number): Promise<PaginatedResult<Payment>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (orderId) {
      params.append('orderId', orderId.toString());
    }

    return apiClient.get<PaginatedResult<Payment>>(`${PaymentService.BASE_URL}?${params}`);
  }

  /**
   * Lấy thông tin thanh toán theo ID
   */
  async getPaymentById(paymentId: number): Promise<Payment> {
    return apiClient.get<Payment>(`${PaymentService.BASE_URL}/${paymentId}`);
  }

  /**
   * Cập nhật thanh toán
   */
  async updatePayment(paymentId: number, updateData: UpdatePaymentDto): Promise<Payment> {
    return apiClient.patch<Payment>(`${PaymentService.BASE_URL}/${paymentId}`, updateData);
  }

  /**
   * Xóa thanh toán (chỉ Manager)
   */
  async deletePayment(paymentId: number): Promise<void> {
    return apiClient.delete(`${PaymentService.BASE_URL}/${paymentId}`);
  }

  /**
   * Tạo Stripe payment intent
   */
  async createStripePaymentIntent(paymentData: CreateStripePaymentDto): Promise<{ clientSecret: string; paymentIntentId: string }> {
    return apiClient.post<{ clientSecret: string; paymentIntentId: string }>(`${PaymentService.BASE_URL}/stripe/create-payment-intent`, paymentData);
  }

  /**
   * Lấy thanh toán theo phương thức thanh toán
   */
  async getPaymentsByMethod(paymentMethodId: number, page: number = 1, limit: number = 10): Promise<PaginatedResult<Payment>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return apiClient.get<PaginatedResult<Payment>>(`${PaymentService.BASE_URL}/payment-method/${paymentMethodId}?${params}`);
  }

  /**
   * Thanh toán tiền mặt cho đơn hàng
   */
  async processCashPayment(orderId: number, amountPaid: number): Promise<Payment> {
    const paymentData: CreatePaymentDto = {
      order_id: orderId,
      payment_method_id: PaymentService.PAYMENT_METHODS.CASH,
      amount_paid: amountPaid,
      payment_time: new Date().toISOString(),
    };

    return this.createPayment(paymentData);
  }

  /**
   * Tạo Stripe payment intent cho đơn hàng
   */
  async processStripePayment(orderId: number, currency: string = 'vnd', orderInfo?: string, customerEmail?: string): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const stripeData: CreateStripePaymentDto = {
      orderId,
      currency,
      orderInfo: orderInfo || `Thanh toán đơn hàng #${orderId}`,
      customerEmail,
    };

    return this.createStripePaymentIntent(stripeData);
  }

  /**
   * Xác nhận thanh toán Stripe
   */
  async confirmStripePayment(paymentIntentId: string): Promise<{ success: boolean; message: string; payment?: any }> {
    return apiClient.post<{ success: boolean; message: string; payment?: any }>(`${PaymentService.BASE_URL}/stripe/confirm-payment`, { paymentIntentId });
  }

  /**
   * Test endpoint
   */
  async test(): Promise<{ message: string }> {
    return apiClient.get<{ message: string }>(`${PaymentService.BASE_URL}/admin/test`);
  }
}

// Export singleton instance
export const paymentService = new PaymentService(); 