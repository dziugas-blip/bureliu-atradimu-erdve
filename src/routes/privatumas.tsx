import { createFileRoute, redirect } from "@tanstack/react-router";

// The privacy policy moved to /privatumo-politika; keep the old address working.
export const Route = createFileRoute("/privatumas")({
  beforeLoad: () => {
    throw redirect({ to: "/privatumo-politika", statusCode: 301 });
  },
});
