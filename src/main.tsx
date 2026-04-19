import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import AuthProvider from "./auth/auth-provider";
import { ThemeProvider } from "./theme/theme-provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
