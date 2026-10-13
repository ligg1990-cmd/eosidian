# Platform support

## Intended compatibility
One release package is intended for Windows, macOS, and Linux desktop, plus mobile Obsidian. The MVP uses Obsidian's Vault/Workspace APIs and browser DOM APIs only; it does not invoke Python, Node subprocesses, or operating-system shell commands. `manifest.json` therefore sets `isDesktopOnly` to `false`.

## Test status

| Platform | Clean-vault install | Create app | Install templates | Upgrade/data-preservation | Status |
| --- | --- | --- | --- | --- | --- |
| Windows desktop | Not run | Not run | Not run | Not run | Unverified |
| macOS desktop | Not run | Not run | Not run | Not run | Unverified |
| Linux desktop | Not run | Not run | Not run | Not run | Unverified |
| iOS / Android | Not run | Not run | Not run | Not run | Unverified |

Do not claim platform compatibility as verified until these tests pass.
