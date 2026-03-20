# Resonance Network Vercel Site V2

This folder is a cleaner static deployment package for GitHub + Vercel.

## Why this version is safer

- asset file names are lowercase and hyphenated
- there are no spaces in deployed asset URLs
- page structure is simpler than the previous pass
- image and font paths are fully local to this folder
- homepage and project page share one stylesheet

## Files

- `index.html` = homepage
- `project.html` = sample project page
- `styles.css` = shared styling
- `assets/` = local logos, fonts, images, and team photos

## Deploy to Vercel

Use this folder as the repo root or upload its contents to a dedicated GitHub repo.

Framework preset:
- `Other`

Build command:
- leave blank

Output directory:
- leave blank

Install command:
- leave blank

## Recommended publishing approach

If the previous deployment was broken, create a fresh GitHub repo with only the contents of this folder, then connect that repo to Vercel.
