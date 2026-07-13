import React from "react";
import { CheckCircle2, Image as ImageIcon } from "lucide-react";

interface AvatarGalleryPickerProps {
  currentValue?: string;
  onChange: (url: string) => void;
  title?: string;
}

const GALLERY_AVATARS = [
  {
    name: "Rachel (Tech Lead)",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Marcus (Solutions Architect)",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Aisha (Product Director)",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "David (Engineering VP)",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Elena (UX Researcher)",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Minimalist Grid",
    url: "https://api.dicebear.com/7.x/identicon/svg?seed=Tech",
  },
  {
    name: "Bot Assistant",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
  },
  {
    name: "Developer Male",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    name: "Developer Female",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    name: "Abstract Geo",
    url: "https://api.dicebear.com/7.x/shapes/svg?seed=Platform",
  },
];

export default function AvatarGalleryPicker({
  currentValue = "",
  onChange,
  title = "Or Choose from Curated Gallery",
}: AvatarGalleryPickerProps) {
  return (
    <div className="space-y-2 border border-slate-100 rounded-xl p-3.5 bg-slate-50/30">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
        <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
        <span>{title}</span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {GALLERY_AVATARS.map((avatar, idx) => {
          const isSelected = currentValue === avatar.url;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(avatar.url)}
              title={avatar.name}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer group focus:outline-none ${
                isSelected
                  ? "border-indigo-600 ring-2 ring-indigo-500/20 scale-105"
                  : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <img
                src={avatar.url}
                alt={avatar.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 bg-white rounded-full p-0.5 shadow-md" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
