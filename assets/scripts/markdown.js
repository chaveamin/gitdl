const md = window
  .markdownit({
    html: true,
    typographer: true,
    breaks: true,
    linkify: true,
  })
  .use(window.markdownitEmoji)
  .enable(["table"]);
