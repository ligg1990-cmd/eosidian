const { ItemView, Modal, Notice, Plugin } = require("obsidian");

const VIEW_TYPE = "eos-workspace-view";
const ROOT = "EOS";
const FOLDERS = ["EOS", "EOS/apps", "EOS/templates", "EOS/data", "EOS/.eos"];
const STARTER_TEMPLATES = {
  "Project.md": `---\ntype: eos-project\nstatus: active\ncreated: {{date}}\n---\n\n# Project\n\n## Outcome\n\n## Next actions\n- [ ] \n\n## Notes\n`,
  "Task.md": `---\ntype: eos-task\nstatus: planned\ncreated: {{date}}\n---\n\n# Task\n\n## Goal\n\n## Steps\n- [ ] \n\n## Result\n`
};

function safeFileName(value) {
  return String(value || "").trim()
    .replace(/[\\/:*?"<>|#^]/g, "-")
    .replace(/[. ]+$/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80) || "New EOS App";
}

class CreateAppModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Create an EOS app" });
    contentEl.createEl("p", { text: "The app is a Markdown file in EOS/apps and will not be overwritten by plugin updates." });
    const input = contentEl.createEl("input", { attr: { type: "text", placeholder: "App name", autofocus: "true" } });
    input.addClass("eos-mvp-name-input");
    const actions = contentEl.createDiv({ cls: "eos-mvp-actions" });
    const cancel = actions.createEl("button", { text: "Cancel" });
    cancel.addEventListener("click", () => this.close());
    const create = actions.createEl("button", { text: "Create app", cls: "mod-cta" });
    const submit = async () => {
      const name = safeFileName(input.value);
      try {
        const file = await this.plugin.createApp(name);
        this.close();
        await this.plugin.openFile(file);
      } catch (error) {
        new Notice(error.message || "Could not create the app.", 8000);
      }
    };
    create.addEventListener("click", submit);
    input.addEventListener("keydown", (event) => { if (event.key === "Enter") submit(); });
    window.setTimeout(() => input.focus(), 0);
  }
}

class EosWorkspaceView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }
  getViewType() { return VIEW_TYPE; }
  getDisplayText() { return "EOS Workspace"; }
  getIcon() { return "layout-dashboard"; }
  async onOpen() { await this.render(); }
  async render() {
    const root = this.contentEl;
    root.empty();
    root.addClass("eos-mvp-view");
    const shell = root.createDiv({ cls: "eos-mvp-shell" });
    const header = shell.createDiv({ cls: "eos-mvp-header" });
    const title = header.createDiv();
    title.createDiv({ cls: "eos-mvp-eyebrow", text: "YOUR LOCAL WORKSPACE" });
    title.createEl("h1", { text: "EOS Workspace" });
    title.createEl("p", { text: "A portable workspace for your notes, projects, and custom apps." });
    const newApp = header.createEl("button", { text: "New app", cls: "mod-cta" });
    newApp.addEventListener("click", () => new CreateAppModal(this.app, this.plugin).open());

    const cards = shell.createDiv({ cls: "eos-mvp-cards" });
    this.renderCard(cards, "Your apps", "Apps you create live in your vault, outside the plugin folder.", "Open apps guide", async () => {
      const file = await this.plugin.ensureWorkspace();
      await this.plugin.openFile(file);
    });
    this.renderCard(cards, "Starter templates", "Copy project and task templates into your local workspace. Existing files are never replaced.", "Install starter templates", async () => {
      const result = await this.plugin.installStarterTemplates();
      new Notice(`Added ${result.created} template(s); kept ${result.kept} existing file(s).`);
      await this.render();
    });

    const list = shell.createDiv({ cls: "eos-mvp-app-list" });
    list.createEl("h2", { text: "Your EOS apps" });
    try {
      await this.plugin.ensureWorkspace();
      const apps = this.app.vault.getMarkdownFiles()
        .filter((file) => file.path.startsWith("EOS/apps/") && file.basename !== "README")
        .sort((a, b) => a.basename.localeCompare(b.basename));
      if (!apps.length) list.createEl("p", { text: "No apps yet. Create one to get started." });
      for (const file of apps) {
        const row = list.createDiv({ cls: "eos-mvp-app-row" });
        const open = row.createEl("button", { text: file.basename, cls: "eos-mvp-app-link" });
        open.addEventListener("click", () => this.plugin.openFile(file));
        row.createSpan({ text: file.path });
      }
    } catch (error) {
      list.createEl("p", { text: `Could not initialize EOS folders: ${error.message || error}` });
    }
    const footer = shell.createDiv({ cls: "eos-mvp-footer" });
    footer.createSpan({ text: "Local-first | No account required | No network requests" });
    footer.createSpan({ text: "Workspace folder: EOS/" });
  }
  renderCard(parent, heading, description, buttonLabel, onClick) {
    const card = parent.createDiv({ cls: "eos-mvp-card" });
    card.createEl("h2", { text: heading });
    card.createEl("p", { text: description });
    const button = card.createEl("button", { text: buttonLabel });
    button.addEventListener("click", () => Promise.resolve(onClick()).catch((error) => new Notice(error.message || "Action failed.", 8000)));
  }
}

