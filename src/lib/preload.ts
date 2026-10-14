// Utility to preload lazy-loaded route chunks on link hover or touch
export const preloadRoute = (route: "feedback" | "dashboard" | "admin" | "auth") => {
  switch (route) {
    case "feedback":
      import("@/pages/Feedback.tsx");
      break;
    case "dashboard":
      import("@/pages/Dashboard.tsx");
      break;
    case "admin":
      import("@/pages/Admin.tsx");
      break;
    case "auth":
      import("@/pages/Auth.tsx");
      break;
  }
};
