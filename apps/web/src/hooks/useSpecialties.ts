import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as specialtiesApi from '../api/specialties.api';

export const useSpecialties = () => {
    return useQuery({
        queryKey: ['specialties'],
        queryFn: specialtiesApi.getSpecialties,
    });
};

export const useCreateSpecialty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: specialtiesApi.createSpecialty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['specialties'] });
        },
    });
};

export const useDeleteSpecialty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: specialtiesApi.deleteSpecialty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['specialties'] });
        },
    });
};
