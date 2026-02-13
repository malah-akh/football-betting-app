import { RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "@/app/routes";
import { AuthProvider } from "@/app/context/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors closeButton />
      </QueryClientProvider>
    </AuthProvider>
  );
}
