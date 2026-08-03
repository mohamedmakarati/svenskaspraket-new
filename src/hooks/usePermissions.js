import { useAuth } from '@/hooks/useAuth';

export function usePermissions() {
  const { profile } = useAuth();
  const role = profile?.role ?? 'viewer';

  return {
    role,
    canAccessAdmin: role === 'admin' || role === 'editor',
    canEdit: role === 'admin' || role === 'editor',
    canDelete: role === 'admin',
    canManageUsers: role === 'admin',
    canManageSettings: role === 'admin',
    isAdmin: role === 'admin',
    isEditor: role === 'editor',
  };
}
