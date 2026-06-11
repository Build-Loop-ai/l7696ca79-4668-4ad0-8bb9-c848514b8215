import { LaunchChecklist } from "@/components/launch/LaunchChecklist";

const DashboardLaunch = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-foreground">Go Live</h1>
        <p className="text-muted-foreground">
          Everything between your remix and an AI that answers the phone — checked for you.
        </p>
      </div>
      <LaunchChecklist />
    </div>
  );
};

export default DashboardLaunch;
