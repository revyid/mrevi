-- Ensure unique names for upsert
ALTER TABLE tools ADD CONSTRAINT tools_name_key UNIQUE (name);

INSERT INTO tools (name, category, href, icon, sort_order) VALUES
  ('React',          'Frontend',         'https://react.dev/',                'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', 7),
  ('Next.js',        'Frontend',         'https://nextjs.org/',               'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg', 8),
  ('Tailwind CSS',   'Frontend',         'https://tailwindcss.com/',          'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg', 9),
  ('Node.js',        'Backend',          'https://nodejs.org/',               'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', 10),
  ('Express.js',     'Backend',          'https://expressjs.com/',            'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg', 11),
  ('PostgreSQL',     'Database',         'https://www.postgresql.org/',       'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', 12),
  ('MySQL',          'Database',         'https://www.mysql.com/',            'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original-wordmark.svg', 13),
  ('MongoDB',        'Database',         'https://www.mongodb.com/',          'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', 14),
  ('Prisma',         'ORM',              'https://www.prisma.io/',            'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg', 15),
  ('Docker',         'Deployment',       'https://www.docker.com/',           'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', 16),
  ('Vercel',         'Deployment',       'https://vercel.com/',               'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original-wordmark.svg', 17),
  ('Git',            'Version Control',  'https://git-scm.com/',              'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', 18),
  ('GitHub',         'Version Control',  'https://github.com/',               'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', 19)
ON CONFLICT (name) DO UPDATE SET
  category    = EXCLUDED.category,
  href        = EXCLUDED.href,
  icon        = EXCLUDED.icon,
  sort_order  = EXCLUDED.sort_order;
