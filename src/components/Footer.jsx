export default function Footer(){
  return (
    <footer className="border-t">
      <div className="container h-16 flex items-center justify-between text-sm text-neutral-600">
        <span>© {new Date().getFullYear()} random-letters</span>
        <div className="flex gap-4">
          <a className="hover:opacity-70" href="#">Privacidad</a>
          <a className="hover:opacity-70" href="#">Términos</a>
        </div>
      </div>
    </footer>
  );
}
