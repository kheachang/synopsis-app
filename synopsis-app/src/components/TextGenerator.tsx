"use client";

import { useState } from "react";

const TextGenerator = () => {
  const [inputText, setInputText] = useState('');

  const handleGenerate = () => {
    console.log('generate')
  }
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
      <button className="btn" onClick={handleGenerate}>Generate</button>
    </div>
  )
}

export default TextGenerator;