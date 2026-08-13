import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import { studioAPI, eventsAPI, getUserIdFromToken , getMediaUrl} from "@/lib/api/client";
import { Download, Zap, Eye, FileText, Check, Copy } from "lucide-react";

export const Route = createFileRoute("/dashboard/brand")({
  head: () => ({ meta: [{ title: "Brand Kit — DearMemory" }] }),
  component: Brand,
});

const FONT_OPTIONS = [
  { name: "Plus Jakarta Sans", value: "plus-jakarta" },
  { name: "Inter", value: "inter" },
  { name: "Instrument Serif", value: "instrument-serif" },
  { name: "Playfair Display", value: "playfair" },
];

const TEMPLATE_PREVIEWS = [
  { name: "Gallery", icon: "🖼️", description: "Photo gallery layout" },
  { name: "Album", icon: "📚", description: "Album collection view" },
  { name: "Event Page", icon: "📅", description: "Event details page" },
  { name: "Timeline", icon: "⏱️", description: "Chronological layout" },
];

function Brand() {
  const [studio, setStudio] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [applyingBrand, setApplyingBrand] = useState(false);
  const [consistencyScore, setConsistencyScore] = useState(0);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [brandVariations, setBrandVariations] = useState<any[]>([]);
  const [showVariationModal, setShowVariationModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studioData = await studioAPI.getMe();
        setStudio(studioData);
        setEditData({
          logo: studioData.logo || null,
          primary_color: studioData.primary_color || "#4a7c6a",
          background_color: studioData.background_color || "#EEEAFE",
          accent_color: studioData.accent_color || "#e1f0f7",
          text_color: studioData.text_color || "#2d2a29",
          heading_font: studioData.heading_font || "plus-jakarta",
          body_font: studioData.body_font || "plus-jakarta",
          watermark_text: studioData.watermark_text || studioData.name || "Studio",
        });

        // Fetch events for consistency check
        const eventsData = await eventsAPI.list();
        setEvents(eventsData || []);

        // Load brand variations if available
        setBrandVariations([
          { name: "Light", primary: "#8ab5a6", dark: false },
          { name: "Dark", primary: "#2d5a4a", dark: true },
        ]);

        // Calculate consistency score
        calculateConsistency(eventsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load brand settings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateConsistency = (eventsList: any[]) => {
    // Simple consistency check: how many events have brand applied
    const withBrand = eventsList.filter((e) => e.cover_image).length;
    const score = eventsList.length > 0 ? Math.round((withBrand / eventsList.length) * 100) : 0;
    setConsistencyScore(score);
  };

  const [logoUploading, setLogoUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show an instant local preview while the real upload is in flight
    const reader = new FileReader();
    reader.onload = () => {
      setEditData((prev: any) => ({ ...prev, logo_preview: reader.result }));
    };
    reader.readAsDataURL(file);

    setLogoUploading(true);
    setActionError(null);
    try {
      const updated = await studioAPI.uploadLogo(file);
      setStudio(updated);
      setEditData((prev: any) => ({ ...prev, logo: updated.logo, logo_preview: null }));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to upload logo");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleColorChange = (colorKey: string, value: string) => {
    setEditData({ ...editData, [colorKey]: value });
  };

  // const handleSave = async () => {
  //   if (!studio) return;

  //   setSaving(true);
  //   try {
  //     const dataToSave = { ...editData };
  //     delete dataToSave.logo_preview;

  //     const updated = await studioAPI.update(dataToSave);
  //     setStudio(updated);
  //     setEditData(updated);
  //     setLogoFile(null);
  //     alert("Brand settings saved successfully!");
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "Failed to save brand settings");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSave = async () => {
    if (!studio) return;

    setSaving(true);
    try {
      const dataToSave = { ...editData };
      delete dataToSave.logo_preview;
      delete dataToSave.logo; // saved separately via the logo upload endpoint

      // Call the correct update endpoint
      const updated = await studioAPI.update(dataToSave);
      setStudio(updated);
      setEditData(updated);
      setLogoFile(null);
      
      // Refresh studio data to confirm save
      const freshData = await studioAPI.getMe();
      setStudio(freshData);
      
      alert("✅ Brand settings saved successfully!");
    } catch (err) {
      alert("❌ " + (err instanceof Error ? err.message : "Failed to save brand settings"));
    } finally {
      setSaving(false);
    }
  };
  
  const downloadBrandGuide = () => {
    // Simple text-based guide (can be replaced with PDF generation)
    const guide = `
BRAND GUIDE
${studio.name}

PRIMARY COLOR
${editData.primary_color}

BACKGROUND COLOR
${editData.background_color}

ACCENT COLOR
${editData.accent_color}

TEXT COLOR
${editData.text_color}

HEADING FONT
${FONT_OPTIONS.find((f) => f.value === editData.heading_font)?.name}

BODY FONT
${FONT_OPTIONS.find((f) => f.value === editData.body_font)?.name}

WATERMARK
${editData.watermark_text}

---
Generated on ${new Date().toLocaleDateString()}
    `.trim();

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(guide)
    );
    element.setAttribute("download", `${studio.name}-brand-guide.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const applyBrandToGalleries = async () => {
    if (events.length === 0) {
      alert("No galleries to apply brand to");
      return;
    }

    setApplyingBrand(true);
    try {
      // Update all events with current brand settings
      for (const event of events) {
        await eventsAPI.update(event.id, {
          ...event,
          primary_color: editData.primary_color,
          brand_applied: true,
        });
      }
      
      alert(`✅ Brand applied to ${events.length} galleries!`);
      calculateConsistency(events);
    } catch (err) {
      alert("❌ Failed to apply brand: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setApplyingBrand(false);
    }
};

  const exportBrandAssets = () => {
    // Simulate exporting brand assets
    const assets = `
Brand: ${studio.name}
Primary: ${editData.primary_color}
Background: ${editData.background_color}
Accent: ${editData.accent_color}
Text: ${editData.text_color}
    `;

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(assets)
    );
    element.setAttribute("download", `${studio.name}-brand-assets.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const saveBrandVariation = (variation: any) => {
    const newVariation = {
      name: prompt("Variation name:"),
      primary: editData.primary_color,
      dark: variation.dark,
    };

    if (newVariation.name) {
      setBrandVariations([...brandVariations, newVariation]);
      alert("Brand variation saved!");
    }
  };

  if (loading) {
    return (
      <AppShell title="Brand Kit" subtitle="Upload once. Applied beautifully across every event.">
        <div className="text-center py-12">Loading brand settings...</div>
      </AppShell>
    );
  }

  if (error || !studio) {
    return (
      <AppShell title="Brand Kit" subtitle="Upload once. Applied beautifully across every event.">
        <div className="text-center py-12 text-red-600">{error || "Studio not found"}</div>
      </AppShell>
    );
  }

  const colors = [
    { label: "Primary", key: "primary_color", value: editData.primary_color },
    { label: "Background", key: "background_color", value: editData.background_color },
    { label: "Accent", key: "accent_color", value: editData.accent_color },
    { label: "Text", key: "text_color", value: editData.text_color },
  ];

  return (
    <AppShell
      title="Brand Kit"
      subtitle="Upload once. Applied beautifully across every event."
      action={
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-deep disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      }
    >
      {actionError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {actionError}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Logo */}
        <div className="bg-white rounded-[2rem] p-6 ring-1 ring-border">
          <div className="font-bold mb-4">Logo</div>
          <div className="aspect-square bg-cream rounded-2xl grid place-items-center relative overflow-hidden mb-4">
            {editData.logo_preview ? (
              <img
                src={editData.logo_preview}
                alt="Logo preview"
                className="w-full h-full object-contain p-4"
              />
            ) : editData.logo ? (
              <img
                src={getMediaUrl(editData.logo)}
                alt="Logo"
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-emerald grid place-items-center text-white font-bold text-2xl">
                {studio.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <label className="w-full bg-white ring-1 ring-border py-2.5 rounded-full text-sm font-semibold cursor-pointer hover:bg-cream block text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={logoUploading}
              className="hidden"
            />
            {logoUploading ? "Uploading..." : "Replace logo"}
          </label>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-[2rem] p-6 ring-1 ring-border">
          <div className="font-bold mb-4">Colors</div>
          <div className="space-y-3">
            {colors.map((c) => (
              <div
                key={c.key}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-cream cursor-pointer"
                onClick={() =>
                  setShowColorPicker(
                    showColorPicker === c.key ? null : c.key
                  )
                }
              >
                <input
                  type="color"
                  value={c.value}
                  onChange={(e) =>
                    handleColorChange(c.key, e.target.value)
                  }
                  className="w-10 h-10 rounded-xl ring-1 ring-border cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{c.label}</div>
                  <div className="font-mono text-xs text-warm-gray">
                    {c.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="bg-white rounded-[2rem] p-6 ring-1 ring-border">
          <div className="font-bold mb-4">Typography</div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-warm-gray mb-2 block">
                Heading Font
              </label>
              <select
                value={editData.heading_font}
                onChange={(e) =>
                  setEditData({ ...editData, heading_font: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-warm-gray mb-2 block">
                Body Font
              </label>
              <select
                value={editData.body_font}
                onChange={(e) =>
                  setEditData({ ...editData, body_font: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Watermark & Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Watermark */}
        <div className="bg-white rounded-[2rem] p-6 ring-1 ring-border">
          <div className="font-bold mb-4">Watermark</div>
          <div
            className="aspect-[16/9] rounded-2xl relative overflow-hidden grid place-items-center mb-4"
            style={{ backgroundColor: editData.background_color }}
          >
            <div className="text-warm-gray text-sm">Watermark preview</div>
            <div
              className="absolute bottom-4 right-4 font-bold opacity-50 text-2xl font-serif italic"
              style={{ color: editData.primary_color }}
            >
              {editData.watermark_text}
            </div>
          </div>
          <input
            type="text"
            value={editData.watermark_text}
            onChange={(e) =>
              setEditData({ ...editData, watermark_text: e.target.value })
            }
            placeholder="Enter watermark text"
            className="w-full px-4 py-2 border border-border rounded-lg text-sm"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-[2rem] p-6 ring-1 ring-border space-y-3">
          <button
            onClick={downloadBrandGuide}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald text-white rounded-lg font-semibold hover:bg-emerald-deep"
          >
            <Download size={18} />
            Download Brand Guide
          </button>

          <button
            onClick={applyBrandToGalleries}
            disabled={applyingBrand}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50"
          >
            <Zap size={18} />
            {applyingBrand ? "Applying..." : "Apply to All Galleries"}
          </button>

          <button
            onClick={() => setShowTemplatePreview(!showTemplatePreview)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-emerald text-emerald rounded-lg font-semibold hover:bg-emerald-light"
          >
            <Eye size={18} />
            Preview Templates
          </button>

          <button
            onClick={exportBrandAssets}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100"
          >
            <FileText size={18} />
            Export Assets
          </button>
        </div>
      </div>

      {/* Template Preview */}
      {showTemplatePreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-2xl">Template Previews</h3>
              <button
                onClick={() => setShowTemplatePreview(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TEMPLATE_PREVIEWS.map((template) => (
                <div
                  key={template.name}
                  className="p-6 rounded-lg text-center border-2 hover:border-emerald transition-all cursor-pointer"
                  style={{ borderColor: editData.primary_color }}
                >
                  <div className="text-5xl mb-4">{template.icon}</div>
                  <div className="font-bold text-lg mb-1">{template.name}</div>
                  <div className="text-sm text-warm-gray">{template.description}</div>
                  <div
                    className="mt-4 h-20 rounded"
                    style={{ backgroundColor: editData.background_color }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Brand Consistency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Consistency Checker */}
        <div className="bg-white rounded-[2rem] p-6 ring-1 ring-border">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold">Brand Consistency</div>
            <div className="text-2xl font-bold text-emerald">{consistencyScore}%</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="h-3 rounded-full bg-emerald transition-all"
              style={{ width: `${consistencyScore}%` }}
            />
          </div>
          <p className="text-sm text-warm-gray">
            {consistencyScore > 80
              ? "Your brand is consistently applied!"
              : consistencyScore > 50
              ? "Some galleries need brand updates"
              : "Consider applying brand to more galleries"}
          </p>
        </div>

        {/* Brand Variations */}
        <div className="bg-white rounded-[2rem] p-6 ring-1 ring-border">
          <div className="font-bold mb-4">Brand Variations</div>
          <div className="space-y-2 mb-4">
            {brandVariations.map((variation, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: variation.primary }}
                  />
                  <span className="text-sm font-semibold">{variation.name}</span>
                </div>
                <button
                  onClick={() => setEditData({ ...editData, primary_color: variation.primary })}
                  className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Use
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowVariationModal(true)}
            className="w-full px-4 py-2 border border-dashed border-emerald text-emerald rounded-lg text-sm font-semibold hover:bg-emerald-light"
          >
            + Save Variation
          </button>
        </div>
      </div>

      {/* Brand Summary */}
      <div className="bg-emerald rounded-[2rem] p-6 text-white">
        <div className="font-bold mb-2">Brand Kit Summary</div>
        <div className="text-xs text-white/70 mb-6">
          {studio.name} · Complete branding system
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
          <div>
            <Check size={18} className="mb-2" />
            <div>Logo configured</div>
          </div>
          <div>
            <Check size={18} className="mb-2" />
            <div>{colors.length} colors set</div>
          </div>
          <div>
            <Check size={18} className="mb-2" />
            <div>Typography selected</div>
          </div>
          <div>
            <Check size={18} className="mb-2" />
            <div>{events.length} galleries</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// import { createFileRoute } from "@tanstack/react-router";
// import { AppShell } from "@/components/app/AppShell";

// export const Route = createFileRoute("/dashboard/brand")({
//   head: () => ({ meta: [{ title: "Brand Kit — DearMemory" }] }),
//   component: Brand,
// });

// function Brand() {
//   return (
//     <AppShell title="Brand Kit" subtitle="Upload once. Applied beautifully across every event.">
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="bg-white rounded-[2rem] p-6 ring-1 ring-border">
//           <div className="font-bold mb-4">Logo</div>
//           <div className="aspect-square bg-cream rounded-2xl grid place-items-center">
//             <div className="w-20 h-20 rounded-full bg-emerald grid place-items-center text-white font-bold text-2xl">G</div>
//           </div>
//           <button className="mt-4 w-full bg-white ring-1 ring-border py-2.5 rounded-full text-sm font-semibold">Replace logo</button>
//         </div>

//         <div className="bg-white rounded-[2rem] p-6 ring-1 ring-border">
//           <div className="font-bold mb-4">Colors</div>
//           <div className="space-y-3">
//             {[
//               { l: "Primary", v: "#4a7c6a" },
//               { l: "Background", v: "#EEEAFE" },
//               { l: "Accent", v: "#e1f0f7" },
//               { l: "Text", v: "#2d2a29" },
//             ].map((c) => (
//               <div key={c.l} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-cream">
//                 <div className="w-10 h-10 rounded-xl ring-1 ring-border" style={{ background: c.v }} />
//                 <div className="flex-1">
//                   <div className="text-sm font-semibold">{c.l}</div>
//                   <div className="font-mono text-xs text-warm-gray">{c.v}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white rounded-[2rem] p-6 ring-1 ring-border">
//           <div className="font-bold mb-4">Typography</div>
//           <div className="space-y-4">
//             <div className="p-4 rounded-2xl bg-cream">
//               <div className="text-2xl font-bold mb-1">Headings</div>
//               <div className="text-xs text-warm-gray font-mono">Plus Jakarta Sans · 700</div>
//             </div>
//             <div className="p-4 rounded-2xl bg-cream">
//               <div className="text-base mb-1">Body text reads beautifully here.</div>
//               <div className="text-xs text-warm-gray font-mono">Plus Jakarta Sans · 400</div>
//             </div>
//             <div className="p-4 rounded-2xl bg-cream">
//               <div className="font-serif italic text-xl mb-1">Quote moments</div>
//               <div className="text-xs text-warm-gray font-mono">Instrument Serif · 400 italic</div>
//             </div>
//           </div>
//         </div>

//         <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 ring-1 ring-border">
//           <div className="font-bold mb-4">Watermark</div>
//           <div className="aspect-[16/9] bg-cream rounded-2xl relative overflow-hidden grid place-items-center">
//             <div className="text-warm-gray text-sm">Watermark preview</div>
//             <div className="absolute bottom-4 right-4 text-emerald font-bold opacity-50 text-2xl font-serif italic">goldenhour</div>
//           </div>
//         </div>

//         <div className="bg-emerald rounded-[2rem] p-6 text-white">
//           <div className="font-bold mb-2">Brand assets</div>
//           <div className="text-xs text-white/70 mb-6">14 files synced</div>
//           <button className="w-full bg-white text-emerald py-3 rounded-full text-sm font-semibold">Manage assets</button>
//         </div>
//       </div>
//     </AppShell>
//   );
// }