import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      data-testid="header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            data-testid="logo"
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="text-2xl font-bold text-[#2D5F3F]">
              Clarisa
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection('como-funciona')}
              className="text-gray-700 hover:text-[#2D5F3F] transition-colors font-medium"
            >
              Cómo funciona
            </button>
            <button
              onClick={() => scrollToSection('para-quien')}
              className="text-gray-700 hover:text-[#2D5F3F] transition-colors font-medium"
            >
              Para quién es
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-gray-700 hover:text-[#2D5F3F] transition-colors font-medium"
            >
              Preguntas
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-gray-700 hover:text-[#2D5F3F] transition-colors font-medium"
            >
              Iniciar sesión
            </button>
            <Button
              onClick={() => navigate('/registro')}
              variant="outline"
              className="border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white font-semibold px-4 py-2 rounded-lg transition-all"
            >
              Registrarse
            </Button>
            <Button
              data-testid="cta-header-btn"
              onClick={() => navigate('/diagnostico')}
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white font-semibold px-6 py-2 rounded-lg transition-all hover:scale-105"
            >
              Diagnóstico Gratuito
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            data-testid="mobile-menu-toggle"
            className="md:hidden text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          data-testid="mobile-menu"
          className="md:hidden bg-white border-t border-gray-200"
        >
          <nav className="px-4 py-4 space-y-3">
            <button
              onClick={() => scrollToSection('como-funciona')}
              className="block w-full text-left text-gray-700 hover:text-[#2D5F3F] transition-colors font-medium py-2"
            >
              Cómo funciona
            </button>
            <button
              onClick={() => scrollToSection('para-quien')}
              className="block w-full text-left text-gray-700 hover:text-[#2D5F3F] transition-colors font-medium py-2"
            >
              Para quién es
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left text-gray-700 hover:text-[#2D5F3F] transition-colors font-medium py-2"
            >
              Preguntas
            </button>
            <Button
              onClick={() => navigate('/diagnostico')}
              className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white font-semibold py-2 rounded-lg"
            >
              Diagnóstico Gratuito
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;