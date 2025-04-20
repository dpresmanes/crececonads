import React from 'react';
import { Clock, Zap, TrendingUp, Brain } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: <Clock size={32} className="text-primary" />,
      title: 'Ahorro de tiempo',
      description: 'Automatizá procesos repetitivos y recuperá hasta 20 horas semanales para enfocarte en lo importante.'
    },
    {
      icon: <Zap size={32} className="text-primary" />,
      title: 'Menos errores',
      description: 'Eliminá fallos humanos y tareas repetitivas con sistemas que funcionan 24/7 con precisión.'
    },
    {
      icon: <TrendingUp size={32} className="text-primary" />,
      title: 'Mayor rentabilidad',
      description: 'Escalá sin contratar equipo adicional. Aumentá ingresos mientras reducís costos operativos.'
    },
    {
      icon: <Brain size={32} className="text-primary" />,
      title: 'Tecnología sin complicaciones',
      description: 'Implementamos todo sin que necesites saber programar. Nosotros nos encargamos de la tecnología.'
    }
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-dark to-dark/95">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Por qué automatizar <span className="text-primary">es la ventaja competitiva</span> que tu negocio necesita
          </h2>
          <p className="text-gray-300 text-lg">
            Mientras tu competencia sigue haciendo todo manual, vos podés dar un salto cualitativo en eficiencia
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="card-hover bg-dark/60 backdrop-blur-sm p-6 rounded-lg border border-white/10 relative"
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-dark/80 flex items-center justify-center shadow-neon">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold mt-4 mb-3">{benefit.title}</h3>
              <p className="text-gray-300">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;