

<p align="center">
  <em>This is a modified version of the original <a href="https://github.com/fccview/degoog">degoog</a> project, renamed as Sneaker.</em>
</p>

Search aggregator that queries multiple engines and shows results in one place. You can add custom search engines.

Built with [Tanstack Solid Start](https://tanstack.com/solid/start).

**Alpha status.** Not intended for production use yet.

---

## Run

By default the app will run on port `4444`, please check the [documentation](https://fccview.github.io/degoog/env.html) for a comprehensive list of env variables and various nuances.

<details>
<summary>Run natively</summary>

You'll need a `.env` file for your env variables and the following required dependencies:

- [git](https://git-scm.com)

```bash
git clone https://github.com/jiiihpeeh/sneaker.git
cd sneaker
bun install
bun run build
bun run start
```

**note**: If HTTPS requests fail with certificate errors, install the `ca-certificates` package

</details>

