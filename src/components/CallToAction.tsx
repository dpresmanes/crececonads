import React from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';

const CallToAction = () => {
  const whatsappLink = "https://wa.me/5491137638307?text=Hola%2C%20quiero%20automatizar%20mi%20negocio%20con%20IA";

  return (
    <section id="contacto" className="section-padding">
      <div className="container">
        <div className="bg-gradient-to-r from-dark/80 to-dark border border-white/10 rounded-lg p-8 md:p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Querés <span className="text-primary">escalar tu negocio</span> con IA y automatización real?
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Agendá una consulta gratuita con nuestros especialistas y descubrí cómo podemos ayudarte a automatizar y escalar tu negocio.
          </p>
          
          <a 
            href={whatsappLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 text-dark bg-primary rounded-lg font-bold text-lg transition-all duration-300 hover:shadow-neon-lg hover:brightness-110 group"
          >
            <MessageCircle size={24} className="mr-2" />
            Hablá con un experto ahora
            <ArrowRight size={20} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
          </a>
          
          <p className="text-sm text-gray-400 mt-4">
            Sin compromiso. Respuesta garantizada en menos de 24 horas.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;