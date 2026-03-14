import { Toaster } from "@/components/ui/sonner";
import MiniBrowser from "./components/MiniBrowser";

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.18 0.025 255)",
            border: "1px solid oklch(0.28 0.03 255)",
            color: "oklch(0.95 0.01 255)",
          },
        }}
      />
      <MiniBrowser />
    </>
  );
}
