-- Insert API Documentation blog post
INSERT INTO blog_posts (
  id,
  title,
  slug,
  excerpt,
  content,
  date,
  read_time,
  sort_order,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'API Documentation',
  'api-docs',
  'Complete API documentation for mrevi-api endpoints including authentication, rate limits, and usage examples for portfolio, projects, blog, journey, and tools endpoints.',
  '<p>For complete API documentation, visit <a href="/blog/api-docs">/blog/api-docs</a></p>',
  '2026-07-28',
  '10 min read',
  0,
  NOW(),
  NOW()
)
ON CONFLICT (slug) 
DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  date = EXCLUDED.date,
  read_time = EXCLUDED.read_time,
  updated_at = NOW();
