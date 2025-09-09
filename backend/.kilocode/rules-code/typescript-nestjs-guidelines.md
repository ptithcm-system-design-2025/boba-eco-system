## Brief overview
- This rule set applies to **code mode** in a TypeScript project using the **NestJS framework**.
- Goal: ensure clean code, adherence to design patterns, maintainability, and scalability.

## Communication style
- Use English for all code, documentation, variable names, function names, and class names.
- Responses are terse and direct.
- Never start a response with flattery or adjectives like "good", "great", "excellent", etc.
- Do not apologize for failures.
- Always respond directly without unnecessary commentary.

## Development workflow
- Use of tools is absolutely required. A full list of available tools has been provided and must be used frequently.
- `brave_web_search`: For general queries, news, articles, and broad information gathering, especially for recent events or diverse web sources. Use this for initial research on technologies, concepts, or external dependencies.
- `get-library-docs`: To fetch up-to-date documentation for any relevant libraries or frameworks. You MUST use this tool before changing implementations.
- `find_implementations`, `find_usages`, `get_call_hierarchy`, `get_type_hierarchy`, `get_type_definition`, `get_workspace_symbols`: These tools are paramount for understanding the codebase structure, function calls, type definitions, and overall relationships within the project. Use them extensively to map out the current architecture.

## Coding best practices
- Declare types for all variables, parameters, and return values.
- Avoid using `any`, create necessary types/interfaces.
- Use **JSDoc** for public classes and methods.
- DO NOT use inline comments, use JSDoc instead.
- One export per file.
- No blank lines inside functions.
- Naming conventions:
  - Classes: PascalCase
  - Variables, functions, methods: camelCase
  - Files and directories: kebab-case
  - Environment variables: UPPERCASE
- Boolean variables should start with `is`, `has`, `can`.
- Avoid magic numbers, define constants.
- Functions:
  - Short, single-purpose, less than 20 statements.
  - Use arrow functions for simple functions (< 3 statements).
  - Use named functions for non-trivial logic.
  - Use default parameter values instead of null/undefined checks.
  - Reduce parameters with objects (RO-RO).
  - Maintain a single level of abstraction.
- Data:
  - Prefer immutability.
  - Use `readonly` and `as const` where applicable.
  - Encapsulate data in composite types instead of abusing primitives.

## Project context (NestJS specific)
- Modular architecture:
  - One module per main domain/route.
  - One controller per main route, additional controllers for secondary routes.
  - DTOs validated with `class-validator` for inputs.
  - Simple types for outputs.
  - One service per entity, containing business logic and persistence.
- Core module:
  - Global filters, middlewares, guards, interceptors.
- Shared module:
  - Utilities and shared business logic.
- Follow SOLID principles, prefer composition over inheritance.
- Classes should be small:
  - Less than 200 statements.
  - Less than 10 public methods.
  - Less than 10 properties.

## Testing
- Use Jest framework.
- Unit tests for each public function.
- Tests for each controller and service.
- End-to-end tests for each API module.
- Follow Arrange-Act-Assert and Given-When-Then conventions.
- Clear test variable naming: inputX, mockX, actualX, expectedX.
- Add an `admin/test` method in each controller as a smoke test.

## Other guidelines
- Use exceptions for unexpected errors, handled by a global handler.
- Catch exceptions only to fix expected issues or add context.
- Avoid data validation inside functions, use classes with internal validation.