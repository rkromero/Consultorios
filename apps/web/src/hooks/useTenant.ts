import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as tenantApi from '../api/tenant.api';

export const useTenantInfo = () => {
    return useQuery({
        queryKey: ['tenant-info'],
        queryFn: tenantApi.getTenantInfo,
    });
};

export const useUpdateTenantName = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (name: string) => tenantApi.updateTenantName(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-info'] });
        },
    });
};

export const useUploadTenantLogo = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (logoDataUrl: string) => tenantApi.uploadTenantLogo(logoDataUrl),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-info'] });
        },
    });
};

export const useRemoveTenantLogo = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => tenantApi.removeTenantLogo(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-info'] });
        },
    });
};
