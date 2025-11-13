import { useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { AuthContext } from '../contexts/AuthContext'; // Import AuthContext
import { Session } from '@supabase/supabase-js';

type Usuario = Database['public']['Tables']['usuarios']['Row'];
type AuthUser = Database['auth']['Tables']['users']['Row'];
type Empresa = Database['public']['Tables']['empresas']['Row'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<Usuario | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [authUser, setAuthUserState] = useState<AuthUser | null>(() => {
    const storedAuthUser = localStorage.getItem('authUser');
    return storedAuthUser ? JSON.parse(storedAuthUser) : null;
  });
  const [empresa, setEmpresaState] = useState<Empresa | null>(() => {
    const stored = localStorage.getItem('empresa');
    return stored ? JSON.parse(stored) : null;
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = (user: Usuario | null) => {
    setUserState(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  };

  const setAuthUser = (authUser: AuthUser | null) => {
    setAuthUserState(authUser);
    if (authUser) {
      localStorage.setItem('authUser', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('authUser');
    }
  };

  const setEmpresa = (empresa: Empresa | null) => {
    setEmpresaState(empresa);
    if (empresa) {
      localStorage.setItem('empresa', JSON.stringify(empresa));
    } else {
      localStorage.removeItem('empresa');
    }
  };

  useEffect(() => {
    const handleSession = async (currentSession: Session | null) => {
      setSession(currentSession);
      if (currentSession) {
        const { data: userProfileData, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('auth_id', currentSession.user.id)
          .limit(1);

        const userProfile = userProfileData ? userProfileData[0] : null;

        if (error || !userProfile) {
          console.error('Error fetching user profile or profile not found:', error);
          setUser(null);
          setAuthUser(null);
          setEmpresa(null);
        } else {
          setUser(userProfile);
          setAuthUser(currentSession.user);

          // Fetch empresa linked to the user
          try {
            const { data: empresaData, error: empresaError } = await supabase
              .from('empresas')
              .select('*')
              .eq('id', userProfile.empresa_id)
              .limit(1);

            const empresaRow = empresaData ? empresaData[0] : null;

            if (empresaError || !empresaRow) {
              console.error('Error fetching empresa or not found:', empresaError);
              setEmpresa(null);
            } else {
              setEmpresa(empresaRow);
            }
          } catch (err) {
            console.error('Unexpected error fetching empresa:', err);
            setEmpresa(null);
          }
        }
      } else {
        setUser(null);
        setAuthUser(null);
        setEmpresa(null);
      }
      setLoading(false);
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, authUser, empresa, session, loading, setAuthUser: setAuthUser as Dispatch<SetStateAction<AuthUser | null>>, setUser: setUser as Dispatch<SetStateAction<Usuario | null>>, setEmpresa: setEmpresa as Dispatch<SetStateAction<Empresa | null>> }}>
      {children}
    </AuthContext.Provider>
  );
}