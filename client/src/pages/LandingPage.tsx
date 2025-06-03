import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Smartphone
} from "lucide-react";
import { MetaTags } from "@/components/MetaTags";

export default function LandingPage() {
  const features = [
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Regalos Colaborativos",
      description: "Organiza colectas grupales para regalos especiales de manera fácil y transparente."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Invita a Todos",
      description: "Comparte tu proyecto con familiares y amigos para que todos puedan contribuir."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Seguro y Confiable",
      description: "Tus datos y contribuciones están protegidos con la máxima seguridad."
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Fácil de Usar",
      description: "Interfaz intuitiva que cualquier persona puede usar sin complicaciones."
    }
  ];

  const benefits = [
    "Crea proyectos en menos de 2 minutos",
    "Seguimiento en tiempo real de las contribuciones",
    "Invitaciones automáticas por enlace",
    "Historial completo de todas las contribuciones",
    "Sin costos ocultos ni comisiones"
  ];

  const testimonials = [
    {
      name: "María González",
      role: "Organizadora de eventos",
      content: "RegaloYa me ayudó a organizar el regalo de cumpleaños de mi mamá. ¡Fue súper fácil y todos pudieron contribuir!",
      rating: 5
    },
    {
      name: "Carlos Mendoza",
      role: "Padre de familia",
      content: "Perfecto para organizar regalos grupales. La transparencia total me da mucha confianza.",
      rating: 5
    },
    {
      name: "Ana López",
      role: "Coordinadora de oficina",
      content: "Lo usamos para regalos de compañeros. Es muy práctico y todo el equipo puede participar fácilmente.",
      rating: 5
    }
  ];

  return (
    <>
      <MetaTags
        title="RegaloYa - Regalos Colaborativos Fáciles y Seguros"
        description="Organiza colectas grupales para regalos especiales. Invita a familiares y amigos, haz seguimiento en tiempo real y crea momentos inolvidables juntos."
        url={window.location.href}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                RegaloYa
              </span>
            </div>
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
              ✨ La forma más fácil de organizar regalos grupales
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Regalos Colaborativos
              <br />
              <span className="text-gray-800">Simples y Seguros</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Organiza colectas grupales para regalos especiales. Invita a familiares y amigos, 
              haz seguimiento en tiempo real y crea momentos inolvidables juntos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg px-8 py-4 text-lg">
                  Crear Mi Primer Proyecto
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                Ver Cómo Funciona
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              ✅ Gratis para siempre • ✅ Sin comisiones • ✅ Configuración en 2 minutos
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white/60 backdrop-blur-sm">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                ¿Por qué elegir RegaloYa?
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
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                Así de fácil es usar RegaloYa
              </h2>
              <p className="text-xl text-gray-600">
                En solo 3 pasos tendrás tu proyecto listo para recibir contribuciones
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Crea tu proyecto",
                  description: "Define el regalo, establece la meta y personaliza los detalles del evento.",
                  icon: <Calendar className="w-8 h-8" />
                },
                {
                  step: "2", 
                  title: "Invita a participar",
                  description: "Comparte el enlace con familiares y amigos para que puedan contribuir.",
                  icon: <Users className="w-8 h-8" />
                },
                {
                  step: "3",
                  title: "Recibe contribuciones",
                  description: "Haz seguimiento en tiempo real y celebra cuando alcances tu meta.",
                  icon: <DollarSign className="w-8 h-8" />
                }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-purple-500 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Todo lo que necesitas en un solo lugar
              </h2>
              <p className="text-xl opacity-90">
                RegaloYa incluye todas las herramientas que necesitas para organizar regalos perfectos
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-white/60 backdrop-blur-sm">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                Lo que dicen nuestros usuarios
              </h2>
              <p className="text-xl text-gray-600">
                Miles de familias ya confían en RegaloYa para sus celebraciones especiales
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-purple-100 hover:shadow-lg transition-all duration-300 bg-white/80">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
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

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
              ¿Listo para crear momentos especiales?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Únete a miles de familias que ya organizan sus regalos de forma colaborativa y sin complicaciones.
            </p>
            
            <Link href="/auth">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg px-8 py-4 text-lg">
                Comenzar Gratis Ahora
                <Heart className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <p className="text-sm text-gray-500 mt-4">
              No se requiere tarjeta de crédito • Configuración en minutos
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">RegaloYa</span>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-gray-400">
                  © 2024 RegaloYa. Todos los derechos reservados.
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Regalos colaborativos fáciles y seguros para toda la familia.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}