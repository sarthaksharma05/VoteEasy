import {
  Check,
  CheckCheck,
  Star,
} from "lucide-react";
import type { ReactNode } from "react";

const features = [
  "AI चैटबॉट से पंजीकरण सहायता",
  "डॉक्यूमेंट और ID स्कैनर",
  "मल्टीलिंगुअल और एक्सेसिबल अनुभव",
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-background lg:h-screen lg:overflow-hidden lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
      <aside className="auth-fade hidden bg-[#1A1714] px-12 py-12 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden xl:px-16 xl:py-14">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary">
            <CheckCheck className="h-5 w-5 text-white" strokeWidth={2.4} />
          </div>
          <p className="text-xl font-semibold tracking-[-0.02em]">
            <span className="text-white">Vote</span>
            <span className="text-primary">Easy</span>
          </p>
        </div>

        <div className="mt-16 flex-1">
          <div className="max-w-xl space-y-8">
            <div className="space-y-6">
              <h1 className="max-w-lg text-5xl font-bold leading-[1.02] tracking-[-0.04em] text-white xl:text-6xl">
                मतदाता पंजीकरण,
                <br />
                <span className="text-primary">अविश्वसनीय</span> रूप से सरल।
              </h1>
              <p className="max-w-md text-base leading-8 text-[#9A9088]">
                अब हर नागरिक का पंजीकरण आसान है।
                <br />
                VoteEasy के साथ eligibility check, document scan, deadline tracking और guided voter registration एक ही जगह पाएं।
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 rounded-2xl border border-[#2A2622] px-4 py-4 text-sm text-[#8A8078]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2A2622]">
                    <Check className="h-4 w-4 text-primary" strokeWidth={2.4} />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 space-y-4 border-t border-[#2A2622] pt-6">
          <p className="text-base font-medium text-white">Free, documented, and ready to scale</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className="h-5 w-5 fill-primary text-primary"
                  strokeWidth={2}
                />
              ))}
            </div>
            <div className="flex items-center -space-x-2">
              <span className="h-9 w-9 rounded-full border border-[#1A1714] bg-[#D9C8BA]" />
              <span className="h-9 w-9 rounded-full border border-[#1A1714] bg-[#C7B19F]" />
              <span className="h-9 w-9 rounded-full border border-[#1A1714] bg-[#B28B74]" />
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#8A8078]">
            Built for student developers, academic evaluation, open-source contribution, and practical voter assistance.
          </p>
        </div>
      </aside>

      <section className="auth-fade flex min-h-screen items-center justify-center px-6 py-10 sm:px-8 lg:h-screen lg:min-h-0 lg:overflow-hidden lg:px-12 lg:py-8">
        {children}
      </section>
    </main>
  );
}
