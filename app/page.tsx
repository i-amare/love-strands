import StrandsGame from "./components/StrandsGame";

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-80 pointer-events-none" />
      <StrandsGame />
    </main>
  );
}
