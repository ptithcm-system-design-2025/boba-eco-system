"use client";

import { useState } from "react";
import { CreditCard, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface StripePaymentMethodProps {
  isSelected: boolean;
  onSelect: () => void;
  total: number;
  orderId?: number;
  clientSecret?: string;
  onPaymentSuccess?: (paymentIntent: unknown) => void;
  onPaymentError?: (error: string) => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

function StripePaymentForm({
  total,
  clientSecret,
  onPaymentSuccess,
  onPaymentError
}: {
  total: number;
  clientSecret?: string;
  onPaymentSuccess?: (paymentIntent: unknown) => void;
  onPaymentError?: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      onPaymentError?.("Stripe chưa được khởi tạo hoặc thiếu client secret");
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onPaymentError?.("Không tìm thấy thông tin thẻ");
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        onPaymentError?.(error.message || "Có lỗi xảy ra khi thanh toán");
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess?.(paymentIntent);
      }
    } catch {
      onPaymentError?.("Có lỗi xảy ra khi xử lý thanh toán");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Lock className="w-4 h-4" />
        <span>Thông tin thẻ được mã hóa an toàn bởi Stripe</span>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing || !clientSecret}
        className="w-full"
      >
        {isProcessing ? "Đang xử lý..." : `Thanh toán ${formatPrice(total)}`}
      </Button>
    </form>
  );
}

export function StripePaymentMethod({
  isSelected,
  onSelect,
  total,
  orderId,
  clientSecret,
  onPaymentSuccess,
  onPaymentError
}: StripePaymentMethodProps) {
  return (
    <div className={`border rounded-lg p-4 ${isSelected ? 'border-blue-500 bg-blue-50' : ''}`}>
      <div className="flex items-center space-x-3">
        <input
          type="radio"
          id="stripe"
          name="payment"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 text-blue-600"
        />
        <label htmlFor="stripe" className="flex-1 cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="font-medium">Thẻ tín dụng/ghi nợ</span>
            <Badge variant="default">Khả dụng</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">Thanh toán an toàn với Stripe</p>
        </label>
      </div>

      {/* Stripe Payment Form */}
      {isSelected && (
        <div className="mt-4 pt-4 border-t">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2 mb-4">
              <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Thanh toán bằng thẻ</p>
                <p className="text-sm text-blue-600 mt-1">
                  Nhập thông tin thẻ để hoàn tất thanh toán an toàn.
                </p>
                <div className="mt-2 text-sm text-blue-700">
                  <p><strong>Số tiền:</strong> {formatPrice(total)}</p>
                  {orderId && <p><strong>Đơn hàng:</strong> #{orderId}</p>}
                </div>
              </div>
            </div>

            {clientSecret ? (
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  total={total}
                  clientSecret={clientSecret}
                  onPaymentSuccess={onPaymentSuccess}
                  onPaymentError={onPaymentError}
                />
              </Elements>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">Đang khởi tạo thanh toán...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}