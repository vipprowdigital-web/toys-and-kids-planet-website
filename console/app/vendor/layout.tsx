import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "~/components/ui/button";
import { removeVendorToken, getVendorData } from "~/utils/vendorAuth";
import { Package, LogOut, Store, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

export default function VendorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const vendor = getVendorData();

  const handleLogout = () => {
    removeVendorToken();
    navigate("/vendor/sign-in");
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <div>
              <div className="font-semibold text-sm">{vendor?.shopName ?? "My Shop"}</div>
              <div className="text-xs text-muted-foreground">Vendor Dashboard</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/vendor/products"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive("/vendor/products")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Package className="h-4 w-4" />
            My Products
          </Link>
        </nav>

        <div className="p-4 border-t">
          <div className="mb-3 px-3">
            <div className="text-sm font-medium">{vendor?.ownerName ?? ""}</div>
            <div className="text-xs text-muted-foreground truncate">{vendor?.email ?? ""}</div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
