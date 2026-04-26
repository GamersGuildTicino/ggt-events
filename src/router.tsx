/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from "react-router";
import AdminAuthLayout from "./routes/layouts/admin-auth-layout";
import AdminLayout from "./routes/layouts/admin-layout";
import AdminProtectedLayout from "./routes/layouts/admin-protected-layout";
import PublicLayout from "./routes/layouts/public-layout";

//------------------------------------------------------------------------------
// Lazy Imports
//------------------------------------------------------------------------------

const lazy =
  (load: () => Promise<{ default: React.ComponentType }>) => async () => ({
    Component: (await load()).default,
  });

const HomePage = lazy(() => import("./routes/pages/home-page/home-page"));
const EventPage = lazy(() => import("./routes/pages/event-page/event-page"));
const TermsAndConditionsPage = lazy(
  () =>
    import("./routes/pages/terms-and-conditions-page/terms-and-conditions-page"),
);
const AdminForgotPasswordPage = lazy(
  () =>
    import("./routes/pages/admin-forgot-password-page/admin-forgot-password-page"),
);
const AdminLoginPage = lazy(
  () => import("./routes/pages/admin-login-page/admin-login-page"),
);
const AdminResetPasswordPage = lazy(
  () =>
    import("./routes/pages/admin-reset-password-page/admin-reset-password-page"),
);
const AdminPage = lazy(() => import("./routes/pages/admin-page/admin-page"));
const AdminEventsPage = lazy(
  () => import("./routes/pages/admin-events-page/admin-events-page"),
);
const AdminEventsNewPage = lazy(
  () => import("./routes/pages/admin-events-new-page/admin-events-new-page"),
);
const AdminEventPage = lazy(
  () => import("./routes/pages/admin-event-page/admin-event-page"),
);
const AdminGameSystemsPage = lazy(
  () =>
    import("./routes/pages/admin-game-systems-page/admin-game-systems-page"),
);
const AdminGameSystemsNewPage = lazy(
  () =>
    import("./routes/pages/admin-game-systems-new-page/admin-game-systems-new-page"),
);
const AdminGameSystemPage = lazy(
  () => import("./routes/pages/admin-game-system-page/admin-game-system-page"),
);
const NotFoundPage = lazy(
  () => import("./routes/pages/not-found-page/not-found-page"),
);

//------------------------------------------------------------------------------
// Router
//------------------------------------------------------------------------------

export const router = createBrowserRouter(
  [
    {
      children: [
        { index: true, lazy: HomePage },
        { lazy: EventPage, path: "events/:eventId" },
        { lazy: TermsAndConditionsPage, path: "terms-and-conditions" },
      ],
      element: <PublicLayout />,
    },
    {
      children: [
        { lazy: AdminResetPasswordPage, path: "reset-password" },
        {
          children: [
            { lazy: AdminForgotPasswordPage, path: "forgot-password" },
            { lazy: AdminLoginPage, path: "login" },
          ],
          element: <AdminAuthLayout />,
        },
        {
          children: [
            {
              children: [
                { index: true, lazy: AdminPage },
                { lazy: AdminEventsPage, path: "events" },
                { lazy: AdminEventsNewPage, path: "events/new" },
                { lazy: AdminEventPage, path: "events/:eventId" },
                { lazy: AdminGameSystemsPage, path: "game-systems" },
                { lazy: AdminGameSystemsNewPage, path: "game-systems/new" },
                {
                  lazy: AdminGameSystemPage,
                  path: "game-systems/:gameSystemId",
                },
              ],
              element: <AdminLayout />,
            },
          ],
          element: <AdminProtectedLayout />,
        },
      ],
      path: "admin",
    },
    { lazy: NotFoundPage, path: "*" },
  ],
  { basename: import.meta.env.BASE_URL },
);
