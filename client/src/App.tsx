import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import Courses from "@/pages/Courses";
import CourseCategory from "@/pages/CourseCategory";
import LessonPage from "@/pages/Lesson";
import Compiler from "@/pages/Compiler";
import ProgressPage from "@/pages/Progress";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Challenges from "@/pages/Challenges";
import Leaderboard from "@/pages/Leaderboard";
import Assistant from "@/pages/Assistant";
import Admin from "@/pages/Admin";
import AdminLessons from "@/pages/AdminLessons";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Redirect to="/auth" />;
  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Redirect to="/auth" />;
  if (user.role !== "admin") return <Redirect to="/dashboard" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Login} />
      <Route path="/auth/signup" component={Signup} />
      <Route path="/auth/forgot" component={ForgotPassword} />

      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/courses">{() => <ProtectedRoute component={Courses} />}</Route>
      <Route path="/courses/:category">{() => <ProtectedRoute component={CourseCategory} />}</Route>
      <Route path="/lessons/:slug">{() => <ProtectedRoute component={LessonPage} />}</Route>
      <Route path="/compiler">{() => <ProtectedRoute component={Compiler} />}</Route>
      <Route path="/progress">{() => <ProtectedRoute component={ProgressPage} />}</Route>
      <Route path="/projects">{() => <ProtectedRoute component={Projects} />}</Route>
      <Route path="/projects/:slug">{() => <ProtectedRoute component={ProjectDetail} />}</Route>
      <Route path="/challenges">{() => <ProtectedRoute component={Challenges} />}</Route>
      <Route path="/leaderboard">{() => <ProtectedRoute component={Leaderboard} />}</Route>
      <Route path="/assistant">{() => <ProtectedRoute component={Assistant} />}</Route>
      <Route path="/profile">{() => <ProtectedRoute component={Profile} />}</Route>
      <Route path="/admin">{() => <AdminRoute component={Admin} />}</Route>
      <Route path="/admin/lessons">{() => <AdminRoute component={AdminLessons} />}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
