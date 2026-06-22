import React from "react";
import MenuBar from "./MenuBar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-surface selection:bg-primary/20">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 mb-8">
        {children}
      </main>
      <MenuBar />
    </div>
  );
}
