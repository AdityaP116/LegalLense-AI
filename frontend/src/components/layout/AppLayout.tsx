import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export function AppLayout() {
  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="relative pt-16 bg-background min-h-screen w-full px-gutter-lg pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
