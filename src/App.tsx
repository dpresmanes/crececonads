import React, { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import Services from './components/Services';
import Process from './components/Process';
import Testimonials from './components/Testimonials';
import FreeKit from './components/FreeKit';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

function App() {
  useEffect(() => {
    // Update the page title
    document.title = "Automatización de Marketing con IA | Crece con Ads";
    
    // Add meta description
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Te ayudamos a escalar tu negocio con campañas, contenido y atención automatizados. Todo con herramientas no-code e IA. Vendé más sin perder tiempo.';
    document.head.appendChild(metaDescription);
    
    return () => {
      // Clean up meta tag on component unmount
      const existingMeta = document.querySelector('meta[name="description"]');
      if (existingMeta) {
        existingMeta.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white overflow-hidden">
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Services />
        <Process />
        <Testimonials />
        <FreeKit />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}

export default App;