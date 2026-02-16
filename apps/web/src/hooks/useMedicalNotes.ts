import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as medicalNotesApi from '../api/medical-notes.api';

export const useMedicalNotes = (patientId: string) => {
    return useQuery({
        queryKey: ['medical-notes', patientId],
        queryFn: () => medicalNotesApi.getByPatient(patientId),
        enabled: !!patientId,
    });
};

export const useCreateMedicalNote = (patientId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (content: string) => medicalNotesApi.createMedicalNote({ patientId, content }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medical-notes', patientId] });
        },
    });
};
