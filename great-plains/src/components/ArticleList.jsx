import { useEffect, useState } from "react";
import ArticleCard from "./ArticleCard";
import "./ArticleList.css";

function ArticleList() {
  const [articles, setArticles] = useState([]); //state, holds all articles fetched from api
  const [error, setError] = useState(""); //error messages
  const [selectedTag, setSelectedTag] = useState(null); //currently selected tag for filtering
  const [searchInput, setSearchInput] = useState(""); //what the user is typing
  const [searchApplied, setSearchApplied] = useState(""); //what is actually searched when search button is pressed
  const [tags, setTags] = useState([]); //all tags returned by api

  //load articles once on component mount
  useEffect(() => {
    async function load() {
      try {
        setError("");

        const res = await fetch("https://api.greatplainsag.com/v1/agronomy/en"); //feth articles
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`); //throw some errors is things dont work

        const data = await res.json(); //parse the json
        //API returns objects keyed by ID. convert to arrays
        const articlesArr = Object.values(data.agronomy ?? {});
        const tagsArr = Object.values(data.tags ?? {}); //convert tag objects to array
        //debug  helper
        console.log("First article keys:", Object.keys(articlesArr[0] ?? {})); //some debugging.inspecting api structure in console
        console.log("First tag keys:", Object.keys(tagsArr[0] ?? {}));

        setArticles(articlesArr);
        setTags(tagsArr);
      } catch (e) {
        //if anything fails reset state so it doesnt crash
        console.error(e);
        setError(e?.message ?? String(e));
        setArticles([]);
        setTags([]);
      }
    }

    load();
  }, []);

  function getTagLabels(article) {
    //extract readable tags from article
    const values = article?.categorization?.tags?.values;
    if (Array.isArray(values) && values.length) {   //if tags are arrays of objects 
      return values
        .map((t) => t?.name ?? t?.label ?? t?.title ?? t?.term_name)
        .filter(Boolean);
    }
    //fallback for comma seperated tag strings
    if (typeof article.tags === "string" && article.tags.trim()) {
      return article.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }
  //removes HTML tags so it can be searched as plain text
  function stripHtml(html = "") {
    return String(html)
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  //determines whether article matches the search term
  function matchesSearch(article, search) {
    const q = search.trim().toLowerCase(); //normalize
    if (!q) return true; //empty matches everything

    const title = (article.title ?? "").toLowerCase(); //normalize
    const summary = stripHtml(article.body?.summary ?? "").toLowerCase();
    const body = stripHtml(article.body?.value ?? "").toLowerCase();

    return title.includes(q) || summary.includes(q) || body.includes(q); //match against any field 
  }
  //apply tag and search filtering
  const filteredArticles = articles.filter((a) => {
    const tagOk = selectedTag ? getTagLabels(a).includes(selectedTag) : true;
    const searchOk = matchesSearch(a, searchApplied);
    return tagOk && searchOk;  //article must pass both filters 
  });

  return (
    <div className="article-page">
      <div className="article-list">
        {/*show active tag filter banner*/}
        {selectedTag && (
          <div className="article-list-filter">
            <span>Filtering by: {selectedTag}</span>
            <button
              className="article-list-button"
              type="button"
              onClick={() => setSelectedTag(null)}
            >
              Clear
            </button>
          </div>
        )}

        <p>
          Showing {filteredArticles.length} of {articles.length}
        </p>
          {/*render each article*/}
        {filteredArticles.map((article) => (
          <ArticleCard
            key={article.nid ?? article.id}
            article={article}
            onTagClick={(label) => setSelectedTag(label)}
          />
        ))}
      </div>

      {/* RIGHT SIDEBAR SEARCH */}
      <aside className="article-search">
        <h3>Search</h3>

        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search articles…"
        />
        {/*search and reset buttons */}
        <div className="article-search-actions">
          <button
            type="button"
            className="article-search-button"
            onClick={() => setSearchApplied(searchInput)}
          >
            Search
          </button>

          <button
            type="button"
            className="article-search-clear"
            onClick={() => {
              setSearchInput("");
              setSearchApplied("");
            }}
            disabled={!searchInput && !searchApplied}
          >
            Reset
          </button>
        </div>
      </aside>
    </div>
  );
}

export default ArticleList;
