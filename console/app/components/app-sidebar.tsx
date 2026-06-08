"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Folder,
  ChartBarStacked,
  Album,
  FileBadge,
  UserStar,
  ImageUp,
  Layers,
  NotebookTabs,
  BookCopy,
  ChartPie,
  Table2,
  Globe,
  Boxes,
  Package,
} from "lucide-react";
import { NavMain } from "~/components/nav-main";
import { NavProjects } from "~/components/nav-projects";
import { NavSecondary } from "~/components/nav-secondary";
import { NavUser } from "~/components/nav-user";
import { Briefcase } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { useUserProfile } from "~/features/user/userApi";
import { useSelector } from "react-redux";
import type { RootState } from "~/redux/store";
import { useLocation } from "react-router";
import one_states_logo_light from "@/welcome/one-states-logo-light.png";

type NavItem = {
  title: string;
  url: string;
  icon?: any;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

type SidebarData = Record<string, NavItem[]>;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isLoading } = useUserProfile();
  // console.log("Inside App Bar Loading user....... ", isLoading);

  const user = useSelector((state: RootState) => state.user);
  // console.log("User: ", user);

  const location = useLocation();

  // ✅ Determine active route
  const isActive = (path: string) => location.pathname.includes(path);

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },

    analyticsNav: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: ChartPie,
        isActive: isActive("/admin/dashboard"),
      },
    ],

    legalComplianceNav: [
      {
        title: "Policy",
        url: "/admin/policy",
        icon: FileBadge,
        isActive: isActive("/admin/policy"),
      },
    ],

    serviceManagementNav: [
      {
        title: "Services",
        url: "/admin/service",
        icon: Album,
        isActive: isActive("/admin/service"),
      },

      {
        title: "Domains",
        url: "/admin/domains",
        icon: Globe,
        isActive: isActive("/admin/domains"),
      },
    ],

    productManagementNav: [
      {
        title: "Products",
        url: "/admin/products",
        icon: Package,
        isActive: isActive("/admin/products"),
      },
      {
        title: "Categories",
        url: "/admin/product-categories",
        icon: Boxes,
        isActive: isActive("/admin/product-categories"),
      },
    ],

    customerFeedbackNav: [
      {
        title: "Testimonials",
        url: "/admin/testimonial",
        icon: UserStar,
        isActive: isActive("/admin/testimonial"),
      },
    ],

    mediaLibraryNav: [
      // {
      //   title: "Certificate",
      //   url: "/admin/certificate",
      //   icon: Table2,
      //   isActive: isActive("/admin/certificate"),
      // },
      // {
      //   title: "Users Certificate",
      //   url: "/admin/user-certificate",
      //   icon: FileBadge,
      //   isActive: isActive("/admin/user-certificate"),
      // },
      {
        title: "Gallery",
        url: "/admin/gallery",
        icon: ImageUp,
        isActive: isActive("/admin/gallery"),
      },
    ],

    communicationCenterNav: [
      {
        title: "Contact",
        url: "/admin/contact",
        icon: NotebookTabs,
        isActive: isActive("/admin/contact"),
      },
    ],
    careerManagementNav: [
      {
        title: "Careers",
        url: "/admin/career",
        icon: Briefcase,
        isActive: isActive("/admin/career"),
      },
    ],

    clientShowcaseNav: [
      {
        title: "Case Studies",
        url: "/admin/case-study",
        icon: Layers,
        isActive: isActive("/admin/case-study"),
      },
    ],

    contentManagementNav: [
      {
        title: "Articles",
        url: "/admin/blog",
        icon: BookCopy,
        isActive: isActive("/admin/blog"),
        items: [
          { title: "All Articles", url: "/admin/blog?filter=all" },
          { title: "Active Articles", url: "/admin/blog?filter=active" },
          { title: "Inactive Articles", url: "/admin/blog?filter=inactive" },
          { title: "Featured Articles", url: "/admin/blog?filter=featured" },
          {
            title: "Non-Featured Articles",
            url: "/admin/blog?filter=nonfeatured",
          },
        ],
      },

      // {
      //   title: "Course",
      //   url: "/admin/course",
      //   icon: BookCopy,
      //   isActive: isActive("/admin/course"),
      //   items: [
      //     { title: "All Course", url: "/admin/course?filter=all" },
      //     { title: "Active Course", url: "/admin/course?filter=active" },
      //     { title: "Inactive Course", url: "/admin/course?filter=inactive" },
      //     { title: "Featured Course", url: "/admin/course?filter=featured" },
      //     {
      //       title: "Non-Featured Course",
      //       url: "/admin/course?filter=nonfeatured",
      //     },
      //   ],
      // },
      {
        title: "Categories",
        url: "/admin/category",
        icon: ChartBarStacked,
        isActive: isActive("/admin/category"),
      },
    ],

    appSettingsNav: [
      {
        title: "App Configuration",
        url: "/admin/app-configuration",
        icon: Settings2,
        isActive: isActive("/admin/blog"),
      },
    ],

    navSecondary: [
      { title: "Support", url: "/admin/support", icon: LifeBuoy },
      { title: "Feedback", url: "/admin/feedback", icon: Send },
      { title: "Domains", url: "/admin/domains", icon: Send },
    ],
  };

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg">
              <img
                src={one_states_logo_light}
                alt="Image"
                className="absolute inset-0 h-full w-full object-contain"
              />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent className="scrollbar-hide">
        {/* <NavMain items={data.analyticsNav} groupName="Analytics Center" /> */}
        <NavMain
          items={data.contentManagementNav}
          groupName="Content Management"
        />
        <NavMain
          items={data.serviceManagementNav}
          groupName="Service Management"
        />
        <NavMain
          items={data.productManagementNav}
          groupName="Product Management"
        />
        <NavMain
          items={data.customerFeedbackNav}
          groupName="Customer Feedback"
        />

        <NavMain items={data.mediaLibraryNav} groupName="Media Library" />

        <NavMain
          items={data.communicationCenterNav}
          groupName="Communication Center"
        />
        <NavMain
          items={data.legalComplianceNav}
          groupName="Legal & Compliance"
        />
        {/* <NavMain
          items={data.careerManagementNav}
          groupName="Career Management"
        /> */}

        {/* <NavMain items={data.clientShowcaseNav} groupName="Client Showcase" /> */}

        <NavMain items={data.appSettingsNav} groupName="Application Settings" />

        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        {isLoading ? (
          <div className="p-2 text-xs text-muted-foreground">
            Loading user...
          </div>
        ) : user?.name ? (
          <NavUser
            user={{
              name: user.name!,
              email: user.email!,
              avatar: user.avatar || "/avatars/default.jpg",
            }}
          />
        ) : (
          <div className="p-2 text-xs text-muted-foreground">No user data</div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
