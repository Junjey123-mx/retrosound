import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkoutService, type CheckoutPayload } from '@/lib/services/checkout';

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckoutPayload) => checkoutService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrito'] });
      queryClient.invalidateQueries({ queryKey: ['cliente-productos'] });
    },
  });
}
