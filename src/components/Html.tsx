import { html } from 'hono/html';
import type { PropsWithChildren } from 'hono/jsx';

type HtmlProps = PropsWithChildren<{
  title?: string;
}>;

export default function({ title = 'teeemofey blog', children }: HtmlProps) {
  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css"
        />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js"></script>
      </head>

      <body>
        {children}
        {html`<script>hljs.highlightAll();</script>`}
      </body>
    </html>
  );
}
