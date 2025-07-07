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
  HelpCircle,
  Building,
  Trophy,
  Briefcase
} from "lucide-react";
import { MetaTags } from "@/components/MetaTags";

export default function RegalosCorporativos() {
  const features = [
    {
      icon: <Building className="w-6 h-6" />,
      title: "Regalos Profesionales y Elegantes",
      description: "Organiza regalos corporativos para despedidas, promociones, jubilaciones y fechas especiales de la empresa."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Unifica a Todo el Equipo",
      description: "Involucra a compañeros de diferentes departamentos y sucursales. Todos pueden participar desde cualquier lugar."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Seguro con MercadoPago",
      description: "Todos los pagos se procesan a través de MercadoPago. Los datos están siempre protegidos y encriptados."
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Reconocimientos Memorables",
      description: "Crea regalos que demuestren verdadero reconocimiento y aprecio hacia compañeros y colaboradores."
    }
  ];

  const benefits = [
    "Organiza regalos para cualquier ocasión corporativa",
    "Involucra a empleados de diferentes departamentos y sedes",
    "Todos pueden pagar con tarjeta de crédito, débito o transferencia",
    "Seguimiento transparente y en tiempo real",
    "100% seguro con MercadoPago",
    "Gratis y profesional para usar en el trabajo"
  ];

  const testimonials = [
    {
      name: "María G.",
      role: "Gerente de RRHH",
      content: "Para la despedida de nuestro director usamos RegaloYa. Participaron más de 50 empleados de todas las sucursales. Fue muy emotivo.",
      rating: 5
    },
    {
      name: "Carlos R.",
      role: "Coordinador de equipo",
      content: "Mi compañera se jubiló después de 30 años. Con RegaloYa organizamos un regalo increíble entre todos. Muy fácil de usar.",
      rating: 5
    },
    {
      name: "Ana L.",
      role: "Líder de proyecto",
      content: "Para el cumpleaños de nuestro jefe organizamos una colecta súper ordenada. RegaloYa nos ayudó a mantener todo profesional.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "¿Cómo funciona para regalos corporativos?",
      answer: "Creás un proyecto para el evento corporativo, invitás a los compañeros de trabajo y ellos pueden contribuir de forma segura y profesional."
    },
    {
      question: "¿Pueden participar empleados de otras sucursales?",
      answer: "¡Por supuesto! RegaloYa funciona para toda Argentina. Los empleados pueden contribuir desde cualquier lugar del país."
    },
    {
      question: "¿Qué tipo de eventos corporativos puedo organizar?",
      answer: "Cualquier ocasión: despedidas, jubilaciones, promociones, cumpleaños, día de la secretaria, navidad empresarial y más."
    },
    {
      question: "¿Es apropiado usar RegaloYa en el trabajo?",
      answer: "Completamente apropiado. RegaloYa es una plataforma profesional que mantiene la privacidad y organización necesaria en el ámbito laboral."
    },
    {
      question: "¿Cómo mantengo la confidencialidad del regalo?",
      answer: "RegaloYa te permite controlar quién ve las contribuciones. Podés mantener la sorpresa mientras organizas de manera transparente."
    }
  ];

  return (
    <>
      <MetaTags
        title="Regalos Corporativos - RegaloYa | Organiza Regalos Empresariales Grupales"
        description="Organiza regalos corporativos para despedidas, jubilaciones y eventos empresariales. Involucra a todo el equipo, pagos seguros con MercadoPago. Profesional y gratis."
        url="/regalos-corporativos"
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
              🏢 Solución para Empresas
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Regalos Corporativos
              <br />
              <span className="text-gray-800">Profesionales y Memorables</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Organiza regalos empresariales para despedidas, jubilaciones, promociones y eventos especiales. Involucra a todo el equipo de manera profesional.
            </p>
            
            <div className="flex justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg px-8 py-4 text-lg">
                  Crear Mi Regalo Corporativo
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
                ¿Por qué elegir RegaloYa para regalos corporativos?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Simplificamos la organización de regalos empresariales para que te enfoques en lo importante: reconocer y valorar.
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
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                Cómo Funciona RegaloYa para Regalos Corporativos
              </h2>
              <p className="text-xl text-gray-600">
                En solo 3 pasos simples organizas el regalo corporativo perfecto
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
                  Crea el Proyecto Corporativo
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Define el evento empresarial, el regalo objetivo y personaliza los detalles del reconocimiento.
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
                  Invita a Todo el Equipo
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Comparte el enlace con compañeros de diferentes departamentos y sucursales. Participación profesional y ordenada.
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
                  Entrega el Reconocimiento
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Recibe las contribuciones y haz realidad el regalo que demuestre el verdadero aprecio del equipo.
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
                Beneficios Clave de RegaloYa para Regalos Corporativos
              </h2>
              <p className="text-xl text-gray-600">
                Todo lo que necesitas para crear reconocimientos empresariales memorables
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
                Lo Que Dicen Otros Equipos de Trabajo
              </h2>
              <p className="text-xl text-gray-600">
                Empresas reales que ya crearon reconocimientos especiales con RegaloYa
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
                Preguntas Frecuentes sobre Regalos Corporativos
              </h2>
              <p className="text-xl text-gray-600">
                Resolvemos todas tus dudas sobre regalos empresariales
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
              Empezá Ahora y Crea Reconocimientos Corporativos Memorables
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Sumate a las empresas que ya organizan regalos corporativos de forma profesional y colaborativa.
            </p>
            
            <Link href="/auth">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg px-8 py-4 text-lg">
                🏢 Crear Mi Regalo Corporativo Gratis
                <Briefcase className="ml-2 w-5 h-5" />
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
                    <Link href="/eventos-familiares">
                      <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                        Eventos Familiares
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/regalos-corporativos">
                      <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                        Regalos Corporativos
                      </span>
                    </Link>
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