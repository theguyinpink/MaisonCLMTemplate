export function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[1400px] px-6 py-10 md:px-8 md:py-14 lg:px-10">{children}</div>;
}
