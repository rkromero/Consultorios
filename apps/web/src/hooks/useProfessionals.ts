import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as professionalsApi from '../api/professionals.api';

export const useProfessionals = () => {
    return useQuery({
        queryKey: ['professionals'],
        queryFn: professionalsApi.getProfessionals,
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
