import TextGenerator from "@/components/TextGenerator";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">Text Generator</h1>
      <TextGenerator />
    </main>
  );
}