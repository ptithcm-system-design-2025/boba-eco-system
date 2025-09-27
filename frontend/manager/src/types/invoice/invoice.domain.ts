// Invoice data used by UI (kept with current snake_case keys to avoid breaking callers)
export interface InvoiceData {
	order_id: number;
	order_time: Date;
	customer_name?: string;
	customer_phone?: string;
	employee_name: string;
	store_name: string;
	store_address: string;
	store_phone: string;
	store_email?: string;
	store_tax_code?: string;
	items: Array<{
		product_name: string;
		quantity: number;
		unit_price: number;
		total_price: number;
	}>;
	subtotal: number;
	discount_amount: number;
	final_amount: number;
	payment_method: string;
	amount_paid: number;
	change_amount: number;
	payment_time: Date;
	payment_status: string;
	print_time: string;
}
