import React from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Aumentamos nuestras ventas un 230% en 30 días automatizando nuestros embudos con Crece con Ads.",
      author: "María Fernández",
      position: "CEO, Ecommerce de Moda",
      image: "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150",
      stars: 5
    },
    {
      quote: "La automatización de nuestro WhatsApp nos permite gestionar 300+ consultas diarias sin contratar más personal.",
      author: "Carlos Mendez",
      position: "Director, Agencia Inmobiliaria",
      image: "https://images.pexels.com/photos/936019/pexels-photo-936019.jpeg?auto=compress&cs=tinysrgb&w=150",
      stars: 5
    },
    {
      quote: "Generamos contenido para 4 redes sociales sin dedicarle más de 1 hora semanal. Una locura lo que ahorramos.",
      author: "Laura Torres",
      position: "Marketing Manager, SaaS B2B",
      image: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150",
      stars: 4
    }
  ];

  const results = [
    { metric: '+230%', label: 'leads promedio' },
    { metric: '-70%', label: 'horas operativas' },
    { metric: '+180%', label: 'ventas automáticas' }
  ];

  return (
    <section id="casos" className="section-padding">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">Resultados Reales</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">
            Lo que dicen nuestros <span className="text-primary">clientes</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Empresas que ya disfrutan de los beneficios de la automatización inteligente
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="card-hover bg-dark border border-white/10 rounded-lg p-6 flex flex-col"
            >
              <div className="flex space-x-1 mb-4">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star key={i} size={16} className="text-primary fill-primary" />
                ))}
                {[...Array(5 - testimonial.stars)].map((_, i) => (
                  <Star key={i + testimonial.stars} size={16} className="text-gray-400" />
                ))}
              </div>
              
              <p className="text-gray-200 mb-6 flex-grow italic">"{testimonial.quote}"</p>
              
              <div className="flex items-center mt-auto">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.author} 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-bold text-white">{testimonial.author}</h4>
                  <p className="text-sm text-gray-400">{testimonial.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-dark/50 border border-white/10 rounded-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold">Resultados destacados</h3>
            <p className="text-gray-300">Métricas promedio conseguidas por nuestros clientes</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {results.map((result, index) => (
              <div key={index} className="p-4">
                <div className="font-space-grotesk text-4xl font-bold text-primary mb-2">{result.metric}</div>
                <p className="text-gray-300">{result.label}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-400">Basado en el promedio de resultados de más de 50 clientes activos.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;