import { useRef, useState } from "react";
import {
  createProfile,
  exportProgressJSON,
  getActiveProfileId,
  importProgressJSON,
  listProfiles,
  setActiveProfileId,
} from "../lib/storage";

export function ProfileSwitcher() {
  const [profiles, setProfiles] = useState(() => listProfiles());
  const [activeId, setActiveId] = useState(() => getActiveProfileId());
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSwitch(id: string) {
    setActiveProfileId(id);
    setActiveId(id);
    window.location.reload();
  }

  function handleNewProfile() {
    const name = window.prompt("Name for the new profile?");
    if (!name) return;
    const profile = createProfile(name);
    setProfiles(listProfiles());
    setActiveId(profile.id);
    window.location.reload();
  }

  function handleExport() {
    const json = exportProgressJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gre-quant-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importProgressJSON(String(reader.result));
        window.location.reload();
      } catch {
        window.alert("That file doesn't look like a valid progress export.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <div className="profile-switcher">
      <select value={activeId} onChange={(e) => handleSwitch(e.target.value)}>
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <button type="button" onClick={handleNewProfile} title="New profile">
        +
      </button>
      <button type="button" onClick={handleExport} title="Export progress">
        Export
      </button>
      <button type="button" onClick={handleImportClick} title="Import progress">
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}
