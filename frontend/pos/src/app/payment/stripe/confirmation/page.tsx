"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PaymentConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');

  useEffect(() => {
    // Lấy thông tin từ URL params
    const paymentStatus = searchParams.get('status');
    const orderIdParam = searchParams.get('orderId');
    const paymentIntentIdParam = searchParams.get('payment_intent');
    const messageParam = searchParams.get('message');

    // Xử lý kết quả
    if (paymentStatus === 'success') {
      setStatus('success');
      setMessage(messageParam || 'Thanh toán thành công!');
      toast.success("Thanh toán thành công", {
        description: "Đơn hàng đã được thanh toán hoàn tất"
      });
    } else if (paymentStatus === 'error') {
      setStatus('error');
      setMessage(messageParam || 'Thanh toán thất bại hoặc bị hủy');
      toast.error("Thanh toán thất bại", {
        description: "Vui lòng thử lại hoặc chọn phương thức thanh toán khác"
      });
    } else {
      // Default to loading if no status provided
      setStatus('loading');
      setMessage('Đang xử lý thanh toán...');
    }

    // Set order ID and payment intent ID
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
    if (paymentIntentIdParam) {
      setPaymentIntentId(paymentIntentIdParam);
    }
  }, [searchParams]);

  const handleBackToPOS = () => {
    router.push('/pos');
  };

  const handleViewOrder = () => {
    if (orderId) {
      router.push(`/orders/${orderId}`);
    }
  };

  const formatPrice = (priceString: string | null) => {
    if (!priceString) return 'N/A';
    const price = parseFloat(priceString);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {status === 'loading' && <Clock className="w-5 h-5 text-blue-600" />}
              {status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {status === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
              <span>Kết quả thanh toán</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            {status === 'loading' && (
              <div>
                <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                <p className="text-lg font-medium text-gray-900">Đang xử lý...</p>
                <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
              </div>
            )}

            {status === 'success' && (
              <div>
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-800 mb-2">Thanh toán thành công!</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    {orderId && (
                      <div className="flex justify-between">
                        <span>Mã đơn hàng:</span>
                        <span className="font-medium">#{orderId}</span>
                      </div>
                    )}
                    {searchParams.get('amount') && (
                      <div className="flex justify-between">
                        <span>Số tiền:</span>
                        <span className="font-medium">{formatPrice(searchParams.get('amount'))}</span>
                      </div>
                    )}
                    {paymentIntentId && (
                      <div className="flex justify-between">
                        <span>Mã thanh toán:</span>
                        <span className="font-medium">{paymentIntentId}</span>
                      </div>
                    )}
                    {searchParams.get('payment_method') && (
                      <div className="flex justify-between">
                        <span>Phương thức:</span>
                        <span className="font-medium">{searchParams.get('payment_method')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Badge variant="default" className="mb-6">
                  Thanh toán hoàn tất
                </Badge>
              </div>
            )}

            {status === 'error' && (
              <div>
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-800 mb-2">Thanh toán thất bại</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    {searchParams.get('error_code') && (
                      <p className="text-red-700">
                        Mã lỗi: {searchParams.get('error_code')}
                      </p>
                    )}
                    {orderId && (
                      <p className="text-red-700">
                        Mã đơn hàng: #{orderId}
                      </p>
                    )}
                    {paymentIntentId && (
                      <p className="text-red-700">
                        Mã thanh toán: {paymentIntentId}
                      </p>
                    )}
                  </div>
                </div>

                <Badge variant="destructive" className="mb-6">
                  Thanh toán thất bại
                </Badge>
              </div>
            )}

            <div className="flex space-x-3 justify-center">
              <Button variant="outline" onClick={handleBackToPOS}>
                Về trang POS
              </Button>
              {status === 'success' && orderId && (
                <Button onClick={handleViewOrder}>
                  Xem đơn hàng
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 