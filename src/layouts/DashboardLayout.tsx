import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import BottomNav from "@/components/dashboard/BottomNav";
import CommandPalette from "@/components/CommandPalette";

const DashboardLayout = () => {
  return (
    <>
      <CommandPalette />
      <div className="min-h-screen flex w-full bg-background gradient-mesh">
        {/* Desktop sidebar */}
        <DashboardSidebar />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto w-full">
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
    </>
  );
};

export default DashboardLayout;