module.exports = class EosWorkspacePlugin extends Plugin {
  async onload() {
    this.registerView(VIEW_TYPE, (leaf) => new EosWorkspaceView(leaf, this));
    this.addRibbonIcon("layout-dashboard", "Open EOS Workspace", () => this.openWorkspace());
    this.addCommand({ id: "open-workspace", name: "Open EOS Workspace", callback: () => this.openWorkspace() });
    this.addCommand({ id: "create-app", name: "Create EOS app", callback: () => new CreateAppModal(this.app, this).open() });
    this.addCommand({ id: "install-starter-templates", name: "Install EOS starter templates", callback: async () => {
      const result = await this.installStarterTemplates();
      new Notice(`Added ${result.created} template(s); kept ${result.kept} existing file(s).`);
    } });
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }
  async ensureWorkspace() {
    for (const folder of FOLDERS) {
      if (!this.app.vault.getAbstractFileByPath(folder)) await this.app.vault.createFolder(folder);
    }
    const indexPath = "EOS/apps/README.md";
    let index = this.app.vault.getAbstractFileByPath(indexPath);
    if (!index) {
      index = await this.app.vault.create(indexPath, "# My EOS apps\n\nCreate apps from the EOS Workspace dashboard. App files in this folder are yours and are not overwritten by plugin updates.\n");
    }
    return index;
  }
  async createApp(name) {
    await this.ensureWorkspace();
    const path = `EOS/apps/${safeFileName(name)}.md`;
    if (this.app.vault.getAbstractFileByPath(path)) throw new Error("An app with that name already exists.");
    const content = `---\ntype: eos-app\ncreated: ${new Date().toISOString().slice(0, 10)}\n---\n\n# ${safeFileName(name)}\n\n## Purpose\n\n## Sections\n\n## Next steps\n- [ ] \n`;
    return await this.app.vault.create(path, content);
  }
  async installStarterTemplates() {
    await this.ensureWorkspace();
    let created = 0;
    let kept = 0;
    for (const [name, template] of Object.entries(STARTER_TEMPLATES)) {
      const path = `EOS/templates/${name}`;
      if (this.app.vault.getAbstractFileByPath(path)) { kept += 1; continue; }
      const content = template.replaceAll("{{date}}", new Date().toISOString().slice(0, 10));
      await this.app.vault.create(path, content);
      created += 1;
    }
    return { created, kept };
  }
  async openWorkspace() {
    await this.ensureWorkspace();
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    if (leaves.length) {
      await this.app.workspace.revealLeaf(leaves[0]);
      return leaves[0];
    }
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.setViewState({ type: VIEW_TYPE, active: true });
    await this.app.workspace.revealLeaf(leaf);
    return leaf;
  }
  async openFile(file) {
    await this.app.workspace.getLeaf("tab").openFile(file);
  }
};

