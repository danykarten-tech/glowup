import { useAuth } from "@/contexts/AuthContext";

const ADMIN_EMAILS = [
  "harishsinghwork2@gmail.com",
  "harishsinghwork92@gmail.com",
  "hariwork92@gmail.com",
  "balamnegi9211@gmail.com",
];

export const useIsAdmin = () => {
  const { user } = useAuth();
  return !!user?.email && ADMIN_EMAILS.includes(user.email);
};
