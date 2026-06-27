import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  layout("routes/public/authLayout.tsx", [
    route("sign-up", "routes/public/sign-up-wrapper.tsx"),
    route("sign-in", "routes/public/sign-in-wrapper.tsx"),
  ]),

  // ── Vendor public routes (no sidebar, own layout) ─────────────────────────
  route("vendor/sign-in", "vendor/sign-in/page.tsx"),
  route("vendor/register", "vendor/register/page.tsx"),

  route("vendor", "vendor/layout.tsx", [
    layout("routes/vendor/VendorProtectedLayout.tsx", [
      route("products", "features/vendor-products/index.tsx"),
      route("products/create", "features/vendor-products/create-wrapper.tsx"),
      route("products/edit/:id", "features/vendor-products/edit-wrapper.tsx"),
    ]),
  ]),

  route("admin", "admin/layout.tsx", [
    layout("routes/protected/ProtectedLayout.tsx", [
      route("dashboard", "routes/protected/dashboard-wrapper.tsx"),
      // ✅ Works fine now
      ...createCrudRoutes("app-configuration"),
      ...createCrudRoutes("blog"),
      ...createCrudRoutes("course"),
      ...createCrudRoutes("category"),
      ...createCrudRoutes("service"),
      ...createCrudRoutes("career"),
      ...createCrudRoutes("policy"),
      ...createCrudRoutes("testimonial"),
      ...createCrudRoutes("certificate"),
      ...createCrudRoutes("user-certificate"),
      ...createCrudRoutes("gallery"),
      ...createCrudRoutes("support"),
      ...createCrudRoutes("contact"),
      ...createCrudRoutes("domains"),

      ...createCrudRoutes("products"),
      route(
        "products/bulk-upload",
        "features/products/components/BulkUploadPage.tsx",
      ),

      ...createCrudRoutes("product-categories"),

      // Orders — list + detail (no create/edit form, managed inline)
      route("orders", "features/orders/index.tsx"),
      route("orders/:id", "features/orders/detail.tsx"),

      // Product reviews — admin manage
      route("product-reviews", "features/product-reviews/index.tsx"),

      // ── Multi-vendor: platform admin vendor management ──────────────────
      route("vendors", "features/vendors/index.tsx"),

      // Single Routes -> Model / Pop Form / Chat Box / AI Agents / Etc.
      route("feedback", "features/feedback/index.tsx"),
    ]),

    route("users/profile", "routes/protected/user-wrapper.tsx"),
  ]),
] satisfies RouteConfig;

/**
 * 🔧 Generate standard CRUD routes
 */
function createCrudRoutes(entity: string): ReturnType<typeof route>[] {
  const basePath = `features/${entity}`;

  // 🧠 Special case for single-record modules like app-configuration
  if (entity === "app-configuration") {
    return [
      route(entity, `${basePath}/index.tsx`),
      route(`${entity}/edit/:id?`, `${basePath}/edit-wrapper.tsx`), // ✅ optional param
    ];
  }

  // 🧱 Default CRUD pattern
  return [
    route(entity, `${basePath}/index.tsx`),
    route(`${entity}/create`, `${basePath}/create-wrapper.tsx`),
    route(`${entity}/edit/:id`, `${basePath}/edit-wrapper.tsx`),
  ];
}
