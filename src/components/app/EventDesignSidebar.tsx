import { useState } from "react";
import {
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  Info,
  MessageSquare,
  Phone,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type SectionType = "cover" | "gallery" | "info" | "guestbook" | "contact";

export interface DesignSection {
  id: string;
  type: SectionType;
  label: string;
  visible: boolean;
}

export interface GalleryStyle {
  layout: "Grid" | "Masonry" | "Carousel";
  columns: number;
  spacing: number;
  radius: number;
}

export interface CoverStyle {
  height: "Small" | "Medium" | "Large";
  overlay: number;
  titleAlign: "Left" | "Center" | "Right";
}

export interface InfoStyle {
  showDate: boolean;
  showLocation: boolean;
  showDescription: boolean;
  align: "Left" | "Center";
}

export interface GuestbookStyle {
  enabled: boolean;
  requireApproval: boolean;
}

export interface ContactStyle {
  buttonLabel: string;
  method: "Email" | "Phone" | "Form";
}

export interface DesignConfig {
  sections: DesignSection[];
  gallery: GalleryStyle;
  cover: CoverStyle;
  info: InfoStyle;
  guestbook: GuestbookStyle;
  contact: ContactStyle;
}

export const DEFAULT_DESIGN_CONFIG: DesignConfig = {
  sections: [
    { id: "cover", type: "cover", label: "Cover photo", visible: true },
    { id: "gallery", type: "gallery", label: "Photo gallery", visible: true },
    { id: "info", type: "info", label: "Event info", visible: true },
    { id: "guestbook", type: "guestbook", label: "Guestbook", visible: true },
    { id: "contact", type: "contact", label: "Contact / book us", visible: false },
  ],
  gallery: { layout: "Grid", columns: 3, spacing: 4, radius: 12 },
  cover: { height: "Medium", overlay: 30, titleAlign: "Center" },
  info: { showDate: true, showLocation: true, showDescription: true, align: "Left" },
  guestbook: { enabled: true, requireApproval: false },
  contact: { buttonLabel: "Book this studio", method: "Form" },
};

const SECTION_ICONS: Record<SectionType, React.ElementType> = {
  cover: ImageIcon,
  gallery: LayoutGrid,
  info: Info,
  guestbook: MessageSquare,
  contact: Phone,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

export function parseDesignConfig(raw: string | null | undefined): DesignConfig {
  if (!raw) return DEFAULT_DESIGN_CONFIG;
  try {
    const parsed = JSON.parse(raw);
    return {
      sections: parsed.sections?.length ? parsed.sections : DEFAULT_DESIGN_CONFIG.sections,
      gallery: { ...DEFAULT_DESIGN_CONFIG.gallery, ...parsed.gallery },
      cover: { ...DEFAULT_DESIGN_CONFIG.cover, ...parsed.cover },
      info: { ...DEFAULT_DESIGN_CONFIG.info, ...parsed.info },
      guestbook: { ...DEFAULT_DESIGN_CONFIG.guestbook, ...parsed.guestbook },
      contact: { ...DEFAULT_DESIGN_CONFIG.contact, ...parsed.contact },
    };
  } catch {
    return DEFAULT_DESIGN_CONFIG;
  }
}

// ─── Small building blocks ──────────────────────────────────────────────────

function StyleBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-warm-gray mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}

function OptionRow<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: readonly T[];
  value: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onSelect(o)}
          className={`text-[11px] font-semibold py-1.5 rounded-lg transition-colors ${
            value === o ? "bg-emerald text-white" : "bg-cream hover:bg-cream/70"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function SwitchRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between text-[12px] font-medium py-1"
    >
      <span>{label}</span>
      <span
        className={`w-8 h-[18px] rounded-full relative transition-colors shrink-0 ${
          checked ? "bg-emerald" : "bg-cream ring-1 ring-border"
        }`}
      >
        <span
          className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-all ${
            checked ? "left-[16px]" : "left-[2px]"
          }`}
        />
      </span>
    </button>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────

