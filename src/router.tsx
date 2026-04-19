import { createBrowserRouter } from "react-router";
import { AdminLayout } from "./routes/layouts/admin-layout";
import { PublicLayout } from "./routes/layouts/public-layout";
import { AdminEventPage } from "./routes/pages/admin-event-page";
import { AdminEventsNewPage } from "./routes/pages/admin-events-new-page";
import { AdminEventsPage } from "./routes/pages/admin-events-page";
import { AdminLoginPage } from "./routes/pages/admin-login-page";
import { AdminPage } from "./routes/pages/admin-page";
import { EventPage } from "./routes/pages/event-page";
import { HomePage } from "./routes/pages/home-page";
import { NotFoundPage } from "./routes/pages/not-found-page";

export const router = createBrowserRouter([
  {
    children: [
      {
        Component: HomePage,
        index: true,
      },
      {
        Component: EventPage,
        path: "events/:eventId",
      },
    ],
    element: <PublicLayout />,
  },
  {
    children: [
      {
        Component: AdminLoginPage,
        path: "login",
      },
      {
        children: [
          {
            Component: AdminPage,
            index: true,
          },
          {
            Component: AdminEventsPage,
            path: "events",
          },
          {
            Component: AdminEventsNewPage,
            path: "events/new",
          },
          {
            Component: AdminEventPage,
            path: "events/:eventId",
          },
        ],
        element: <AdminLayout />,
      },
    ],
    path: "admin",
  },
  {
    Component: NotFoundPage,
    path: "*",
  },
]);
