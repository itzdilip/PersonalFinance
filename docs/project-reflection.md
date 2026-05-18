# Project Reflection: Kubera-Finance Flow

## 1. Major Roadblocks and Hallucinations

During the development of Kubera-Finance Flow, several technical hurdles and AI-specific challenges (hallucinations) were encountered:

### Technical Roadblocks
*   **Google Drive API Complexity**: Integrating the Google Identity Services (GIS) for authentication while managing the `drive.file` scope required careful orchestration. The transition from the legacy `gapi` library to the modern GIS library is a frequent source of friction.
*   **Service Worker Lifecycle**: Ensuring that the Service Worker correctly caches external assets (Google Fonts, FontAwesome, Chart.js) while allowing for seamless app updates (the "Skip Waiting" logic) was a nuanced task.
*   **IndexedDB Asynchronicity**: Managing complex transactions and schema migrations in IndexedDB without a heavy wrapper library required robust error handling and state management in `db.js`.

### Hallucinations
*   **API Obsolescence**: Initial suggestions occasionally drifted toward the deprecated `gapi.auth2` client, which has been replaced by the Google Identity Services. This required manual correction and "pinning" the prompt to modern standards.
*   **CSS "Native" Features**: Hallucinations regarding the support of certain CSS properties in PWA standalone mode (e.g., specific safe-area-inset behaviors on non-iOS platforms) required empirical testing and refinement.
*   **Automatic PWA Installation**: At times, the AI suggested that the "Install" prompt could be triggered programmatically without a user gesture, which is a security restriction in modern browsers.

## 2. Adjustments in Prompting Strategy

To overcome these challenges and ensure a functional, secure product, the prompting strategy evolved:

*   **Architectural Guardrails**: Instead of asking for code immediately, the strategy shifted to requesting a **Technical Design Document** first. This ensured that the AI and the developer were aligned on the tech stack (IndexedDB vs. LocalStorage) and data model.
*   **Contextual Constraints**: Prompts were refined to include specific library versions or "Do Not Use" lists (e.g., "Use ES Modules", "Do not use jQuery", "Use modern Google Identity Services").
*   **Modular Implementation**: Rather than requesting a "complete app" in one go, the project was broken down into functional modules (`db.js`, `ui.js`, `drive.js`). This reduced the likelihood of "context drift" and made debugging surgical.
*   **Verification Cycles**: Each module was followed by a request for a testing strategy or a "dry run" of the logic, forcing the AI to double-check its own implementation for logic flaws.

## 3. Perspective on Digital Product Development

Building Kubera-Finance Flow has reshaped the perspective on rapid prototyping and product development:

*   **The "Architect" Shift**: The role of the developer is rapidly shifting from a "synthesizer of code" to an "architect of intent." The focus is less on syntax and more on system design, security boundaries, and user experience.
*   **Documentation as a First-Class Citizen**: In traditional development, documentation is often an afterthought. In this AI-driven workflow, documentation (README, User Guides, Technical Specs) was generated in parallel with the code, ensuring that the project remains maintainable from day one.
*   **Compression of Time-to-Value**: The ability to go from a conceptual request to a functional, offline-first PWA with cloud sync in a single session is a paradigm shift. It allows for "hot-testing" ideas with near-zero overhead.
*   **Robustness via Iteration**: Rapid prototyping no longer means "messy code." By using AI to generate modular, typed, and documented code, the initial prototype is much closer to a production-ready MVP than ever before.

---
*Generated as part of the Kubera-Finance Flow development cycle.*
