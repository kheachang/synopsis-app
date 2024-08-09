function splitIntoSentences(text: string): string[] {
  console.log("Debug: Original text:", text);

  // Replace periods, exclamation marks, or question marks that are followed by a space or end of the text
  const sentenceEndings = /(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|!)\s+(?=[A-Z])/g;
  const quotesHandling = /(?<=["'])\s+(?=[A-Z])/g; // Handle spaces after quotes

  let sentences = text
      .replace(quotesHandling, "|") // Handle cases where punctuation follows a quote
      .replace(sentenceEndings, "|") // Replace sentence enders with delimiter
      .split('|') // Split by delimiter
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0); // Filter out empty strings

  // Additional handling for sentences with quotes
  sentences = sentences.flatMap(sentence => {
      if (sentence.includes('"') || sentence.includes("'")) {
          return sentence.split(/(?<=["'])\s+(?=[A-Z])/g).map(s => s.trim()).filter(s => s.length > 0);
      }
      return [sentence];
  });

  console.log("Debug: Sentences after splitting:");
  sentences.forEach((sentence, i) => {
      console.log(`  Sentence ${i+1}: ${sentence}`);
  });

  return sentences;
}


function getSimilarity(sentence1: string, sentence2: string): number {
  const wordsSentenceOne = sentence1.toLowerCase().split(/\s+/);
  const wordsSentenceTwo = sentence2.toLowerCase().split(/\s+/);

  const commonWordCount = countCommonWords(wordsSentenceOne, wordsSentenceTwo);

  const logS1 = Math.log10(wordsSentenceOne.length);
  const logS2 = Math.log10(wordsSentenceTwo.length);

  if (logS1 + logS2 === 0) {
    return 0;
  }

  return commonWordCount / (logS1 + logS2);
}

function countCommonWords(words1: string[], words2: string[]): number {
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  return new Set([...set1].filter((x) => set2.has(x))).size;
}

async function summarize(
  text: string,
  numSentences: number = 3,
  additionalStopwords: string[] = []
): Promise<string> {
  console.log(
    `Debug: Received text of length ${text.length} and numSentences=${numSentences}`
  );

  if (typeof text !== "string") {
    throw new Error("Text parameter must be a string!");
  }

  const sentences = splitIntoSentences(text);
  console.log(`Debug: Total sentences in input: ${sentences.length}`);

  numSentences = Math.min(numSentences, sentences.length);
  console.log(`Debug: Adjusted numSentences: ${numSentences}`);

  const stopwords = new Set([...additionalStopwords]);

  const sentencesClean = sentences.map((sentence) =>
    sentence.toLowerCase().replace(/[^\w\s]/g, "")
  );

  const sentenceTokens = sentencesClean.map((sentence) =>
    sentence.split(" ").filter((word) => !stopwords.has(word))
  );

  // Basic similarity matrix
  const similarityMatrix = sentences.map((_, i) =>
    sentences.map((_, j) =>
      i !== j ? getSimilarity(sentences[i], sentences[j]) : 0
    )
  );

  // Simple ranking algorithm: sum of similarities for each sentence
  const scores = similarityMatrix.map((row) =>
    row.reduce((acc, score) => acc + score, 0)
  );

  const sortedSentences = sentences
    .map((sentence, i) => ({ score: scores[i], index: i, text: sentence }))
    .sort((a, b) => b.score - a.score);

  const topSentenceIndices = sortedSentences
    .slice(0, numSentences)
    .map((item) => item.index)
    .sort((a, b) => a - b);

  const topSentences = topSentenceIndices.map((i) => sentences[i]);

  console.log(`Debug: Number of sentences in summary: ${topSentences.length}`);
  topSentences.forEach((sentence, i) => {
    console.log(`Debug: Summary sentence ${i + 1}: ${sentence}`);
  });

  return topSentences.join(" ");
}

export default summarize;
