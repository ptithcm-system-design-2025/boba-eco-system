## Brief overview
- This rule applies to the entire project, enforcing the usage of `pnpm` as the official Node.js package manager instead of `npm` or `yarn`.

## Communication style
- Dependency and package manager guidelines should be documented briefly and clearly.
- Do not reopen the choice discussion, always default to `pnpm`.

## Development workflow
- When installing dependencies, always run: `pnpm install`.
- To add a new package, use: `pnpm add <package>`.
- To remove a package, use: `pnpm remove <package>`.
- In a multi-package (monorepo) setup, make sure the `pnpm-workspace.yaml` file is properly updated.

## Coding best practices
- Do not commit `package-lock.json` or `yarn.lock`, only keep `pnpm-lock.yaml`.
- Ensure `pnpm-lock.yaml` is in sync with `package.json` before committing.
- Use `pnpm run <script>` instead of `npm run <script>`.

## Project context
- This project follows a monorepo structure (frontend/manager, frontend/pos, backend).
- All submodules must consistently use `pnpm`.
- If `package-lock.json` or `yarn.lock` files exist in the repository, they should be removed to avoid conflicts.

## Other guidelines
- When onboarding new team members, instruct them to install `pnpm` globally: `npm install -g pnpm`.
- CI/CD pipelines must be configured to run `pnpm install --frozen-lockfile` to guarantee reproducible environments.