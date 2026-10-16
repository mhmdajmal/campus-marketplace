# Group GitHub Collaboration Workflow

The lecturer requires 3–5 group members, meaningful individual GitHub commits, feature branches where appropriate, clear messages, a README, and final working code. **Actual authors must make their own contributions; do not impersonate teammates or fabricate commit history.**

## Step 1 — Group repository

One member forks <https://github.com/webtegy/campus-marketplace> to the group owner's GitHub account. Add the other members as repository collaborators in Settings → Collaborators.

The original checkout keeps its history. After adding the assignment files, set remotes (run only once):

```powershell
git remote -v
git remote rename origin upstream
git remote add origin https://github.com/YOUR_USERNAME/campus-marketplace.git
git push -u origin master
```

If the repo's default branch is `main`, use your actual branch instead of `master`. Never `git init` or force-push over classmates' work. Keep the upstream remote for reference.

## Step 2 — Assign real work

Possible split for 4 members (adapt to 3 or 5):

| Member | Suggested branch | Real coding work |
| --- | --- | --- |
| A | `feature/listing-validation` | Improve form validation/error messages, test listing edits |
| B | `feature/price-filter` | Test/improve price sorting and price range UX |
| C | `feature/saved-items` | Improve saved empty states and persistent saved sync |
| D | `feature/messaging` | Improve chat usability, error handling, and test message security |

These are suggested tasks, not a claim that any student has completed them. Members should also review each other's pull requests. Do not merely change comments or make cosmetic commits to simulate contribution.

## Step 3 — Individual branch, commits and pull requests

Each teammate clones the **group repository** and works on their own branch:

```powershell
git clone https://github.com/YOUR_USERNAME/campus-marketplace.git
cd campus-marketplace
git checkout -b feature/your-feature-name
# Make and test real code changes.
npm run verify
git add .
git commit -m "feat: improve [your actual feature]"
git push -u origin feature/your-feature-name
```

Open a GitHub pull request and ask another member to review it. Merge after testing. Use clear commit message prefixes such as `feat:`, `fix:`, `test:`, `docs:`. The branch name, commit author and code diff should match genuine team work.

## Step 4 — Final review

```powershell
git checkout master
git pull origin master
npm install
npm run verify
npx expo start -c
```

Review README group table and `docs/TEST-PLAN.md`, then share the GitHub repository URL with the lecturer. The course email additionally requires a video; this package purposely does not produce that video.

## Before committing

- `.env` must remain untracked (`git status --ignored` can help).
- Do not push personal Gmail passwords, Firebase service-account JSON or Firebase admin credentials.
- Review `git status` and `git diff --stat` before committing.
- Do not overwrite teammates' uncommitted changes.
