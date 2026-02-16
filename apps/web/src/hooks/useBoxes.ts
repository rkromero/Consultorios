import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as boxesApi from '../api/boxes.api';

export const useBoxes = (siteId?: string) => {
    return useQuery({
        queryKey: ['boxes', siteId],
        queryFn: () => boxesApi.getBoxes(siteId),
    });
};

export const useCreateBox = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: boxesApi.createBox,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boxes'] });
        },
    });
};

export const useUpdateBox = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<boxesApi.Box> }) => boxesApi.updateBox(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boxes'] });
        },
    });
};

export const useDeleteBox = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: boxesApi.deleteBox,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boxes'] });
        },
    });
};
