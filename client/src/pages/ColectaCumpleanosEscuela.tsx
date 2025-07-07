import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Gift, 
  Users, 
  Heart, 
  CheckCircle, 
  Star,
  ArrowRight,
  Calendar,
  DollarSign,
  Shield,
  Smartphone,
  ChevronDown,
  HelpCircle
} from "lucide-react";
import { MetaTags } from "@/components/MetaTags";

export default function ColectaCumpleanosEscuela() {
  const features = [
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Colectas Grupales Sin Caos en WhatsApp",
      description: "Olvidate de seguir el hilo interminable de mensajes. RegaloYa centraliza todo en un solo enlace."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Invita Fácilmente a Otros Padres y Madres",
      description: "Compartí el enlace en el grupo de WhatsApp y listo. Todos pueden participar cuando quieran y desde donde estén."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Seguro con MercadoPago",
      description: "Todos los pagos se procesan a través de MercadoPago. Los datos están siempre protegidos y encriptados."
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Todo en un Solo Lugar",
      description: "Seguí la colecta, sabé quién aportó, cuánto falta para la meta y organizá todo sin salir de la plataforma."
    }
  ];

  const benefits = [
    "Centralizás todo en un solo lugar (no más caos de mensajes)",
    "Podés ver quién aportó y cuánto",
    "Todos pueden pagar con tarjeta de crédito, débito o transferencia",
    "Seguimiento en tiempo real",
    "100% seguro con MercadoPago",
    "Gratis y fácil de usar desde el celular"
  ];

  const testimonials = [
    {
      name: "Martina G.",
      role: "Mamá de sala de 5",
      content: "Antes era un caos organizar el regalo en el grupo de WhatsApp. Ahora con RegaloYa es súper ordenado y todos pueden participar fácil.",
      rating: 5
    },
    {
      name: "Luis M.",
      role: "Papá de primer grado",
      content: "Me encantó porque pude aportar con tarjeta de crédito y no tuve que hacer transferencias complicadas.",
      rating: 5
    },
    {
      name: "Paula T.",
      role: "Mamá de jardín",
      content: "Fue muy fácil, creé el proyecto y lo compartí en el grupo en menos de 5 minutos.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "¿Cómo funciona la colecta para el cumpleaños de los chicos?",
      answer: "Creás un proyecto, compartís el enlace y las familias pueden aportar de forma segura y simple."
    },
    {
      question: "¿Puedo saber quién aportó y cuánto?",
      answer: "Sí, siempre podés ver el historial completo de contribuciones."
    },
    {
      question: "¿Qué pasa si no se llega a la meta?",
      answer: "No hay problema. Igual podés usar el dinero recaudado para comprar otro regalo."
    },
    {
      question: "¿Cómo pueden pagar los otros padres?",
      answer: "Con tarjeta de crédito, débito o transferencia, de manera simple y segura con MercadoPago."
    },
    {
      question: "¿Es seguro usar RegaloYa?",
      answer: "Sí, usamos MercadoPago, una plataforma confiable y segura."
    }
  ];

  return (
    <>
      <MetaTags
        title="Colecta Cumpleaños Niños Escuela - RegaloYa | Organiza Regalos Grupales Sin Caos"
        description="Organiza colectas para cumpleaños de niños en la escuela de forma simple y segura. Pagos con MercadoPago, sin estrés en WhatsApp. Gratis y fácil de usar."
        url="/colecta-cumpleanos-escuela"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  RegaloYa
                </span>
              </div>
            </Link>
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                Comenzar Gratis
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <Badge variant="secondary" className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0">
              🎁 Solución para Padres y Madres
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              La Solución Simple para
              <br />
              <span className="text-gray-800">Colectas Grupales en la Escuela</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Olvidate del caos en WhatsApp y organiza colectas de manera simple y segura.
            </p>

            {/* Problem description */}
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 max-w-4xl mx-auto border border-gray-100">
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Si alguna vez intentaste juntar dinero para el regalo de cumpleaños de un compañero o compañera de tus hijos, seguro viviste esto:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center gap-3 text-gray-600">
                  <span className="text-2xl">📱</span>
                  <span>Decenas de mensajes en el grupo de WhatsApp</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <span className="text-2xl">💸</span>
                  <span>Capturas de transferencias por todos lados</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <span className="text-2xl">📊</span>
                  <span>Encuestas para saber quién participa</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <span className="text-2xl">📍</span>
                  <span>Compartir la ubicación del lugar de la compra o la entrega</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg px-8 py-4 text-lg">
                  Crear Mi Colecta Gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              ✅ Gratis para siempre • ✅ Configuración en 2 minutos
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white/60 backdrop-blur-sm">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                ¿Por qué elegir RegaloYa para colectas escolares?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Simplificamos la organización de regalos grupales para que te enfoques en lo importante: celebrar.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center border-purple-100 hover:shadow-lg transition-all duration-300 bg-white/80">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4 text-white">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-purple-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Cómo Funciona RegaloYa para Colectas Escolares
              </h2>
              <p className="text-xl text-gray-600">
                En solo 3 pasos simples organizas la colecta perfecta
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  <div className="absolute -inset-3 bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  Crea la Colecta en 2 Minutos
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Definí el regalo, cargá la meta y personalizá el evento.
                </p>
              </div>

              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <div className="absolute -inset-3 bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  Compartí el Enlace en WhatsApp
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Invitá a las familias de la sala o el grado a sumarse con un solo clic.
                </p>
              </div>

              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  <div className="absolute -inset-3 bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  Recibí los Aportes y Hacé Seguimiento
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Controlá en tiempo real quién aportó y cuánto falta para alcanzar el objetivo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Beneficios Clave de RegaloYa para Cumpleaños Infantiles
              </h2>
              <p className="text-xl text-gray-600">
                Todo lo que necesitas en una sola plataforma
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 p-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-lg text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-purple-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Lo Que Dicen Otros Padres y Madres
              </h2>
              <p className="text-xl text-gray-600">
                Familias reales que ya usan RegaloYa
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6 h-full hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 italic leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <p className="font-semibold text-gray-800">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Preguntas Frecuentes de Padres y Madres
              </h2>
              <p className="text-xl text-gray-600">
                Resolvemos todas tus dudas sobre colectas escolares
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      <span className="font-semibold">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Founders Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-purple-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Conocé a Nuestro Equipo
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Las personas detrás de RegaloYa, trabajando para hacer los regalos colaborativos más simples.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Beti Dominguez */}
              <div className="text-center group">
                <div className="relative mb-6 mx-auto w-48 h-48 overflow-hidden rounded-full border-4 border-purple-200 group-hover:border-purple-400 transition-all duration-300">
                  <img 
                    src="/attached_assets/beti.png"
                    alt="Beti Dominguez"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Beti Dominguez</h3>
                <p className="text-gray-600 leading-relaxed">
                  La que en cada cumple se pone las pilas para juntar la plata. Su experiencia organizando regalos grupales inspiró la creación de RegaloYa.
                </p>
              </div>

              {/* Jota Juarez */}
              <div className="text-center group">
                <div className="relative mb-6 mx-auto w-48 h-48 overflow-hidden rounded-full border-4 border-purple-200 group-hover:border-purple-400 transition-all duration-300">
                  <img 
                    src="/attached_assets/jota.png"
                    alt="Jota Juarez"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Jota Juarez</h3>
                <p className="text-gray-600 leading-relaxed">
                  El que le gusta resolver cosas con tecnología, y ahora con IA. Desarrolló toda la plataforma para hacer los regalos colaborativos súper fáciles.
                </p>
              </div>

              {/* Agus Bessone */}
              <div className="text-center group">
                <div className="relative mb-6 mx-auto w-48 h-48 overflow-hidden rounded-full border-4 border-purple-200 group-hover:border-purple-400 transition-all duration-300">
                  <img 
                    src="/attached_assets/agus.png"
                    alt="Agus Bessone"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Agus Bessone</h3>
                <p className="text-gray-600 leading-relaxed">
                  El que hace que las cosas pasen. Lidera la visión de RegaloYa para transformar la forma en que organizamos regalos en familia y entre amigos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
              Empezá Ahora y Organiza el Próximo Regalo de Cumpleaños Sin Estrés
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Sumate a las familias que ya organizan los cumpleaños de sus hijos de forma simple y colaborativa.
            </p>
            
            <Link href="/auth">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg px-8 py-4 text-lg">
                👉 Crear Mi Colecta Gratis Ahora
                <Heart className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <p className="text-sm text-gray-500 mt-4">
              No se necesita tarjeta de crédito • Creación en 2 minutos
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* Logo and Company Info */}
              <div>
                <Link href="/">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">RegaloYa</span>
                  </div>
                </Link>
                <p className="text-gray-400 text-sm">
                  Regalos colaborativos fáciles y seguros para toda la familia.
                </p>
              </div>

              {/* Soluciones por Industria */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Soluciones por Industria</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/colecta-cumpleanos-escuela">
                      <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                        Colectas Escolares
                      </span>
                    </Link>
                  </li>
                  <li>
                    <span className="text-gray-400">
                      Eventos Familiares
                    </span>
                  </li>
                  <li>
                    <span className="text-gray-400">
                      Regalos Corporativos
                    </span>
                  </li>
                </ul>
              </div>

              {/* Descubrí Más */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Descubrí Más</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/auth">
                      <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                        Crear Proyecto
                      </span>
                    </Link>
                  </li>
                  <li>
                    <span className="text-gray-400">
                      Cómo Funciona
                    </span>
                  </li>
                  <li>
                    <span className="text-gray-400">
                      Soporte
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-8">
              <div className="text-center">
                <p className="text-gray-400">
                  © 2024 RegaloYa. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}