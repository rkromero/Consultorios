import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: usersApi.getAll
    });
}
