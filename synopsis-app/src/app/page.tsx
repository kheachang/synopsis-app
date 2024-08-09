import TextGenerator from "@/components/TextGenerator";
import About from "@/components/About";

export default function Home() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6 text-center pt-10">TextRank Summarizer</h1>
      <About />
      <TextGenerator />
    </main>
  );
}