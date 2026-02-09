import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orion - Login",
  description: "Sign in to your Orion account",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
