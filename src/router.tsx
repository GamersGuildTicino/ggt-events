import { createBrowserRouter } from "react-router";
import AdminAuthLayout from "./routes/layouts/admin-auth-layout";
import AdminLayout from "./routes/layouts/admin-layout";
import AdminProtectedLayout from "./routes/layouts/admin-protected-layout";
import PublicLayout from "./routes/layouts/public-layout";
import AdminEventPage from "./routes/pages/admin-event-page";
import AdminEventsNewPage from "./routes/pages/admin-events-new-page";
import AdminEventsPage from "./routes/pages/admin-events-page";
import AdminForgotPasswordPage from "./routes/pages/admin-forgot-password-page";
import AdminLoginPage from "./routes/pages/admin-login-page";
import AdminPage from "./routes/pages/admin-page";
import EventPage from "./routes/pages/event-page";
import HomePage from "./routes/pages/home-page";
import NotFoundPage from "./routes/pages/not-found-page";

export const router = createBrowserRouter([
  {
    children: [
      { Component: HomePage, index: true },
      { Component: EventPage, path: "events/:eventId" },
    ],
    element: <PublicLayout />,
  },
  {
    children: [
      {
        children: [
          { Component: AdminForgotPasswordPage, path: "forgot-password" },
          { Component: AdminLoginPage, path: "login" },
        ],
        element: <AdminAuthLayout />,
      },
      {
        children: [
          {
            children: [
              { Component: AdminPage, index: true },
              { Component: AdminEventsPage, path: "events" },
              { Component: AdminEventsNewPage, path: "events/new" },
              { Component: AdminEventPage, path: "events/:eventId" },
            ],
            element: <AdminLayout />,
          },
        ],
        element: <AdminProtectedLayout />,
      },
    ],
    path: "admin",
  },
  { Component: NotFoundPage, path: "*" },
]);
