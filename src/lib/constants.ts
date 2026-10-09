export const orderStatusLabels: Record<string, string> = {
  pending_payment: 'Ödeme Bekliyor',
  paid: 'Ödeme Başarılı',
  preparing: 'Hazırlanıyor',
  shipped: 'Kargoya Verildi',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
  refunded: 'İade Edildi',
};

export const orderStatusColors: Record<string, string> = {
  pending_payment: 'bg-amber-100 text-amber-800',
  paid: 'bg-blue-100 text-blue-800',
  preparing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-green-100 text-green-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export const paymentStatusLabels: Record<string, string> = {
  pending: 'Bekliyor',
  success: 'Başarılı',
  failed: 'Başarısız',
  refunded: 'İade Edildi',
};

export const orderStatusDot: Record<string, string> = {
  pending_payment: 'bg-amber-500',
  paid: 'bg-blue-500',
  preparing: 'bg-indigo-500',
  shipped: 'bg-green-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-500',
  refunded: 'bg-gray-500',
};
