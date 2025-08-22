import { MainLayout } from "@/components/layout/main-layout";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
} 