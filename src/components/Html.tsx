import { html } from 'hono/html';
import { jsxRenderer } from 'hono/jsx-renderer';

export default jsxRenderer(
	({ children }) => {
		return (
			<html lang="en">
				<head>
					<title>teeemofey</title>
					<link rel="stylesheet" href="/css" />
					<link
						rel="stylesheet"
						href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css"
					/>
					<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
					<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js"></script>
				</head>

				<body class="prose">
					{children}
					{html`<script>hljs.highlightAll();</script>`}
				</body>
			</html>
		);
	},
	{ docType: '<!DOCTYPE html>' },
);
