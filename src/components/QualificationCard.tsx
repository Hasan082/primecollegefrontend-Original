import { Link } from "react-router-dom";

interface QualificationCardProps {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  level: string | null;
  duration: string;
  price: string;
  description: string;
  imageUrl?: string | null;
}

const QualificationCard = ({
  slug,
  title,
  category,
  level,
  duration,
  price,
  description,
  imageUrl,
}: QualificationCardProps) => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      {imageUrl ? (
        <Link to={`/qualifications/${slug}`} className="mb-4 block overflow-hidden rounded-lg">
          <img src={imageUrl} alt={title} className="h-44 w-full object-cover" />
        </Link>
      ) : null}

      <div className="mb-3 flex items-center gap-2">
        {category ? (
          <span className="rounded bg-secondary px-3 py-1 text-xs font-bold uppercase text-secondary-foreground">
            {category}
          </span>
        ) : null}
        {level ? <span className="text-xs text-muted-foreground">{level}</span> : null}
      </div>

      <Link to={`/qualifications/${slug}`}>
        <h3 className="mb-2 text-lg font-semibold leading-snug text-foreground transition-colors hover:text-primary">
          {title}
        </h3>
      </Link>

      <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">{description}</p>

      <div className="mt-auto">
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="text-sm text-muted-foreground">{duration}</div>
          <div className="text-lg font-bold text-primary">{price}</div>
        </div>

        <Link
          to={`/qualifications/${slug}`}
          className="mt-4 block rounded bg-primary py-2 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default QualificationCard;
