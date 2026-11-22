# Writing a blog post

A post is one Markdown file in `src/content/blog/`. The filename is the URL:
`jobify-scraper-engine.md` → `/blog/jobify-scraper-engine/`. Use lowercase
words joined by dashes. Files whose name starts with `_` are ignored, so
`_ideas.md` is a safe place for notes.

The quickest way to write one: jot rough notes, give them to your local AI with
the [prompt below](#prompt-for-your-local-ai), save what it returns as
`src/content/blog/<slug>.md`, then run `npm run dev` and open `/blog/<slug>/`.

## Pick a template

There are two shapes. Both are suggestions: any `##` sections and `###`
subsections work, so change the headings to fit what you're writing.

- **A topic post** explains a CS idea: an algorithm, a data structure, how
  something works under the hood, a concept you finally understood. It doesn't
  need a project or a repo.
- **A project post** walks through something you built: the problem, the
  decisions and what they cost. It can link to the project's card.

In both, the part between the `---` lines is the post's details. Everything
below it is the post itself.

### Topic post

````markdown
---
title: How consistent hashing keeps caches from reshuffling
description: One sentence, used in the post list, the RSS feed and link previews.
date: 2026-11-22
tags: [distributed-systems, algorithms]
draft: false
---

## Intro

Two or three sentences: what this post explains and why it's worth knowing.
Say what the reader will understand by the end.

## The problem it solves

What goes wrong without it, in plain words. A small example helps.

## How it works

The idea in one paragraph, then the details.

### <First piece of the idea>

Explain one part at a time. Add a code block or a diagram if it helps.

### <Second piece>

Same again.

## An example

Walk through it once with real values, or show a short program.

## Where it shows up

- Real systems, libraries or problems that use it.

## Gotchas

- Mistakes people make, or limits of the idea.

## Conclusion

Two or three sentences: the one idea you want the reader to leave with.
````

### Project post

````markdown
---
title: How I think about Jobify's scraper engine
description: One sentence, used in the post list, the RSS feed and link previews.
date: 2026-11-09
tags: [node, architecture]
project: Jobify      # GitHub repo name; delete this line if you'd rather not link the project
draft: false
---

## Intro

Two or three sentences: what this post is about and why it was interesting.
Say what the reader will get out of it.

## The problem

What was hard, in plain words. This is the "what".

### The constraints I had

- Limits you had to work inside: hosting, time, money, team size.

### What "done" meant

How you knew it worked. A number helps: "every company refreshed nightly in
under 3 minutes".

## How I approached it

One short paragraph that sets up the decisions below. This is the "how".

### Scrapers as config, not code

What you did, in a paragraph or two. Add a code block or a diagram if it helps.

- **Why:** the reason you chose it.
- **Trade-off:** what it cost you.

### A worker pool instead of a loop

Same shape: what, then **Why:** and **Trade-off:**.

## What I'd do differently

- Things you learned or would change next time.

## Conclusion

Two or three sentences: the one idea you want the reader to leave with.
````

## The details block

| Field | Required | What it does |
|---|---|---|
| `title` | yes | The post's heading and browser tab title. |
| `description` | yes | One sentence, at most 200 characters. Shown in the post list, RSS and link previews. |
| `date` | yes | Publish date, `YYYY-MM-DD`. Posts are listed newest first. |
| `updated` | no | Date of a meaningful edit, `YYYY-MM-DD`. |
| `tags` | no | Lowercase words joined by dashes: `[rust, system-design]`. Each tag gets its own page. |
| `project` | no | Only for a post about one of your projects. Leave it out for topic posts and anything else. It's the project's GitHub repo name, exactly as in `src/data/projects.json`: for example `Talent-Radar` or `SentinelFlow`, not the display name. Links the post and the project card to each other, and labels the post "Project Notes" instead of "Notes". |
| `draft` | no | `true` shows the post in `npm run dev` only. Defaults to `false`. |

If a field is wrong, `npm run dev` and `npm run build` stop and name the file
and the field.

## Things you can use in a post

**Headings.** Use `##` for sections and `###` for subsections. Don't use a
single `#`: the title already is the page's main heading. Sections and
subsections become the post's table of contents.

**Callouts.** A quote that starts with a marker becomes a boxed note:

```markdown
> [!NOTE]
> Shown as [INFO]. Background the reader might want.

> [!TIP]
> Shown as [TIP]. A shortcut or suggestion.

> [!WARN]
> Shown as [WARN]. A pitfall or a cost.

> [!OK]
> Shown as [ OK ]. Something that worked well.
```

A quote without a marker stays a normal quote.

**Why / trade-off boxes.** A bullet list where *every* item starts with a bold
label ending in a colon is shown as a labelled box, like the decisions in the
template:

```markdown
- **Why:** adding a company means adding a file.
- **Trade-off:** selectors still break when a site redesigns.
```

Any label works (`**Cost:**`, `**Result:**`). If one item has no label, the
list stays a normal bullet list.

**Code.** Put the language after the opening backticks so it's highlighted in
the visitor's theme colours: `js`, `ts`, `python`, `rust`, `json`, `bash`,
`yaml` and so on.

````markdown
```js
const pool = createPool({ size: 4 });
```
````

**Diagrams.** Draw them with text inside a `text` code block. They keep their
spacing and scroll sideways on small screens.

````markdown
```text
configs ──▶ worker pool ──▶ ScraperRun
```
````

**Images.** Put them in `public/blog/<slug>/` and link them from the root,
always with a description of what the image shows:

```markdown
![The scraper status dashboard, with one failed run](/blog/jobify-scraper-engine/dashboard.png)
```

**Links.** `[text](https://example.com)` for other sites, `[text](/projects/)`
for pages on this site.

## Prompt for your local AI

Paste this, then your notes underneath.

```text
Turn my notes below into a blog post for my portfolio site. Follow these rules exactly.

Output only one Markdown file, with nothing before or after it.

Start with this details block, filled in from my notes:
---
title: <a specific title, under 70 characters>
description: <one sentence, under 200 characters, saying what the reader learns>
date: <today's date as YYYY-MM-DD>
tags: [<2 to 4 lowercase tags, words joined by dashes>]
project: <ONLY if the post is about one specific project I built: its GitHub repo name. Otherwise delete this line.>
draft: true
---

Then pick ONE structure.

If the post explains a CS topic, idea or technique (not one of my projects), use:
## Intro                     (2-3 sentences: what this explains and why it's worth knowing)
## The problem it solves     (what goes wrong without it)
## How it works              (the idea in one paragraph)
### <one ### per part of the idea>
## An example                (real values or a short program)
## Where it shows up         (a bullet list)
## Gotchas                   (a bullet list)
## Conclusion                (2-3 sentences)

If the post is about something I built, use:
## Intro                     (2-3 sentences: what this is about and why it was interesting)
## The problem               (what was hard)
### The constraints I had    (a bullet list)
### What "done" meant        (how I knew it worked)
## How I approached it       (one short paragraph)
### <one ### per decision>   (what I did, then two bullets: "- **Why:** ..." and "- **Trade-off:** ...")
## What I'd do differently   (a bullet list)
## Conclusion                (2-3 sentences)

If neither fits my notes, keep the Intro and Conclusion and choose clear ## sections in between.

Rules:
- Never use a single # heading.
- Write in first person, in plain, direct sentences. Keep my own wording where it's clear.
- Do not invent numbers, results, names, facts or features that aren't in my notes. If something is missing or you're unsure it's correct, write TODO in its place.
- Code blocks must name their language after the backticks (js, ts, python, rust, c, cpp, java, go, json, bash, yaml). Use `text` for diagrams.
- For a warning, tip, note or success, use a callout: a line "> [!WARN]", "> [!TIP]", "> [!NOTE]" or "> [!OK]", then the text on the next line starting with "> ".
- No emoji, no HTML.

My notes:
```

The prompt sets `draft: true`. Check the post in `npm run dev`, fix any TODOs,
then change it to `draft: false` to publish.
