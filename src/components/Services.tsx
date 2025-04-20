import React from 'react';
import { Megaphone, MessageSquare, MessageCircle, Activity, Users, BarChart } from 'lucide-react';

const Services = () => {
  const serviceCards = [
    {
      icon: <Megaphone size={36} className="text-primary" />,
      title: 'Campañas Automatizadas',
      description: 'Meta Ads y Google Ads conectados a embudos inteligentes que optimizan automáticamente el presupuesto según resultados.',
      features: ['Optimización automática', 'Segmentación con IA', 'Ajuste inteligente de presupuesto']
    },
    {
      icon: <MessageSquare size={36} className="text-primary" />,
      title: 'Contenido con IA',
      description: 'Generación y programación automática de contenido de valor para Instagram, TikTok, LinkedIn y más plataformas.',
      features: ['Calendario editorial automático', 'Copywriting con IA', 'Programación multi-plataforma']
    },
    {
      icon: <MessageCircle size={36} className="text-primary" />,
      title: 'Automatización de Atención',
      description: 'Bots en WhatsApp/Instagram, respuestas rápidas y conexión con CRM para no perder ninguna oportunidad.',
      features: ['Respuesta 24/7', 'Calificación automática de leads', 'Integración con CRM']
    },
    {
      icon: <Activity size={36} className="text-primary" />,
      title: 'Embudos Inteligentes',
      description: 'La combinación perfecta: Landing + Formulario + WhatsApp + Email = venta automática.',
      features: ['Seguimiento personalizado', 'Detección de abandono', 'Recordatorios automáticos']
    },
    {
      icon: <Users size={36} className="text-primary" />,
      title: 'Consultoría 1:1',
      description: 'Acompañamiento para integrar herramientas no-code como Make, Zapier, Brevo, ManyChat y más.',
      features: ['Sesiones personalizadas', 'Auditoría de procesos', 'Implementación asistida']
    },
    {
      icon: <BarChart size={36} className="text-primary" />,
      title: 'Reportes Inteligentes',
      description: 'Envío automático de métricas a Google Sheets o dashboards de Looker Studio para toma de decisiones.',
      features: ['Actualización automática', 'Alertas personalizables', 'Visualización clara']
    }
  ];

  return (
    <section id="servicios" className="section-padding">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">Nuestros Servicios</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">
            Soluciones de <span className="text-primary">automatización</span> que transforman tu negocio
          </h2>
          <p className="text-gray-300 text-lg">
            Sistemas inteligentes diseñados para que puedas escalar sin complicaciones ni tareas repetitivas
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceCards.map((service, index) => (
            <div 
              key={index} 
              className="card-hover gradient-border bg-dark border border-white/10 rounded-lg p-6 flex flex-col h-full"
            >
              <div className="mb-6">{service.icon}</div>
              
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-gray-300 mb-6">{service.description}</p>
              
              <div className="mt-auto">
                <div className="border-t border-white/10 pt-4 mt-4">
                  <ul className="space-y-2">
                    {service.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center">
                        <span className="text-primary mr-2">•</span>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;