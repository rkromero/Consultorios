import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, InviteUserData } from '../api/users.api';

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: usersApi.getAll
    });
}

export function useInviteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: InviteUserData) => usersApi.invite(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
}

export function useRemoveUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => usersApi.remove(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
}

export function useUpdateUserRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: string }) => usersApi.updateRole(userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
}
