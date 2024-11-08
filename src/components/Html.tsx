import { html } from 'hono/html';
import { jsxRenderer } from 'hono/jsx-renderer';

export default jsxRenderer(
	({ children }) => {
		return (
			<html lang="en">
				<head>
					<title>teeemofey</title>
					<link rel="stylesheet" href="/css" />
				</head>

				<body class="prose">{children}</body>
			</html>
		);
	},
	{ docType: '<!DOCTYPE html>' },
);
