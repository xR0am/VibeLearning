import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserProfileSettings from "@/components/UserProfileSettings";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";

export default function Profile() {
  const { isAuthenticated, isLoading } = useAuth();

  // If still loading, show nothing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to home
  if (!isAuthenticated && !isLoading) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
          <UserProfileSettings />
        </div>
      </main>
      <Footer />
    </div>
  );
}