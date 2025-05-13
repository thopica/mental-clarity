import { useState, useEffect } from "react";
import {
  PencilSquareIcon,
  BookOpenIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { analyzeEntry } from "./openAiClient";
import { supabase } from "./supabaseClient";

const tabs = [
  { name: "Erfassen", icon: PencilSquareIcon },
  { name: "Einträge", icon: BookOpenIcon },
  { name: "Analysen", icon: ChartBarIcon },
  { name: "Einstellungen", icon: Cog6ToothIcon },
];

export default function AppShell() {
  const [activeTab, setActiveTab] = useState("Erfassen");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showFullText, setShowFullText] = useState(false);
  const [text, setText] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Fehler beim Laden:", error);
    } else {
      setEntries(data);
    }
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setStatusMessage("Analyse läuft...");

    try {
      const analysis = await analyzeEntry(text);
      const { error } = await supabase
        .from("entries")
        .insert([{ content: text, analysis }]);
      if (error) throw error;

      setText("");
      setStatusMessage("Analyse abgeschlossen ✅");
      fetchEntries();
    } catch (error) {
      console.error("Fehler bei der Analyse oder Speicherung:", error);
      setStatusMessage("Analyse fehlgeschlagen ❌");
    } finally {
      setLoading(false);
    }
  };

  const getShortenedText = (text) => {
    const lines = text.split("\n");
    const result = [];
    let lineCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      result.push(line);
      lineCount++;
      if (lineCount >= 3) break;
    }

    return result.join("\n");
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      <div className="hidden md:flex md:flex-col md:w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-6 text-2xl font-bold">Mental Clarity</div>
        <nav className="flex-1 p-2 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-gray-700 transition ${
                activeTab === tab.name ? "bg-gray-700" : ""
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="md:hidden p-4 text-center font-semibold text-xl">
          {activeTab}
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === "Erfassen" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Gedanken erfassen</h2>
              <textarea
                className="w-full h-40 p-4 text-lg text-white bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Deine Gedanken hier eingeben..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              ></textarea>
              <div className="mt-4 flex gap-4">
                <button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg">
                  🎙️ Spracheingabe
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Analysiere..." : "💾 Speichern & analysieren"}
                </button>
              </div>
              {statusMessage && (
                <p className="mt-4 text-sm text-gray-300">{statusMessage}</p>
              )}
            </div>
          )}

          {activeTab === "Einträge" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Vergangene Einträge</h2>
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => {
                      setSelectedEntry(entry);
                      setShowFullText(false);
                    }}
                    className="cursor-pointer bg-gray-800 border border-gray-700 p-4 rounded-lg hover:bg-gray-700"
                  >
                    <p className="text-white line-clamp-2">{entry.content}</p>
                    <p className="text-sm text-gray-400 mt-1">Analyse anzeigen</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Analysen" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Deine Entwicklung</h2>
              <p className="text-gray-400">
                Hier kannst du bald deine Stimmung, Themen und Fortschritte
                visualisieren. (Geplant)
              </p>
            </div>
          )}

          {activeTab === "Einstellungen" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Einstellungen</h2>
              <p className="text-gray-400">
                Später kannst du hier API-Verbrauch, Sprache, etc. anpassen.
                (Noch nicht aktiv)
              </p>
            </div>
          )}
        </main>

        {selectedEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-xl w-full h-[90vh] overflow-y-auto relative">
              <button
                className="absolute top-4 left-4 text-gray-400 hover:text-white"
                onClick={() => setSelectedEntry(null)}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <div className="mt-8">
                <p className="text-sm text-gray-300 font-semibold">
                  {new Date(selectedEntry.created_at).toLocaleString("de-DE")}
                </p>
              </div>
              <div className="transition-all duration-300 ease-in-out">
                <p className="text-white whitespace-pre-wrap break-words mb-1">
                  {showFullText
                    ? selectedEntry.content
                    : getShortenedText(selectedEntry.content)}
                </p>
              </div>
              {showFullText ? (
                <button
                  onClick={() => setShowFullText(false)}
                  className="text-sm text-blue-400 hover:text-blue-300 underline mb-6"
                >
                  Weniger anzeigen
                </button>
              ) : (
                <button
                  onClick={() => setShowFullText(true)}
                  className="text-sm text-red-400 hover:text-blue-300 underline mb-6"
                >
                  Mehr anzeigen
                </button>
              )}
              <h4 className="text-lg font-semibold mb-2">Analyse</h4>
              <p className="text-blue-300 whitespace-pre-wrap break-words">
                {selectedEntry.analysis}
              </p>
            </div>
          </div>
        )}

        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around py-2 z-50">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex flex-col items-center text-xs ${
                activeTab === tab.name ? "text-pink-400" : "text-gray-400"
              }`}
            >
              <tab.icon className="w-6 h-6 mb-1" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
