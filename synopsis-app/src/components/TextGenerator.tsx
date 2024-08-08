"use client";

import { useState } from "react";

const TextGenerator = () => {
  const [inputText, setInputText] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    console.log('input text', inputText)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputText }),
      });
      
      console.log('res', response)
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
        <div className="label">
          <span className="label-text">Input your text</span>
        </div>
        <textarea
          className="textarea textarea-bordered h-24"
          placeholder="text here"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        ></textarea>
        <div className="label">
        </div>
      </label>
      <button
        className="btn"
        onClick={handleGenerate}
        disabled={isLoading || !inputText.trim()}
      >
        Generate
      </button>
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