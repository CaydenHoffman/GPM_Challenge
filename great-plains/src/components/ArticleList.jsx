import { useEffect, useState } from "react";
import ArticleCard from "./ArticleCard";
import "./ArticleList.css";


function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchApplied, setSearchApplied] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setError("");

        const res = await fetch("https://api.greatplainsag.com/v1/agronomy/en");
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

        const data = await res.json();

        const articlesArr = Object.values(data.agronomy ?? {});
        const tagsArr = Object.values(data.tags ?? {});

        console.log("First article keys:", Object.keys(articlesArr[0] ?? {}));
        console.log("First tag keys:", Object.keys(tagsArr[0] ?? {}));

        setArticles(articlesArr);
        setTags(tagsArr);
      } catch (e) {
        console.error(e);
        setError(e?.message ?? String(e));
        setArticles([]);
        setTags([]);
      }
    }

    load();
  }, []);
function getTagLabels(article) {
  const values = article?.categorization?.tags?.values;
  if (Array.isArray(values) && values.length) {
    return values
      .map(t => t?.name ?? t?.label ?? t?.title ?? t?.term_name)
      .filter(Boolean);
  }

  if (typeof article.tags === "string" && article.tags.trim()) {
    return article.tags
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }

  return [];
}

function stripHtml(html = "") {
  return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function matchesSearch(article, search) {
  const q = search.trim().toLowerCase();
  if (!q) return true;

  const title = (article.title ?? "").toLowerCase();
  const summary = stripHtml(article.body?.summary ?? "").toLowerCase();
  const body = stripHtml(article.body?.value ?? "").toLowerCase();

  return title.includes(q) || summary.includes(q) || body.includes(q);
}

const filteredArticles = articles.filter((a) => {
  const tagOk = selectedTag ? getTagLabels(a).includes(selectedTag) : true;
  const searchOk = matchesSearch(a, searchApplied);
  return tagOk && searchOk;
});



  return (
    <div className="article-page">
      <div className="article-list">
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

        <p>Showing {filteredArticles.length} of {articles.length}</p>

        {filteredArticles.map(article => (
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

        <input type="text" value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search articles…"
        />
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
            onClick={() => { setSearchInput(""); setSearchApplied(""); }}
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