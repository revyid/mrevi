export function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Made by{" "}
          <span className="text-foreground font-medium">Aaabad Ahmed</span>
          {" · "}
          &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
