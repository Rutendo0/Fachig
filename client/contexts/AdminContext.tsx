import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AdminContextType {
  isAdmin: boolean;
  toggleAdmin: () => void;
  setAdmin: (isAdmin: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  // Load admin state from localStorage on mount
  useEffect(() => {
    const savedAdminState = localStorage.getItem("blog-admin-mode");
    if (savedAdminState === "true") {
      setIsAdmin(true);
    }
  }, []);

  // Save admin state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("blog-admin-mode", isAdmin.toString());
  }, [isAdmin]);

  const toggleAdmin = () => {
    setIsAdmin(!isAdmin);
  };

  const setAdmin = (adminState: boolean) => {
    setIsAdmin(adminState);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, toggleAdmin, setAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
