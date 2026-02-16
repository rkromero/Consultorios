import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as appointmentsApi from '../api/appointments.api';

export const useAppointments = (params: { start: string; end: string; professionalId?: string; siteId?: string }) => {
    return useQuery({
        queryKey: ['appointments', params],
        queryFn: () => appointmentsApi.getAppointments(params),
        enabled: !!params.start && !!params.end, // Only fetch if range is defined
    });
};

export const useCreateAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: appointmentsApi.createAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
};

export const useUpdateAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<appointmentsApi.Appointment> }) => appointmentsApi.updateAppointment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
};
