import sys
import re
from nltk.corpus import stopwords
from gensim.models import Word2Vec
import numpy as np
import networkx as nx
from math import log10

def split_into_sentences(text):
    print("Debug: Original text:", text)
    
    alphabets= "([A-Za-z])"
    prefixes = "(Mr|St|Mrs|Ms|Dr)[.]"
    suffixes = "(Inc|Ltd|Jr|Sr|Co)"
    starters = "(Mr|Mrs|Ms|Dr|He\s|She\s|It\s|They\s|Their\s|Our\s|We\s|But\s|However\s|That\s|This\s|Wherever)"
    acronyms = "([A-Z][.][A-Z][.](?:[A-Z][.])?)"
    websites = "[.](com|net|org|io|gov)"
    text = " " + text + "  "
    text = text.replace("\n"," ")
    text = re.sub(prefixes,"\\1<prd>",text)
    text = re.sub(websites,"<prd>\\1",text)
    if "Ph.D" in text: text = text.replace("Ph.D.","Ph<prd>D<prd>")
    text = re.sub("\s" + alphabets + "[.] "," \\1<prd> ",text)
    text = re.sub(acronyms+" "+starters,"\\1<stop> \\2",text)
    text = re.sub(alphabets + "[.]" + alphabets + "[.]" + alphabets + "[.]","\\1<prd>\\2<prd>\\3<prd>",text)
    text = re.sub(alphabets + "[.]" + alphabets + "[.]","\\1<prd>\\2<prd>",text)
    text = re.sub(" "+suffixes+"[.] "+starters," \\1<stop> \\2",text)
    text = re.sub(" "+suffixes+"[.]"," \\1<prd>",text)
    text = re.sub(" " + alphabets + "[.]"," \\1<prd>",text)
    
    # Correct handling of unicode quotation marks
    if '"' in text: text = text.replace('."', '".')
    if '"' in text: text = text.replace('."', '".')
    if '"' in text: text = text.replace('."', '".')
    if "'" in text: text = text.replace(".'", "'.")
    if "'" in text: text = text.replace(".'", "'.")
    if "!" in text: text = text.replace('!"', '"!')
    if "?" in text: text = text.replace('?"', '"?')
    
    text = text.replace(".",".<stop>")
    text = text.replace("?","?<stop>")
    text = text.replace("!","!<stop>")
    text = text.replace("<prd>",".")
    sentences = text.split("<stop>")
    sentences = [s.strip() for s in sentences]
    if sentences and not sentences[-1]: sentences = sentences[:-1]
    
    print("Debug: Sentences after splitting:")
    for i, sentence in enumerate(sentences):
        print(f"  Sentence {i+1}: {sentence}")
    
    return sentences

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

def summarize(text, num_sentences=3, language="english", additional_stopwords=None):
    print(f"Debug: Received text of length {len(text)} and num_sentences={num_sentences}")
    
    if not isinstance(text, str):
        raise ValueError("Text parameter must be a Unicode object (str)!")

    # Tokenize sentences using the improved method
    sentences = split_into_sentences(text)
    print(f"Debug: Total sentences in input: {len(sentences)}")

    # Ensure num_sentences is not greater than the number of sentences in the text
    num_sentences = min(num_sentences, len(sentences))
    print(f"Debug: Adjusted num_sentences: {num_sentences}")

    # Clean and tokenize words, removing stopwords
    stop_words = set(stopwords.words(language))
    if additional_stopwords:
        stop_words.update(additional_stopwords)
    
    sentences_clean = [re.sub(r"[^\w\s]", "", sentence.lower()) for sentence in sentences]
    sentence_tokens = [
        [word for word in sentence.split() if word not in stop_words]
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

    # Sort sentences by PageRank score, but keep track of original indices
    sorted_sentences = sorted(((scores[i], i, s) for i, s in enumerate(sentences)), reverse=True)

    # Extract top sentence indices, ensuring we don't exceed num_sentences
    top_sentence_indices = [idx for _, idx, _ in sorted_sentences[:num_sentences]]

    # Sort the indices to preserve original order
    top_sentence_indices.sort()

    # Extract top sentences in original order
    top_sentences = [sentences[i] for i in top_sentence_indices]
    
    print(f"Debug: Number of sentences in summary: {len(top_sentences)}")
    for i, sentence in enumerate(top_sentences):
        print(f"Debug: Summary sentence {i+1}: {sentence}")

    return " ".join(top_sentences)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python summarize.py <number_of_sentences> <text_to_summarize>")
        sys.exit(1)
    
    try:
        num_sentences = int(sys.argv[1])
        if num_sentences <= 0:
            raise ValueError("Number of sentences must be positive")
    except ValueError as e:
        print(f"Error: Invalid number of sentences. {str(e)}")
        sys.exit(1)

    input_text = sys.argv[2]
    print(f"Debug: Command line args - num_sentences: {num_sentences}, input_text length: {len(input_text)}")
    
    summary = summarize(input_text, num_sentences=num_sentences)
    print("Summary:")
    print(summary)
