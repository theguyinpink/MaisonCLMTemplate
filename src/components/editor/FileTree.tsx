"use client";

type ProjectFile = {
  id: string;
  path: string;
  content: string | null;
  updated_at?: string | null;
};

type FileTreeProps = {
  files: ProjectFile[];
  selectedPath: string;
  onSelect: (path: string) => void;
};

type TreeNode = {
  __type: "folder";
  children: Record<string, TreeNode | string>;
};

function createFolderNode(): TreeNode {
  return {
    __type: "folder",
    children: {},
  };
}

function buildTree(paths: string[]) {
  const root = createFolderNode();

  for (const fullPath of paths) {
    const parts = fullPath.split("/");
    let current = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;

      if (isFile) {
        current.children[part] = fullPath;
      } else {
        if (!current.children[part] || typeof current.children[part] === "string") {
          current.children[part] = createFolderNode();
        }

        current = current.children[part] as TreeNode;
      }
    });
  }

  return root;
}

function getFileIcon(name: string) {
  if (name.endsWith(".html")) return "🌐";
  if (name.endsWith(".css")) return "🎨";
  if (name.endsWith(".js")) return "🟨";
  if (name.endsWith(".ts") || name.endsWith(".tsx")) return "🔷";
  if (name.endsWith(".json")) return "🧩";
  if (name.endsWith(".md")) return "📝";
  return "📄";
}

function sortEntries(entries: [string, TreeNode | string][]) {
  return [...entries].sort((a, b) => {
    const aIsFolder = typeof a[1] !== "string";
    const bIsFolder = typeof b[1] !== "string";

    if (aIsFolder && !bIsFolder) return -1;
    if (!aIsFolder && bIsFolder) return 1;

    return a[0].localeCompare(b[0], "fr");
  });
}

function FileNode({
  name,
  value,
  selectedPath,
  onSelect,
  level = 0,
}: {
  name: string;
  value: TreeNode | string;
  selectedPath: string;
  onSelect: (path: string) => void;
  level?: number;
}) {
  const isFile = typeof value === "string";

  if (isFile) {
    const active = value === selectedPath;

    return (
      <button
        type="button"
        onClick={() => onSelect(value)}
        className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition ${
          active
            ? "bg-[#f8edf2] text-[#b8618e] shadow-sm"
            : "text-slate-600 hover:bg-[#fcf6f9]"
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        <span className="text-base">{getFileIcon(name)}</span>
        <span className="truncate font-medium">{name}</span>
      </button>
    );
  }

  const folder = value as TreeNode;
  const entries = sortEntries(Object.entries(folder.children));

  return (
    <div className="space-y-1">
      <div
        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        <span>📁</span>
        <span className="truncate">{name}</span>
      </div>

      <div className="space-y-1">
        {entries.map(([childName, childValue]) => (
          <FileNode
            key={`${name}/${childName}`}
            name={childName}
            value={childValue}
            selectedPath={selectedPath}
            onSelect={onSelect}
            level={level + 1}
          />
        ))}
      </div>
    </div>
  );
}

export default function FileTree({
  files,
  selectedPath,
  onSelect,
}: FileTreeProps) {
  const paths = files.map((file) => file.path);
  const tree = buildTree(paths);
  const entries = sortEntries(Object.entries(tree.children));

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-[26px] border border-[#ecdfe5] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
      <div className="border-b border-[#f0e5eb] px-5 py-4">
        <h2
          className="text-2xl text-slate-900"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          Explorateur
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {files.length} fichier{files.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3">
        <div className="space-y-1.5">
          {entries.length > 0 ? (
            entries.map(([name, value]) => (
              <FileNode
                key={name}
                name={name}
                value={value}
                selectedPath={selectedPath}
                onSelect={onSelect}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-[#f0e6eb] bg-[#fcfafb] p-4 text-sm text-slate-500">
              Aucun fichier disponible.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}