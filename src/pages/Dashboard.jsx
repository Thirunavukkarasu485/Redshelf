import { useAuth } from "../context/AuthContext.jsx";
import BankDashboard from "./BankDashboard.jsx";
import HospitalDashboard from "./HospitalDashboard.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  return user.role === "bank" ? <BankDashboard /> : <HospitalDashboard />;
}
