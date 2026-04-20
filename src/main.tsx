import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import AuthProvider from "./auth/auth-provider";
import I18nProvider from "./i18n/i18n-provider";
import { ThemeProvider } from "./theme/theme-provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
