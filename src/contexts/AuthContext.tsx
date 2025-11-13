import { createContext, useContext, Dispatch, SetStateAction } from 'react';
import { Database } from '@/integrations/supabase/types';
import { Session } from '@supabase/supabase-js';

type Usuario = Database['public']['Tables']['usuarios']['Row'];
type AuthUser = Database['auth']['Tables']['users']['Row'];
type Empresa = Database['public']['Tables']['empresas']['Row'];

interface AuthContextType {
  user: Usuario | null;
  authUser: AuthUser | null;
  empresa: Empresa | null;
  session: Session | null;
  loading: boolean;
  setAuthUser: Dispatch<SetStateAction<AuthUser | null>>;
  setUser: Dispatch<SetStateAction<Usuario | null>>;
  setEmpresa: Dispatch<SetStateAction<Empresa | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}