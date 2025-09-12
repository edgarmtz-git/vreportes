import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-4 mt-8 border-t border-stone-200">
      <div className="px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          <div className="text-center lg:text-left">
            <div className="text-sm text-stone-600">
              © {currentYear}, hecho con{" "}
              <Heart className="w-3 h-3 inline-block text-red-500 fill-current" />{" "}
              por{" "}
              <a
                href="#"
                className="font-semibold text-stone-900 hover:text-stone-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Edgar Martínez
              </a>{" "}
              Desarrollador de Frikilabs.
            </div>
          </div>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Frikilabs Dev Team
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}