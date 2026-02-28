# Context

@README.md

- Before using any library or framework, look up its documentation with Context7 MCP.
- For LangChain/LangGraph, use Context7 to look up documentation at (`/langchain`).
- When working with UI components, use Context7 to look up Designsystemet documentation (`/digdir/designsystemet`).

# General requirements

- Use SRP, DRY, KISS and YAGNI.
- Prefer pure functions where practical.
- Avoid excessive comments. Use descriptive function names instead.
- Prefer simple and readable code over performance.
- Prefer long and descriptive variable names to short and concise ones.
- Don't use magic numbers or strings. Assign them to a constant or variable instead.
- Prefer to use Digdir Designsystemet components over native html tags. E.g <h1> -> <Heading>, <p> -> <Paragraph>.
- Use Designsystemet CSS tokens for colors, sizes, border-radius, and shadows.
- Every React component should be in its own folder.
- Follow good accessibility patterns (built-in with Designsystemet).
- Test happy paths, error cases and important edge cases using Vitest.
- After writing code, double check that it follows the requirements.
