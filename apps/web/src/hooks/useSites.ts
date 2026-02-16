import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as sitesApi from '../api/sites.api';

export const useSites = () => {
    return useQuery({
        queryKey: ['sites'],
        queryFn: sitesApi.getSites,
    });
};

export const useCreateSite = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: sitesApi.createSite,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sites'] });
        },
    });
};

export const useUpdateSite = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<sitesApi.Site> }) => sitesApi.updateSite(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sites'] });
        },
    });
};

export const useDeleteSite = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: sitesApi.deleteSite,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sites'] });
        },
    });
};
