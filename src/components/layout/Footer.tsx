export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-6 text-center text-muted-foreground mt-auto">
      <div className="container mx-auto px-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
        </p>
        <p className="text-xs mt-1">
          Built with Next.js, Tailwind CSS, and ShadCN UI.
        </p>
      </div>
    </footer>
  );
}
