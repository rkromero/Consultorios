import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as patientsApi from '../api/patients.api';

export const usePatient = (id: string) => {
    return useQuery({
        queryKey: ['patient', id],
        queryFn: () => patientsApi.getPatient(id),
        enabled: !!id,
    });
};

export const usePatients = (params: { q?: string; page?: number; limit?: number }) => {
    return useQuery({
        queryKey: ['patients', params],
        queryFn: () => patientsApi.getPatients(params),
        placeholderData: (previousData) => previousData, // Keep previous data while fetching
    });
};

export const useCreatePatient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: patientsApi.createPatient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
        },
    });
};

export const useUpdatePatient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<patientsApi.Patient> }) => patientsApi.updatePatient(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
        },
    });
};
