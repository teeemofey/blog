import { Hono } from 'hono';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';
import fm from 'front-matter';
import { resolve } from 'node:path';

import { Html } from './components';
import { Glob, serve, $ } from 'bun';
import { raw } from 'hono/html';
import sanitize from 'sanitize-html';
import { jsxRenderer } from 'hono/jsx-renderer';

const md = markdownit({
	highlight: function (str, lang) {
		console.log(lang, 'hello', new Date().toISOString());
		if (lang && hljs.getLanguage(lang)) {
			try {
				const highlighted = hljs.highlight(str, {
					language: lang,
					ignoreIllegals: true,
				}).value;
				// Return highlighted code wrapped in a special token
				return `<pre class="hljs"><code>${highlighted}</code></pre>`;
			} catch (e) {
				console.log(e);
			}
		}
		return ''; // use external default escaping
	},
	html: true, // Enable HTML tags in source
	breaks: true, // Convert '\n' in paragraphs into <br>
});

type PostFrontMatter = {
	title: string;
	author: string;
	date: string;
	lastmod: string;
	slug: string;
};

type Post = { body: string; html: string } & PostFrontMatter;
type Posts = Record<string, Post>;

async function getPosts(): Promise<Posts> {
	const glob = new Glob('*.md');
	const postsPath = resolve('posts');

	const posts: Posts = {};

	for await (const filePath of glob.scan(postsPath)) {
		const path = resolve(postsPath, filePath);

		const file = Bun.file(path);
		const text = await file.text();

		const { attributes, body } = fm<PostFrontMatter>(text);
		posts[attributes.slug] = {
			...attributes,
			body: body,
			html: md.render(body),
		};
	}

	return posts;
}

const posts = await getPosts();

const app = new Hono();

function PostsList({ posts }: { posts: PostFrontMatter[] }) {
	return (
		<div>
			{posts.map((post) => (
				<div>
					<a href={`/post/${post.slug}`}>{post.title}</a>
				</div>
			))}
		</div>
	);
}

app.get('/*', Html);

app.get('/', (c) => {
	jsxRenderer();

	return c.render(<PostsList posts={Object.values(posts)} />);
});

app.get('/post/:slug', (c) => {
	const slug = c.req.param('slug') || '';
	const post = posts[slug];

	if (!post) return c.html('Not found');

	const sanitized = sanitize(post.html);

	return c.render(raw(sanitized));
});

app.get('/css', async (c) => {
	const css = await $`bunx tailwindcss -i ./src/index.css`.quiet();

	c.header('Content-Type', 'text/css');
	return c.body(css.text());
});

serve({ fetch: app.fetch, port: 6969 });
