import sys
import nltk
import re
from nltk.tokenize import sent_tokenize
from nltk.corpus import stopwords
from gensim.models import Word2Vec
import numpy as np
import networkx as nx
from math import log10

nltk.download("punkt", quiet=True)
nltk.download('stopwords', quiet=True)

def summarize(text, ratio=0.2, words=None, language="english", additional_stopwords=None):
    if not isinstance(text, str):
        raise ValueError("Text parameter must be a Unicode object (str)!")

    # Tokenize sentences
    sentences = sent_tokenize(text)

    # Clean and tokenize words, removing stopwords
    stop_words = stopwords.words(language)
    if additional_stopwords:
        stop_words.extend(additional_stopwords)
    sentences_clean = [re.sub(r"[^\w\s]", "", sentence.lower()) for sentence in sentences]
    sentence_tokens = [
        [word for word in sentence.split(" ") if word not in stop_words]
        for sentence in sentences_clean
    ]

    # Initialize Word2Vec model
    w2v = Word2Vec(sentence_tokens, vector_size=100, min_count=1, epochs=1000)

    # Compute similarity matrix
    similarity_matrix = np.zeros([len(sentences), len(sentences)])
    for i, sentence_1 in enumerate(sentences):
        for j, sentence_2 in enumerate(sentences):
            if i != j:
                similarity_matrix[i][j] = _get_similarity(sentence_1, sentence_2, w2v)

    # Construct graph and calculate PageRank scores
    nx_graph = nx.from_numpy_array(similarity_matrix)
    scores = nx.pagerank(nx_graph)

    # Sort sentences by PageRank score
    sorted_sentences = sorted(zip(sentences, scores.values()), key=lambda x: x[1], reverse=True)

    # Extract top sentences based on ratio or word count
    if words:
        top_sentences = [sentence for sentence, score in sorted_sentences[:words]]
    else:
        total_sentences = len(sorted_sentences)
        top_sentences = [sentence for sentence, score in sorted_sentences[:int(total_sentences * ratio)]]

    return " ".join(top_sentences)

def _get_similarity(sentence_1, sentence_2, w2v):
    words_sentence_one = sentence_1.split()
    words_sentence_two = sentence_2.split()

    common_word_count = _count_common_words(words_sentence_one, words_sentence_two)

    log_s1 = log10(len(words_sentence_one))
    log_s2 = log10(len(words_sentence_two))

    if log_s1 + log_s2 == 0:
        return 0

    return common_word_count / (log_s1 + log_s2)

def _count_common_words(words_sentence_one, words_sentence_two):
    return len(set(words_sentence_one) & set(words_sentence_two))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide the text to summarize as a command-line argument.")
        sys.exit(1)
    
    input_text = sys.argv[1]
    summary = summarize(input_text)
    print(summary)

