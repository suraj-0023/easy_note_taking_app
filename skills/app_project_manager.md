---
name: App Project Manager Documentation Skill
description: Formally tracks project progress, maintains the evolution log, and updates a comprehensive project summary for long-term documentation.
---

# App Project Manager Documentation Skill

This skill ensures that the project's development is recorded in both a chronological "Evolution Log" and a high-level "Comprehensive Project Summary".

## Core Responsibilities

1.  **Maintain `evolution.md`**: After every major task or iteration, update the `evolution.md` file at the root of the project with the specific changes made and their immediate rationale.
2.  **Update `comprehensive_project_summary.md`**: Maintain a living documentation file that summarizes the project's current state, overall architecture, key features, and development history. This file should be easy to refer to for understanding how the project has developed over time.
3.  **Document Rationale**: For every change, document:
    *   **What changed**: Technical and UI/UX modifications.
    *   **Why it changed**: The user's request or the problem being solved.
    *   **Expected Impact**: The functional or aesthetic goal.
4.  **Chat History Research**: Before asking the user for rationale or intent, research the conversation history and previous summaries.
5.  **User Inquiry**: Proactively ask the user for clarification if the rationale or expected impact is missing from the record.

## Documentation Formats

### `evolution.md`
Reverse-chronological log of changes.

### `comprehensive_project_summary.md`
A structured document containing:
- **Project Overview**: What the app is and its core purpose.
- **Current Architecture**: Files, technologies (HTML/CSS/JS/localStorage), and data structures.
- **Key Features**: List of functional components (Sidebar, Search, Quiz, etc.).
- **Development History**: Summary of major milestones (derived from `evolution.md`).
- **Future Roadmap**: Potential enhancements (derived from `ideas.md` or chat).
