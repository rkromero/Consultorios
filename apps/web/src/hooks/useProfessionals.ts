import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as professionalsApi from '../api/professionals.api';

export const useProfessionals = (activeOnly?: boolean) => {
    return useQuery({
        queryKey: ['professionals', activeOnly],
        queryFn: () => professionalsApi.getProfessionals(activeOnly),
    });
};

export const useCreateProfessional = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: professionalsApi.createProfessional,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['professionals'] });
        },
    });
};

export const useToggleProfessionalActive = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: professionalsApi.toggleProfessionalActive,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['professionals'] });
        },
    });
};
