"use client";

import { useEffect, useRef, useState } from "react";

const TextGenerator = () => {
  const [inputText, setInputText] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentenceCount, setSentenceCount] = useState('3');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    setGeneratedText('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputText, numSentences: sentenceCount }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setGeneratedText(data.result);
    } catch (err) {
      setError('An error occurred while generating the summary');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <label className="form-control">
        <h3 className="pb-3">Input text that you want summarized:</h3>
        <textarea
          ref={textareaRef}
          className="textarea textarea-bordered w-full min-h-[6rem] resize-none"
          placeholder="text here"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        ></textarea>
        <div className="label">
        </div>
      </label>
      <input
        type="text"
        placeholder="3"
        className="input w-12 h-10 mr-6"
        value={sentenceCount}
        onChange={(e) => setSentenceCount(e.target.value)}
      />
      Sentences
      <button
        className="btn ml-6"
        onClick={handleGenerate}
        disabled={isLoading || !inputText.trim()}
      >
        Generate
      </button>
      {isLoading && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="">Summary is loading...</p>
        </div>
      )}
      {generatedText && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Summary:</h3>
          <p>{generatedText}</p>
        </div>
      )}
    </div>
  )
}

export default TextGenerator;