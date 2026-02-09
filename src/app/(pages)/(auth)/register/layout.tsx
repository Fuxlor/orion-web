import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orion - Register",
  description: "Create your Orion account",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
