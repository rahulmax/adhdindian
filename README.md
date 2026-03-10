# ADHD Indian

A community-curated directory of ADHD-friendly psychiatrists and psychologists across India. Find doctors who understand ADHD, prescribe stimulants, do proper diagnoses, and accept prior evaluations.

**Live:** [adhdindian.com](https://adhdindian.com)

## What's in here

- **170 doctors** across **37 cities** in India
- Filter by city, doctor type, consultation mode, stimulant prescriptions, adult ADHD specialists, and more
- Community reviews with sentiment analysis
- Locality-level location data (e.g., "Koramangala, Bangalore" not just "Bangalore")
- Setup wizard to personalize your search on first visit
- Auto-syncs new submissions from the community Google Form every 3 days

## Community

- [Discord](https://discord.gg/adhdindia) — join the ADHD India community
- [Reddit](https://www.reddit.com/r/adhdindia/) — r/adhdindia
- [Contribute a doctor](https://forms.gle/b1VCBMtnddWUMFM87) — know a good ADHD doctor? Add them

## Contributing

PRs welcome. The doctor data lives in `src/data/doctors.json`. If you want to add or fix a doctor entry, edit that file directly.

New submissions from the [Google Form](https://forms.gle/b1VCBMtnddWUMFM87) are automatically picked up by a sync script that runs every 3 days via GitHub Actions. It only appends new entries — never overwrites curated data.

To run the sync manually:

```bash
node scripts/sync-sheet.mjs
```

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech

- [Next.js](https://nextjs.org) (App Router)
- Tailwind CSS
- Single-page app, statically generated
- Deployed on [Vercel](https://vercel.com)

## License

MIT

---

Built by [rahulmax](https://rahulmax.com)
