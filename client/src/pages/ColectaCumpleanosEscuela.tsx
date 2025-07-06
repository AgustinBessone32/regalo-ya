import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Gift, Users, Shield, Clock, CreditCard } from "lucide-react";
import { MetaTags } from "@/components/MetaTags";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";

export default function ColectaCumpleanosEscuela() {
  return (
    <>
      <MetaTags
        title="Colecta Cumpleaños Niños Escuela - RegaloYa | Organiza Regalos Grupales Sin Caos"
        description="Organiza colectas para cumpleaños de niños en la escuela de forma simple y segura. Pagos con MercadoPago, sin estrés en WhatsApp. Gratis y fácil de usar."
        url="/colecta-cumpleanos-escuela"
      />

      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-24 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 px-4 py-2 text-sm font-medium">
                🎁 Solución para Padres y Madres
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Organiza Regalos de Cumpleaños 
              <span className="text-purple-600"> Sin Caos</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              La Solución Simple para Colectas Grupales en la Escuela
            </p>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8 text-left max-w-2xl mx-auto">
              <p className="text-gray-700 mb-4">
                Si alguna vez intentaste juntar dinero para el regalo de cumpleaños de un compañero o compañera de tus hijos, seguro viviste esto:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  📱 Decenas de mensajes en el grupo de WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  💸 Capturas de transferencias por todos lados
                </li>
                <li className="flex items-center gap-2">
                  📊 Encuestas para saber quién participa
                </li>
                <li className="flex items-center gap-2">
                  📍 Compartir la ubicación del lugar de la compra o la entrega
                </li>
              </ul>
            </div>

            <div className="bg-purple-600 text-white p-6 rounded-xl mb-8">
              <p className="text-xl font-semibold mb-4">
                Con RegaloYa todo eso se resuelve en un solo lugar. Simple, seguro y sin estrés.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Gratis para siempre
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Creación en menos de 2 minutos
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Pagos con MercadoPago
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
                  Crear Mi Colecta Gratis Ahora
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              No se necesita tarjeta de crédito • Creación en 2 minutos
            </p>
          </div>
        </section>

        {/* Why Choose RegaloYa Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                ¿Por Qué Elegir RegaloYa para los Regalos de Cumpleaños de los Chicos?
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="text-purple-600 mb-4">
                    <Gift className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    🎁 Colectas Grupales Sin Caos en WhatsApp
                  </h3>
                  <p className="text-gray-600">
                    Olvidate de seguir el hilo interminable de mensajes. RegaloYa centraliza todo en un solo enlace.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="text-purple-600 mb-4">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    👨‍👩‍👧‍👦 Invita Fácilmente a Otros Padres y Madres
                  </h3>
                  <p className="text-gray-600">
                    Compartí el enlace en el grupo de WhatsApp y listo. Todos pueden participar cuando quieran y desde donde estén.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="text-purple-600 mb-4">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    💳 Pagos Accesibles para Todos
                  </h3>
                  <p className="text-gray-600">
                    Cada persona puede aportar con <strong>tarjeta de crédito, débito o transferencia</strong>, de manera rápida y segura.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="text-purple-600 mb-4">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    🔒 100% Seguro con MercadoPago
                  </h3>
                  <p className="text-gray-600">
                    Todos los pagos se procesan a través de MercadoPago. Los datos están siempre protegidos y encriptados.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="text-purple-600 mb-4">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    📱 Todo en un Solo Lugar
                  </h3>
                  <p className="text-gray-600">
                    Seguí la colecta, sabé quién aportó, cuánto falta para la meta y organizá todo sin salir de la plataforma.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Cómo Funciona RegaloYa para Colectas Escolares
              </h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    Crea la Colecta en 2 Minutos
                  </h3>
                  <p className="text-gray-600">
                    Definí el regalo, cargá la meta y personalizá el evento.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    Compartí el Enlace en WhatsApp
                  </h3>
                  <p className="text-gray-600">
                    Invitá a las familias de la sala o el grado a sumarse con un solo clic.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    Recibí los Aportes y Hacé Seguimiento
                  </h3>
                  <p className="text-gray-600">
                    Controlá en tiempo real quién aportó y cuánto falta para alcanzar el objetivo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Beneficios Clave de RegaloYa para Cumpleaños Infantiles
              </h2>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Centralizás todo en un solo lugar (no más caos de mensajes)",
                  "Podés ver quién aportó y cuánto",
                  "Todos pueden pagar con tarjeta de crédito, débito o transferencia",
                  "Seguimiento en tiempo real",
                  "100% seguro con MercadoPago",
                  "Gratis y fácil de usar desde el celular"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Preguntas Frecuentes de Padres y Madres
              </h2>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {[
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
              ].map((faq, index) => (
                <Card key={index} className="p-6">
                  <CardContent className="p-0">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Lo Que Dicen Otros Padres y Madres
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="p-6">
                <CardContent className="p-0">
                  <p className="text-gray-600 mb-4 italic">
                    "Antes era un caos organizar el regalo en el grupo de WhatsApp. Ahora con RegaloYa es súper ordenado y todos pueden participar fácil."
                  </p>
                  <p className="font-semibold text-gray-900">
                    Martina G. - Mamá de sala de 5
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="p-0">
                  <p className="text-gray-600 mb-4 italic">
                    "Me encantó porque pude aportar con tarjeta de crédito y no tuve que hacer transferencias complicadas."
                  </p>
                  <p className="font-semibold text-gray-900">
                    Luis M. - Papá de primer grado
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="p-0">
                  <p className="text-gray-600 mb-4 italic">
                    "Fue muy fácil, creé el proyecto y lo compartí en el grupo en menos de 5 minutos."
                  </p>
                  <p className="font-semibold text-gray-900">
                    Paula T. - Mamá de jardín
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Founders Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
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

        {/* Final CTA Section */}
        <section className="py-16 bg-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Empezá Ahora y Organiza el Próximo Regalo de Cumpleaños Sin Estrés
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Sumate a las familias que ya organizan los cumpleaños de sus hijos de forma simple y colaborativa.
            </p>
            
            <Link href="/auth">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg">
                👉 Crear Mi Colecta Gratis Ahora
              </Button>
            </Link>
            
            <p className="text-purple-200 mt-4">
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
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">RegaloYa</span>
                </div>
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