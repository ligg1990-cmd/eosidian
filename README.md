# EOS Workspace

EOS Workspace is a small, local-first Obsidian workspace starter. This public MVP is intentionally limited to a reliable core while the larger EOS feature set is being separated from its author's vault.

## Features
- Creates an `EOS/` workspace inside the current vault.
- Creates and lists user apps as Markdown files in `EOS/apps/`.
- Installs starter project/task templates in `EOS/templates/` without replacing existing files.
- Stores user-created content in the vault, outside the plugin installation folder, so plugin updates do not overwrite it.
- Uses Obsidian's cross-platform Vault and Workspace APIs. No Python, Node subprocesses, account, network requests, or telemetry are required by this MVP.

## Install
1. Install from Obsidian Community Plugins when the listing is available, or copy `main.js`, `manifest.json`, and `styles.css` into `.obsidian/plugins/eos-workspace/`.
2. Enable **EOS Workspace**.
3. Run **Open EOS Workspace** from the command palette.

## Data and privacy
All workspace notes are stored in the current vault under `EOS/`. The plugin does not send vault content anywhere and does not collect telemetry. Deleting the plugin does not delete `EOS/` or user-created apps.

## Compatibility
The MVP uses Obsidian APIs only and is intended to work with one release package on Windows, macOS, Linux, and mobile. Platform testing is still required before describing any platform as verified. See `PLATFORM_SUPPORT.md`.

## Development
Run `node --check main.js` to check JavaScript syntax. This does not replace testing in a clean Obsidian vault.

## Scope
This MVP is not the full EOS system. Legacy vault-specific knowledge packs, Python scripts, account/subscription features, and Claudian-specific execution are deliberately excluded until they can be bundled or isolated safely.

## License

This project is licensed under the MIT License. See `LICENSE`.
