import React from 'react';
import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      data-testid="footer"
      className="bg-[#2D5F3F] text-white py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Clarisa</h3>
            <p className="text-green-100 leading-relaxed">
              La plataforma que simplifica la implementación de NIIF S1/S2 para
              organizaciones latinoamericanas.
            </p>
          </div>

          {/* Column 2: Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Enlaces</h4>
            <ul className="space-y-2 text-green-100">
              <li>
                <a
                  href="/diagnostico"
                  className="hover:text-white transition-colors"
                >
                  Diagnóstico Gratuito
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Plataforma
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Recursos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Acerca de
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contacto</h4>
            <div className="flex items-center gap-2 text-green-100">
              <Mail className="h-5 w-5" />
              <a
                href="mailto:hola@clarisa.com"
                className="hover:text-white transition-colors"
              >
                hola@clarisa.com
              </a>
            </div>
            <p className="text-green-100 text-sm">
              Latinoamérica
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-green-700 pt-8 text-center text-green-100 text-sm">
          <p>© 2025 Clarisa. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;