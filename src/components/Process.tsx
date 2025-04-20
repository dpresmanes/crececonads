import React from 'react';
import { Search, Cog, Rocket } from 'lucide-react';

const Process = () => {
  const steps = [
    {
      number: '01',
      icon: <Search size={32} className="text-primary" />,
      title: 'Diagnóstico + Estrategia',
      description: 'Analizamos tu negocio, identificamos cuellos de botella y diseñamos una estrategia personalizada de automatización.'
    },
    {
      number: '02',
      icon: <Cog size={32} className="text-primary" />,
      title: 'Implementación',
      description: 'Configuramos los sistemas automatizados, conectamos herramientas y capacitamos a tu equipo para su uso.'
    },
    {
      number: '03',
      icon: <Rocket size={32} className="text-primary" />,
      title: 'Optimización y Escalado',
      description: 'Mejoramos continuamente los procesos mediante análisis de datos y ajustamos para maximizar resultados.'
    }
  ];

  return (
    <section id="proceso" className="section-padding bg-dark/80">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">Metodología</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">
            Cómo <span className="text-primary">trabajamos</span> juntos
          </h2>
          <p className="text-gray-300 text-lg">
            Un proceso simple y efectivo para implementar automatizaciones que generen resultados reales
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 mt-12">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="flex-1 relative group"
            >
              <div className="card-hover p-8 border border-white/10 rounded-lg bg-dark backdrop-blur-md flex flex-col items-center text-center h-full">
                {/* Number with gradient background */}
                <div className="absolute -top-5 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-primary/30 to-primary/80">
                  <span className="font-space-grotesk font-bold text-dark">{step.number}</span>
                </div>
                
                {/* Icon */}
                <div className="mb-6 mt-6 transform group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </div>
              
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-primary/20"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;