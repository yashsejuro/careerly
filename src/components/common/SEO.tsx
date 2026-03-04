import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: 'website' | 'article';
}

export function SEO({
    title,
    description = "Navigate your career path with confidence. Discover personalized roadmaps, analyze skill gaps, and track internships.",
    keywords = ["career", "roadmap", "internshpis", "skill gap", "students", "professional development"],
    image = "/og-image.png", // We should make sure this image exists or use a default one
    url = "https://careerly-pi.vercel.app", // Replace with actual domain
    type = "website",
}: SEOProps) {
    const siteTitle = "Careerly | Navigate Your Future";
    const finalTitle = title ? `${title} | Careerly` : siteTitle;

    return (
        <Helmet>
            {/* Basic */}
            <title>{finalTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords.join(", ")} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={finalTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />
        </Helmet>
    );
}
