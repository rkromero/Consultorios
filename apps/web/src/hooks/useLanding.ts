import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as landingApi from '../api/landing.api';

const KEY = ['landing'];

export function useLanding() {
    return useQuery({
        queryKey: KEY,
        queryFn: landingApi.getLanding,
    });
}

export function useUpdateLanding() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: landingApi.updateLanding,
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}

export function useEnableLanding() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: landingApi.enableLanding,
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}

export function useDisableLanding() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: landingApi.disableLanding,
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}

export function useUpdateSlug() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: landingApi.updateSlug,
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}

export function useUploadLandingImage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ image, field }: { image: string; field: 'logoUrl' | 'heroImageUrl' }) =>
            landingApi.uploadLandingImage(image, field),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}

export function useRemoveLandingImage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (field: 'logoUrl' | 'heroImageUrl') =>
            landingApi.removeLandingImage(field),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}

export function usePublicLanding(slug: string) {
    return useQuery({
        queryKey: ['public-landing', slug],
        queryFn: () => landingApi.getPublicLanding(slug),
        enabled: !!slug,
        retry: false,
    });
}
