import { Link } from "react-router-dom";
import ClawMachineGame from "@/components/ClawMachineGame";
import StarsBackdrop from "@/components/StarsBackdrop";
import TopNav from "@/components/TopNav";

export default function Game() {
  return (
    <div className="min-h-[100svh] bg-[color:var(--bg)] text-[var(--text)]">
      <TopNav />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <StarsBackdrop density={70} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_10%,rgba(255,77,141,0.12),transparent_55%)]" />
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
          <div className="mb-6">
            <div className="text-xs text-[var(--muted)]">
              <Link to="/" className="underline-offset-4 hover:underline">
                Beranda
              </Link>{" "}
              / Claw Machine
            </div>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Claw Machine: Ambil Hati</h1>
            <div className="mt-2 text-sm text-[var(--muted)]">Gerakkan claw, lalu tekan drop untuk ambil hati.</div>
          </div>

          <ClawMachineGame />
        </div>
      </main>
    </div>
  );
}

