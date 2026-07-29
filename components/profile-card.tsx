"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProfileCardSettings {
  profile_name?:   string;
  profile_title?:  string;
  profile_bio?:    string;
  profile_avatar?: string;
  /** Comma-separated list of rotating role labels */
  profile_roles?:  string;
  social_facebook?:  string;
  social_twitter?:   string;
  social_instagram?: string;
  social_email?:     string;
  social_github?:    string;
  social_linkedin?:  string;
}

// ---------------------------------------------------------------------------
// Rotating text pill
// ---------------------------------------------------------------------------

function RotatingText({ roles }: { roles: string[] }) {
  const [index, setIndex]   = useState(0);
  const [phase, setPhase]   = useState<"enter" | "exit">("enter");
  const [width, setWidth]   = useState<number | null>(null);
  const measureRef           = useRef<HTMLSpanElement>(null);

  const EXIT_DURATION    = 350;
  const DISPLAY_DURATION = 2500;

  useEffect(() => {
    if (roles.length === 0) return;
    if (phase === "enter") {
      const timer = setTimeout(() => setPhase("exit"), DISPLAY_DURATION);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIndex((prev) => (prev + 1) % roles.length);
        setPhase("enter");
      }, EXIT_DURATION);
      return () => clearTimeout(timer);
    }
  }, [index, phase, roles.length]);

  useLayoutEffect(() => {
    if (measureRef.current) setWidth(measureRef.current.offsetWidth);
  }, [index, phase]);

  const currentRole = roles[index] ?? "";

  return (
    <span className="inline-flex justify-center overflow-hidden">
      <span className="pill-label">
        {/* Hidden measuring span */}
        <span
          ref={measureRef}
          className="pill-wrapper"
          style={{ position: "absolute", visibility: "hidden", whiteSpace: "nowrap" }}
        >
          {currentRole}
        </span>
        {/* Visible animated span */}
        <span
          className="pill-wrapper"
          style={width !== null ? { width: `${width}px` } : undefined}
        >
          {currentRole.split("").map((char, i) => (
            <span
              key={`${index}-${i}-${phase}`}
              className={phase === "exit" ? "pill-char-exit" : "pill-char"}
              style={{ animationDelay: `${i * 20}ms` }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Social icon helper
// ---------------------------------------------------------------------------

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const isEmail = href && !href.startsWith("http") && !href.startsWith("#");
  const finalHref = isEmail ? `mailto:${href}` : href;

  return (
    <a
      href={finalHref}
      aria-label={label}
      target={finalHref.startsWith("http") ? "_blank" : undefined}
      rel={finalHref.startsWith("http") ? "noopener noreferrer" : undefined}
      className="size-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-foreground"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
        {children}
      </svg>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Profile Card
// ---------------------------------------------------------------------------

const DEFAULT_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Full Stack Developer",
  "UI/UX Enthusiast",
];

interface ProfileCardProps {
  settings?: ProfileCardSettings;
}

export function ProfileCard({ settings = {} }: ProfileCardProps) {
  const name   = settings.profile_name   || "M. Revi Ramadhan";
  const bio    = settings.profile_bio    || "Based in Indonesia with 12+ years of experience in software engineering.";
  const avatar = settings.profile_avatar || "https://res.cloudinary.com/dr95izqlg/image/upload/v1777198819/i85y5yann4nxdy38vpge.jpg";

  const roles: string[] = settings.profile_roles
    ? settings.profile_roles.split(",").map((r) => r.trim()).filter(Boolean)
    : DEFAULT_ROLES;

  const social = {
    facebook:  settings.social_facebook  || "#",
    twitter:   settings.social_twitter   || "#",
    instagram: settings.social_instagram || "#",
    email:     settings.social_email     || "your@email.com",
    github:    settings.social_github    || "#",
    linkedin:  settings.social_linkedin  || "#",
  };

  return (
    <div className="w-full rounded-2xl bg-card overflow-hidden">
      {/* Profile Image */}
      <div className="flex justify-center xl:justify-start pt-6 px-6">
        <div className="w-[220px] h-[220px] rounded-2xl overflow-hidden">
          <img
            src={avatar}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Bio Section */}
      <div className="px-6 pt-6 pb-8 text-center xl:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading text-center xl:text-left">
          {name}
        </h2>

        {/* Rotating role pill */}
        <div className="h-6 my-4">
          <RotatingText roles={roles} />
        </div>

        <Separator className="mb-5" />

        <p className="text-sm leading-relaxed mb-5 text-muted-foreground">
          {bio}
        </p>

        <Separator className="mb-5" />

        {/* Social Icons */}
        <div className="flex items-center justify-center xl:justify-start gap-2">
          {/* Facebook */}
          <SocialIcon href={social.facebook} label="Facebook">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.245.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" />
          </SocialIcon>

          {/* Twitter / X */}
          <SocialIcon href={social.twitter} label="Twitter">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </SocialIcon>

          {/* Instagram */}
          <SocialIcon href={social.instagram} label="Instagram">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </SocialIcon>

          {/* Email */}
          <SocialIcon href={social.email} label="Email">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </SocialIcon>

          {/* GitHub */}
          <SocialIcon href={social.github} label="GitHub">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </SocialIcon>

          {/* LinkedIn */}
          <SocialIcon href={social.linkedin} label="LinkedIn">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </SocialIcon>
        </div>
      </div>
    </div>
  );
}
