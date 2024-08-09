const About = () => {
  return (
    <div className="mt-8 mb-8">
      <p>
        The TextRank algorithm is an automated text summarization technique inspired by Google's
        PageRank algorithm.
        This method allows for extractive summarization, where key sentences from the original text are selected to form a concise summary.
      </p>
      <br />
      <p >"In short, a graph-based ranking algorithm is a way of deciding
        on the importance of a vertex within a graph, by taking into account
        global information recursively computed from the entire graph, rather
        than relying only on local vertex-specific information ... In this paper,
        we introduced TextRank – a graph-based ranking model for text processing."
      </p>
      <br />
      <p>(Rada Mihalcea and Paul Tarau, "TextRank: Bringing Order into Texts", 2004)</p>
    </div>

  )
}

export default About;