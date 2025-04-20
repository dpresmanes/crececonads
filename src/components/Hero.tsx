import React from 'react';
import { ChevronRight } from 'lucide-react';

const Hero = () => {
  const whatsappLink = "https://wa.me/5491137638307?text=Hola%2C%20quiero%20automatizar%20mi%20negocio%20con%20IA";

  return (
    <section className="relative min-h-screen flex items-center pt-20" id="inicio">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[5%] w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 mb-6 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <span className="animate-pulse-slow mr-2">●</span> 
            Automatización inteligente para tu negocio
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Automatizamos tu negocio digital con IA. 
            <span className="text-primary"> Vos escalás, nosotros ejecutamos.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
            Campañas, contenido, atención al cliente y embudos, 
            todo funcionando en piloto automático.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href={whatsappLink}
              className="btn-primary group"
              target="_blank" 
              rel="noopener noreferrer"
            >
              🚀 Quiero empezar
              <ChevronRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
            </a>
            
            <a 
              href="#servicios" 
              className="btn-outline"
            >
              Ver servicios
            </a>
          </div>
          
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
            <div className="bg-dark/50 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <p className="text-primary font-space-grotesk text-xl md:text-2xl font-bold">+200%</p>
              <p className="text-sm text-gray-300">conversiones</p>
            </div>
            <div className="bg-dark/50 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <p className="text-primary font-space-grotesk text-xl md:text-2xl font-bold">-70%</p>
              <p className="text-sm text-gray-300">tiempo operativo</p>
            </div>
            <div className="bg-dark/50 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <p className="text-primary font-space-grotesk text-xl md:text-2xl font-bold">24/7</p>
              <p className="text-sm text-gray-300">atención cliente</p>
            </div>
            <div className="bg-dark/50 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <p className="text-primary font-space-grotesk text-xl md:text-2xl font-bold">+50</p>
              <p className="text-sm text-gray-300">clientes activos</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-8 h-14 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;