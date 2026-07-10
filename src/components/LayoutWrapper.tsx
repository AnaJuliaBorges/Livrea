import React from "react";
import MenuBar from "./MenuBar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-surface selection:bg-primary/20">
      <main
        className="
      mx-auto
      max-w-3xl
      px-4
      pt-4
      pb-10
      sm:px-6
      lg:max-w-7xl
      md:pt-32
      lg:pb-6
    "
      >
        {children}
      </main>

      <MenuBar />
    </div>
  );
}
