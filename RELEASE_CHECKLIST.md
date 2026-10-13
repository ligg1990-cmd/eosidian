# Release checklist ? EOS Workspace MVP

## Before creating the public GitHub release
- [ ] Choose and add an open-source license (the maintainer must choose; MIT is a common permissive option).
- [ ] Install this folder into a fresh test vault and verify: enable plugin, open dashboard, create app, restart Obsidian, reopen app, install templates twice (second run must preserve files), disable/re-enable plugin, uninstall plugin (vault data must remain).
- [ ] Test on the platforms you intend to claim as supported. Do not mark mobile or any desktop OS verified before testing it.
- [ ] Replace/check author and contact details in `manifest.json` and README.
- [ ] Create a GitHub repository containing `main.js`, `manifest.json`, `styles.css`, and documentation at the repository root.
- [ ] Create a GitHub Release whose tag matches `manifest.json` version (for example `0.1.0`), with those three plugin files attached at the release root.
- [ ] Submit the GitHub repository to the Obsidian community plugin directory using its current submission instructions.

## Scope warning
This is a small, free, local-first starter MVP?not the full legacy EOS plugin. It intentionally contains no login, subscription enforcement, network service, Python runtime, or Claudian-specific agents. Do not advertise those features as included.
