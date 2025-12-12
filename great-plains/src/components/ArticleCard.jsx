import "./ArticleCard.css";


function stripHtml(html = "") {
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function decodeHtmlEntities(str = "") {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

function pickImageFromField(field) {
  const v = field?.values?.[0];
  const imgs = v?.images;
  if (!imgs) return null;

  return (
    imgs["500px_width_uri"] ||
    imgs["800px_width_uri"] ||
    imgs["1200px_width_uri"] ||
    imgs["thumbnail_uri"] ||
    imgs["1300px_width_uri"] ||
    Object.values(imgs)[0] ||
    null
  );
}

function pickAltFromField(field, fallback) {
  return field?.values?.[0]?.alt || fallback;
}

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

function ArticleCard({ article, onTagClick }) {
  const imgUrl =
    pickImageFromField(article.article_image) ||
    pickImageFromField(article.feature_block_image);

  const imgAlt =
    pickAltFromField(article.article_image, article.title) ||
    pickAltFromField(article.feature_block_image, article.title);

  const tagLabels = getTagLabels(article);

  const summary =
    article.body?.summary
      ? decodeHtmlEntities(article.body.summary)
      : decodeHtmlEntities(stripHtml(article.body?.value ?? ""));

  return (
    <article className="article-card">
      {imgUrl && (
        <img
          className="article-card__image"
          src={imgUrl}
          alt={imgAlt}
          loading="lazy"
        />
      )}

      <div className="article-card__content">
        <h3 className="article-card__title">{article.title}</h3>

        <div className="article-card__tags">
          {tagLabels.map(label => (
            <button
              key={label}
              type="button"
              className="article-card__tag"
              onClick={() => onTagClick?.(label)}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="article-card__summary">{summary}</p>

        <button className="article-card__read-more">
          Read More
        </button>
      </div>
    </article>
  );
}

export default ArticleCard;

