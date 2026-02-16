import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as invoicesApi from '../api/invoices.api';

export const useInvoices = (params: { startDate?: string; endDate?: string; status?: string }) => {
    return useQuery({
        queryKey: ['invoices', params],
        queryFn: () => invoicesApi.getInvoices(params),
    });
};

export const useInvoiceStats = () => {
    return useQuery({
        queryKey: ['invoices-stats'],
        queryFn: invoicesApi.getStats
    });
}

export const useCreateInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: invoicesApi.createInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['invoices-stats'] });
        },
    });
};

export const useUpdateInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => invoicesApi.updateInvoice(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['invoices-stats'] });
        },
    });
};
