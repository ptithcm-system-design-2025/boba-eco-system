## Brief overview
- This Kilo rule enforces the use of pnpm as the package manager for the repository
- It ensures consistent dependency installation, lockfile handling, and determinism in builds and CI/CD

## Scope
- Applies to all Node.js based projects in the repository
- Does not enforce pnpm on developers' machines outside this repo
- CI/CD pipelines must use pnpm for install and related commands

## Enforced practices
- Always use pnpm install or pnpm i to install dependencies
- Use pnpm add and pnpm remove to modify packages
- Commit the pnpm-lock.yaml file and avoid committing package-lock.json
- Do not keep or commit npm's package-lock.json; remove if present

## Versioning and engines
- Use Node.js LTS versions compatible with the project
- CI should verify Node and pnpm versions align with project configuration (e.g., engines field and CI image)

## Enforcement and checks
- Pre-commit hooks or CI scripts should verify presence of pnpm-lock.yaml and absence of package-lock.json
- If package-lock.json is detected, raise an error with guidance to switch to pnpm
- Ensure pnpm is available in CI environments

## Examples
- pnpm install
- pnpm i
- pnpm add <package>
- pnpm remove <package>
- pnpm run build

## Trigger cases
- When developers run npm install or npm i, warn and suggest using pnpm equivalents