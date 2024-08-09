# TextRank Algorithm and Summarization GUI

The TextRank algorithm is an automated text summarization technique inspired by Google's PageRank algorithm. It works by:

1. Breaking the text into sentences
2. Creating a graph where sentences are nodes
3. Connecting sentences based on their similarity
4. Applying a ranking algorithm to identify the most important sentences

This method allows for extractive summarization, where key sentences from the original text are selected to form a concise summary.

Our GUI (Graphical User Interface) provides a user-friendly way to interact with this algorithm:

1. Users can input any text they want summarized
2. They can specify the number of sentences desired in the summary
3. The interface sends this information to a backend service running the TextRank algorithm
4. The resulting summary is then displayed to the user

This tool is particularly useful for quickly grasping the main points of long articles, reports, or any extensive text, saving time and improving comprehension of key ideas.


## Work in progress - TODOs:
- [x] create a GUI
- [ ] fix sentence splitting bug