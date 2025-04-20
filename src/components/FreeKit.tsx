import React, { useState } from 'react';
import { Gift, CheckCircle, ChevronRight } from 'lucide-react';

const FreeKit = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const res = await fetch("https://formsubmit.co/ajax/damianpresmanes@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          email,
          _captcha: false
        })
      });
  
      const data = await res.json();
      console.log("Respuesta de Formsubmit:", data);
  
      // Aceptamos éxito por status HTTP o por bandera "success"
      if (data?.success || res.ok) {
        setIsSubmitted(true);
        setEmail('');
      } else {
        alert("Hubo un error al enviar. Intentá de nuevo.");
      }
  
    } catch (error) {
      if (error instanceof Error) {
        alert("Error al enviar el formulario: " + error.message);
      } else {
        alert("Ocurrió un error desconocido.");
      }
    }
  
    setIsSubmitting(false);
  };
  
  /*const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setEmail('');
    }, 1500);
  };*/

  return (
    <section id="kit" className="section-padding bg-gradient-to-b from-dark/90 to-dark">
      <div className="container">
        <div className="bg-dark/50 backdrop-blur-md border border-white/10 rounded-lg p-8 md:p-12 max-w-5xl mx-auto relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-7/12">
              <div className="inline-flex items-center px-4 py-2 mb-6 bg-primary/10 rounded-full text-primary text-sm font-medium">
                <Gift size={16} className="mr-2" /> 
                Kit Gratuito 2025
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Plantillas, Herramientas y Automatizaciones listas para usar
              </h2>
              
              <p className="text-gray-300 mb-6">
                Descargá gratis este kit de recursos que te permitirán empezar a automatizar 
                tu negocio hoy mismo, sin conocimientos técnicos.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span>5 plantillas de flujos de automatización en Make y Zapier</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span>10 prompts de IA para generar contenido de alto impacto</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span>Guía paso a paso para configurar WhatsApp Business API</span>
                </li>
              </ul>
              
              <p className="text-sm text-gray-400">
                <span className="font-bold text-primary">+370</span> profesionales ya lo descargaron
              </p>
            </div>
            
            <div className="md:w-5/12 w-full">
              <div className="bg-dark border border-white/10 rounded-lg p-6 shadow-neon">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit}>
                    <h3 className="text-xl font-bold mb-4">Descargá tu kit ahora</h3>
                    
                    <div className="mb-4">
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">
                        Email profesional
                      </label>
                      <input 
                        type="email" 
                        id="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-dark/80 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="tu@empresa.com"
                        required 
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="w-full btn-primary justify-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          📩 Quiero el Kit <ChevronRight className="ml-2" size={18} />
                        </span>
                      )}
                    </button>
                    
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      Al suscribirte, aceptás nuestra política de privacidad.
                    </p>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">¡Gracias por suscribirte!</h3>
                    <p className="text-gray-300 mb-4">
                      Hemos enviado el kit a tu correo electrónico. Revisá tu bandeja de entrada.
                    </p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="text-primary hover:underline text-sm"
                    >
                      Volver al formulario
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreeKit;