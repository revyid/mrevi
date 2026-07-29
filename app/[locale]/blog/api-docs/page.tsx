import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const BASE_URL = "https://revy.my.id";

export const metadata: Metadata = {
  title: "API Documentation — M. Revi Ramadhan",
  description: "Complete API documentation for mrevi-api endpoints including authentication, rate limits, and usage examples.",
  openGraph: {
    type: "website",
    url: `${BASE_URL}/en/blog/api-docs`,
    title: "API Documentation — M. Revi Ramadhan",
    description: "Complete API documentation for mrevi-api endpoints.",
  },
  alternates: { canonical: `${BASE_URL}/en/blog/api-docs` },
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.revy.my.id";

export default async function ApiDocsPage() {
  const t = await getTranslations("blog");

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12">
      <section>
        <Link href="/blog">
          <button className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5 M12 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </button>
        </Link>
        
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight font-heading mb-4">
          API Documentation
        </h1>
        <p className="text-lg text-muted-foreground">
          Complete guide to integrate with mrevi-api endpoints.
        </p>
      </section>

      {/* Authentication */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-heading">Authentication</h2>
        <p className="text-muted-foreground">
          All API endpoints require authentication using an API key. Include your API key in the request header:
        </p>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm">
          <pre className="overflow-x-auto">
{`x-api-key: your_api_key_here`}
          </pre>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-200">
            <strong>How to get an API Key:</strong>
          </p>
          <ol className="text-sm text-blue-200/80 mt-2 list-decimal list-inside space-y-1">
            <li>Login at <Link href="/profile" className="underline">revy.my.id/profile</Link></li>
            <li>Scroll to the &quot;API Authentication&quot; section</li>
            <li>Your API key is auto-generated on first visit</li>
            <li>Copy and store it securely — the full key is only shown once</li>
          </ol>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-sm text-yellow-200">
            <strong>Note:</strong> API keys are hashed using SHA-256 before storage. Keep your keys secure and never commit them to version control. If you lose your key, click &quot;Regenerate Key&quot; on the profile page.
          </p>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-heading">Rate Limits</h2>
        <p className="text-muted-foreground">
          Rate limits are enforced per API key on an hourly basis. Default limit is configurable per key. 
          If you exceed the limit, you'll receive a <code className="bg-secondary px-2 py-1 rounded">429</code> response.
        </p>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm">
          <pre className="overflow-x-auto">
{`{
  "error": "Rate limit exceeded"
}`}
          </pre>
        </div>
      </section>

      {/* Base URL */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-heading">Base URL</h2>
        <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm">
          <pre>{API_BASE_URL}</pre>
        </div>
      </section>

      {/* Endpoints */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold font-heading">Endpoints</h2>

        {/* Portfolio Endpoint */}
        <div className="border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm font-mono">GET</span>
            <code className="text-lg font-mono">/api/portfolio</code>
          </div>
          <p className="text-muted-foreground">
            Fetch all portfolio data including projects, experiences, tools, blog posts, and site settings.
          </p>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Request Example</h4>
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`curl -X GET ${API_BASE_URL}/api/portfolio \\
  -H "x-api-key: your_api_key_here"`}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Response Example</h4>
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`{
  "status": "ok",
  "data": {
    "projects": [...],
    "experiences": [...],
    "tools": [...],
    "blog_posts": [...],
    "settings": {
      "site_name": "...",
      "site_description": "..."
    }
  }
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Projects Endpoint */}
        <div className="border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm font-mono">GET</span>
            <code className="text-lg font-mono">/api/projects</code>
          </div>
          <p className="text-muted-foreground">
            Fetch all projects ordered by sort_order.
          </p>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Request Example</h4>
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`curl -X GET ${API_BASE_URL}/api/projects \\
  -H "x-api-key: your_api_key_here"`}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Response Example</h4>
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`{
  "status": "ok",
  "data": [
    {
      "id": "...",
      "title": "Project Title",
      "description": "...",
      "sort_order": 1,
      ...
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Blog Endpoint */}
        <div className="border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm font-mono">GET</span>
            <code className="text-lg font-mono">/api/blog</code>
          </div>
          <p className="text-muted-foreground">
            Fetch all blog posts ordered by sort_order.
          </p>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Request Example</h4>
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`curl -X GET ${API_BASE_URL}/api/blog \\
  -H "x-api-key: your_api_key_here"`}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Response Example</h4>
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`{
  "status": "ok",
  "data": [
    {
      "id": "...",
      "title": "Blog Post Title",
      "excerpt": "...",
      "slug": "...",
      "date": "...",
      "read_time": "...",
      "sort_order": 1,
      ...
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Experiences Endpoint */}
        <div className="border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm font-mono">GET</span>
            <code className="text-lg font-mono">/api/experiences</code>
          </div>
          <p className="text-muted-foreground">
            Fetch all work experiences ordered by sort_order.
          </p>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Request Example</h4>
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`curl -X GET ${API_BASE_URL}/api/experiences \\
  -H "x-api-key: your_api_key_here"`}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Response Example</h4>
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`{
  "status": "ok",
  "data": [
    {
      "id": "...",
      "company": "Company Name",
      "position": "...",
      "description": "...",
      "sort_order": 1,
      ...
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Tools Endpoint */}
        <div className="border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm font-mono">GET</span>
            <code className="text-lg font-mono">/api/tools</code>
          </div>
          <p className="text-muted-foreground">
            Fetch all tools/technologies ordered by sort_order.
          </p>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Request Example</h4>
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`curl -X GET ${API_BASE_URL}/api/tools \\
  -H "x-api-key: your_api_key_here"`}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Response Example</h4>
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>
{`{
  "status": "ok",
  "data": [
    {
      "id": "...",
      "name": "Tool Name",
      "category": "...",
      "sort_order": 1,
      ...
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Error Responses */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-heading">Error Responses</h2>
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <code className="text-red-400">401 Unauthorized</code>
            </div>
            <div className="bg-secondary/50 rounded p-3 font-mono text-sm">
              <pre>{`{ "error": "API key required" }
{ "error": "Invalid API key" }
{ "error": "API key is inactive" }
{ "error": "API key expired" }`}</pre>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <code className="text-red-400">429 Too Many Requests</code>
            </div>
            <div className="bg-secondary/50 rounded p-3 font-mono text-sm">
              <pre>{`{ "error": "Rate limit exceeded" }`}</pre>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <code className="text-red-400">500 Internal Server Error</code>
            </div>
            <div className="bg-secondary/50 rounded p-3 font-mono text-sm">
              <pre>{`{ "error": "Internal Server Error" }`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* CORS */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-heading">CORS</h2>
        <p className="text-muted-foreground">
          All endpoints support CORS with the following configuration:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Access-Control-Allow-Origin:</strong> Dynamic based on request origin</li>
          <li><strong>Access-Control-Allow-Methods:</strong> GET, OPTIONS</li>
          <li><strong>Access-Control-Allow-Headers:</strong> Content-Type, x-api-key</li>
        </ul>
      </section>

      {/* Support */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-heading">Support</h2>
        <p className="text-muted-foreground">
          Need help or have questions? Contact me through the{" "}
          <Link href="/contact" className="text-accent hover:underline">
            contact form
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
