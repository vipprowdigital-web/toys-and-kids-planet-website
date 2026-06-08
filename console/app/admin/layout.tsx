// app/admin/layout.tsx

import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Fragment } from "react/jsx-runtime";
import ThemeSwitcher from "~/components/ThemeSwitcher";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background rounded-t-2xl">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/blog">
                    One States Console
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {pathParts.slice(1).map((part, index) => (
                  <Fragment key={`crumb-${index}`}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="capitalize">
                        {part.replace("-", " ")}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* <div className="px-4">
            <ThemeSwitcher />
          </div> */}
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
