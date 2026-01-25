import { RouterProvider } from "react-router";
import { router } from "@/app/routes"; // Import routes configuration
import { AuthProvider } from "@/app/context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}