export function EventDesignSidebar({
  config,
  onChange,
  variant = "card",
}: {
  config: DesignConfig;
  onChange: (next: DesignConfig) => void;
  variant?: "card" | "flush";
}) {
  const [expandedId, setExpandedId] = useState<string | null>("gallery");

  const move = (index: number, dir: -1 | 1) => {
    const next = [...config.sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ ...config, sections: next });
  };

  const toggleVisible = (id: string) => {
    onChange({
      ...config,
      sections: config.sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)),
    });
  };

  const updateGallery = (patch: Partial<GalleryStyle>) =>
    onChange({ ...config, gallery: { ...config.gallery, ...patch } });
  const updateCover = (patch: Partial<CoverStyle>) =>
    onChange({ ...config, cover: { ...config.cover, ...patch } });
  const updateInfo = (patch: Partial<InfoStyle>) =>
    onChange({ ...config, info: { ...config.info, ...patch } });
  const updateGuestbook = (patch: Partial<GuestbookStyle>) =>
    onChange({ ...config, guestbook: { ...config.guestbook, ...patch } });
  const updateContact = (patch: Partial<ContactStyle>) =>
    onChange({ ...config, contact: { ...config.contact, ...patch } });

  const outerClass =
    variant === "flush"
      ? "w-full h-full flex flex-col bg-white"
      : "w-[280px] shrink-0 bg-white rounded-2xl ring-1 ring-border p-3";

  const listClass = variant === "flush" ? "flex-1 overflow-y-auto px-3 py-3 space-y-1.5" : "space-y-1.5";

  return (
    <div className={outerClass}>
      <div className={variant === "flush" ? "px-4 pt-4 pb-2" : "px-2 pt-1 pb-3"}>
        <div className="font-bold text-sm">Page sections</div>
        <div className="text-xs text-warm-gray mt-0.5">
          Reorder, show/hide, and style each section of this event's public page.
        </div>
      </div>

      <div className={listClass}>
        {config.sections.map((section, index) => {
          const Icon = SECTION_ICONS[section.type];
          const isExpanded = expandedId === section.id;
          return (
            <div
              key={section.id}
              className={`rounded-xl ring-1 transition-colors ${
                section.visible ? "ring-border bg-cream/40" : "ring-border/60 bg-cream/10 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 px-2 py-2">
                <div className="flex flex-col -my-1 shrink-0">
                  <button
                    type="button"
                    aria-label="Move up"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="text-warm-gray hover:text-emerald disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    onClick={() => move(index, 1)}
                    disabled={index === config.sections.length - 1}
                    className="text-warm-gray hover:text-emerald disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>

                <GripVertical size={14} className="text-warm-gray/50 shrink-0" />
                <Icon size={15} className="text-emerald shrink-0" />

                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : section.id)}
                  className="flex-1 text-left text-[13px] font-semibold truncate"
                >
                  {section.label}
                </button>

                <button
                  type="button"
                  aria-label={section.visible ? "Hide section" : "Show section"}
                  onClick={() => toggleVisible(section.id)}
                  className="text-warm-gray hover:text-emerald shrink-0"
                >
                  {section.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-border/60 space-y-3">
                  {section.type === "gallery" && (
                    <>
                      <StyleBlock label="Layout">
                        <OptionRow
                          options={["Grid", "Masonry", "Carousel"] as const}
                          value={config.gallery.layout}
                          onSelect={(v) => updateGallery({ layout: v })}
                        />
                      </StyleBlock>
                      <StyleBlock label={`Columns (${config.gallery.columns})`}>
                        <input
                          type="range"
                          min={1}
                          max={6}
                          value={config.gallery.columns}
                          onChange={(e) => updateGallery({ columns: Number(e.target.value) })}
                          className="w-full accent-emerald"
                        />
                      </StyleBlock>
                      <StyleBlock label={`Spacing (${config.gallery.spacing})`}>
                        <input
                          type="range"
                          min={0}
                          max={12}
                          value={config.gallery.spacing}
                          onChange={(e) => updateGallery({ spacing: Number(e.target.value) })}
                          className="w-full accent-emerald"
                        />
                      </StyleBlock>
                      <StyleBlock label={`Corner radius (${config.gallery.radius})`}>
                        <input
                          type="range"
                          min={0}
                          max={32}
                          value={config.gallery.radius}
                          onChange={(e) => updateGallery({ radius: Number(e.target.value) })}
                          className="w-full accent-emerald"
                        />
                      </StyleBlock>
                    </>
                  )}

                  {section.type === "cover" && (
                    <>
                      <StyleBlock label="Height">
                        <OptionRow
                          options={["Small", "Medium", "Large"] as const}
                          value={config.cover.height}
                          onSelect={(v) => updateCover({ height: v })}
                        />
                      </StyleBlock>
                      <StyleBlock label={`Overlay darkness (${config.cover.overlay}%)`}>
                        <input
                          type="range"
                          min={0}
                          max={80}
                          value={config.cover.overlay}
                          onChange={(e) => updateCover({ overlay: Number(e.target.value) })}
                          className="w-full accent-emerald"
                        />
                      </StyleBlock>
                      <StyleBlock label="Title alignment">
                        <OptionRow
                          options={["Left", "Center", "Right"] as const}
                          value={config.cover.titleAlign}
                          onSelect={(v) => updateCover({ titleAlign: v })}
                        />
                      </StyleBlock>
                    </>
                  )}

                  {section.type === "info" && (
                    <>
                      <StyleBlock label="Fields shown">
                        <div className="space-y-0.5">
                          <SwitchRow
                            label="Date"
                            checked={config.info.showDate}
                            onToggle={() => updateInfo({ showDate: !config.info.showDate })}
                          />
                          <SwitchRow
                            label="Location"
                            checked={config.info.showLocation}
                            onToggle={() => updateInfo({ showLocation: !config.info.showLocation })}
                          />
                          <SwitchRow
                            label="Description"
                            checked={config.info.showDescription}
                            onToggle={() =>
                              updateInfo({ showDescription: !config.info.showDescription })
                            }
                          />
                        </div>
                      </StyleBlock>
                      <StyleBlock label="Text alignment">
                        <OptionRow
                          options={["Left", "Center"] as const}
                          value={config.info.align}
                          onSelect={(v) => updateInfo({ align: v })}
                        />
                      </StyleBlock>
                    </>
                  )}

                  {section.type === "guestbook" && (
                    <>
                      <SwitchRow
                        label="Allow guest comments"
                        checked={config.guestbook.enabled}
                        onToggle={() => updateGuestbook({ enabled: !config.guestbook.enabled })}
                      />
                      <SwitchRow
                        label="Require approval before showing"
                        checked={config.guestbook.requireApproval}
                        onToggle={() =>
                          updateGuestbook({ requireApproval: !config.guestbook.requireApproval })
                        }
                      />
                    </>
                  )}

                  {section.type === "contact" && (
                    <>
                      <StyleBlock label="Button label">
                        <input
                          type="text"
                          value={config.contact.buttonLabel}
                          onChange={(e) => updateContact({ buttonLabel: e.target.value })}
                          className="w-full bg-cream rounded-lg px-2.5 py-1.5 text-xs outline-none"
                        />
                      </StyleBlock>
                      <StyleBlock label="Contact method">
                        <OptionRow
                          options={["Email", "Phone", "Form"] as const}
                          value={config.contact.method}
                          onSelect={(v) => updateContact({ method: v })}
                        />
                      </StyleBlock>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}