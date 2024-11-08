import { Hono } from 'hono';
import fm from 'front-matter';
import { resolve } from 'node:path';

import { Html } from './components';
import { Glob, serve, $ } from 'bun';
import { consola } from 'consola';

import Shiki from '@shikijs/markdown-it';
import MarkdownIt from 'markdown-it';

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

	const md = MarkdownIt();

	md.use(
		await Shiki({
			themes: {
				light: 'vitesse-light',
				dark: 'vitesse-dark',
			},
		}),
	);

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

app.use('*', Html);

app.get('/', (c) => {
	return c.render(<PostsList posts={Object.values(posts)} />);
});

app.get('/post/:slug', (c) => {
	const slug = c.req.param('slug') || '';
	const post = posts[slug];

	if (!post) return c.html('Not found');

	return c.render(<div dangerouslySetInnerHTML={{ __html: post.html }} />);
});

app.get('/css', async (c) => {
	const css = await $`bunx tailwindcss -i ./src/index.css`.quiet();

	c.header('Content-Type', 'text/css');
	return c.body(css.text());
});

const PORT = 3000;
const HOSTNAME = '0.0.0.0';

serve({ fetch: app.fetch, port: PORT, hostname: HOSTNAME });
consola.info(`started web server on port ${PORT} and host ${HOSTNAME}`);
