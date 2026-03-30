import { createContext, useContext, useState, useCallback, useRef } from "react";
import { getUserAPI } from "./api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "", photoUrl: null });
  const [loaded, setLoaded] = useState(false);
  const fetchRef = useRef(null);

  const fetchUser = useCallback(async () => {
    // Deduplicate concurrent calls
    if (fetchRef.current) return fetchRef.current;
    fetchRef.current = (async () => {
      try {
        const res = await getUserAPI();
        const data = res?.data ?? res;
        setUser({
          firstName: data?.first_name || "",
          lastName: data?.last_name || "",
          email: data?.email || "",
          photoUrl: data?.profile_pic_url || null,
        });
      } catch {
        // not logged in or failed
      } finally {
        setLoaded(true);
        fetchRef.current = null;
      }
    })();
    return fetchRef.current;
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  const clearUser = useCallback(() => {
    setUser({ firstName: "", lastName: "", email: "", photoUrl: null });
    setLoaded(false);
  }, []);

  return (
    <UserContext.Provider value={{ user, loaded, fetchUser, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
