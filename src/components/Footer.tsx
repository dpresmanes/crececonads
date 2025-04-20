import React from 'react';
import { Instagram, Linkedin, Twitter, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark/95 pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 font-space-grotesk">CreceConAds</h3>
            <p className="text-gray-400 mb-6">
              Automatizamos tu negocio digital con IA para que puedas escalar sin complicaciones.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><a href="#inicio" className="text-gray-400 hover:text-primary transition-colors">Inicio</a></li>
              <li><a href="#servicios" className="text-gray-400 hover:text-primary transition-colors">Servicios</a></li>
              <li><a href="#proceso" className="text-gray-400 hover:text-primary transition-colors">Cómo Trabajamos</a></li>
              <li><a href="#casos" className="text-gray-400 hover:text-primary transition-colors">Casos de Éxito</a></li>
              <li><a href="#kit" className="text-gray-400 hover:text-primary transition-colors">Kit Gratuito</a></li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Servicios</h3>
            <ul className="space-y-2">
              <li><a href="#servicios" className="text-gray-400 hover:text-primary transition-colors">Campañas Automatizadas</a></li>
              <li><a href="#servicios" className="text-gray-400 hover:text-primary transition-colors">Contenido con IA</a></li>
              <li><a href="#servicios" className="text-gray-400 hover:text-primary transition-colors">Automatización de Atención</a></li>
              <li><a href="#servicios" className="text-gray-400 hover:text-primary transition-colors">Embudos Inteligentes</a></li>
              <li><a href="#servicios" className="text-gray-400 hover:text-primary transition-colors">Consultoría 1:1</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Mail size={20} className="text-primary mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-400">info@crececonads.com</span>
              </li>
              <li className="flex items-start">
                <MapPin size={20} className="text-primary mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-400">Buenos Aires, Argentina</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {currentYear} CreceConAds. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Políticas de Privacidad</a>
              <a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Términos de Servicio</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;